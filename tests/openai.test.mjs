import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resetKeyCache } from '../keygen.mjs';
import { getAIConfig, askOpenAI } from '../openai.mjs';

function fixture(t) {
  const path = mkdtempSync(join(tmpdir(), 'de-pollution-test-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  const root = pathToFileURL(`${path}/`);
  writeFileSync(new URL('.env', root), 'KEYGEN_URL=paste-here\nKEYGEN_TOKEN=paste-here\n');
  writeFileSync(new URL('NOTES.md', root), '# Notes\nOpenAI model: test-model\n');
  const brief = readFileSync(new URL('../BRIEF.md', import.meta.url), 'utf8');
  writeFileSync(new URL('BRIEF.md', root), brief);
  return { root, brief };
}

test('configuration reads the exact model from NOTES.md', async t => {
  const { root } = fixture(t);
  assert.equal((await getAIConfig(root, { fetchImpl: async () => ({ ok: true, json: async () => ({ apiKey: 'temporary', expiresAt: new Date(Date.now() + 600_000).toISOString() }) }), env: { KEYGEN_URL: 'https://keygen.invalid', KEYGEN_TOKEN: 'test' } })).model, 'test-model');
  writeFileSync(new URL('NOTES.md', root), '# Notes\nOpenAI model: \n');
  assert.equal((await getAIConfig(root, { fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({}) }), env: { KEYGEN_URL: 'https://keygen.invalid', KEYGEN_TOKEN: 'test' } })).ready, false);
  assert.equal((await getAIConfig(root, { fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({}) }), env: { KEYGEN_URL: 'https://keygen.invalid', KEYGEN_TOKEN: 'test' } })).model, '');
  writeFileSync(new URL('NOTES.md', root), '# Notes\nOpenAI model: gpt 5.0 Luna\n');
  assert.equal((await getAIConfig(root, { fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({}) }), env: { KEYGEN_URL: 'https://keygen.invalid', KEYGEN_TOKEN: 'test' } })).model, '');
});

test('unfilled MindDo settings keep the AI off and reveal no secret value', async t => {
  const { root } = fixture(t);
  writeFileSync(new URL('.env', root), 'KEYGEN_URL=paste-here\nKEYGEN_TOKEN=paste-here\n');
  let keygenCalls = 0;
  const fetchImpl = async () => { keygenCalls++; return { ok: false, status: 400, json: async () => ({}) }; };
  const config = await getAIConfig(root, { fetchImpl, env: {} });
  assert.equal(config.ready, false);
  assert.equal(config.model, 'test-model');
  assert.equal(config.keygenReady, false);
  assert.match(config.keygenMessage, /KEYGEN_URL or KEYGEN_TOKEN/);
  assert.doesNotMatch(`${config.keygenMessage}${config.keygenFix}`, /paste-here|temporary|secret/u);
  assert.equal(keygenCalls, 0, 'placeholders are detected before any network request');
});

test('this project’s NOTES.md model line is one the app can read', async () => {
  const config = await getAIConfig(new URL('../', import.meta.url), { fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({}) }), env: { KEYGEN_URL: 'https://keygen.invalid', KEYGEN_TOKEN: 'test' } });
  assert.match(config.model, /^[a-zA-Z0-9][a-zA-Z0-9._:-]+$/, 'The "OpenAI model:" line must hold one exact API name with no spaces.');
});

test('each AI request uses getKey, the real adapter, brief system instructions and no chat storage', async t => {
  const { root, brief } = fixture(t);
  resetKeyCache();
  let captured;
  const fetchImpl = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization, 'Bearer temporary-openai-key');
    captured = JSON.parse(options.body);
    return { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ answer: 'A small step counts.', safety: 'ok', classification: 'goal', sourceIds: ['epaFood'] }) }] }] }) };
  };
  const goal = { kind: 'food', target: 3, completed: 0 };
  const goalContext = { label: 'Save food', hint: 'Use only edible portions.' };
  const result = await askOpenAI({ root, goal, goalContext, question: 'How can I waste less food?', fetchImpl,
    keyFetchImpl: async (url, options) => {
      assert.equal(url, 'https://keygen.invalid/api/lookup-key');
      assert.equal(options.headers.Authorization, 'Bearer keygen-test-token');
      return { ok: true, json: async () => ({ apiKey: 'temporary-openai-key', expiresAt: new Date(Date.now() + 600_000).toISOString() }) };
    },
    env: { KEYGEN_URL: 'https://keygen.invalid', KEYGEN_TOKEN: 'keygen-test-token' },
  });
  assert.equal(captured.model, 'test-model');
  assert.equal(captured.store, false);
  assert.equal(captured.input[0].role, 'system');
  assert.ok(captured.input[0].content.includes(brief.slice(brief.indexOf('## My AI’s instructions'))));
  assert.equal(captured.input.length, 2);
  assert.equal(captured.text.format.strict, true);
  const user = JSON.parse(captured.input[1].content);
  assert.deepEqual(user.recordedGoal, goal);
  assert.deepEqual(user.goalContext, goalContext);
  assert.equal(user.question, 'How can I waste less food?');
  assert.equal(result.classification, 'goal');
  assert.equal(result.sources[0].title, 'EPA · Waste less food at home');
});

test('malformed responses fail instead of being presented as a real answer', async t => {
  const { root } = fixture(t);
  resetKeyCache();
  const sign = {
    keyFetchImpl: async () => ({ ok: true, json: async () => ({ apiKey: 'temporary-openai-key', expiresAt: new Date(Date.now() + 600_000).toISOString() }) }),
    env: { KEYGEN_URL: 'https://keygen.invalid', KEYGEN_TOKEN: 'test' },
  };
  await assert.rejects(() => askOpenAI({ root, goal: {}, question: 'test', fetchImpl: async () => ({ ok: true, json: async () => ({ output: [] }) }), ...sign }));
});
