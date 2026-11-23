import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getKey, keygenSetup, resetKeyCache } from '../keygen.mjs';
import { getAIConfig, askOpenAI } from '../openai.mjs';

function fixture(t) {
  const path = mkdtempSync(join(tmpdir(), 'de-pollution-keygen-'));
  t.after(() => { resetKeyCache(); rmSync(path, { recursive: true, force: true }); });
  const root = pathToFileURL(`${path}/`);
  writeFileSync(new URL('NOTES.md', root), '# Notes\nOpenAI model: test-model\n');
  writeFileSync(new URL('BRIEF.md', root), readFileSync(new URL('../BRIEF.md', import.meta.url), 'utf8'));
  return { root, env: { KEYGEN_URL: 'https://keygen.invalid/', KEYGEN_TOKEN: 'test-token' } };
}

const answer = { answer: 'A small step counts.', safety: 'ok', classification: 'goal', sourceIds: ['epaFood'] };
const completed = { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify(answer) }] }] }) };

test('MindDo setup comes from Vercel environment variables or private .env', async t => {
  const { root } = fixture(t);
  writeFileSync(new URL('.env', root), 'KEYGEN_URL=paste-here\nKEYGEN_TOKEN=paste-here\n');
  assert.equal((await keygenSetup(root, {})).ready, false);
  assert.deepEqual(await keygenSetup(root, { KEYGEN_URL: 'https://example.invalid', KEYGEN_TOKEN: 'token' }), { url: 'https://example.invalid', token: 'token', ready: true });
  writeFileSync(new URL('.env', root), 'KEYGEN_URL=https://file.invalid\nKEYGEN_TOKEN=file-token\n');
  assert.deepEqual(await keygenSetup(root, {}), { url: 'https://file.invalid', token: 'file-token', ready: true });
});

test('getKey posts once, reuses the key before expiry, and replaces it after expiry', async t => {
  const { root, env } = fixture(t);
  resetKeyCache();
  let calls = 0;
  let clock = 1_000;
  const fetchImpl = async (url, options) => {
    calls++;
    assert.equal(url, 'https://keygen.invalid/api/lookup-key');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return { ok: true, json: async () => ({ apiKey: 'temporary-key', expiresAt: new Date(2_000).toISOString() }) };
  };
  const options = { root, env, fetchImpl, now: () => clock };
  assert.equal(await getKey(options), 'temporary-key');
  assert.equal(await getKey(options), 'temporary-key');
  assert.equal(calls, 1);
  clock = 3_000;
  assert.equal(await getKey(options), 'temporary-key');
  assert.equal(calls, 2);
});

test('concurrent getKey calls share one MindDo lookup', async t => {
  const { root, env } = fixture(t);
  resetKeyCache();
  let calls = 0;
  const started = new Promise(resolve => setTimeout(resolve, 10));
  const fetchImpl = async () => { calls++; await started; return { ok: true, json: async () => ({ apiKey: 'shared-key', expiresAt: new Date(Date.now() + 60_000).toISOString() }) }; };
  const results = await Promise.all([getKey({ root, env, fetchImpl }), getKey({ root, env, fetchImpl })]);
  assert.deepEqual(results, ['shared-key', 'shared-key']);
  assert.equal(calls, 1);
});

test('MindDo errors show message on screen and expose fix only to server logging', async t => {
  const { root, env } = fixture(t);
  resetKeyCache();
  let calls = 0;
  await assert.rejects(getKey({ root, env, fetchImpl: async () => { calls++; return { status: 400, ok: false, json: async () => ({ error: { message: 'The token is not valid.', fix: 'Rotate KEYGEN_TOKEN in Vercel.' } }) }; } }), error => {
    assert.equal(error.message, 'The token is not valid.');
    assert.equal(error.fix, 'Rotate KEYGEN_TOKEN in Vercel.');
    assert.equal(error.status, 400);
    return true;
  });
  assert.equal(calls, 1, 'a lookup is attempted only once');
});

test('server readiness reports the sign-in error without exposing tokens', async t => {
  const { root, env } = fixture(t);
  resetKeyCache();
  const config = await getAIConfig(root, { fetchImpl: async () => ({ ok: false, status: 500, json: async () => ({ error: { message: 'The lookup service is unavailable.', fix: 'Check KEYGEN_URL with MindDo status.' } }) }), env });
  assert.equal(config.ready, false);
  assert.equal(config.model, 'test-model');
  assert.equal(config.keygenMessage, 'The lookup service is unavailable.');
  assert.equal(config.keygenFix, 'Check KEYGEN_URL with MindDo status.');
  assert.doesNotMatch(JSON.stringify(config), /test-token|keygen\.invalid/);
});

test('askOpenAI uses getKey, never its local key file, and sends only AI results upward', async t => {
  const { root, env } = fixture(t);
  resetKeyCache();
  const goal = { kind: 'food', target: 3, completed: 0 };
  let keyCalls = 0;
  let captured;
  const keyFetch = async (url, options) => {
    keyCalls++;
    assert.equal(url, 'https://keygen.invalid/api/lookup-key');
    return { ok: true, json: async () => ({ apiKey: 'temporary-openai-key', expiresAt: new Date(Date.now() + 600_000).toISOString() }) };
  };
  const openAIFetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization, 'Bearer temporary-openai-key');
    captured = JSON.parse(options.body);
    return completed;
  };
  const result = await askOpenAI({ root, goal, question: 'How can I waste less food?', fetchImpl: openAIFetch, keyFetchImpl: keyFetch, env });
  assert.equal(keyCalls, 1);
  assert.equal(captured.model, 'test-model');
  assert.equal(captured.store, false);
  assert.deepEqual(result, { answer: answer.answer, safety: 'ok', classification: 'goal', sources: [{ title: 'EPA · Waste less food at home', url: 'https://www.epa.gov/recycle/preventing-wasted-food-home' }] });
});

test('OpenAI rejecting a key asks MindDo for a replacement and retries the answer once', async t => {
  const { root, env } = fixture(t);
  resetKeyCache();
  let keyCalls = 0;
  let aiCalls = 0;
  const keyFetch = async () => {
    keyCalls++;
    return { ok: true, json: async () => ({ apiKey: `temporary-key-${keyCalls}`, expiresAt: new Date(Date.now() + 600_000).toISOString() }) };
  };
  const openAIFetch = async (url, options) => {
    aiCalls++;
    if (aiCalls === 1) return { ok: false, status: 401, json: async () => ({}) };
    assert.equal(options.headers.Authorization, 'Bearer temporary-key-2');
    return completed;
  };
  const result = await askOpenAI({ root, goal: { kind: 'litter', target: 1, completed: 0 }, question: 'What next?', fetchImpl: openAIFetch, keyFetchImpl: keyFetch, env });
  assert.equal(keyCalls, 2);
  assert.equal(aiCalls, 2);
  assert.equal(result.answer, answer.answer);
});
