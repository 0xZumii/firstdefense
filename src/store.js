/**
 * store.js  -  everything that lives in the browser's own storage.
 *
 * Two things only:
 *   firstdefense.find  -  the append-only list of previous finds (nothing overwrites)
 *   firstdefense.key   -  the visitor's pasted API key (the one documented exception
 *                       to the PRD's "nothing else persists")
 *
 * Spec ref: spec.md > Components > store.js, spec.md > Data Model
 * PRD ref:  prd.md > Previous finds
 */

const FIND_KEY = 'firstdefense.find';
const API_KEY = 'firstdefense.key';
const MAX_ENTRIES = 100; // a gentle cap so storage can't grow without bound

/* ---------- low-level safe access ---------- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    // Corrupt or unavailable storage must never crash the app.
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ---------- the API key ---------- */
export function getKey() {
  try {
    return (localStorage.getItem(API_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function saveKey(key) {
  try {
    const trimmed = String(key || '').trim();
    if (!trimmed) return false;
    localStorage.setItem(API_KEY, trimmed);
    return true;
  } catch {
    return false;
  }
}

export function forgetKey() {
  try {
    localStorage.removeItem(API_KEY);
  } catch { /* nothing to do */ }
}

export function hasKey() {
  return getKey().length > 0;
}

/* ---------- previous finds ---------- */

/** Short, single-line label from the pasted message  -  for the sidebar row. */
export function makeLabel(message) {
  const flat = String(message || '').replace(/\s+/g, ' ').trim();
  return flat.length > 40 ? flat.slice(0, 40).trimEnd() + '...' : flat;
}

/** Newest-first list. Never throws; returns [] on any problem. */
export function getFinds() {
  const list = readJSON(FIND_KEY, []);
  if (!Array.isArray(list)) return [];
  return list
    .filter((f) => f && typeof f === 'object' && f.id && f.result)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Append one find. Never modifies or deletes existing entries. */
export function addFind(message, result) {
  const list = readJSON(FIND_KEY, []);
  const safeList = Array.isArray(list) ? list : [];
  const entry = {
    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2),
    createdAt: Date.now(),
    label: makeLabel(message),
    message: String(message || ''),
    result
  };
  safeList.push(entry);
  const trimmed = safeList.slice(-MAX_ENTRIES); // oldest beyond the cap fall away; nothing recent is touched
  writeJSON(FIND_KEY, trimmed);
  return entry;
}

export function getFind(id) {
  return getFinds().find((f) => f.id === id) || null;
}
