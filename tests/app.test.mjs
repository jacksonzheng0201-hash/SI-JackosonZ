import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { goalTypes, validGoal, progress, treeStage, addProgress, leavesForProgress } from '../public/goals.js';
import { articles, featuredArticle, comics } from '../public/articles.js';
import { containsPersonalInformation } from '../public/privacy.js';
import { loadState, saveState, removeGoal } from '../public/storage.js';

const goal = { kind: 'litter', target: 10, completed: 0 };

test('the GitHub Pages entry opens public with a relative redirect and fallback link', async () => {
  const entry = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(entry, /http-equiv="refresh" content="0; url=\.\/public\/"/);
  assert.match(entry, /href="\.\/public\/"/);
});

test('page assets and home navigation stay inside a GitHub project path', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const assets = [...html.matchAll(/<(?:link|script)\b[^>]*(?:href|src)="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(assets, ['./favicon.svg', './style.css', './app.js']);
  assert.match(html, /class="brand" href="\.\/"/);
  assert.doesNotMatch(html, /(?:href|src)="\//);
  for (const base of ['http://127.0.0.1:4317/', 'https://example.github.io/SI-JackosonZ/public/']) {
    for (const asset of assets) {
      assert.equal(new URL(asset, base).pathname, new URL(base).pathname + asset.slice(2));
      assert.ok((await readFile(new URL(`../public/${asset.slice(2)}`, import.meta.url))).length > 0);
    }
  }
});

test('progress uses the exact accessible custom bar without the large number line', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /id="progress-percent"|<progress\b/);
  assert.match(html, /<div id="growth-progress" class="growth-progress" role="progressbar"[^>]*aria-valuemin="0"[^>]*aria-valuemax="100"[^>]*aria-valuenow="0"><span id="growth-progress-fill" class="growth-progress-fill"><\/span><\/div>/);
  assert.match(app, /\$\('growth-progress'\)\.setAttribute\('aria-valuenow', String\(percent\)\)/);
  assert.match(app, /\$\('growth-progress'\)\.setAttribute\('aria-valuetext', `\$\{percent\}%`\)/);
  assert.match(app, /\$\('growth-progress-fill'\)\.style\.width = `\$\{percent\}%`/);
});

test('progress and tree transitions stay smooth and respect reduced motion', async () => {
  const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.growth-progress-fill\{[^}]*transition:width \.35s cubic-bezier\(\.22,1,\.36,1\)/);
  assert.match(css, /\.tree-grown\{[^}]*transition:transform \.9s cubic-bezier\(\.22,1,\.36,1\),opacity \.4s ease/);
  assert.match(css, /\.tree-seed,\.tree-sprout\{[^}]*transition:transform \.5s cubic-bezier\(\.22,1,\.36,1\),opacity \.35s ease/);
  assert.match(css, /\.tree-fruit\{[^}]*transition:opacity \.5s ease \.2s/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\*,\*::before,\*::after\{animation:none!important;transition:none!important;scroll-behavior:auto!important\}\}/);
});

test('uplifting copy changes with the tree while progress stays factual', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  assert.match(html, /<p class="uplift-note" id="uplift-note">/);
  assert.match(html, /A symbolic tree\. Your recorded actions, not a verified climate measurement\./);
  assert.match(app, /\$\('uplift-note'\)\.textContent = encouragement\[goal \? stage \+ 1 : 0\]/);
  assert.match(app, /Your first sprout is here\. Small steps really do add up\./);
  assert.match(app, /You’re more than halfway there\. Keep going—you’ve got this\./);
  assert.match(app, /You did it\. Your care and consistency turned a small goal into something beautiful\./);
  assert.match(css, /\.uplift-note\{[^}]*background:#eef3e8/);
});

test('the Growth Shop includes free articles and the leaf-powered comic shelf', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /id="article-shelf"/);
  assert.match(html, /class="comic-shop"/);
  assert.match(html, /id="leaf-balance" aria-live="polite"/);
  assert.match(html, /id="comic-shelf"/);
  assert.match(html, /id="comic-feedback" role="status"/);
});

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

test('every goal type can reach full bloom through valid recorded steps', () => {
  const examples = [
    ['litter', 5, 1],
    ['materials', 4, 1],
    ['food', 2, 1],
    ['electricity', 0.3, 0.1],
    ['prevention', 3, 1],
  ];
  for (const [kind, target, step] of examples) {
    let current = { kind, target, completed: 0 };
    for (let i = 0; i < Math.round(target / step); i++) {
      current = addProgress(current, step);
      assert.ok(validGoal(current));
    }
    assert.equal(progress(current), 100);
    assert.equal(treeStage(current), 5);
  }
});

test('recorded progress earns one leaf per ten percentage points', () => {
  assert.equal(leavesForProgress(0, 100), 10);
  assert.equal(leavesForProgress(0, 20), 2);
  assert.equal(leavesForProgress(20, 40), 2);
  assert.equal(leavesForProgress(33, 66), 3);
  assert.equal(leavesForProgress(66, 100), 4);
  assert.equal(leavesForProgress(100, 100), 0);
  assert.equal(leavesForProgress(50, 40), 0);
});

test('common personal details are blocked and safe goal questions are allowed', () => {
  for (const text of ['My address is 123 Example Street', '123 Example Street', 'test@example.invalid', 'My name is Example Person', 'My school is Example School', 'I go to Example Middle School', 'I live at 123 Imaginary Road', '555-010-1234', 'My phone number is 555 123 4567', '+1 800 555 0199', 'password: not-a-real-password', 'test [at] example [dot] invalid']) {
    assert.equal(containsPersonalInformation(text), true, text);
  }
  for (const text of ['I collected 2 of 10 items. What next?', 'How can I reuse a bag?', 'In 2018, 8.7% of plastic waste was recycled.', 'How can I stop food waste?', 'I go to the park near my house and pick up bottles.', 'I live in a small apartment building.', 'My school is out of recycling bags.', 'My number is 10 because that is my goal.', 'There is one good 1 way to reuse bags.', 'Is 2018 2019 or 1 2 3 4 5 6 7 8 a good target?', 'What is the secret to recycling more? My secret is reusing jars.']) {
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

test('eco comics are unique, affordable with earned leaves, and source-linked', () => {
  assert.equal(new Set(comics.map(comic => comic.id)).size, comics.length);
  for (const comic of comics) {
    assert.ok(Number.isInteger(comic.price) && comic.price > 0 && comic.price <= 10);
    assert.ok(comic.title.length > 0 && comic.teaser.length > 0 && comic.action.length > 0);
    assert.ok(comic.panels.length >= 3);
    for (const panel of comic.panels) assert.ok(panel.title.length > 0 && panel.text.length > 0);
    const url = new URL(comic.source.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(['www.epa.gov', 'marinedebris.noaa.gov'].includes(url.hostname));
  }
});

test('goal, privacy count, leaves, comics, and permanent shop unlock persist, but chat does not', () => {
  const memory = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  } });
  assert.deepEqual(loadState().state, { version: 2, goal: null, privacyStrikes: 0, shopUnlocked: false, leaves: 0, ownedComics: [] });
  assert.equal(saveState({ goal, privacyStrikes: 1, shopUnlocked: true, leaves: 7, ownedComics: ['bag-comeback-comic', 'not-a-comic', 'bag-comeback-comic'], chat: 'must not persist' }), true);
  assert.deepEqual(loadState().state, { version: 2, goal, privacyStrikes: 1, shopUnlocked: true, leaves: 7, ownedComics: ['bag-comeback-comic'] });
  assert.equal([...memory.values()][0].includes('must not persist'), false);
  removeGoal({ goal, privacyStrikes: 1, shopUnlocked: true, leaves: 7, ownedComics: ['bag-comeback-comic'] });
  assert.deepEqual(loadState().state, { version: 2, goal: null, privacyStrikes: 1, shopUnlocked: true, leaves: 7, ownedComics: ['bag-comeback-comic'] });
  memory.set('de-pollution-v1', JSON.stringify({ version: 1, goal, privacyStrikes: 0 }));
  assert.deepEqual(loadState().state, { version: 2, goal, privacyStrikes: 0, shopUnlocked: false, leaves: 0, ownedComics: [] });
  memory.set('de-pollution-v1', JSON.stringify({ version: 2, leaves: -3, ownedComics: ['not-a-comic'] }));
  assert.equal(loadState().state.leaves, 0);
  assert.deepEqual(loadState().state.ownedComics, []);
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
