# SOS button — design

**Date:** 2026-08-26
**Status:** approved, not yet implemented

## Purpose

When Zohaib and Zainab are home and both parents are out, the children need
one action that reaches the parents wherever they are. The dashboard today
talks only to itself — reminders and azaan are `localStorage` plus an in-page
toast, and nothing in the codebase sends anything outward. This is the first
outbound path.

## What this is not

It is not a replacement for a phone, and it must never be presented to the
children as one. It depends on the laptop being awake with working internet.
If that chain is broken the button cannot deliver, and the design's most
important job is to **say so honestly** rather than show a reassuring screen
over a message that never left the house.

## Channel

A Telegram bot posting to a private family group.

Chosen over WhatsApp (the Cloud API needs a business account, number
verification, template approval, and only permits free-form messages inside a
24-hour window), over web push (subscriptions expire silently — unacceptable
for safety), and over SMS/voice (costs per alert, sender-ID rules for Saudi
numbers).

Only the parents install Telegram. The children need no app, no account, no
phone. The tablet does not talk to Telegram either — it calls our own
`/api/sos`, and the **laptop** makes the outbound HTTPS call.

## Flow

1. Child presses and holds the red SOS button for 1 second. A ring fills as
   they hold. Hold rather than tap because a permanently visible red button on
   a fridge, in a house with a nursery-age child, will otherwise be pressed for
   fun — and it starts a siren.
2. On completion the alert sends immediately. Bare and short:
   `SOS from home — 4:32 PM`. Nothing slower is allowed to delay it.
3. The siren starts.
4. The tablet shows a calm confirmation, and below it three optional buttons —
   *someone at the door* / *I'm scared* / *I'm hurt* — each sending a follow-up
   line. The first message has already gone; these are free.
5. *Someone at the door* additionally attaches a snapshot from the camera set in
   `SOS_DOOR_CAMERA` (default `3`, currently labelled Front Street — the four
   labels are guesses and can be re-pointed without a code change).
   This is the one case where the cameras help: they all face outward, and the
   dashboard is LAN-only so the parents cannot open the Cams tab from outside
   the house.

Repeat presses within 60 seconds are ignored, so a child leaning on the button
does not flood the group. The follow-up buttons are exempt.

## Siren

Two alternating tones built from oscillators in `lib/audio.js` — the existing
engine is oscillator-based, so no audio file is needed. It loops in **bursts:
roughly 4 seconds on, 3 seconds off**.

The bursts are not cosmetic. The agreed rule is that the siren stops when a
parent phones home and says so — but a continuous siren on the fridge is
exactly what stops a child hearing that call. The gaps let the phone ring
through and let the child hear the voice on it.

A plain "Stop siren" button is always visible. The children *can* stop it. A
frightened child unable to silence an alarm is a worse outcome than an early
stop, and the rule about waiting for a parent is better enforced socially than
by removing the control.

The siren mounts at app root, so switching tabs does not kill it.

## Failure

Two silent retries. If the alert still cannot be delivered, the confirmation
screen does **not** claim the parents have been told. It says plainly that it
could not reach them and shows both numbers in large type to dial from the
house phone, labelled MOM and DAD.

The siren runs regardless of whether delivery succeeded — it is the fallback
that reaches a neighbour when the network cannot reach a parent.

## Files

| File | Role |
|---|---|
| `lib/telegram.js` | new — `sendMessage`, `sendPhoto`; the only place the token is read |
| `app/api/sos/route.js` | new — POST; rate limit, retries, honest success/failure response |
| `components/SosButton.js` | new — hold-to-send button, confirmation, reason buttons |
| `lib/audio.js` | edit — add `startSiren` / `stopSiren` |
| `app/page.js` | edit — mount alongside `GuidesFab`, so it is present on every tab |
| `.env.example` | edit — blank keys, tracked |

## Configuration

Added to `.env.local` by hand. That file is gitignored, so **these do not
travel with `git pull`** — the second laptop needs them copied across
directly. This has already caused two separate bugs (`.env.local` for the
cameras, `backend/.env` for the RecipyAI key).

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_SOS_CHAT_ID=
MOM=
DAD=
SOS_DOOR_CAMERA=3
```

Getting the first two:

1. In Telegram, message `@BotFather`, send `/newbot`, follow the prompts. It
   returns a token. That token can post as the bot to anyone who has started a
   chat with it — treat it as a password and keep it out of git.
2. Create a private group, add the bot to it, and post any message there.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and read
   the `chat.id` — negative for a group. That is `TELEGRAM_SOS_CHAT_ID`.

## Risks

- **The laptop is the single point of failure.** Asleep or offline, the button
  cannot deliver. Mitigated by honest failure reporting and the siren, not
  solved.
- **Telegram reachability.** Messaging works normally on Saudi networks, but if
  it ever proves unreliable here, `lib/telegram.js` is deliberately the only
  file that knows the channel, so swapping it is a contained change.
- **False alarms.** Hold-to-send is the guard. If they still happen, the next
  step is an "all clear" follow-up button rather than more friction on the
  press.

## Testing

End to end once the token is in place: press, confirm the message arrives.
Then deliberately break the network and confirm the failure screen is honest
and the numbers show. Confirm the siren survives a tab switch and that its
gaps are long enough to hear a phone ring.
