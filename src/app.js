/**
 * app.js — flow and rendering for First Defense.
 *
 * Slice 1 scope: the page shell, the look and feel, the two main render states,
 * the key control UI, and the always-visible phrase list. Pressing "Find out now"
 * shows a clearly-labelled SAMPLE breakdown. No model call yet — that lands in
 * slice 2 (api.js + schema.js) and slice 4 (store.js + real history).
 *
 * Spec ref: spec.md > Components > The page shell, spec.md > Components > app.js
 * PRD ref:  prd.md > Screens and Layout, prd.md > The Core Journey
 */

import {
  GENERAL_PHRASES,
  NEXT_STEP_TEXT,
  PHONE_GUIDANCE_TEXT,
  NO_ASK_TEXT,
  NO_TACTICS_TEXT,
  SAMPLE_RESULT
} from './phrases.js';

/* ------------------------------------------------------------------ *
 * Tiny helpers — every model-derived string goes in with textContent,
 * never innerHTML. Nothing from a message is ever parsed as markup.
 * ------------------------------------------------------------------ */
export const el = (id) => document.getElementById(id);

function setText(node, text) {
  node.textContent = text;
}

function clear(node) {
  node.replaceChildren();
}

/* ------------------------------------------------------------------ *
 * Six render states, matching spec.md > Components > The page shell.
 *   1 arrival · 2 processing · 3 result · 4 no-key · 5 error
 * (state 6 is the sidebar, always in the DOM)
 * ------------------------------------------------------------------ */
const STATES = {
  FIND: 'stateFind',
  RESULT: 'stateResult',
  NO_KEY: 'stateNoKey',
  ERROR: 'stateError'
};

let currentState = STATES.FIND;
let currentResult = null;

export function showState(name) {
  currentState = name;
  for (const id of Object.values(STATES)) {
    el(id).hidden = (id !== name);
  }
  // "Have another?" only makes sense once there is a result on screen.
  el('haveAnotherBtn').hidden = (name !== STATES.RESULT);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------------ *
 * Rendering a result (prd.md > The breakdown — fixed shape, same order)
 * ------------------------------------------------------------------ */
export function renderResult(result, { sample = false } = {}) {
  currentResult = result;

  // 1. the flat ask
  const ask = (result.ask || '').trim();
  setText(el('askText'), ask || NO_ASK_TEXT);

  // 2. the tactic(s) — the one accent-colored block
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
    setText(li, 'No close match found in our examples — which does not make the message safe.');
    scamList.appendChild(li);
  } else {
    for (const s of scams) {
      const li = document.createElement('li');
      setText(li, s);
      scamList.appendChild(li);
    }
  }

  // 4. conditional independent-number guidance (static copy, never model text)
  const phoneBlock = el('phoneGuidance');
  phoneBlock.hidden = !result.pushesPhoneNumber;
  setText(el('phoneGuidanceText'), PHONE_GUIDANCE_TEXT);

  // 5. the calm next step — always shown
  setText(el('nextStepText'), NEXT_STEP_TEXT);

  // honest label for the not-yet-real slice
  const flag = el('sampleFlag');
  flag.hidden = !sample;
  setText(flag, 'Sample breakdown — live reading arrives in the next build step. This is fixed example text, not your message.');

  showState(STATES.RESULT);
}

/* ------------------------------------------------------------------ *
 * Error / no-key states (fully wired in slice 2)
 * ------------------------------------------------------------------ */
export function showError(message) {
  setText(el('errorText'), message);
  showState(STATES.ERROR);
}

export function showNoKey() {
  showState(STATES.NO_KEY);
  openKeyBar();
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
 * Key control (storage wiring arrives in slice 4)
 * ------------------------------------------------------------------ */
function openKeyBar() {
  el('keyBody').hidden = false;
  el('keyToggle').setAttribute('aria-expanded', 'true');
}

function closeKeyBar() {
  el('keyBody').hidden = true;
  el('keyToggle').setAttribute('aria-expanded', 'false');
}

/* ------------------------------------------------------------------ *
 * Wiring
 * ------------------------------------------------------------------ */
function init() {
  renderPhrases();
  el('sidebarInner').hidden = window.matchMedia('(max-width: 1039px)').matches;

  // collapse / expand the key bar
  el('keyToggle').addEventListener('click', () => {
    if (el('keyBody').hidden) openKeyBar(); else closeKeyBar();
  });

  // collapse / expand the sidebar on small screens
  el('sidebarToggle').addEventListener('click', () => {
    if (window.matchMedia('(max-width: 1039px)').matches) {
      const inner = el('sidebarInner');
      inner.hidden = !inner.hidden;
      el('sidebarToggle').setAttribute('aria-expanded', String(!inner.hidden));
    }
  });

  // the one call to action
  el('findBtn').addEventListener('click', () => {
    const text = el('messageInput').value.trim();
    if (!text) {
      showError('There was no message to look at. Paste the text you received, then try again.');
      return;
    }
    // SLICE 1: no model call yet — show the clearly-labelled sample.
    renderResult(SAMPLE_RESULT, { sample: true });
  });

  // reset to arrival; history is untouched (real history in slice 4)
  el('haveAnotherBtn').addEventListener('click', () => {
    el('messageInput').value = '';
    showState(STATES.FIND);
    el('messageInput').focus();
  });

  showState(STATES.FIND);
}

document.addEventListener('DOMContentLoaded', init);

/* exported for slice 2 so api/schema code can drive the same render path */
export { init };
