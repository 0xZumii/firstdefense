/**
 * app.js  -  flow and rendering for First Defense.
 *
 * Slice 2: the real breakdown. Pressing "Find out now" now sends the pasted
 * message to the model through api.js, validates it through schema.js, and
 * renders it. All error states are wired.
 *
 * Spec ref: spec.md > Components > The page shell, spec.md > Components > app.js
 * PRD ref:  prd.md > Screens and Layout, prd.md > The Core Journey
 */

import {
  GENERAL_PHRASES,
  NEXT_STEP_TEXT,
  PHONE_GUIDANCE_TEXT,
  ERROR_COPY,
  NO_ASK_TEXT,
  NO_TACTICS_TEXT,
  NO_MATCH_TEXT
} from './phrases.js';
import { analyze, ERROR, MAX_INPUT_CHARS } from './api.js';
import { textPushesPhoneNumber } from './schema.js';
import { getKey, saveKey, forgetKey, hasKey, addFind, getFinds } from './store.js';

/* ------------------------------------------------------------------ *
 * Tiny helpers  -  every model-derived string goes in with textContent,
 * never innerHTML. Nothing from a message is ever parsed as markup.
 * ------------------------------------------------------------------ */
const el = (id) => document.getElementById(id);
const setText = (node, text) => { node.textContent = text; };
const clear = (node) => { node.replaceChildren(); };

/* ------------------------------------------------------------------ *
 * Render states (spec.md > Components > The page shell):
 *   1 arrival ? 2 processing ? 3 result ? 4 no-key ? 5 error
 * ------------------------------------------------------------------ */
const STATES = {
  FIND: 'stateFind',
  RESULT: 'stateResult',
  NO_KEY: 'stateNoKey',
  ERROR: 'stateError'
};

let inputLocked = false;

function showState(name) {
  for (const id of Object.values(STATES)) el(id).hidden = (id !== name);
  el('haveAnotherBtn').hidden = (name !== STATES.RESULT);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setProcessing(on) {
  el('processing').hidden = !on;
  el('findBtn').disabled = on;
  inputLocked = on;
}

/**
 * Return to the arrival state from anywhere - result, error, or no-key.
 * Keeps the typed message, so a user who hit a too-long error can trim it
 * rather than retype. History is untouched.
 */
function returnHome() {
  showState(STATES.FIND);
  renderSidebar();
  el('messageInput').focus();
}

/* ------------------------------------------------------------------ *
 * Previous finds sidebar (prd.md > Previous finds)
 * ------------------------------------------------------------------ */
function formatWhen(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function renderSidebar(selectedId = null) {
  const finds = getFinds();
  const list = el('sidebarList');
  clear(list);

  el('sidebarEmpty').hidden = finds.length > 0;

  for (const find of finds) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sidebar-item' + (find.id === selectedId ? ' selected' : '');
    btn.dataset.findId = find.id;

    const label = document.createElement('span');
    label.className = 'sidebar-label';
    setText(label, find.label || '(no text)');

    const when = document.createElement('span');
    when.className = 'sidebar-when';
    setText(when, formatWhen(find.createdAt));

    btn.append(label, when);
    btn.addEventListener('click', () => {
      renderResult(find.result, { rawMessage: find.message });
      renderSidebar(find.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    li.appendChild(btn);
    list.appendChild(li);
  }
}

/* ------------------------------------------------------------------ *
 * Rendering a result (prd.md > The breakdown  -  fixed shape, same order)
 * ------------------------------------------------------------------ */
function renderResult(result, { rawMessage = '', sample = false } = {}) {
  // 1. the flat ask
  const ask = (result.ask || '').trim();
  setText(el('askText'), ask || NO_ASK_TEXT);
  // 2. the tactic(s)  -  the one accent-colored block (static UI, model text only)
  const tactics = Array.isArray(result.tactics) ? result.tactics : [];
  const tacticList = el('tacticList');
  clear(tacticList);
  if (tactics.length === 0) {
    const li = document.createElement('li');
    const why = document.createElement('p');
    why.className = 'tactic-why';
    setText(why, NO_TACTICS_TEXT);
    li.appendChild(why);
    tacticList.appendChild(li);
  } else {
    for (const t of tactics) {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.className = 'tactic-name';
      setText(name, t.name || 'Pressure tactic');
      const why = document.createElement('p');
      why.className = 'tactic-why';
      setText(why, t.explanation || '');
      li.append(name, why);
      tacticList.appendChild(li);
    }
  }

  // 3. matching real scams
  const scams = Array.isArray(result.similarScams) ? result.similarScams : [];
  const scamList = el('scamList');
  clear(scamList);
  if (scams.length === 0) {
    const li = document.createElement('li');
    setText(li, NO_MATCH_TEXT);
    scamList.appendChild(li);
  } else {
    for (const s of scams) {
      const li = document.createElement('li');
      setText(li, s);
      scamList.appendChild(li);
    }
  }

  // 4. independent-number guidance  -  shown if the model flagged it OR the raw text
  //    clearly contains one. The second check means a scrambled model answer can't
  //    silently hide the one protective line. Copy is static (phrases.js).
  const showsPhone = Boolean(result.pushesPhoneNumber) || textPushesPhoneNumber(rawMessage);
  el('phoneGuidance').hidden = !showsPhone;
  setText(el('phoneGuidanceText'), PHONE_GUIDANCE_TEXT);

  // 5. the calm next step  -  always shown, never model text
  setText(el('nextStepText'), NEXT_STEP_TEXT);

  const flag = el('sampleFlag');
  flag.hidden = !sample;
  if (sample) setText(flag, 'Sample breakdown  -  fixed example text, not your message.');

  showState(STATES.RESULT);
}

/* ------------------------------------------------------------------ *
 * Error / no-key states
 * ------------------------------------------------------------------ */
function showError(message) {
  setText(el('errorText'), message);
  showState(STATES.ERROR);
}

function showNoKey() {
  showState(STATES.NO_KEY);
  openKeyBar();
}

function copyForError(code) {
  switch (code) {
    case ERROR.NO_KEY: return ERROR_COPY.NO_KEY;
    case ERROR.EMPTY: return ERROR_COPY.EMPTY;
    case ERROR.TOO_LONG:
      return `That message is very long (over ${MAX_INPUT_CHARS.toLocaleString()} characters). ` +
             'Paste just the part that is asking you to do something.';
    case ERROR.NETWORK: return ERROR_COPY.NETWORK;
    case ERROR.OFF_SHAPE:
    default: return ERROR_COPY.OFF_SHAPE;
  }
}

/* ------------------------------------------------------------------ *
 * Always-visible phrase list
 * ------------------------------------------------------------------ */
function renderPhrases() {
  const list = el('phrasesList');
  clear(list);
  for (const p of GENERAL_PHRASES) {
    const li = document.createElement('li');
    const say = document.createElement('span');
    say.className = 'phrase-say';
    setText(say, p.say);
    const why = document.createElement('span');
    why.className = 'phrase-why';
    setText(why, p.why);
    li.append(say, why);
    list.appendChild(li);
  }
}

/* ------------------------------------------------------------------ *
 * Key control
 * ------------------------------------------------------------------ */
function openKeyBar() {
  el('keyBody').hidden = false;
  el('keyToggle').setAttribute('aria-expanded', 'true');
}
function closeKeyBar() {
  el('keyBody').hidden = true;
  el('keyToggle').setAttribute('aria-expanded', 'false');
}
function refreshKeySummary() {
  setText(el('keySummary'), hasKey() ? 'Your key is set  -  click to replace' : 'Use your own key');
}
function handleSaveKey() {
  const value = el('keyInput').value.trim();
  if (!value) { setText(el('keyStatus'), 'Paste a key first.'); return; }
  if (saveKey(value)) {
    setText(el('keyStatus'), 'Saved in this browser.');
    el('keyInput').value = '';
    refreshKeySummary();
  } else {
    setText(el('keyStatus'), 'Could not save the key in this browser.');
  }
}
function handleForgetKey() {
  forgetKey();
  el('keyInput').value = '';
  setText(el('keyStatus'), 'Key removed.');
  refreshKeySummary();
}

/* ------------------------------------------------------------------ *
 * The core action
 * ------------------------------------------------------------------ */
async function runFind() {
  const text = el('messageInput').value.trim();

  if (!text) { showError(copyForError(ERROR.EMPTY)); return; }
  if (!hasKey()) { showNoKey(); return; }

  setProcessing(true);
  try {
    const result = await analyze(text);
    const saved = addFind(text, result);   // append-only; nothing overwritten
    renderResult(result, { rawMessage: text });
    renderSidebar(saved ? saved.id : null);
  } catch (e) {
    const code = e && e.code ? e.code : ERROR.NETWORK;
    if (code === ERROR.NO_KEY) showNoKey();
    else showError(copyForError(code));
  } finally {
    setProcessing(false);
  }
}

/* ------------------------------------------------------------------ *
 * Wiring
 * ------------------------------------------------------------------ */
function init() {
  renderPhrases();
  refreshKeySummary();
  renderSidebar();
  el('sidebarInner').hidden = window.matchMedia('(max-width: 1039px)').matches;

  // Storage may have been cleared in another tab, or a previous find may have
  // been added there. Re-render the sidebar when this tab becomes visible again.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderSidebar();
  });

  el('keyToggle').addEventListener('click', () => {
    if (el('keyBody').hidden) openKeyBar(); else closeKeyBar();
  });
  el('saveKeyBtn').addEventListener('click', handleSaveKey);
  el('forgetKeyBtn').addEventListener('click', handleForgetKey);

  el('sidebarToggle').addEventListener('click', () => {
    if (window.matchMedia('(max-width: 1039px)').matches) {
      const inner = el('sidebarInner');
      inner.hidden = !inner.hidden;
      el('sidebarToggle').setAttribute('aria-expanded', String(!inner.hidden));
    }
  });

  el('findBtn').addEventListener('click', () => { if (!inputLocked) runFind(); });

  // Ctrl/Cmd + Enter inside the box is a fast path to "Find out now"
  el('messageInput').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !inputLocked) runFind();
  });

  el('haveAnotherBtn').addEventListener('click', returnHome);
  el('errorBackBtn').addEventListener('click', returnHome);
  el('nokeyBackBtn').addEventListener('click', returnHome);

  showState(STATES.FIND);
}

document.addEventListener('DOMContentLoaded', init);

export { renderResult, showState };
