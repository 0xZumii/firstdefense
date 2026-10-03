# First Defense

**Paste a suspicious message. Get the plain-language version of what it is actually asking you to do.**

First Defense is built for people who get targeted most: older, non-technical family members facing
fake delivery fees, "your account is locked" texts, tech-support calls, and gift-card or romance
scams. Paste the message, press one button, and it shows you the ask in flat language, the pressure
tactic being used, and real scam patterns that look like it.

**It never tells you a message is safe or unsafe.** False positives and false negatives both exist,
and a wrong verdict is worse than no verdict. It translates and educates instead of ruling — and it
always ends with the same calm advice: slow down, and verify through a number you look up yourself.

---

## Try it

### The public copy (no key built in)

The deployed page ships with no API key — that would let anyone spend it. To just look at the
interface, open it with no key: it explains that live reading needs one.

### Run it locally with your own key

1. You need **Node.js** and **Git**. No build step, no framework, no backend.
2. In this folder, start any static server. With Node installed:

   ```
   npx serve .
   ```

   Or, if you have Python: `python -m http.server`

3. Open the printed `http://localhost:...` address.
4. Get a free Gemini API key at **aistudio.google.com/apikey**.
5. On the page, open **"Use your own key"**, paste the key, and press **Save key**.
   It is kept in your browser's own storage and sent only to Google.
6. Paste a suspicious message and press **Find out now**.

> **Why the key prompt?** This is a static page with no server. On a real deployment there is
> nowhere safe to hide a secret — anything in the page is public. So the key lives with the person
> using it, and your own key stays on your own machine. A visitor who pastes their own key gets the
> full working tool.

---

## What it does, in one picture

```
   paste a message
         |
         v
   one model call  ----->  Gemini (the pasted text is sent as its own message,
         |                  never as instructions to follow)
         v
   validate the shape --->  no verdict field exists, unknown keys rejected
         |
         v
   show four things:  the ask  /  the tactic  /  similar scams  /  the calm next step
```

## How it protects the output

The pasted message is untrusted text, and turned into a defense rather than a weak point:

- **Role separation** — the tool's rules live in the system message; the pasted text is sent as its
  own user message and is evidence to examine, never orders to follow.
- **No verdict field, structurally** — the result schema has no `safe`/`scam`/`confidence` slot, and
  unknown keys are rejected. There is nowhere for an injected verdict to land.
- **Length caps** on every field, so an attack cannot stuff instructions into a sentence-sized slot.
- **`textContent` only** — model text is never parsed as HTML or script.
- **Static protective copy** — the "verify with a number you look up yourself" line is fixed
  interface text. Even a fully hijacked model cannot remove it.

The injection test bench (`injection-test.html`, development only) runs seven real attack inputs
through the live path and checks that no verdict can render. It passes 7/7.

## Project layout

```
first-defense/
├── index.html          # the whole page (paste, result, phrases, sidebar, key control)
├── styles.css          # soft, official styling; one accent color for the tactic box
├── env.example.js      # shape of a local key file (safe to commit)
├── probe.html          # dev only: proves the browser model call works
├── keycheck.html       # dev only: checks a key without calling a model
├── injection-test.html # dev only: the seven prompt-injection attacks
├── src/
│   ├── app.js          # flow and rendering
│   ├── api.js          # the ONE provider-specific file (Gemini)
│   ├── schema.js       # validates and hardens model output
│   ├── store.js        # local history and the visitor's key
│   └── phrases.js      # fixed awareness list and protective copy
├── assets/favicon.svg
└── devpost/            # the planning documents behind this build
```

## Cost

One model call per message. Gemini's free tier covers personal use; paid usage is a fraction of a
cent per message. There is no account, no subscription, and no data stored anywhere except your own
browser.

## What it deliberately does not do

- It does not declare a message safe or unsafe.
- It does not open or scan links, images, or transactions.
- It keeps no account and sends nothing to a server of its own.

First Defense is an educational tool. When in doubt: don't reply, don't call the number in the
message, and verify through a number you find yourself.
