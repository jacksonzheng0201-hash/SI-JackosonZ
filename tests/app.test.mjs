import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goalTypes, validGoal, progress, treeStage, addProgress } from '../public/goals.js';
import { articles, featuredArticle } from '../public/articles.js';
import { containsPersonalInformation } from '../public/privacy.js';
import { loadState, saveState, removeGoal } from '../public/storage.js';

const goal = { kind: 'litter', target: 10, completed: 0 };

test('every tree milestone is reached at the right percentage', () => {
  for (let completed = 0; completed <= 10; completed++) {
    assert.equal(progress({ ...goal, completed }), completed * 10);
    assert.equal(treeStage({ ...goal, completed }), Math.floor(completed / 2));
  }
  assert.equal(progress(null), 0);
});

test('only positive, measurable and bounded goals are allowed', () => {
  for (const kind of Object.keys(goalTypes)) assert.equal(validGoal({ ...goal, kind }), true);
  for (const target of [0, -1, Infinity, NaN, 10001, 1.5, '10']) assert.equal(validGoal({ ...goal, target }), false);
  assert.equal(validGoal({ ...goal, kind: '__proto__' }), false);
  assert.equal(validGoal({ kind: 'electricity', target: 0.3, completed: 0.1 }), true);
  assert.equal(validGoal({ ...goal, completed: 11 }), false);
});

test('progress rejects negative, fractional item counts and over-reporting', () => {
  assert.deepEqual(addProgress(goal, 2), { ...goal, completed: 2 });
  for (const amount of [-1, 0, 1.5, Infinity, NaN, 11]) assert.equal(addProgress(goal, amount), null);
  assert.deepEqual(addProgress({ kind: 'electricity', target: 0.3, completed: 0.1 }, 0.2), { kind: 'electricity', target: 0.3, completed: 0.3 });
});

test('common personal details are blocked and safe goal questions are allowed', () => {
  for (const text of ['My address is 123 Example Street', '123 Example Street', 'test@example.invalid', 'My name is Example Person', 'My school is Example School', 'I live at 123 Imaginary Road', '555-010-1234', 'password: not-a-real-password', 'test [at] example [dot] invalid']) {
    assert.equal(containsPersonalInformation(text), true, text);
  }
  for (const text of ['I collected 2 of 10 items. What next?', 'How can I reuse a bag?', 'In 2018, 8.7% of plastic waste was recycled.', 'How can I stop food waste?']) {
    assert.equal(containsPersonalInformation(text), false, text);
  }
});

test('all shop articles are unique, linked, and ready for every goal', () => {
  const ids = articles.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(Object.keys(goalTypes).map(featuredArticle), ['little-cleanup', 'bag-comeback', 'leftover-remix', 'leftover-remix', 'bag-comeback']);
  for (const article of articles) {
    assert.equal(article.category.length > 0, true);
    assert.ok(article.preview.length > 0 && article.question.length > 0);
    assert.equal(article.paragraphs.length >= 3, true);
    assert.equal(typeof article.action === 'string' && article.action.length > 0, true);
    const url = new URL(article.source.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(['www.epa.gov', 'marinedebris.noaa.gov'].includes(url.hostname));
  }
});

test('goal, privacy count, and permanent shop unlock persist, but chat does not', () => {
  const memory = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  } });
  assert.equal(loadState().state.goal, null);
  assert.equal(saveState({ goal, privacyStrikes: 1, shopUnlocked: true, chat: 'must not persist' }), true);
  assert.deepEqual(loadState().state, { version: 1, goal, privacyStrikes: 1, shopUnlocked: true });
  assert.equal([...memory.values()][0].includes('must not persist'), false);
  removeGoal({ goal, privacyStrikes: 1, shopUnlocked: true });
  assert.deepEqual(loadState().state, { version: 1, goal: null, privacyStrikes: 1, shopUnlocked: true });
  memory.set('de-pollution-v1', JSON.stringify({ version: 1, goal, privacyStrikes: 0 }));
  assert.equal(loadState().state.shopUnlocked, false);
  memory.set('de-pollution-v1', '{broken');
  assert.equal(loadState().available, false);
});

test('blocked browser storage fails honestly without crashing', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem() { throw new Error('Disabled'); }, setItem() { throw new Error('Disabled'); },
  } });
  assert.equal(loadState().available, false);
  assert.equal(saveState({ goal, privacyStrikes: 0 }), false);
});
