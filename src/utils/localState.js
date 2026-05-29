// src/utils/localState.js
// Lokalno čuvanje (localStorage) trenutnog trebovanja i istorije.
// Sve se čuva isključivo na uređaju, sa rokom od 14 dana.

const DRAFT_KEY = 'trebovanje_draft_v1';
const HISTORY_KEY = 'trebovanje_history_v1';
const THEME_KEY = 'trebovanje_theme';

const RETENTION_MS = 14 * 24 * 60 * 60 * 1000; // 14 dana
const HISTORY_LIMIT = 50;

const hasWindow = () => typeof window !== 'undefined';

function readJSON(key) {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJSON(key, value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // npr. quota / private mode — tiho ignorišemo
  }
}

/* ---------- Draft (trenutno trebovanje) ---------- */

export function loadDraft() {
  const draft = readJSON(DRAFT_KEY);
  if (!draft || !draft.savedAt) return null;
  if (Date.now() - draft.savedAt > RETENTION_MS) {
    clearDraft();
    return null;
  }
  return {
    orders: draft.orders || {},
    variantOrders: draft.variantOrders || {},
    notes: draft.notes || '',
  };
}

export function saveDraft(orders, variantOrders, notes) {
  const hasContent =
    (orders && Object.keys(orders).length > 0) ||
    (variantOrders && Object.keys(variantOrders).length > 0) ||
    (notes && notes.trim());
  if (!hasContent) {
    clearDraft();
    return;
  }
  writeJSON(DRAFT_KEY, { orders, variantOrders, notes, savedAt: Date.now() });
}

export function clearDraft() {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------- Istorija poslatih trebovanja ---------- */

function prune(list) {
  const now = Date.now();
  return (Array.isArray(list) ? list : [])
    .filter((e) => e && e.createdAt && now - e.createdAt <= RETENTION_MS)
    .slice(0, HISTORY_LIMIT);
}

export function loadHistory() {
  const pruned = prune(readJSON(HISTORY_KEY));
  writeJSON(HISTORY_KEY, pruned);
  return pruned;
}

export function addToHistory(entry) {
  // entry: { text, count, orders, variantOrders, notes }
  const list = prune(readJSON(HISTORY_KEY));
  const record = {
    id: `h_${Date.now()}`,
    createdAt: Date.now(),
    text: entry.text,
    count: entry.count,
    orders: entry.orders || {},
    variantOrders: entry.variantOrders || {},
    notes: entry.notes || '',
  };
  const next = [record, ...list].slice(0, HISTORY_LIMIT);
  writeJSON(HISTORY_KEY, next);
  return next;
}

export function deleteHistory(id) {
  const next = prune(readJSON(HISTORY_KEY)).filter((e) => e.id !== id);
  writeJSON(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  writeJSON(HISTORY_KEY, []);
  return [];
}

/* ---------- Tema ---------- */

export function loadTheme() {
  if (!hasWindow()) return 'system';
  try {
    return window.localStorage.getItem(THEME_KEY) || 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(theme) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function applyTheme(theme) {
  if (!hasWindow()) return;
  const root = document.documentElement;
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', dark);
}
