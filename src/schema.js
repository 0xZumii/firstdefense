/**
 * schema.js  -  validates and hardens model output before anything is shown.
 *
 * This is not decoration. It is the enforcement point for the product's central
 * rule: no verdict ever renders. The shape below has no field a verdict could
 * live in, and unknown keys are rejected here (the provider does not enforce
 * additionalProperties for us  -  see spec.md > Stack).
 *
 * Spec ref: spec.md > Components > schema.js, spec.md > The Result Shape
 * PRD ref:  prd.md > The breakdown, prd.md > States and Boundaries
 */

export const MAX_ASK = 300;          // a scam's ask is short; a paragraph means something is wrong
export const MAX_TACTIC_NAME = 40;
export const MAX_TACTIC_EXPLANATION = 260;
export const MAX_SCAM = 90;
export const MAX_TACTICS = 5;
export const MAX_SCAMS = 3;

const FORBIDDEN_KEYS = ['verdict', 'isScam', 'is_scam', 'safe', 'unsafe', 'confidence', 'score', 'risk', 'label'];

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export class ShapeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ShapeError';
  }
}

/**
 * @returns {{ask:string, tactics:{name:string,explanation:string}[], similarScams:string[], pushesPhoneNumber:boolean}}
 * @throws {ShapeError} if the object cannot be trusted as one of our results
 */
export function validateResult(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ShapeError('Result was not an object.');
  }

  // Reject unknown keys  -  including any verdict-shaped key someone tried to inject.
  const allowed = new Set(['ask', 'tactics', 'similarScams', 'pushesPhoneNumber']);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) {
      throw new ShapeError(
        FORBIDDEN_KEYS.includes(key)
          ? `Output contained a forbidden "${key}" field.`
          : `Output contained an unexpected "${key}" field.`
      );
    }
  }

  if (typeof raw.ask !== 'string') throw new ShapeError('Missing "ask" text.');
  const ask = clean(raw.ask);
  if (ask.length > MAX_ASK) throw new ShapeError('The "ask" text was far longer than a real ask.');

  if (!Array.isArray(raw.tactics)) throw new ShapeError('Missing "tactics" list.');
  if (raw.tactics.length > MAX_TACTICS) throw new ShapeError('Too many tactics returned.');
  const tactics = raw.tactics.map((t, i) => {
    if (!t || typeof t !== 'object') throw new ShapeError(`Tactic ${i + 1} was not an object.`);
    const name = clean(t.name);
    const explanation = clean(t.explanation);
    if (!name && !explanation) throw new ShapeError(`Tactic ${i + 1} was empty.`);
    return {
      name: name.slice(0, MAX_TACTIC_NAME),
      explanation: explanation.slice(0, MAX_TACTIC_EXPLANATION)
    };
  });

  if (!Array.isArray(raw.similarScams)) throw new ShapeError('Missing "similarScams" list.');
  if (raw.similarScams.length > MAX_SCAMS) throw new ShapeError('Too many similar scams returned.');
  const similarScams = raw.similarScams
    .map((s) => clean(s).slice(0, MAX_SCAM))
    .filter((s) => s.length > 0);

  if (typeof raw.pushesPhoneNumber !== 'boolean') throw new ShapeError('Missing "pushesPhoneNumber" flag.');

  return { ask, tactics, similarScams, pushesPhoneNumber: raw.pushesPhoneNumber };
}

/** The JSON schema handed to the provider, kept in sync with the checks above. */
export const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    ask: { type: 'string', description: 'What the sender wants the reader to DO, in plain language. Empty string if nothing is asked. Max ~300 characters.' },
    tactics: {
      type: 'array',
      description: 'Manipulation tactics present, 0 to 5. Name each in one or two words and explain it in one plain sentence.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          explanation: { type: 'string' }
        },
        required: ['name', 'explanation']
      }
    },
    similarScams: {
      type: 'array',
      description: '0 to 3 short names of real scam patterns that use language like this.',
      items: { type: 'string' }
    },
    pushesPhoneNumber: { type: 'boolean', description: 'True if the message tells the reader to call a phone number or contact "support".' }
  },
  required: ['ask', 'tactics', 'similarScams', 'pushesPhoneNumber']
};

/**
 * Independent of the model: does the raw text contain something that really
 * looks like a phone number?
 *
 * Deliberately strict. An earlier, looser version matched phrases like
 * "contact us" or "act now" and showed phone guidance on messages that had
 * nothing to do with calling (found in the slice-2 hands-on review). It now
 * requires actual digits in a phone-like grouping, or an explicit instruction
 * to call accompanied by digits.
 */
export function textPushesPhoneNumber(text) {
  const t = String(text || '');

  // A real, well-formed number: 7+ digits with the usual separators,
  // or a North American style number.
  const digitGroups = (t.match(/\d/g) || []).length;
  const looksLikeNumber =
    /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}\b/.test(t) && digitGroups >= 7;
  if (looksLikeNumber) return true;

  // An explicit "call this number" instruction, which only counts if digits appear nearby.
  const callInstruction = /\b(call|dial|phone|ring)\b[^.!?\n]{0,60}\b(number|line|hotline|us|now|immediately|today)\b/i.test(t);
  if (callInstruction && digitGroups >= 3) return true;

  return false;
}
