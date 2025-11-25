# Repository Guidelines

This repository holds a client-side Czech reading practice app for kids (see `spelling_app_prompt.md`). Use the notes below to keep contributions consistent, mobile-first, and easy to maintain.

## Project Structure & Module Organization
- Keep source in `src/` with entry at `src/main.(js|jsx|ts|tsx)`; static assets in `public/`; dictionary data in `src/data/words.json` or `src/data/words.js`.
- Co-locate UI pieces with components (e.g., `src/components/LetterPanel/`), and keep shared hooks/utils in `src/lib/`.
- Tests live next to code as `*.test.[jt]s` or under `src/__tests__/` for integration flows.

## Build, Test, and Development Commands
- `npm install` — install dependencies after cloning or pulling new packages.
- `npm run dev` — start the Vite dev server for local development.
- `npm run build` — create a production build; use before shipping.
- `npm run lint` / `npm run test` — lint and test the codebase; ensure both pass before PRs.

## Coding Style & Naming Conventions
- Prefer TypeScript when possible; otherwise modern ES modules. Use 2-space indentation and trailing commas.
- Keep UI text in Czech; use constants or locale files instead of inline literals when reused.
- Components and hooks: `PascalCase` for components, `useCamelCase` for hooks, `camelCase` for helpers and variables.
- Run Prettier/ESLint (via `npm run lint`) before commits; avoid inline `any` without justification.

## Testing Guidelines
- Use Vitest + Testing Library; write tests for voice recognition logic, dictionary filtering, and mobile toggles.
- Name tests after user behavior: `reads word when microphone pressed`, `filters by disabled letters`, etc.
- For speech features, mock Web Speech API; include regression cases for iOS freeze fixes.
- Aim for high coverage on logic-heavy modules; snapshot only stable, low-noise UI.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`); keep messages in present tense.
- PRs should include: summary of changes, testing done (`npm run lint`, `npm run test`), and mobile notes if relevant (devices/browsers tried).
- Link issues when available; add Czech UI screenshots or GIFs for UI changes, especially on tablet viewports.

## Architecture & Mobile Notes
- The app is client-only; avoid server dependencies. Persist preferences (letter toggles, panel state) via `localStorage`.
- Prioritize mobile Safari/Chrome: debounce speech start/stop, clean up recognition instances on unmount, and test on iPad/iPhone first.
- Keep the dictionary free of single-syllable words to improve Czech Speech API accuracy; store at least 50–100 two-plus-syllable entries.

## Commands

### /plan
Describe a complete implementation plan, including architecture, components, and task breakdown based on spelling_app_prompt.md. Persist the plan in a markdown file.

### /implement
Generate code for a specific file or task. Accepts a description or filename. Stick to the markdown file with the plan where applicable. Always update the plan when something is done or something changes.
