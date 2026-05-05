# lifedesigner

> a concept interface for a voice-first life designer —
> not yet a product, an exploration of what one could feel like.

[**portfolio**](https://taniabezancon.netlify.app/en) · [**linkedin**](https://www.linkedin.com/in/tania-bezancon/) · designed and built by **tania bezancon** · may 2026

---

## what this is

lifedesigner imagines a personal companion that listens before it
suggests. it connects to your tools (gmail, calendar, slack, health),
asks you to imagine your dream life, and translates that into a program
of micro-habits that fit your existing schedule.

this repository is the **single-page landing** for that concept — a
narrative that follows **maria**, 31, brooklyn product designer who lost
her saturday morning runs, and shows how the designer would walk her
back to a 10k in twelve weeks.

> **this is not a working product.** there is no real ai, no mic
> streaming to a server, no actual oauth integrations. it is a
> high-fidelity prototype meant to make the experience *felt* before
> it is built.

## the story the page tells

| § | section | what happens |
|---|---|---|
| 01 | hero | atmospheric opening · breathing webgl orb · live counter |
| 02 | maria | who she is · what broke · 4 statistics |
| 03 | connected | the designer plugs into her tools · asks her to imagine saturday morning in her dream life · she whispers her vision |
| 04 | program | 12 weeks · 36 micro-habits · fitted to her calendar · ending in a 10k |
| 05 | your turn | one prompt: type a goal you've been postponing |
| 06 | plan | your week, generated cinematically · download as a 1080×1920 png |
| 07 | cta + footer | begin monday · creator's note · still listening |

## design notes

- **the orb is the protagonist.** four webgl canvases (hero · sticky
  bottom-right · mini in the input · footer) share one fragment shader
  and dissolve transparently into the page. they pulse with the user's
  typing, scroll position, and time.

- **monospace where it matters.** times (`07:12`), session counters
  (`session 4m 12s`), and tech labels (`presence.calibrate()`,
  `week.render(maria, goal=10k)`) use sf mono / jetbrains mono with
  tabular numerals — the page feels computed rather than written.

- **archetype-based generation.** the visitor's input is keyword-matched
  against six archetypes (sleep · energy · connection · focus · calm ·
  default) and renders a 7-day plan with precise times and one-line
  rationales for every habit.

- **shareable artefact.** the personalised plan exports as a 1080×1920
  png rendered on a `<canvas>` — meant for an instagram story.

- **graceful voice fallback.** the *hear* button uses the web speech
  api with the best available system voice (samantha on macos,
  microsoft aria on windows). if speech synthesis is unavailable, a
  procedural web audio pad (two detuned sines + a triangle harmonic +
  a swell envelope) takes over.

- **mic-reactive, opt-in only.** clicking *listen* requests microphone
  permission. if granted, an analysernode rms feeds the orb's
  `u_listen` shader uniform. denial degrades gracefully to a manual
  pulse toggle.

- **futuristic, but never loud.** scroll progress bar (2px coral
  gradient), hero mouse parallax (10px lerped), hover lifts on plan
  days, animated underlines on nav links, glassmorphic input with
  coral focus glow — all small, all intentional.

## stack

```
next.js 14             app router · react server components
typescript 5.4         strict mode
react 18               functional · hooks
css modules            no tailwind · no ui library
inter tight + sf mono  next/font · tabular numerals
webgl 1                raw · no three.js · ~120 lines of glsl
web audio api          mic analysis + procedural pad
speech synthesis api   real voice with graceful fallback
```

no tailwind, no ui kit, no animation library. just vanilla react,
css modules, and a single fragment shader.

## run locally

```bash
git clone https://github.com/Tania-bezancon/Lifedesigner.git
cd Lifedesigner
pnpm install
pnpm dev
# open http://localhost:3000
```

requires node 18+ and pnpm. if you don't have pnpm:
`corepack enable && corepack prepare pnpm@latest --activate`.

## structure

```
app/
  layout.tsx              root layout · loads inter tight via next/font
  page.tsx                imports the landing component
  globals.css             minimal global resets only
  landing.module.css      every scoped style for the page

components/
  landing.tsx             page composition · scroll progress · mouse parallax · footer
  orb-canvas.tsx          webgl shader + imperative ref handle (setListen)
  maria-intro.tsx         §02 case study
  connected.tsx           §03 integrations + dream visualization
  program.tsx             §04 twelve-week timeline
  your-turn.tsx           §05 interactive prompt + typewriter
  plan-section.tsx        §06 generated plan display
  sticky-orb.tsx          ambient orb that follows past the hero
  mic.ts                  getUserMedia + analyser → orb level
  designer.ts             speech synthesis + procedural pad fallback

lib/
  generate-plan.ts        archetype matching + plan templates
  share-card.ts           canvas → 1080×1920 png export
```

## things i would build next

- a real backend with oauth integrations (gmail, google calendar,
  slack, health) so the designer's "reading" is actually data, not
  copy
- an llm-powered conversation with persistent memory across weeks
- a mobile-first chat surface where the orb lives in the corner of
  the os
- weekly debrief audio that the user records and the designer
  transcribes + adjusts the next week from
- a real shareable artefact that includes a qr code linking back to
  the user's plan

## credits

inspired by the editorial calm of *kinfolk* and the cinematic restraint
of apple's vision keynotes. the orb is original. the philosophy is
borrowed from anyone who has ever wanted a quieter relationship with
their week.

— **tania bezancon** · [portfolio](https://taniabezancon.netlify.app/en) · [linkedin](https://www.linkedin.com/in/tania-bezancon/)

---

<sub>concept · interface · presence.idle()</sub>
