import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server.mjs';
import { KeygenError } from '../keygen.mjs';

const goal = { kind: 'litter', target: 10, completed: 2 };
const safeAnswer = { answer: 'You recorded 2 items. Take one safe step with a trusted adult.', safety: 'ok', classification: 'goal', sources: [] };

async function setup(t, options = {}) {
  let calls = 0;
  const app = createApp({ configReader: () => ({ ready: true, model: 'test-only', key: 'not-a-real-key' }), ai: async () => { calls++; return safeAnswer; }, ...options });
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  t.after(() => new Promise(resolve => { app.close(resolve); app.closeAllConnections(); }));
  const base = `http://127.0.0.1:${app.address().port}`;
  const config = await fetch(`${base}/api/config`);
  const cookie = config.headers.get('set-cookie').split(';')[0];
  const post = (path, data = {}, headers = {}) => fetch(`${base}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, Cookie: cookie, ...headers }, body: JSON.stringify(data),
  });
  return { base, post, config, calls: () => calls };
}

test('page loading and config checks do not ask AI or expose the key', async t => {
  const app = await setup(t);
  const config = await app.config.json();
  assert.deepEqual(config, { ready: true, model: 'test-only', privacyStrikes: 0 });
  assert.equal(app.calls(), 0);
  assert.equal((await fetch(app.base)).status, 200);
  for (const path of ['/.env', '/NOTES.md', '/BRIEF.md', '/openai.mjs', '/server.mjs', '/keygen.mjs', '/.git/config', '/%2e%2e/.env']) {
    assert.equal((await fetch(`${app.base}${path}`)).status, 404, path);
  }
  const page = await fetch(app.base);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('valid check-mark request returns AI advice without changing progress', async t => {
  const app = await setup(t);
  const result = await app.post('/api/ask', { question: 'What should I do next?', goal });
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { answer: safeAnswer.answer, sources: [], classification: 'goal' });
  assert.equal(app.calls(), 1);
  assert.equal(goal.completed, 2);
});

test('goal activity reaches the AI and an off-topic reply is returned unchanged', async t => {
  let request;
  const app = await setup(t, { ai: async options => { request = options; return { ...safeAnswer, classification: 'off_topic', answer: 'That is unrelated, but your goal is waiting.' }; } });
  const result = await app.post('/api/ask', { question: 'What is a moon?', goal });
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { answer: 'That is unrelated, but your goal is waiting.', sources: [], classification: 'off_topic' });
  assert.equal(request.goalContext.label, 'Collect litter');
  assert.match(request.goalContext.hint, /adult/);
});

test('missing goal classification fails closed', async t => {
  const app = await setup(t, { ai: async () => ({ ...safeAnswer, classification: undefined }) });
  assert.equal((await app.post('/api/ask', { question: 'What next?', goal })).status, 502);
});

test('first personal-information submission warns; second locks AI without external calls', async t => {
  const app = await setup(t);
  const first = await app.post('/api/ask', { question: 'My address is 123 Example Street', goal });
  assert.equal(first.status, 422);
  assert.equal((await first.json()).privacyStrikes, 1);
  const second = await app.post('/api/ask', { question: 'My school is Example School', goal });
  assert.equal((await second.json()).privacyStrikes, 2);
  const locked = await app.post('/api/ask', { question: 'How can I reuse bags?', goal });
  assert.equal(locked.status, 423);
  assert.equal(app.calls(), 0);
});

test('browser-only privacy warnings also lock the server session', async t => {
  const app = await setup(t);
  await app.post('/api/privacy-warning');
  await app.post('/api/privacy-warning');
  assert.equal((await app.post('/api/ask', { question: 'What next?', goal })).status, 423);
  assert.equal(app.calls(), 0);
});

test('untrusted origins and invalid goals cannot trigger paid calls', async t => {
  const app = await setup(t);
  assert.equal((await app.post('/api/ask', { question: 'Help?', goal }, { Origin: 'https://example.invalid' })).status, 403);
  assert.equal((await app.post('/api/ask', { question: 'Help?', goal: { ...goal, target: -1 } })).status, 400);
  assert.equal((await app.post('/api/ask', { question: 'a'.repeat(601), goal })).status, 400);
  assert.equal((await app.post('/api/ask', { question: 'a'.repeat(9000), goal })).status, 413);
  assert.equal(app.calls(), 0);
});

test('MindDo errors show only their message while the fix goes to the server log', async t => {
  const logged = [];
  const original = console.error;
  console.error = (...args) => logged.push(args.join(' '));
  t.after(() => { console.error = original; });
  const app = await setup(t, { ai: async () => { throw new KeygenError('The token is not valid.', 'Rotate KEYGEN_TOKEN in Vercel.', 400); } });
  const result = await app.post('/api/ask', { question: 'What next?', goal });
  console.error = original;
  assert.equal(result.status, 503);
  assert.equal((await result.json()).error, 'The token is not valid.');
  assert.deepEqual(logged, ['[minddo-fix] Rotate KEYGEN_TOKEN in Vercel.']);
});

test('API failure gives a friendly sign-in message without upstream details', async t => {
  const app = await setup(t, { ai: async () => { throw new Error('Private provider error should not be sent'); } });
  const result = await app.post('/api/ask', { question: 'What next?', goal });
  assert.equal(result.status, 503);
  const body = await result.text();
  assert.match(body, /MindDo sign-in settings/);
  assert.doesNotMatch(body, /Private provider/);
});

test('missing setup does not create a fake answer or call the provider', async t => {
  const app = await setup(t, { configReader: async () => ({ ready: false, model: '', keygenReady: false, keygenMessage: 'MindDo settings are not ready.', keygenFix: 'Add both values to .env.' }) });
  const result = await app.post('/api/ask', { question: 'What next?', goal });
  assert.equal(result.status, 503);
  assert.match((await result.json()).error, /model in NOTES\.md.*MindDo settings are not ready/);
  assert.equal(app.calls(), 0);
});

test('a valid model with incomplete MindDo settings says only both MindDo values are empty', async t => {
  const app = await setup(t, { configReader: async () => ({ ready: false, model: 'test-model', keygenReady: false, keygenMessage: 'The AI is switched off because KEYGEN_URL or KEYGEN_TOKEN is still empty in .env. Your question was not sent and nothing was charged.', keygenFix: 'Add both values to .env.' }) });
  const result = await app.post('/api/ask', { question: 'What next?', goal });
  assert.equal(result.status, 503);
  assert.match((await result.json()).error, /KEYGEN_URL or KEYGEN_TOKEN is still empty in \.env/);
  assert.equal(app.calls(), 0);
});

test('parallel submissions are blocked while the first request is thinking', async t => {
  let release;
  let signalStart;
  const started = new Promise(resolve => { signalStart = resolve; });
  const app = await setup(t, { ai: async () => { signalStart(); await new Promise(resolve => { release = resolve; }); return safeAnswer; } });
  const first = app.post('/api/ask', { question: 'What next?', goal });
  await started;
  const second = await app.post('/api/ask', { question: 'What next?', goal });
  assert.equal(second.status, 429);
  release();
  assert.equal((await first).status, 200);
});

test('AI-discovered personal information is hidden and raises a privacy warning', async t => {
  const app = await setup(t, { ai: async () => ({ safety: 'personal_info', answer: 'Must never be shown', sources: [] }) });
  const response = await app.post('/api/ask', { question: 'A detail missed by simple patterns', goal });
  const result = await response.json();
  assert.equal(response.status, 422);
  assert.equal(result.privacyStrikes, 1);
  assert.doesNotMatch(JSON.stringify(result), /Must never/);
});
