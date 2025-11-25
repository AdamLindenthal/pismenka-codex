# Czech Reading Practice Web Application for Kids

## Project Overview
Create a **client-side only** web application for Czech children to practice reading words. The app must work flawlessly on tablets and phones (iOS Safari, Chrome, Android) - this is a critical requirement. Any issues with hydration, voice recognition freezing, or mobile compatibility make the app unusable.

**Language: All interface elements and content are in Czech.**

## Critical Mobile Requirements
- **MUST work perfectly on iPads and iPhones (Safari and Chrome)**
- **MUST work perfectly on Android tablets and phones**
- Web Speech API voice recognition must NOT freeze on any device
- No hydration errors or client/server mismatches
- Touch-friendly UI with appropriate button sizes for tablets
- Responsive design that works on all screen sizes
- Test voice recognition thoroughly on mobile devices

## Technology Stack
- **Plain HTML/CSS/JavaScript** or **React with Vite** (client-side only, NO Next.js or SSR)
- Web Speech API for voice recognition (Czech language: cs-CZ)
- LocalStorage or cookies for persisting settings
- No backend required - everything runs in the browser

## Features

### 1. Word Dictionary
- Human-editable dictionary file (JSON, JavaScript object, or simple text format)
- **Pre-populated with Czech words during development** (at least 50-100 words to start)
- Dictionary entry format:
  - Lowercase words (e.g., "pes", "dům", "stůl") - can be rendered as lowercase, UPPERCASE, or Capitalized
  - Proper nouns with capital (e.g., "Praha", "Petr") - can be rendered as stored or UPPERCASE only
- **IMPORTANT: Avoid single-syllable words** due to Czech Web Speech API accuracy issues (words like "les" vs "pes" are problematic)
- Focus on 2+ syllable words for better recognition accuracy
- Words should be appropriate for children learning to read
- Easy for developers to add/edit words in the dictionary file

### 2. Letter Filter Panel (Collapsible)
- **Collapsible panel** - can be hidden to avoid distracting the child during practice
- Display ALL letters of the Czech alphabet as **CAPITALS**: A, Á, B, C, Č, D, Ď, E, É, Ě, F, G, H, CH, I, Í, J, K, L, M, N, Ň, O, Ó, P, Q, R, Ř, S, Š, T, Ť, U, Ú, Ů, V, W, X, Y, Ý, Z, Ž
- Each letter is clickable to enable/disable it
- Visual indication of enabled vs disabled letters (e.g., different colors, opacity, or checkmarks)
- Only words containing enabled letters will appear in practice
- Letter selection state persists using LocalStorage or cookies
- Default: all letters enabled on first visit
- Clear visual toggle (expand/collapse button) for parents

### 3. Reading Practice Mode
- Display one random word from the dictionary (filtered by enabled letters)
- **Random case rendering:**
  - Lowercase dictionary entries → rendered as lowercase, UPPERCASE, or First capital (random)
  - Proper nouns (first letter capital in dictionary) → rendered as stored or UPPERCASE (random)
  - Example: "kočka" might appear as "kočka", "KOČKA", or "Kočka"
  - Example: "Praha" might appear as "Praha" or "PRAHA"
- Large, clear display of the word suitable for kids
- Voice recognition button that:
  - Activates Web Speech API (Czech language)
  - Listens for the child's pronunciation
  - Shows visual feedback (listening indicator)
  - Validates if the spoken word matches the displayed word (**case-insensitive comparison**)
- Feedback system:
  - Correct: cheerful animation/sound, move to next word
  - Incorrect: gentle feedback, allow retry
- "Next word" button (in Czech) to skip if needed

### 4. Kid-Friendly Styling
- **Bright, vibrant colors** (primary colors, pastels)
- **Large, rounded buttons** easy for small fingers to tap
- **Playful fonts** (consider Comic Sans, Bubblegum, or similar kid-friendly fonts)
- **Fun animations** (bouncing, wiggling, star effects)
- **Cute illustrations or icons** (stars, smiley faces, animals)
- **High contrast** for readability
- **Generous spacing** between interactive elements
- Consider themes like: space, underwater, jungle, candy land
- Positive, encouraging visual feedback for all interactions
- Czech language used throughout the interface

## Technical Requirements

### Voice Recognition
- Use Web Speech API (`webkitSpeechRecognition` or `SpeechRecognition`)
- **Language: cs-CZ (Czech)**
- **Must handle mobile quirks:**
  - Implement proper cleanup to prevent freezing on iOS
  - Use timeouts and proper event handling
  - Consider continuous vs non-continuous recognition based on device
  - Test stop/start cycles thoroughly
- **Case-insensitive word matching** (compare spoken word to expected word ignoring case)
- Clear error handling with user-friendly messages (in Czech)
- Fallback UI if voice recognition not supported
- Note: Single-syllable words have accuracy issues with Czech Speech API, avoid in dictionary

### Word Dictionary Structure
- Easy to edit by developers
- Suggested format:
```javascript
const words = [
  { word: "kočka", type: "common" },      // Can be rendered: kočka, KOČKA, Kočka
  { word: "Praha", type: "proper" },      // Can be rendered: Praha, PRAHA
  { word: "maminka", type: "common" },
  // ... more words
];
```
- Or simpler format distinguishing by capitalization in the string itself
- Pre-populate with at least 50-100 Czech words (2+ syllables)

### Data Persistence
- Store enabled/disabled letters in LocalStorage or cookies
- Store letter panel collapse state
- Store user preferences (if any)
- Handle first-time visitors with sensible defaults

### Responsive Design
- Mobile-first approach
- Tablet optimization (primary target)
- Works on phones (secondary but important)
- Portrait and landscape orientations
- Touch-optimized interactions
- Collapsible panel works smoothly on all devices

### Browser Compatibility
- **iOS Safari** (critical - primary testing target)
- **iOS Chrome** (critical)
- **Android Chrome** (critical)
- Desktop browsers (nice to have)

## User Flow
1. First visit: See all letters enabled by default, letter panel visible
2. Parent collapses the letter panel to minimize distraction
3. Parent can expand panel to customize which letters to practice by clicking them
4. Child starts practice session
5. App shows random word (with random case variation) from enabled letter set
6. Child taps microphone and reads the word aloud
7. App provides immediate feedback (case-insensitive matching)
8. Continues with next random word

## Czech Language Interface Examples
- Microphone button: "Řekni slovo" or microphone icon
- Next button: "Další slovo"
- Correct feedback: "Výborně!" "Super!" "Skvělé!"
- Try again: "Zkus to znovu" "Ještě jednou"
- Letter panel title: "Výběr písmen"
- Collapse/Expand: "Skrýt" / "Zobrazit"

## Deliverables
- Single-page application (or simple multi-file structure if using React)
- Editable word dictionary file with 50-100+ pre-populated Czech words (2+ syllables)
- Clear README with:
  - How to run locally
  - How to deploy (can be hosted on any static hosting)
  - How to edit the word dictionary
  - Known device compatibility notes
  - Troubleshooting for voice recognition issues
- Clean, commented code
- Mobile testing checklist completed

## Success Criteria
- ✅ Voice recognition works reliably on iPad Safari without freezing
- ✅ Voice recognition works on iPhone Safari
- ✅ No hydration or console errors on mobile devices
- ✅ Letter selection persists across sessions
- ✅ Letter panel is collapsible and state persists
- ✅ Words appear in random case variations correctly
- ✅ Word matching is case-insensitive
- ✅ Dictionary is easy to edit and pre-populated with Czech words
- ✅ UI is engaging and appropriate for children aged 4-8
- ✅ Touch interactions work smoothly on tablets
- ✅ All interface text is in Czech
- ✅ App loads quickly and works offline after first load (consider PWA)

---

**Priority Order:**
1. Mobile compatibility (especially iOS voice recognition)
2. Word dictionary setup with 2+ syllable Czech words
3. Letter selection with persistence and collapsible panel
4. Case variation rendering and case-insensitive matching
5. Kid-friendly design
6. Voice recognition accuracy
7. Additional polish and features