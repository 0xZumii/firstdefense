---
doc: prd
status: approved
---

# First Defense — Product Requirements

One line: a single-page, calm, trustworthy tool where a non-technical person pastes a suspicious message, presses one button, and gets the plain-language version of what it is asking them to do — plus the tactic it is using — never a verdict.
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## The Core Journey

An older, non-technical person (the learner's mom or grandparent) has a message that feels "off."

1. She opens First Defense. One page. At the top is a large box labeled to paste her message, with a clear button below it reading **"Find out now."** Below that sits a fixed list of common scam phrases and tactics — general awareness, the same for everyone.
2. She pastes the message (or types it in) and presses **"Find out now."**
3. The paste box disappears. In its place, near the top, is the **breakdown of her message**: the ask restated in flat, plain language, and — in a box with one calm accent color — the tactic(s) *her specific message* uses.
4. Below the breakdown, the general scam-phrase list stays in place (it never goes away).
5. If the message points her at a phone number or a "contact support" line, the breakdown includes a plain warning: only trust a number she looks up herself.
6. A button near the header, on the left — **"Have another?"** — returns to the empty paste box for the next message. Her previous find does not disappear.

**Success:** the "oh, that's the thing" moment. She reads her own scam message reduced to a boring, plain-language ask sitting right next to the tactic being used against her, and the message's power to panic her drains out of it. She is never told the message is safe or unsafe.

## Screens and Layout

One page, no navigation, phone-sized first. Two visual states of the same page:

**State A — before a find (arrival):**
```
┌─────────────────────────────────────────┐
│  FIRST DEFENSE                          │  ← header, calm/official
├─────────────────────────────────────────┤
│                                          │
│   ┌──────────────────────────────────┐   │
│   │ paste your message here          │   │  ← large, obvious, top of page
│   │                                   │   │
│   └──────────────────────────────────┘   │
│                                          │
│              [  Find out now  ]          │
│                                          │
│   Common scams & phrases to know         │  ← fixed general list, always present
│   • "Act now / offer expires…"           │
│   • "Your account is locked…"            │
│   • "Verify your identity…"              │
│   • "You've won / claim your prize…"     │
│   • "There's a problem with your payment"│
├─────────────────────────────────────────┤
│  Previous finds                          │  ← left sidebar (see note)
└─────────────────────────────────────────┘
```

**State B — after a find:**
```
┌─────────────────────────────────────────┐
│  FIRST DEFENSE      [ Have another? ]    │  ← reset control, header-left
├─────────────────────────────────────────┤
│   ┌─ What they want you to do ─────────┐ │  ← the flat ask
│   │ "Send $400 in gift cards and read  │ │
│   │  them the numbers."                │ │
│   └───────────────────────────────────┘ │
│   ┌─ Tactic used in this message ─────┐ │  ← ONE calm accent color
│   │ Urgency + fear. It makes you feel  │ │
│   │ you must act before you can think. │ │
│   └───────────────────────────────────┘ │
│                                          │
│   Common scams & phrases to know         │  ← unchanged, still lower down
│   • …                                    │
│                                          │
│   Only trust a number you look up        │  ← conditional: shown when the
│   yourself. Never call a number that     │    message pushes a phone number
│   came in the message.                   │
├─────────────────────────────────────────┤
│  Previous finds                          │
└─────────────────────────────────────────┘
```

**Sidebar:** a "Previous finds" panel, collapsed on mobile and visible on wider screens. Each entry is a saved find the user can tap to look back on. Local to the machine only; no account.

## Look and Feel

Direction from the learner: **soft, official, and trustworthy.**

- The touchstone is a *bank statement or a well-made medical leaflet* — calm authority, not a hacking tool and not a flashing alarm.
- Large, highly readable body text; generous white space; short lines.
- Soft, neutral palette. Nothing red-and-alarming. No "DANGER" styling anywhere.
- **One calm accent color reserved for the specific-tactic box**, so the eye is drawn to the one thing that matters about *her* message. Everything else stays neutral.
- Plain, warm, non-technical language in every label and message. No security jargon.

*(Exact fonts and hex values are a `4-spec` decision; this section is the intent it must honor.)*

## Features and Behavior

### Making a find

- The page has one large paste box. It accepts pasted text and typed text.
- **"Find out now"** is the only call to action, and it starts the process.
- On completion the paste box is replaced by the breakdown; the general phrase list stays where it is.

### The breakdown (fixed shape, same order every time)

Every find returns the same four things, in the same order:

1. **The ask, flattened.** What the sender actually wants the user to *do*, in plain language, with no dressing. Example: *"They want you to send $400 in gift cards and read them the numbers."*
2. **The tactic(s), named.** The manipulation being used — urgency, fear, authority, too-good-to-be-true, secrecy — explained in a sentence a non-technical reader understands. Shown in the single accent-colored box.
3. **Matching common scams.** Two or three real scam patterns written in same language as the message, so the pattern is recognizable next time.
4. **The calm next step.** Do not act under pressure; verify through a number you look up yourself.

**Never a verdict.** The output must not say, imply, or lean toward "this is safe" or "this is a scam." It translates and educates only. This is the product's definitional rule.

### Phone-number guidance

When the message pushes a phone number, a support line, or a "call us" instruction, the breakdown adds plain guidance:

> Some scams copy real logos, email addresses, and phone numbers perfectly. The only number you can trust is one you look up yourself — visit the bank's website directly, or call the number on the back of your card. Never call a number that came in the message.

This reassures the user about *what to do*, never about the message itself.

### Previous finds

- Every completed find is saved locally and listed in a "Previous finds" sidebar.
- Selecting an entry shows that past find again.
- **Nothing ever overwrites.** Each find is its own entry.
- "Have another?" resets to the empty paste box; past finds remain in the sidebar.
- No account, no sync, no server. Clearing browser storage clears the list.

### General scam phrases (always visible)

A fixed, curated list of common scam phrases and tactics, always on the page below the find area — general awareness, not tailored to any one message. This is what the user can learn from even when they aren't using the tool.

## States and Boundaries

- **First use (empty):** the paste box and general list are all that show. No "Previous finds" heading, or an empty one — nothing awkward.
- **Pasted message that is not a scam:** the tool still does its job — restates what (if anything) the message asks the user to do, and names any tactic actually present. If there is no ask and no tactic, it says so **without reassuring the user about the message**. It recommends verifying independently regardless.
- **Message that appears to be a real, genuine institution message:** no reassurance. The independent-verification guidance carries it.
- **Empty input / nonsense input:** "Find out now" needs something to work with; the user is told to paste a message first.
- **Processing:** a brief, calm "looking at this…" state — no spinner drama.
- **Processing error / no result:** an honest message that it could not produce a breakdown, and the suggestion to verify independently and not act on the message. No fallback verdict.
- **Pasted message containing instructions aimed at the tool:** the tool ignores them and does its job. *(This is the highest-risk behavior in the product; how it is enforced is a `4-spec` decision.)*
- **Persistence:** previous finds persist in browser storage between sessions. Nothing else persists.

## Product Decisions

- **Never emits a safe/unsafe verdict** — false positives and false negatives both hurt users and destroy trust. Carried from `scope.md`.
- **The specific-tactic box gets the single accent color** — directs the eye to what matters about this message while the rest stays neutral. Learner chose soft/official/trustworthy styling overall.
- **Pasted text only**, no link fetching — a separate attack surface and a build-time sink.
- **Local history with a "Previous finds" sidebar** — makes the tool more useful with no account and nothing leaving the machine. Learner's addition during PRD.
- **Nothing ever overwrites** — each find is preserved as its own entry.
- **Dropped the "this could be legitimate" reassurance.** It would have created a verdict the product refuses to give, and could be exploited by a scammer who knows the tool. Independent-verification guidance replaces it.
- **"Have another?" sits header-left** and resets only the input, not the history.

## What We're Building

- One page, one large paste box, one "Find out now" button.
- Fixed-shape breakdown: flat ask → named tactic(s) in the accent box → matching common scams → calm next step.
- Conditional independent-phone-number guidance when the message pushes a number.
- Always-visible general scam-phrase list.
- Persistent local "Previous finds" sidebar; nothing overwrites.
- "Have another?" reset.
- The never-a-verdict rule, enforced in the output.
- Soft, official, trustworthy visual style; one accent color for the tactic box.
- Works on a phone-sized screen.

## Deferred From the POC

- **Link/domain analysis** — showing the raw URL and flagging a suspicious domain. Separate attack surface; not needed to prove the kernel.
- **Screenshot/image input (OCR)** — a second input pipeline.
- **Transaction and wallet-approval scanning** — the web3 angle; adds nothing to the core proof.
- **Read-aloud and translation** — valuable for this audience, but extra build surface.
- **Family sharing / exporting a find** — implies links or a backend.

## Possible Later Enhancements

One-tap read-aloud would help the exact audience this is built for. Language translation would widen it. The strongest later feature is probably letting a user share a find with a family member who can look after them.

## Non-Goals

- **No safe/unsafe verdict.** The definitional rule of the product.
- **No fetching or rendering pasted links.** Untrusted content the page would have to render; not needed.
- **No accounts, no chat, no follow-up prompting.** One-shot and prompt-free by design.
- **No transaction scanning.** Web3 scope.
- **No scary red alarms or threat scores.** The user is already frightened; the tool calms and informs.

## Open Questions

- **How instruction-like text hidden inside a pasted message is prevented from changing the output.** Must be resolved in `4-spec` — the product's trust depends on it.
- **Exact wording of headers, button labels, and the general phrase list.** Can be settled during the build; not blocking.
- **Exact fonts, palette, and accent color.** `4-spec` decides; intent is fixed above.
