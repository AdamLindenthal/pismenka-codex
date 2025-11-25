# Implementation Plan

Goal: ship a mobile-first, client-only Czech reading practice app per `spelling_app_prompt.md`, with reliable Web Speech API usage on iOS/Android and a kid-friendly UI.

## 1) Foundations & Setup
- Initialize Vite (React or vanilla) with TypeScript, ESLint, Prettier; configure `cs-CZ` locale defaults.
- Create base folders: `src/components`, `src/lib` (helpers/hooks), `src/data` (dictionary), `src/styles`.
- Add global styles for touch targets, playful typography, and responsive layout; set up design tokens (colors, spacing, radii).

## 2) Dictionary Data & Filtering
- Author initial dictionary (50–100 2+ syllable words, mix of common/proper nouns) in `src/data/words.ts`.
- Build utilities: random case rendering rules, filtering by enabled letters, proper noun handling.
- Wire localStorage persistence for enabled letters and panel collapse state.

## 3) Letter Filter Panel
- Implement collapsible panel showing all Czech letters (A…Ž including CH, diacritics) with enable/disable toggles.
- Visual states for enabled/disabled; mobile-friendly touch targets; persist selections and collapse state.

## 4) Practice Mode UI
- Layout with large word display, microphone button, next-word button, and feedback area.
- Implement random word selection respecting filters; random casing per rules; skip gracefully if no words match filters.
- Add kid-friendly styling, animations for success, gentle cues for retry; Czech copy throughout.

## 5) Speech Recognition Integration
- Implement Web Speech API hook (webkitSpeechRecognition fallback) with lifecycle cleanup to avoid iOS freezes.
- Handle start/stop, result parsing, error states, timeouts; compare spoken vs displayed word case-insensitively.
- Provide fallback UI when speech not supported; add retry/stop controls to avoid stuck states.

## 6) Persistence & Settings
- Store letter toggles, panel visibility, and any future preferences in localStorage with migration-friendly keys.
- Ensure defaults load cleanly for first-time visitors; guard against unavailable storage.

## 7) Testing & Quality
- Unit tests (Vitest + Testing Library): dictionary filtering, casing logic, persistence helpers, speech hook (mocked API).
- Interaction tests: toggling letters, showing filtered words, success/failed recognition flows.
- Lint/format checks; responsive sanity checks for iPad/iPhone/Android via devtools; manual voice tests on target devices.

## 8) Polish & Delivery
- Add playful icons/illustrations and subtle animations; ensure high contrast and spacing.
- Document running, testing, editing dictionary, and mobile caveats in README.
- Final manual pass: no hydration errors, smooth touch interactions, offline-friendly build (optional PWA if time).

## UI/UX polish and gamification
- Micro-animations: letter tiles idle/pulse + hover pop/squish, buttons hover/press scaling, mascots float with hover spark, reward modal pop-in.
- Selected letter styling: saturated green gradient, thicker border, purple glow, gentle looping pulse to highlight active tiles.
- Mission bar: thicker rounded track with gradient, animated fill/marker tied to success count thresholds; tip bubble sits under the bar.
- Reward/sticker MVP: counts successful recognitions, compares to thresholds (5/10/20), persists progress in localStorage, shows modal toast with close + tap-to-dismiss overlay.
- Sound effects scaffold: optional toggle in header, plays tile/success/error sounds if enabled; expects assets under `assets/sounds/`.
- TODOs: replace placeholder icons/emojis with final art, add actual SFX files, extend reward set/badge art, hook mission bar to real goals as needed.
