import { validGoal } from './goals.js';
import { comics } from './articles.js';

const KEY = 'de-pollution-v1';
const comicIds = new Set(comics.map(comic => comic.id));
const empty = () => ({ version: 2, goal: null, privacyStrikes: 0, shopUnlocked: false, leaves: 0, ownedComics: [] });
const cleanLeaves = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const cleanComics = value => Array.isArray(value) ? [...new Set(value.filter(id => comicIds.has(id)))] : [];

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: empty(), available: true };
    const data = JSON.parse(raw);
    const state = empty();
    if (data?.version === 1 || data?.version === 2) {
      if (validGoal(data.goal)) state.goal = data.goal;
      if (Number.isInteger(data.privacyStrikes)) state.privacyStrikes = Math.min(2, Math.max(0, data.privacyStrikes));
      if (data.shopUnlocked === true) state.shopUnlocked = true;
      state.leaves = cleanLeaves(data.leaves);
      state.ownedComics = cleanComics(data.ownedComics);
    }
    return { state, available: true };
  } catch {
    return { state: empty(), available: false };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      version: 2,
      goal: validGoal(state.goal) ? state.goal : null,
      privacyStrikes: Math.min(2, Math.max(0, state.privacyStrikes || 0)),
      shopUnlocked: state.shopUnlocked === true,
      leaves: cleanLeaves(state.leaves),
      ownedComics: cleanComics(state.ownedComics),
    }));
    return true;
  } catch {
    return false;
  }
}

export function removeGoal(state) {
  return saveState({ ...state, goal: null });
}
