import { goalTypes, sampleGoals, progress, treeStage, validGoal, addProgress, leavesForProgress } from './goals.js';
import { articles, featuredArticle, comics } from './articles.js';
import { loadState, saveState, removeGoal } from './storage.js';
import { containsPersonalInformation, privacyMessage } from './privacy.js';

const $ = id => document.getElementById(id);
const loaded = loadState();
let state = loaded.state;
let savingWorks = loaded.available;
let busy = false;
let configChecked = false;
let selectedKind = 'litter';
const isGitHubPages = location.hostname.endsWith('.github.io');
const stageNames = ['Planted', 'Sprout', 'Seedling', 'Sapling', 'Growing', 'Full bloom'];

function showSaveStatus() {
  $('save-status').classList.toggle('error', !savingWorks);
  $('save-status').querySelector('span').textContent = savingWorks
    ? 'Saves on this computer only for now.'
    : 'Browser saving is unavailable. Keep this page open; progress may be lost on refresh.';
}

function persist() {
  savingWorks = saveState(state);
  showSaveStatus();
}

function feedback(message, error = false) {
  $('goal-feedback').textContent = message;
  $('goal-feedback').classList.toggle('error', error);
}

function chatFeedback(message, locked = false) {
  $('chat-feedback').textContent = message;
  $('chat-feedback').hidden = !message;
  $('chat-feedback').classList.toggle('locked', locked);
}

function comicFeedback(message, error = false) {
  $('comic-feedback').textContent = message;
  $('comic-feedback').classList.toggle('error', error);
}

function updateChatControls() {
  const locked = state.privacyStrikes >= 2;
  $('question').disabled = locked || busy || isGitHubPages;
  $('ask-button').disabled = locked || busy || !state.goal || !$('question').value.trim() || !configChecked;
  $('ask-label').textContent = busy ? 'Thinking…' : locked ? 'AI closed' : isGitHubPages ? 'AI unavailable here' : 'Ask guide';
  $('char-count').textContent = `${$('question').value.length} / 600`;
  $('chat-form').setAttribute('aria-busy', String(busy));
  document.body.classList.toggle('busy', busy);
  document.querySelectorAll('[data-prompt]').forEach(button => { button.disabled = locked || busy || isGitHubPages; });
  $('change-goal').disabled = busy;
  $('new-goal').disabled = busy;
  $('log-form').querySelectorAll('input, button').forEach(element => { element.disabled = busy; });
  if (locked) chatFeedback(privacyMessage(2), true);
}

function updateGoalInput() {
  selectedKind = $('goal-kind').value;
  const type = goalTypes[selectedKind];
  $('target-unit').textContent = type.unit;
  $('goal-hint').textContent = type.hint;
  $('goal-target').step = String(type.step);
  $('goal-target').min = String(type.step);
}

function renderGoal() {
  const goal = state.goal;
  const percent = progress(goal);
  const stage = treeStage(goal);
  const complete = Boolean(goal && percent === 100);
  if (complete && !state.shopUnlocked) { state.shopUnlocked = true; persist(); }
  $('goal-form').hidden = Boolean(goal);
  $('sample-section').hidden = Boolean(goal);
  $('log-form').hidden = !goal || complete;
  $('change-goal').hidden = !goal;
  $('complete-message').hidden = !complete;
  $('goal-form-title').textContent = goal ? 'Every little action counts' : 'Choose your small change';
  $('tree-picture').dataset.stage = goal ? String(stage) : 'preview';
  $('tree-picture').setAttribute('aria-label', goal ? `Your symbolic tree: ${stageNames[stage]}, ${percent} percent of your goal recorded` : 'Preview of the tree you can grow');
  $('stage-badge').textContent = goal ? `${stageNames[stage]} · ${stage}/5` : 'Ready to plant';
  $('garden-title').textContent = complete ? 'Look what your little steps grew.' : goal ? 'One little action at a time.' : 'A small start. A greener you.';
  $('landscape-caption').textContent = !goal ? 'Imagine what a little care can grow.' : complete ? 'A small promise, beautifully kept.' : stage === 0 ? 'Every growing story starts with a seed.' : 'A little progress is still progress.';
  $('progress-percent').replaceChildren(document.createTextNode(String(percent)));
  const percentSymbol = document.createElement('span');
  percentSymbol.textContent = '%';
  $('progress-percent').append(percentSymbol);
  $('growth-progress').value = percent;
  $('growth-progress').textContent = `${percent}%`;
  document.querySelectorAll('[data-milestone]').forEach(element => element.classList.toggle('reached', Boolean(goal && percent >= Number(element.dataset.milestone))));
  if (goal) {
    const type = goalTypes[goal.kind];
    $('goal-label').textContent = type.label;
    $('goal-count').textContent = `${goal.completed} of ${goal.target} ${type.unit} ${type.verb}`;
    $('log-unit').textContent = type.unit;
    $('log-amount').step = String(type.step);
    $('log-amount').min = String(type.step);
    $('log-amount').max = String(Math.round((goal.target - goal.completed) * 10) / 10);
    $('log-amount').value = String(Math.min(1, Math.round((goal.target - goal.completed) * 10) / 10));
    $('log-hint').textContent = type.hint;
  } else {
    $('goal-label').textContent = 'Your first goal is waiting';
    $('goal-count').textContent = 'Plant a goal below to start your story.';
  }
  updateChatControls();
  renderShop();
  showSaveStatus();
}

function articleCard(article) {
  const card = document.createElement('article');
  card.className = `article-card color-${article.color}`;
  const heading = document.createElement('div');
  heading.className = 'article-card-heading';
  const icon = document.createElement('span');
  icon.className = 'article-icon';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  const use = document.createElementNS('http://www.w3.org/1999/xlink', 'use');
  use.setAttribute('href', `#${article.icon}`);
  svg.append(use);
  icon.append(svg);
  const text = document.createElement('div');
  const category = document.createElement('p');
  category.className = 'article-category';
  category.textContent = article.category;
  const title = document.createElement('h3');
  title.textContent = article.title;
  text.append(category, title);
  heading.append(icon, text);
  const preview = document.createElement('p');
  preview.className = 'article-preview';
  preview.textContent = article.preview;
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'article-open';
  open.textContent = state.shopUnlocked ? 'Read the story' : 'Locked until your first tree is grown';
  open.disabled = !state.shopUnlocked;
  open.addEventListener('click', () => openArticle(article));
  card.append(heading, preview, open);
  return card;
}

function renderShop() {
  const featured = state.goal ? featuredArticle(state.goal.kind) : null;
  const visible = featured ? [featured, ...articles.map(a => a.id).filter(id => id !== featured)] : articles.map(a => a.id);
  $('shop-state').textContent = state.shopUnlocked ? 'Open' : 'Locked';
  $('shop-state').classList.toggle('unlocked', state.shopUnlocked);
  $('shop-description').textContent = state.shopUnlocked
    ? 'Your first tree opened the shop. Articles stay free, and eco comics can be collected with leaves you earned by recording safe progress.'
    : 'Free true stories and little green comics are waiting. Your first fully grown tree opens the door.';
  $('shop-lock-note').textContent = state.shopUnlocked
    ? 'Articles stay free. Comics use earned leaves only—never real money or personal information.'
    : 'Finish one goal to open free articles and leaf-powered comics. Keep going—one small action at a time.';
  $('article-shelf').replaceChildren(...visible.map(id => articleCard(articles.find(article => article.id === id))));
  renderComicShop();
}

function articleParagraph(text, className = '') {
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  if (className) paragraph.className = className;
  return paragraph;
}

function openArticle(article) {
  const content = document.createElement('div');
  content.className = `article-reader color-${article.color}`;
  const label = document.createElement('p');
  label.className = 'eyebrow';
  label.textContent = article.category;
  const title = document.createElement('h2');
  title.textContent = article.title;
  content.append(label, title, ...article.paragraphs.map(paragraph => articleParagraph(paragraph)));
  const action = articleParagraph(article.action, 'article-action');
  content.append(action);
  const source = document.createElement('a');
  source.href = article.source.url;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = `${article.source.title} ↗`;
  content.append(articleParagraph('READ THE REAL SOURCE', 'article-source-label'), source);
  const ask = document.createElement('button');
  ask.type = 'button';
  ask.className = 'article-question';
  ask.textContent = isGitHubPages ? 'AI guide is available in the local app' : 'Ask your guide about this';
  ask.disabled = isGitHubPages;
  ask.addEventListener('click', () => {
    $('question').value = article.question;
    updateChatControls();
    $('info-dialog').close();
    $('question').focus();
    chatFeedback('Press the check mark to ask the AI about this article.');
    document.querySelector('.guide-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  content.append(ask);
  $('dialog-content').replaceChildren(content);
  $('info-dialog').showModal();
}

function svgIcon(id, className = 'icon') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', className);
  const use = document.createElementNS('http://www.w3.org/1999/xlink', 'use');
  use.setAttribute('href', `#${id}`);
  svg.append(use);
  return svg;
}

function comicCard(comic) {
  const owned = state.ownedComics.includes(comic.id);
  const card = document.createElement('article');
  card.className = `comic-card color-${comic.color}${owned ? ' owned' : ''}`;
  const cover = document.createElement('div');
  cover.className = 'comic-cover';
  const issue = document.createElement('span');
  issue.className = 'comic-issue';
  issue.textContent = `ISSUE ${comic.issue}`;
  cover.append(svgIcon(comic.icon), issue);
  const title = document.createElement('h4');
  title.textContent = comic.title;
  const teaser = document.createElement('p');
  teaser.className = 'comic-preview';
  teaser.textContent = comic.teaser;
  const price = document.createElement('span');
  price.className = 'comic-price';
  price.textContent = owned ? 'In your collection' : `${comic.price} leaves`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `comic-buy${owned ? ' owned' : ''}${!owned && state.leaves < comic.price ? ' unaffordable' : ''}`;
  button.textContent = owned ? 'Read again' : state.shopUnlocked ? `Buy for ${comic.price} leaves` : 'Unlocks with your first tree';
  button.disabled = !state.shopUnlocked;
  button.addEventListener('click', () => {
    if (!state.shopUnlocked) return;
    if (owned) openComic(comic);
    else buyComic(comic);
  });
  card.append(cover, title, teaser, price, button);
  return card;
}

function renderComicShop() {
  const leafLabel = document.createElement('span');
  leafLabel.textContent = `${state.leaves} ${state.leaves === 1 ? 'leaf' : 'leaves'}`;
  $('leaf-balance').replaceChildren(svgIcon('i-leaf', 'icon small'), leafLabel);
  $('comic-shop-note').textContent = state.shopUnlocked
    ? 'Spend your leaves on mini comics about reuse, food, and wildlife. Every comic is yours to reread, even after you plant another goal.'
    : 'Your first full tree opens this shelf. You can already earn one leaf for each 10% of goal progress you record.';
  $('comic-shelf').replaceChildren(...comics.map(comicCard));
}

function buyComic(comic) {
  if (!state.shopUnlocked) return comicFeedback('Grow your first tree to open the comic shelf.', true);
  if (state.ownedComics.includes(comic.id)) return openComic(comic);
  if (state.leaves < comic.price) {
    return comicFeedback(`You need ${comic.price - state.leaves} more ${comic.price - state.leaves === 1 ? 'leaf' : 'leaves'} for this comic. Record more safe progress to earn them.`, true);
  }
  state.leaves -= comic.price;
  state.ownedComics = [...state.ownedComics, comic.id];
  persist();
  renderComicShop();
  comicFeedback(`You collected “${comic.title}.” It is yours to read anytime.`);
}

function openComic(comic) {
  const content = document.createElement('div');
  content.className = `comic-reader color-${comic.color}`;
  const label = document.createElement('p');
  label.className = 'eyebrow';
  label.textContent = `ECO COMIC ${comic.issue} · A MADE-UP STORY WITH REAL FACTS`;
  const title = document.createElement('h2');
  title.textContent = comic.title;
  const teaser = document.createElement('p');
  teaser.className = 'comic-teaser';
  teaser.textContent = comic.teaser;
  const panels = document.createElement('div');
  panels.className = 'comic-panels';
  for (const [index, panel] of comic.panels.entries()) {
    const frame = document.createElement('section');
    frame.className = 'comic-panel';
    const marker = document.createElement('span');
    marker.className = 'comic-panel-marker';
    marker.append(svgIcon(panel.icon, 'icon small'));
    const body = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = `${index + 1}. ${panel.title}`;
    const text = document.createElement('p');
    text.textContent = panel.text;
    body.append(heading, text);
    frame.append(marker, body);
    panels.append(frame);
  }
  const action = articleParagraph(comic.action, 'comic-action');
  const sourceLabel = articleParagraph('READ THE REAL SOURCE', 'article-source-label');
  const source = document.createElement('a');
  source.href = comic.source.url;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = `${comic.source.title} ↗`;
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'comic-back';
  back.textContent = 'Back to the comic shelf';
  back.addEventListener('click', () => $('info-dialog').close());
  content.append(label, title, teaser, panels, action, sourceLabel, source, back);
  $('dialog-content').replaceChildren(content);
  $('info-dialog').showModal();
}

for (const [value, type] of Object.entries(goalTypes)) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = type.label;
  $('goal-kind').append(option);
}
for (const sample of sampleGoals) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = sample.title;
  button.title = `Made-up example: ${sample.description}`;
  button.addEventListener('click', () => {
    $('goal-kind').value = sample.kind;
    $('goal-target').value = String(sample.target);
    updateGoalInput();
    feedback('Example loaded. Press “Plant my goal” to start at zero.');
  });
  $('samples').append(button);
}
$('goal-kind').addEventListener('change', updateGoalInput);
$('goal-form').addEventListener('submit', event => {
  event.preventDefault();
  const goal = { kind: selectedKind, target: Number($('goal-target').value), completed: 0 };
  if (!validGoal(goal)) return feedback('Choose a positive target up to 10,000. Use whole items, or tenths for kWh.', true);
  state.goal = goal;
  persist();
  renderGoal();
  feedback(isGitHubPages ? 'Your goal is planted. Take a safe step, then record what you did.' : 'Your goal is planted. Ask your guide for one safe first step.');
  if (!isGitHubPages) $('question').focus({ preventScroll: true });
});
$('log-form').addEventListener('submit', event => {
  event.preventDefault();
  if (busy) return;
  const before = progress(state.goal);
  const updated = addProgress(state.goal, Number($('log-amount').value));
  if (!updated) return feedback('Enter a positive amount no larger than what is left in your goal.', true);
  const after = progress(updated);
  const earned = leavesForProgress(before, after);
  state.goal = updated;
  state.leaves += earned;
  persist();
  renderGoal();
  const leafNote = earned ? ` You earned ${earned} ${earned === 1 ? 'leaf' : 'leaves'} for the comic shelf.` : '';
  feedback(after === 100 ? `100% recorded. Your tree is fully grown—the Growth Shop is open!${leafNote}` : `${after}% recorded. Small steps count.${leafNote}`);
});

function showDialog(html) {
  $('dialog-content').innerHTML = html;
  $('info-dialog').showModal();
}
function confirmChange() {
  if (busy) return;
  showDialog('<h2>A fresh little start?</h2><p>This removes your current goal and its recorded progress from this browser. Your AI privacy warnings will stay. There is no pressure to start over.</p><div class="dialog-actions"><button class="danger-button" id="confirm-change">Clear goal and start again</button><button class="text-button" id="cancel-change">Keep my tree</button></div>');
  $('cancel-change').addEventListener('click', () => $('info-dialog').close());
  $('confirm-change').addEventListener('click', () => {
    savingWorks = removeGoal(state);
    state.goal = null;
    $('chat-area').replaceChildren();
    $('question').value = '';
    renderGoal();
    renderShop();
    feedback('Choose a new goal when you feel ready.');
    $('info-dialog').close();
    $('goal-kind').focus();
  });
}
$('change-goal').addEventListener('click', confirmChange);
$('new-goal').addEventListener('click', confirmChange);
$('close-dialog').addEventListener('click', () => $('info-dialog').close());
$('how-button').addEventListener('click', () => showDialog('<h2>One goal. A little growth.</h2><ol><li><strong>Plant a goal.</strong> Choose something small and safe. The examples are made up; every new goal starts at zero.</li><li><strong>Ask your guide.</strong> Type a question and press the check mark. Only then does the server ask OpenAI, using your goal and the instructions in BRIEF.md.</li><li><strong>Take a safe step.</strong> Record what you actually did. Your tree grows at 20%, 40%, 60%, 80%, and 100%.</li><li><strong>Open the Growth Shop.</strong> Finish one goal to read three free true stories and collect mini eco comics with leaves earned from your recorded progress.</li></ol><p>The tree is a progress picture, not a real planted tree or proof of pollution prevented. Your goal, leaves, and comics save only in this browser. Chats are not saved by this app.</p><p><strong>Made for small beginnings.</strong> No account, real-money purchases, public rankings, or pressure. You earn one leaf for each 10% of goal progress. After your first tree reaches 100%, the Growth Shop opens and stays open on this computer.</p>'));
$('sources-button').addEventListener('click', () => showDialog('<h2>Real sources. Small steps.</h2><p>Our guide uses these checked sources, not a live web search. Older figures keep their original dates.</p><ul><li><a href="https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials" target="_blank" rel="noopener noreferrer">EPA: everyday waste in the U.S.</a><br>292.4 million tons generated in 2018. This is not a measurement of litter.</li><li><a href="https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data" target="_blank" rel="noopener noreferrer">EPA: plastic recycling</a><br>8.7% of plastic municipal waste recycled in 2018. The rest did not all enter the ocean.</li><li><a href="https://marinedebris.noaa.gov/why-marine-debris-problem/ingestion" target="_blank" rel="noopener noreferrer">NOAA: plastic and wildlife</a><br>Eating plastic can injure animals and block their digestive systems.</li><li><a href="https://www.epa.gov/recycle/preventing-wasted-food-home" target="_blank" rel="noopener noreferrer">EPA: prevent wasted food at home</a><br>Plan around food you have before buying more.</li></ul><p>Existing tools such as Recycle Coach already help people recycle. Our prototype combines a personal goal, a tree, and guidance based on recorded progress. We have not proven it changes habits better than other tools.</p>'));

$('question').addEventListener('input', updateChatControls);
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => {
  $('question').value = button.dataset.prompt;
  updateChatControls();
  $('question').focus();
  if (!state.goal) chatFeedback('Plant your goal first, then press the check mark to ask.');
}));

async function recordPrivacyWarning() {
  state.privacyStrikes = Math.min(2, state.privacyStrikes + 1);
  $('question').value = '';
  persist();
  chatFeedback(privacyMessage(state.privacyStrikes), state.privacyStrikes >= 2);
  updateChatControls();
  try {
    const response = await fetch('/api/privacy-warning', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    if (Number.isInteger(data.privacyStrikes)) {
      state.privacyStrikes = Math.max(state.privacyStrikes, data.privacyStrikes);
      persist();
    }
  } catch {}
  chatFeedback(privacyMessage(state.privacyStrikes), state.privacyStrikes >= 2);
  updateChatControls();
}

$('chat-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || state.privacyStrikes >= 2 || !configChecked) return;
  if (!state.goal) return chatFeedback('Plant a goal first so your guide can help with your next step.');
  const question = $('question').value.trim();
  if (!question) return;
  if (containsPersonalInformation(question)) {
    busy = true;
    try { await recordPrivacyWarning(); }
    finally { busy = false; updateChatControls(); }
    return;
  }
  busy = true;
  chatFeedback('');
  updateChatControls();
  const userMessage = document.createElement('div');
  userMessage.className = 'user-message';
  userMessage.textContent = question;
  const thinking = document.createElement('div');
  thinking.className = 'thinking-message';
  thinking.textContent = 'Thinking…';
  $('chat-area').replaceChildren(userMessage, thinking);
  try {
    const response = await fetch('/api/ask', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, goal: state.goal }), signal: AbortSignal.timeout(55000),
    });
    const data = await response.json();
    thinking.remove();
    if (!response.ok) {
      if (Number.isInteger(data.privacyStrikes)) {
        state.privacyStrikes = Math.max(state.privacyStrikes, data.privacyStrikes);
        persist();
        userMessage.remove();
        $('question').value = '';
      }
      chatFeedback(data.error || 'The AI could not answer. Please check the key and internet connection with a trusted adult.', state.privacyStrikes >= 2);
      return;
    }
    const answer = document.createElement('div');
    answer.className = 'assistant-message';
    const label = document.createElement('span');
    label.className = 'message-eyebrow';
    label.textContent = data.classification === 'off_topic' ? 'GREEN GUIDE · GENERAL NOTE' : 'YOUR GREEN GUIDE';
    const text = document.createElement('p');
    text.textContent = data.answer;
    answer.append(label, text);
    if (data.classification === 'off_topic') answer.append(articleParagraph('This is outside your current goal, but you can ask your guide to bring it back to your next step.', 'off-topic-note'));
    if (data.sources?.length) {
      const links = document.createElement('div');
      links.className = 'source-links';
      for (const source of data.sources) {
        const url = new URL(source.url);
        if (url.protocol !== 'https:' || !['www.epa.gov', 'marinedebris.noaa.gov'].includes(url.hostname)) continue;
        const link = document.createElement('a');
        link.href = source.url;
        link.textContent = `${source.title} ↗`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        links.append(link);
      }
      answer.append(links);
    }
    $('chat-area').append(answer);
    $('question').value = '';
    $('chat-area').scrollTop = $('chat-area').scrollHeight;
  } catch {
    thinking.remove();
    chatFeedback('The AI could not answer. Please ask a trusted adult to check the MindDo settings in .env and your internet connection, then try again.');
  } finally {
    busy = false;
    updateChatControls();
  }
});

async function checkConfig() {
  if (isGitHubPages) {
    $('connection-status').classList.add('unready');
    $('connection-status').querySelector('span:last-child').textContent = 'GitHub Pages · goals, articles, and comics work; AI is unavailable here';
    $('chat-area').replaceChildren();
    chatFeedback('GitHub Pages cannot run the AI server. You can still plant a goal, grow your tree, read articles, and collect eco comics with earned leaves. Use the app running on your computer for AI guidance. Never upload an API key to GitHub.');
    updateChatControls();
    return;
  }
  try {
    const response = await fetch('/api/config', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('SETUP_UNAVAILABLE');
    const config = await response.json();
    configChecked = true;
    if (Number.isInteger(config.privacyStrikes) && config.privacyStrikes > state.privacyStrikes) {
      state.privacyStrikes = Math.min(2, config.privacyStrikes);
      persist();
    }
    $('connection-status').classList.toggle('unready', !config.ready);
    $('connection-status').querySelector('span:last-child').textContent = config.ready
      ? `OpenAI ${config.model} ready · only answers when you ask`
      : config.model ? `Model ${config.model} is set · add KEYGEN_URL and KEYGEN_TOKEN to .env` : 'AI setup needed · add the model and MindDo settings';
  } catch {
    $('connection-status').classList.add('unready');
    $('connection-status').querySelector('span:last-child').textContent = 'Local server unavailable · restart and refresh';
    chatFeedback('Please start the local server and refresh. If the AI still cannot answer, ask an adult to check the MindDo settings in .env.');
  }
  updateChatControls();
}
updateGoalInput();
renderGoal();
checkConfig();
