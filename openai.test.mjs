import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getAIConfig, askOpenAI } from '../openai.mjs';

function fixture(t) {
  const path = mkdtempSync(join(tmpdir(), 'de-pollution-test-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  const root = pathToFileURL(`${path}/`);
  writeFileSync(new URL('.env', root), 'OPENAI_API_KEY=fictional-test-token\n');
  writeFileSync(new URL('NOTES.md', root), '# Notes\nOpenAI model: test-model\n');
  const brief = readFileSync(new URL('../BRIEF.md', import.meta.url), 'utf8');
  writeFileSync(new URL('BRIEF.md', root), brief);
  return { root, brief };
}

test('configuration comes from .env and the model line in NOTES.md', t => {
  const { root } = fixture(t);
  assert.deepEqual(getAIConfig(root), { key: 'fictional-test-token', model: 'test-model', ready: true });
  writeFileSync(new URL('NOTES.md', root), '# Notes\nOpenAI model: \n');
  assert.equal(getAIConfig(root).ready, false);
  assert.equal(getAIConfig(root).model, '');
  writeFileSync(new URL('NOTES.md', root), '# Notes\nOpenAI model: gpt 5.0 Luna\n');
  assert.equal(getAIConfig(root).model, '');
  assert.equal(getAIConfig(root).ready, false);
});

test('placeholder key wording is treated as no key, so the app never claims to be ready', t => {
  const { root } = fixture(t);
  const cases = [['paste-your-key-here', false], ['PASTE_YOUR_API_KEY', false], ['your key here', false], ['your_api_key', false], ['fictional-lookalike-9f3a71', true]];
  for (const [value, filled] of cases) {
    writeFileSync(new URL('.env', root), `OPENAI_API_KEY=${value}\n`);
    assert.equal(getAIConfig(root).ready, filled, value);
  }
});

test('the visible key file works when the hidden one is still a placeholder', t => {
  const { root } = fixture(t);
  writeFileSync(new URL('.env', root), 'OPENAI_API_KEY=paste-your-key-here\n');
  assert.equal(getAIConfig(root).ready, false);
  writeFileSync(new URL('PASTE-KEY-HERE.txt', root), 'OPENAI_API_KEY=fictional-helper-token\n');
  assert.equal(getAIConfig(root).ready, true);
  assert.equal(getAIConfig(root).key, 'fictional-helper-token');
});

test('this project’s NOTES.md model line is one the app can read', () => {
  const config = getAIConfig(new URL('../', import.meta.url));
  assert.match(config.model, /^[a-zA-Z0-9][a-zA-Z0-9._:-]+$/, 'The "OpenAI model:" line must hold one exact API name with no spaces.');
});

test('each AI request uses the real adapter, brief system instructions and no chat storage', async t => {
  const { root, brief } = fixture(t);
  let captured;
  const fetchImpl = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization, 'Bearer fictional-test-token');
    captured = JSON.parse(options.body);
    return { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ answer: 'A small step counts.', safety: 'ok', classification: 'goal', sourceIds: ['epaFood'] }) }] }] }) };
  };
  const goal = { kind: 'food', target: 3, completed: 0 };
  const goalContext = { label: 'Save food', hint: 'Use only edible portions.' };
  const result = await askOpenAI({ root, goal, goalContext, question: 'How can I waste less food?', fetchImpl });
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
  await assert.rejects(() => askOpenAI({ root, goal: {}, question: 'test', fetchImpl: async () => ({ ok: true, json: async () => ({ output: [] }) }) }));
});
