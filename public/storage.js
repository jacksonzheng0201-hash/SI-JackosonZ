import { validGoal } from './goals.js';

const KEY = 'de-pollution-v1';
const empty = () => ({ version: 1, goal: null, privacyStrikes: 0, shopUnlocked: false });

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: empty(), available: true };
    const data = JSON.parse(raw);
    const state = empty();
    if (data?.version === 1) {
      if (validGoal(data.goal)) state.goal = data.goal;
      if (Number.isInteger(data.privacyStrikes)) state.privacyStrikes = Math.min(2, Math.max(0, data.privacyStrikes));
      if (data.shopUnlocked === true) state.shopUnlocked = true;
    }
    return { state, available: true };
  } catch {
    return { state: empty(), available: false };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      version: 1,
      goal: validGoal(state.goal) ? state.goal : null,
      privacyStrikes: Math.min(2, Math.max(0, state.privacyStrikes || 0)),
      shopUnlocked: state.shopUnlocked === true,
    }));
    return true;
  } catch {
    return false;
  }
}

export function removeGoal(state) {
  return saveState({ ...state, goal: null });
}
