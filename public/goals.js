export const goalTypes = {
  litter: { label: 'Collect litter', unit: 'items', singular: 'item', verb: 'collected', step: 1, hint: 'Count ordinary, safe litter items collected with an adult. Leave sharp or unknown objects alone.' },
  materials: { label: 'Reuse materials', unit: 'reuses', singular: 'reuse', verb: 'reused', step: 1, hint: 'Count times you reuse something, like bringing a reusable bag. Check local rules before recycling plastic bags.' },
  food: { label: 'Save food', unit: 'portions', singular: 'portion', verb: 'saved', step: 1, hint: 'Count edible portions you actually use instead of wasting. Ask an adult about storage and food safety.' },
  electricity: { label: 'Save electricity', unit: 'kWh', singular: 'kWh', verb: 'saved', step: 0.1, hint: 'Only log savings measured against a clear baseline. Never switch off equipment needed for health or safety.' },
  prevention: { label: 'Prevent litter', unit: 'items', singular: 'item', verb: 'avoided', step: 1, hint: 'Count single-use items avoided, such as refusing an unneeded bag. This is not a measurement of total pollution prevented.' },
};

export const sampleGoals = [
  { kind: 'litter', target: 10, title: 'Collect 10 litter items', description: 'A small, adult-supervised cleanup.' },
  { kind: 'materials', target: 5, title: 'Reuse a bag 5 times', description: 'Give something you have another turn.' },
  { kind: 'food', target: 3, title: 'Save 3 food portions', description: 'Plan a meal around food you have.' },
];

export function validGoal(goal) {
  if (!goal || !Object.hasOwn(goalTypes, goal.kind)) return false;
  const step = goalTypes[goal.kind].step;
  return Number.isFinite(goal.target) && goal.target >= step && goal.target <= 10000
    && Number.isFinite(goal.completed) && goal.completed >= 0 && goal.completed <= goal.target
    && Math.abs(goal.target / step - Math.round(goal.target / step)) < 0.000001
    && Math.abs(goal.completed / step - Math.round(goal.completed / step)) < 0.000001;
}

export function progress(goal) {
  if (!validGoal(goal)) return 0;
  return Math.min(100, Math.floor(goal.completed / goal.target * 100 + 0.000001));
}

export function treeStage(goal) {
  return Math.floor(progress(goal) / 20);
}

export function leavesForProgress(before, after) {
  const start = Number.isFinite(before) ? Math.min(100, Math.max(0, Math.floor(before))) : 0;
  const end = Number.isFinite(after) ? Math.min(100, Math.max(0, Math.floor(after))) : 0;
  return Math.max(0, Math.floor(end / 10) - Math.floor(start / 10));
}

export function addProgress(goal, quantity) {
  if (!validGoal(goal) || !Number.isFinite(quantity) || quantity <= 0) return null;
  const updated = { ...goal, completed: Math.round((goal.completed + quantity) * 10) / 10 };
  const step = goalTypes[goal.kind].step;
  if (Math.abs(quantity / step - Math.round(quantity / step)) > 0.000001) return null;
  return validGoal(updated) ? updated : null;
}
