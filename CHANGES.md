# UI/UX asset integration log

- Added pixel-art icons to actions: microphone (`/assets/microphone.png`) on “Řekni slovo”, arrow (`/assets/next.png`) on “Další slovo”, speaker toggle (`/assets/speaker-on.png` / `/assets/speaker-off.png`), and XP orb (`/assets/xp-orb.png`) on the mission bar.
- Kept the microphone icon visible by moving the mic button text into a label span and updating JS to change only the label (“Poslouchám...” / “Řekni slovo”) instead of replacing the whole button.
- Introduced sticker rewards driven by a single `STICKERS` array in `app.js`; stickers unlock at thresholds, show in the modal with their image, and render in the stickers grid (locked vs unlocked states).
- Reward progress, sounds toggle state, and stickers persist via localStorage; mission bar marker now uses the XP orb and respects progress.
- Left panel now uses tabs: default “Moje nálepky” gallery and a “Nastavení” tab that holds the letter grid; tab state persists so kids see stickers first while parents can access settings.
- UI polish keeps Minecraft/lab theme with blocky panels, animated tiles/buttons/mascots, and responsive layout across desktop, tablet, mobile, including Safari.
- Added a parent-focused “Maximální délka slova” slider in the Nastavení tab (default 7, range 3–12) that filters available words; preference is stored in localStorage and updates the word pool immediately.
- Strengthened motion: mascots float with bigger bob/tilt, XP orb gently bobs/scales, and a few background atoms/cubes drift; main action buttons are now icon-only (microphone/next) with aria labels and sr-only text for accessibility.
- Updated sound mappings to new transparent PNG set and .m4a audio: tile, success, try-again now point to /assets/sounds/*.m4a; added sticker unlock sound; mic-on reserved for later.
