---
doc: scope
status: approved
---

# First Defense

*(Renamed from working title "Pause" during the PRD; name approved by the learner.)*

One line: a dead-simple page where a non-technical person pastes a suspicious message and gets the plain-language version of what it is actually asking them to do — plus the pressure tactic being used — without ever being told "safe" or "unsafe."

## The Unique Kernel

It refuses to give a verdict. Instead of chatbot prose, it always returns the same predictable shape: **the ask restated in flat, plain language**, **the manipulation tactic named** (urgency, fear, too-good-to-be-true), and **a short list of real scams using that same language**. It is built for people who do not know how to prompt an AI, and it is deliberately honest about uncertainty: a better-informed user is worth more than a yes/no answer.

If you deleted the "never says safe" rule and the fixed output shape, this would just be ChatGPT with a text box. Both are the point.

## Who It's For

The learner's **mom and grandparents** — older, non-technical people who are the prime targets of fake-financial social engineering: fake delivery/package fees, "your account is locked," technical-support calls, gift-card and romance scams.

Today they either take the message at face value or forward it to a family member and hope someone answers. The tool is meant to be usable *by them, alone, in the moment* — not something that requires someone else to explain it.

## The Core Loop

They open one page, paste the message into one big box, press one button.

They get back, in the same order every single time:

1. The plain version of the ask — what the sender actually wants them to *do*.
2. The tactic the message is using — the thing making them feel rushed or scared.
3. A few real scam patterns that look like this one.
4. A calm reminder not to act under pressure.

No account, no chat, no follow-up prompting, no jargon. They come back the next time a message feels "off" — because scams keep arriving.

## Inspiration & Identity

No visual references volunteered yet. The direction implied by the conversation is **plain, calm, large, and jargon-free** — the opposite of a scary red "DANGER" alert, and the opposite of a wall of AI text. `3-prd` will confirm look and feel with 1–2 questions.

## Why This Matters to the Learner

Security is what excites them: *"i love helping people and the internet is a better place when users are protected."* They point out that scams and cybercrime are rising fast because AI lets threat actors vibe-code malware and phishing sites cheaply — while the people being targeted are the ones least equipped to spot it. They are a junior in the security field focused on web3 best practices for keeping funds and personal information safe, and they want this to be a **first layer of defense for people who have nothing else to rely on**.

## What "Working" Looks Like

A single page. Paste a scam text, press the button, and the screen shows:

- *"They want you to send $400 in gift cards and read them the numbers."*
- *"This message uses urgency and fear to rush you."*
- Two or three common scams written in the same language.
- A short, calm line about slowing down and verifying through a number you look up yourself.

It fits on a phone screen. There is **no verdict anywhere** — it never says safe or unsafe.

**The "oh, that's the thing" moment:** the ask appears flattened into boring, plain language right next to the named tactic — the message's power to panic you visibly drains out of it.

## The POC Boundary

- One page, one large paste box, one button.
- **Pasted text only** as input.
- Fixed output structure: plain-language ask → named tactic(s) → matching common-scam examples → one calm action reminder.
- **Never emits a safe/unsafe verdict.**
- Works on a phone-sized screen.
- One LLM call, with a prompt/guardrail that keeps the output in shape and resistant to instructions hidden inside the pasted message.

## Later

- Handling links: showing the URL and flagging a suspicious domain (string analysis only).
- Screenshot / image input (OCR).
- Transaction and wallet-approval scanning (web3 angle).
- Read-aloud and translation.
- Saved history, or a "share with my family" option.

## Explicitly Cut

- **Any safe/unsafe verdict.** Deliberate and central: false positives and false negatives would both hurt users and destroy trust.
- **Fetching and rendering arbitrary pasted links.** A separate attack surface and a build-time sink; not needed to prove the kernel.
- **Accounts, chat history, follow-up prompting.** The product is one-shot and prompt-free by design.
- **Transaction scanning.** Web3 scope; interesting later, adds nothing to the core proof.
