const LETTERS = [
  "A",
  "Á",
  "B",
  "C",
  "Č",
  "D",
  "Ď",
  "E",
  "É",
  "Ě",
  "F",
  "G",
  "H",
  "CH",
  "I",
  "Í",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ň",
  "O",
  "Ó",
  "P",
  "Q",
  "R",
  "Ř",
  "S",
  "Š",
  "T",
  "Ť",
  "U",
  "Ú",
  "Ů",
  "V",
  "W",
  "X",
  "Y",
  "Ý",
  "Z",
  "Ž",
];


const elements = {
  letters: document.querySelector("[data-letters]"),
  word: document.querySelector("[data-word]"),
  feedback: document.querySelector("[data-feedback]"),
  panel: document.querySelector("[data-panel]"),
  mic: document.querySelector("[data-mic]"),
  micLabel: document.querySelector("[data-mic-label]"),
  next: document.querySelector("[data-next]"),
  missionFill: document.querySelector("[data-mission-fill]"),
  missionMarker: document.querySelector("[data-mission-marker]"),
  missionCount: document.querySelector("[data-mission-count]"),
  missionGoal: document.querySelector("[data-mission-goal]"),
  missionLabel: document.querySelector("[data-mission-label]"),
  level: document.querySelector("[data-level]"),
  stars: document.querySelector("[data-stars]"),
  soundToggle: document.querySelector("[data-sound-toggle]"),
  maxLengthInput: document.querySelector("[data-max-length]"),
  maxLengthValue: document.querySelector("[data-max-length-value]"),
  rewardModal: document.querySelector("[data-reward-modal]"),
  rewardText: document.querySelector("[data-reward-text]"),
  rewardTitle: document.querySelector("[data-reward-title]"),
  rewardClose: document.querySelector("[data-reward-close]"),
  rewardImage: document.querySelector("[data-reward-image]"),
  rewardIcon: document.querySelector("[data-reward-icon]"),
  stickersGrid: document.querySelector("[data-stickers-grid]"),
  chest: document.querySelector("[data-chest]"),
  chestCount: document.querySelector("[data-chest-count]"),
  chestGoal: document.querySelector("[data-chest-goal]"),
  chestButton: document.querySelector("[data-chest-button]"),
  includePhrases: document.querySelector("[data-include-phrases]"),
  sideTabs: Array.from(document.querySelectorAll("[data-tab-target]")),
  tabPanels: Array.from(document.querySelectorAll("[data-tab-panel]")),
  version: document.querySelector("[data-version]"),
};

const UA = navigator.userAgent || "";
const IS_IOS = /iPad|iPhone|iPod/.test(UA);
const IS_CHROME_IOS = /CriOS/.test(UA);

const STORAGE_KEYS = {
  letters: "pismenkova_hra_enabled_letters_v1",
  panel: "pismenkova_hra_panel_open_v1",
  sounds: "pismenkova_hra_sounds_enabled_v1",
  rewards: "pismenkova_hra_reward_progress_v1",
  sideTab: "pismenkova_hra_side_tab_v1",
  maxLength: "pismenkova_hra_max_length_v1",
  includePhrases: "pismenkova_hra_include_phrases_v1",
};

const DEFAULT_MAX_WORD_LENGTH = 7;
const APP_VERSION = window.APP_VERSION || "1.0.1";

const state = {
  enabledLetters: new Set(LETTERS),
  panelCollapsed: false,
  words: [],
  currentWord: null,
  renderedWord: null,
  recognition: null,
  listening: false,
  timeoutId: null,
  soundsEnabled: false,
  successCount: 0,
  unlockedStickers: new Set(),
  stickerLevels: {},
  level: 1,
  mission: null,
  starCount: 0,
  audioCache: {},
  activeSideTab: "stickers",
  maxWordLength: DEFAULT_MAX_WORD_LENGTH,
  includePhrases: false,
};

const SOUND_PATHS = {
  tile: "assets/sounds/tile-click.m4a",
  success: "assets/sounds/success.m4a",
  error: "assets/sounds/try-again.m4a",
  sticker: "assets/sounds/sticker-unlocked.m4a",
  micOn: "assets/sounds/mic-on.m4a",
};
let STICKERS = window.STICKERS || [];
const externalLoadState = {
  phrases: false,
  stickers: false,
};

const MISSION_GOAL = 10;
const LEVEL_STEP = 50;
const SURPRISE_CHANCE = 0.3;
const STAR_GOAL = 5;
const MAX_STICKER_LEVEL = 3;

function safeLoad(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (err) {
    console.warn("Nepodařilo se načíst z localStorage", err);
    return fallback;
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Nepodařilo se uložit do localStorage", err);
  }
}

function getAudio(name) {
  if (!SOUND_PATHS[name]) return null;
  if (!state.audioCache[name]) {
    const audio = new Audio(SOUND_PATHS[name]);
    audio.preload = "auto";
    state.audioCache[name] = audio;
  }
  return state.audioCache[name];
}

function playSound(name) {
  if (!state.soundsEnabled) return;
  const audio = getAudio(name);
  if (!audio) return;
  try {
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore autoplay errors; sounds are optional
    });
  } catch (err) {
    // swallow sound errors
  }
}

function renderLetters() {
  elements.letters.innerHTML = "";
  LETTERS.forEach((letter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "letter";
    button.textContent = letter;
    const isOn = state.enabledLetters.has(letter);
    if (!isOn) {
      button.classList.add("is-off");
    }
    button.setAttribute("aria-pressed", String(isOn));
    button.addEventListener("click", () => toggleLetter(letter, button));
    elements.letters.appendChild(button);
  });
}

function toggleLetter(letter, node) {
  if (state.enabledLetters.has(letter)) {
    state.enabledLetters.delete(letter);
    node.classList.add("is-off");
    node.setAttribute("aria-pressed", "false");
  } else {
    state.enabledLetters.add(letter);
    node.classList.remove("is-off");
    node.setAttribute("aria-pressed", "true");
  }
  playSound("tile");
  persistEnabledLetters();
  updateWord();
}

function togglePanel() {
  state.panelCollapsed = !state.panelCollapsed;
  const isOpen = !state.panelCollapsed;
  elements.letters.style.display = isOpen ? "grid" : "none";
  elements.panelToggle.textContent = isOpen ? "Skrýt" : "Zobrazit";
  elements.panelToggle.setAttribute("aria-expanded", String(isOpen));
  safeSave(STORAGE_KEYS.panel, isOpen);
}

function persistEnabledLetters() {
  safeSave(STORAGE_KEYS.letters, Array.from(state.enabledLetters));
}

function persistSideTab() {
  safeSave(STORAGE_KEYS.sideTab, state.activeSideTab);
}

function persistMaxLength() {
  safeSave(STORAGE_KEYS.maxLength, state.maxWordLength);
}

function persistIncludePhrases() {
  safeSave(STORAGE_KEYS.includePhrases, state.includePhrases);
}

function persistRewards() {
  safeSave(STORAGE_KEYS.rewards, {
    successCount: state.successCount,
    earned: Array.from(state.unlockedStickers),
    stickerLevels: state.stickerLevels,
    level: state.level,
    mission: state.mission,
    starCount: state.starCount,
  });
}

function persistSounds() {
  safeSave(STORAGE_KEYS.sounds, state.soundsEnabled);
}

function loadScriptOnce(src, onload) {
  if (document.querySelector(`script[data-loader="${src}"]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.dataset.loader = src;
  script.onload = onload;
  script.onerror = () => {
    console.warn(`Nepodařilo se načíst ${src}`);
  };
  document.head.appendChild(script);
}

function ensureExternalData() {
  if (!state.words.length && Array.isArray(window.PHRASES)) {
    state.words = window.PHRASES;
  } else if (!state.words.length && !externalLoadState.phrases) {
    externalLoadState.phrases = true;
    loadScriptOnce("phrases.js", () => {
      if (Array.isArray(window.PHRASES)) {
        state.words = window.PHRASES;
        updateWord();
      }
    });
  }
  if (!STICKERS.length && Array.isArray(window.STICKERS)) {
    STICKERS = window.STICKERS;
  } else if (!STICKERS.length && !externalLoadState.stickers) {
    externalLoadState.stickers = true;
    loadScriptOnce("stickers.js", () => {
      if (Array.isArray(window.STICKERS)) {
        STICKERS = window.STICKERS;
        renderStickers();
        updateMissionUI();
      }
    });
  }
}

function updateSoundToggleUI() {
  if (!elements.soundToggle) return;
  elements.soundToggle.setAttribute("aria-pressed", String(state.soundsEnabled));
  const img = elements.soundToggle.querySelector("img");
  const label = elements.soundToggle.querySelector(".sound-toggle__label");
  if (img) {
    img.src = state.soundsEnabled ? "assets/speaker-on.png" : "assets/speaker-off.png";
    img.alt = state.soundsEnabled ? "Zvuky zapnuté" : "Zvuky vypnuté";
  }
  if (label) label.textContent = "Zvuky";
  elements.soundToggle.setAttribute(
    "aria-label",
    state.soundsEnabled ? "Zvuky zapnuté" : "Zvuky vypnuté"
  );
}

function toggleSounds() {
  state.soundsEnabled = !state.soundsEnabled;
  persistSounds();
  updateSoundToggleUI();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDefaultStickerLevels() {
  return STICKERS.reduce((acc, sticker) => {
    acc[sticker.id] = 0;
    return acc;
  }, {});
}

function getWordLength(word) {
  return word ? word.replace(/\s+/g, "").length : 0;
}

function normalizeStickerLevels(levels) {
  const normalized = getDefaultStickerLevels();
  if (levels && typeof levels === "object") {
    Object.keys(normalized).forEach((id) => {
      const value = Number(levels[id]);
      if (!Number.isNaN(value)) {
        normalized[id] = Math.max(0, Math.min(MAX_STICKER_LEVEL, Math.floor(value)));
      }
    });
  }
  return normalized;
}

function createMission() {
  const missions = [
    {
      weight: 5,
      build: () => ({
        type: "words",
        label: "Čtení slov",
        goal: randomInt(8, 12),
        progress: 0,
      }),
    },
    {
      weight: 3,
      build: () => ({
        type: "long",
        label: "Delší slova (min. 6)",
        goal: randomInt(4, 6),
        progress: 0,
      }),
      guard: () => state.maxWordLength >= 6,
    },
    {
      weight: 2,
      build: () => ({
        type: "wins",
        label: "Úspěšná slova",
        goal: randomInt(4, 6),
        progress: 0,
      }),
    },
  ].filter((mission) => (mission.guard ? mission.guard() : true));
  const total = missions.reduce((sum, mission) => sum + mission.weight, 0);
  let roll = Math.random() * total;
  for (const mission of missions) {
    if (roll < mission.weight) return mission.build();
    roll -= mission.weight;
  }
  return missions[0].build();
}

function getMissionProgress() {
  if (!state.mission) return 0;
  return state.mission.progress;
}

function advanceMissionOnSuccess(word) {
  if (!state.mission) state.mission = createMission();
  if (state.mission.type === "long") {
    if (getWordLength(word) >= 6) {
      state.mission.progress = Math.min(state.mission.goal, state.mission.progress + 1);
    }
    return;
  }
  state.mission.progress = Math.min(state.mission.goal, state.mission.progress + 1);
}

function updateLevel() {
  state.level = Math.floor(state.successCount / LEVEL_STEP) + 1;
}

function updateMetaUI() {
  if (elements.level) {
    elements.level.textContent = `Úroveň ${state.level}`;
  }
  if (elements.stars) {
    elements.stars.textContent = `⭐ Truhla: ${state.starCount}/${STAR_GOAL}`;
  }
  if (elements.missionCount) {
    elements.missionCount.textContent = String(
      Math.min(state.mission?.goal || MISSION_GOAL, getMissionProgress())
    );
  }
  if (elements.missionGoal) {
    elements.missionGoal.textContent = String(state.mission?.goal || MISSION_GOAL);
  }
  if (elements.missionLabel) {
    elements.missionLabel.textContent = state.mission?.label || "Čtení slov";
  }
}

function updateChestUI() {
  const count = Math.min(STAR_GOAL, state.starCount);
  const ready = count >= STAR_GOAL;
  if (elements.chestCount) {
    elements.chestCount.textContent = String(count);
  }
  if (elements.chestGoal) {
    elements.chestGoal.textContent = String(STAR_GOAL);
  }
  if (elements.chestButton) {
    elements.chestButton.disabled = !ready;
    elements.chestButton.textContent = ready ? "Otevřít truhlu" : "Sbírej hvězdy v misích";
    elements.chestButton.setAttribute("aria-disabled", String(!ready));
  }
  if (elements.chest) {
    elements.chest.classList.toggle("is-ready", ready);
  }
}

function updateMissionUI() {
  if (!elements.missionFill || !elements.missionMarker) return;
  if (!state.mission) state.mission = createMission();
  const progress = Math.min(
    1,
    Math.max(0, getMissionProgress() / (state.mission?.goal || MISSION_GOAL))
  );
  const width = `${progress * 100}%`;
  elements.missionFill.style.width = width;
  elements.missionMarker.style.left = width;
  updateMetaUI();
  updateChestUI();
}

function showReward({ title, text, image, imageAlt, confetti }) {
  if (!elements.rewardModal || !elements.rewardText) return;
  if (elements.rewardTitle) {
    elements.rewardTitle.textContent = title || "Skvělé!";
  }
  elements.rewardText.textContent = text || "";
  if (elements.rewardImage && elements.rewardIcon) {
    if (image) {
      elements.rewardImage.src = image;
      elements.rewardImage.alt = imageAlt || "";
      elements.rewardIcon.hidden = false;
    } else {
      elements.rewardImage.src = "";
      elements.rewardImage.alt = "";
      elements.rewardIcon.hidden = true;
    }
  }
  elements.rewardModal.hidden = false;
  document.body.classList.add("modal-open");
  if (confetti) {
    launchConfetti();
  }
}

function hideReward() {
  if (!elements.rewardModal) return;
  elements.rewardModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function pickRandomItem(items) {
  if (!items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function launchConfetti() {
  const colors = ["#00b894", "#6c5ce7", "#ffb347", "#ffd86a", "#7bed9f"];
  const container = document.createElement("div");
  container.className = "confetti";
  const pieces = 16;
  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti__piece";
    const x = Math.round((Math.random() - 0.5) * 260);
    const y = Math.round(200 + Math.random() * 160);
    const r = Math.round(Math.random() * 360);
    const delay = Math.random() * 0.2;
    piece.style.setProperty("--x", `${x}px`);
    piece.style.setProperty("--y", `${y}px`);
    piece.style.setProperty("--r", `${r}deg`);
    piece.style.setProperty("--delay", `${delay}s`);
    piece.style.setProperty("--color", colors[i % colors.length]);
    container.appendChild(piece);
  }
  document.body.appendChild(container);
  window.setTimeout(() => container.remove(), 1400);
}

function unlockSticker(sticker) {
  if (!sticker) return;
  state.unlockedStickers.add(sticker.id);
}

function upgradeSticker(sticker) {
  if (!sticker) return;
  const current = state.stickerLevels[sticker.id] || 0;
  state.stickerLevels[sticker.id] = Math.min(MAX_STICKER_LEVEL, current + 1);
}

function getThresholdUnlock() {
  return STICKERS.find(
    (sticker) => state.successCount >= sticker.threshold && !state.unlockedStickers.has(sticker.id)
  );
}

function grantSurpriseReward() {
  const eligible = STICKERS.filter(
    (sticker) => state.successCount >= sticker.threshold && !state.unlockedStickers.has(sticker.id)
  );
  if (eligible.length) {
    const sticker = pickRandomItem(eligible);
    unlockSticker(sticker);
    playSound("sticker");
    return {
      title: "Tajná odměna!",
      text: `Získal jsi nálepku: ${sticker.name}!`,
      image: sticker.image,
      imageAlt: sticker.name,
    };
  }
  const upgradable = STICKERS.filter(
    (sticker) =>
      state.unlockedStickers.has(sticker.id) &&
      (state.stickerLevels[sticker.id] || 0) < MAX_STICKER_LEVEL
  );
  if (upgradable.length) {
    const sticker = pickRandomItem(upgradable);
    upgradeSticker(sticker);
    playSound("sticker");
    return {
      title: "Tajná odměna!",
      text: `Nálepka ${sticker.name} je teď silnější! ⭐`,
      image: sticker.image,
      imageAlt: sticker.name,
    };
  }
  return {
    title: "Tajná odměna!",
    text: "Skvělá práce! Pokračuj dál.",
  };
}

function grantStarBonus() {
  state.starCount = 0;
  const bonus = grantSurpriseReward();
  return {
    ...bonus,
    title: "Truhla odměn!",
  };
}

function openChest() {
  if (state.starCount < STAR_GOAL) return;
  const bonus = grantStarBonus();
  showReward({
    ...bonus,
    confetti: true,
  });
  persistRewards();
  updateMissionUI();
  renderStickers();
}

function recordSuccess() {
  state.successCount += 1;
  updateLevel();
  advanceMissionOnSuccess(state.currentWord);

  const thresholdSticker = getThresholdUnlock();
  let rewardPayload = null;

  if (thresholdSticker) {
    unlockSticker(thresholdSticker);
    playSound("sticker");
    rewardPayload = {
      title: "Nová nálepka!",
      text: `Získal jsi nálepku: ${thresholdSticker.name}!`,
      image: thresholdSticker.image,
      imageAlt: thresholdSticker.name,
    };
  }

  const missionCompleted =
    state.mission && getMissionProgress() >= (state.mission.goal || MISSION_GOAL);
  if (missionCompleted) {
    state.starCount = Math.min(STAR_GOAL, state.starCount + 1);
    const bonusPayload = Math.random() < SURPRISE_CHANCE ? grantSurpriseReward() : null;
    const chestReady = state.starCount >= STAR_GOAL;

    const pieces = ["Mise splněna!"];
    if (thresholdSticker) {
      pieces.push(`Získal jsi nálepku: ${thresholdSticker.name}!`);
    }
    if (bonusPayload) {
      pieces.push(`Bonus: ${bonusPayload.text}`);
    }
    if (chestReady) {
      pieces.push("Truhla je připravená! Otevři ji v nálepkách.");
    } else {
      pieces.push(`Získáváš hvězdu (${state.starCount}/${STAR_GOAL}).`);
    }

    rewardPayload = {
      title: chestReady ? "Truhla je připravená!" : thresholdSticker ? "Dvojitá odměna!" : "Mise splněna!",
      text: pieces.join(" "),
      image: thresholdSticker?.image || bonusPayload?.image,
      imageAlt: thresholdSticker?.name || bonusPayload?.imageAlt,
      confetti: true,
    };

    state.mission = createMission();
  } else if (rewardPayload) {
    rewardPayload.confetti = false;
  }

  if (rewardPayload) {
    showReward(rewardPayload);
  }

  persistRewards();
  updateMissionUI();
  renderStickers();
}

function renderStickers() {
  ensureExternalData();
  if (!elements.stickersGrid) return;
  elements.stickersGrid.innerHTML = "";
  STICKERS.forEach((sticker) => {
    const unlocked = state.unlockedStickers.has(sticker.id);
    const level = state.stickerLevels[sticker.id] || 0;
    const card = document.createElement("div");
    card.className = "sticker-card";
    if (unlocked) card.classList.add("is-unlocked");
    if (unlocked && level > 0) card.classList.add(`level-${level}`);
    const img = document.createElement("img");
    img.src = sticker.image;
    img.alt = sticker.name;
    img.className = "sticker-card__image";
    const name = document.createElement("div");
    name.className = "sticker-card__name";
    name.textContent = sticker.name;
    if (unlocked && level > 0) {
      const levelBadge = document.createElement("span");
      levelBadge.className = "sticker-card__level";
      levelBadge.textContent = `⭐ ${level}`;
      card.appendChild(levelBadge);
    }
    if (!unlocked) {
      const lock = document.createElement("span");
      lock.className = "sticker-card__lock";
      lock.textContent = "🔒";
      card.appendChild(lock);
    }
    card.appendChild(img);
    card.appendChild(name);
    elements.stickersGrid.appendChild(card);
  });
}

function setActiveSideTab(tab) {
  state.activeSideTab = tab;
  persistSideTab();
  if (elements.sideTabs.length) {
    elements.sideTabs.forEach((btn) => {
      const isActive = btn.getAttribute("data-tab-target") === tab;
      btn.classList.toggle("side-tab--active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
  }
  if (elements.tabPanels.length) {
    elements.tabPanels.forEach((panel) => {
      const isMatch = panel.getAttribute("data-tab-panel") === tab;
      panel.hidden = !isMatch;
    });
  }
  if (elements.letters) {
    elements.letters.style.display = tab === "settings" ? "grid" : "none";
  }
  if (elements.version) {
    elements.version.textContent = `Verze: ${APP_VERSION}`;
  }
}

function hydrateFromStorage() {
  const savedLetters = safeLoad(STORAGE_KEYS.letters, null);
  if (Array.isArray(savedLetters) && savedLetters.length) {
    state.enabledLetters = new Set(
      savedLetters.filter((letter) => LETTERS.includes(letter))
    );
  }

  const panelOpen = safeLoad(STORAGE_KEYS.panel, true);
  state.panelCollapsed = !panelOpen;

  const soundOn = safeLoad(STORAGE_KEYS.sounds, false);
  state.soundsEnabled = Boolean(soundOn);

  const rewardProgress = safeLoad(STORAGE_KEYS.rewards, {
    successCount: 0,
    earned: [],
  });
  state.successCount = Number(rewardProgress.successCount) || 0;
  state.unlockedStickers = new Set(rewardProgress.earned || []);
  state.stickerLevels = normalizeStickerLevels(rewardProgress.stickerLevels);
  updateLevel();
  const savedMission = rewardProgress.mission;
  if (savedMission && typeof savedMission === "object") {
    const goal = Math.max(1, Number(savedMission.goal) || MISSION_GOAL);
    state.mission = {
      type: savedMission.type || "words",
      label: savedMission.label || "Čtení slov",
      goal,
      progress: Math.min(goal, Math.max(0, Number(savedMission.progress) || 0)),
    };
  } else {
    state.mission = createMission();
  }
  state.starCount = Math.max(0, Math.min(STAR_GOAL, Number(rewardProgress.starCount) || 0));

  const savedTab = safeLoad(STORAGE_KEYS.sideTab, "stickers");
  state.activeSideTab = savedTab === "settings" ? "settings" : "stickers";

  const savedMax = Number(safeLoad(STORAGE_KEYS.maxLength, DEFAULT_MAX_WORD_LENGTH));
  if (!Number.isNaN(savedMax) && savedMax >= 0 && savedMax <= 12) {
    state.maxWordLength = savedMax;
  } else {
    state.maxWordLength = DEFAULT_MAX_WORD_LENGTH;
  }
  state.includePhrases = Boolean(safeLoad(STORAGE_KEYS.includePhrases, false));
}

function wordUsesDisabledLetters(word) {
  const text = word.toUpperCase();
  const disabled = LETTERS.filter((letter) => !state.enabledLetters.has(letter));
  return disabled.some((letter) => text.includes(letter.toUpperCase()));
}

function isWithinMaxLength(text) {
  if (state.maxWordLength === 0) return true;
  const parts = text.split(/\s+/).filter(Boolean);
  return parts.every((part) => getWordLength(part) <= state.maxWordLength);
}

function getFilteredWords() {
  ensureExternalData();
  if (!state.mission) state.mission = createMission();
  const withinLength = state.words.filter((word) => isWithinMaxLength(word));
  const pool = withinLength.length ? withinLength : state.words;
  const phraseFiltered = state.includePhrases
    ? pool
    : pool.filter((word) => !word.includes(" "));
  const missionFiltered =
    state.mission?.type === "long"
      ? phraseFiltered.filter((word) => getWordLength(word) >= 6)
      : phraseFiltered;
  const filtered = missionFiltered.filter((word) => !wordUsesDisabledLetters(word));
  return filtered;
}

function capitalize(word) {
  if (!word) return word;
  const [first, ...rest] = word;
  return first.toUpperCase() + rest.join("").toLowerCase();
}

function randomCase(word) {
  const looksProper = word[0] === word[0].toUpperCase();
  const roll = Math.random();
  if (looksProper) {
    return roll < 0.5 ? word : word.toUpperCase();
  }
  if (roll < 0.33) return word.toLowerCase();
  if (roll < 0.66) return word.toUpperCase();
  return capitalize(word);
}

function setFeedback(message, type = "info") {
  elements.feedback.textContent = message;
  elements.feedback.className = "feedback";
  if (type === "success") elements.feedback.classList.add("is-success");
  if (type === "error") elements.feedback.classList.add("is-error");
  // Remove any modal if present when showing new feedback
}

function normalizeWord(word) {
  return word ? word.trim().toLocaleLowerCase("cs-CZ") : "";
}

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function hasSpeechRecognition() {
  return Boolean(getSpeechRecognitionConstructor());
}

function pickRandomWord() {
  const pool = getFilteredWords();
  if (!pool.length) {
    return null;
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function updateWord() {
  stopRecognition();
  const choice = pickRandomWord();
  state.currentWord = choice;
  if (!choice) {
    elements.word.textContent = "---";
    state.renderedWord = null;
    setFeedback(
      "Pro aktuální nastavení nejsou k dispozici žádná slova. Zkuste zvýšit maximální délku slova nebo změnit písmena.",
      "error"
    );
    return;
  }
  state.renderedWord = randomCase(choice);
  elements.word.textContent = state.renderedWord;
  elements.word.classList.remove("bump");
  void elements.word.offsetWidth; // restart animation
  elements.word.classList.add("bump");
  setFeedback("Řekni slovo nebo vyber další.");
}

function setMicListening(isListening) {
  state.listening = isListening;
  elements.mic.classList.toggle("is-listening", isListening);
  if (elements.micLabel) {
    elements.micLabel.textContent = isListening ? "Poslouchám..." : "Řekni slovo";
  } else {
    elements.mic.textContent = isListening ? "Poslouchám..." : "Řekni slovo";
  }
  elements.mic.disabled = !state.currentWord;
}

function setMaxLength(value) {
  const parsed = Number(value);
  const clamped = Number.isNaN(parsed)
    ? DEFAULT_MAX_WORD_LENGTH
    : Math.min(12, Math.max(0, parsed));
  state.maxWordLength = clamped;
  if (elements.maxLengthInput) {
    elements.maxLengthInput.value = clamped;
  }
  if (elements.maxLengthValue) {
    elements.maxLengthValue.textContent =
      clamped === 0 ? "Bez limitu" : `${clamped} písmen`;
  }
  persistMaxLength();
  updateWord();
}

function setIncludePhrases(isEnabled) {
  state.includePhrases = Boolean(isEnabled);
  if (elements.includePhrases) {
    elements.includePhrases.checked = state.includePhrases;
  }
  persistIncludePhrases();
  updateWord();
}

function stopRecognition() {
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }
  if (state.recognition) {
    state.recognition.onresult = null;
    state.recognition.onerror = null;
    state.recognition.onend = null;
    try {
      state.recognition.stop();
    } catch (err) {
      // ignore stop errors
    }
  }
  state.recognition = null;
  setMicListening(false);
}

function handleRecognitionResult(event) {
  const phrases = Array.from(event.results).map((result) =>
    result[0].transcript
  );
  const spoken = phrases.join(" ");
  const matches =
    normalizeWord(spoken) === normalizeWord(state.currentWord || "");
  if (matches) {
    setFeedback(`Výborně! Řekl jsi: ${spoken}`, "success");
    playSound("success");
    recordSuccess();
    stopRecognition();
    setTimeout(updateWord, 900);
  } else {
    setFeedback(`Zkus to znovu. Slyšel jsem: ${spoken}`, "error");
    playSound("error");
    stopRecognition();
  }
}

function handleRecognitionError(event) {
  const errorMessages = {
    "no-speech": "Neslyším nic. Zkus to znovu.",
    aborted: "Poslech byl zrušen. Zkus to znovu.",
    "audio-capture": "Mikrofon nelze použít. Zkontroluj oprávnění nebo připojení.",
    network: "Služba rozpoznávání je nedostupná. Zkus to znovu nebo přejdi na jiné připojení.",
    "not-allowed":
      "Povol přístup k mikrofonu v prohlížeči nebo nastaveních zařízení.",
    "service-not-allowed":
      "Služba rozpoznávání není dostupná. Zkus jiný prohlížeč nebo restart.",
    "language-not-supported": "Vybraný jazyk není podporován.",
  };
  const message = errorMessages[event.error] || "Došlo k chybě mikrofonu. Zkus to prosím znovu.";
  playSound("error");
  setFeedback(message, "error");
  stopRecognition();
}

function startRecognition() {
  const SpeechRecognition = getSpeechRecognitionConstructor();
  if (!SpeechRecognition) {
    setFeedback("Prohlížeč nepodporuje rozpoznávání řeči.", "error");
    elements.mic.disabled = true;
    return;
  }
  if (!window.isSecureContext) {
    setFeedback("Mikrofon potřebuje HTTPS nebo localhost.", "error");
    return;
  }
  if (IS_CHROME_IOS) {
    setFeedback("Chrome na iOS nepodporuje mikrofon pro Web Speech API. Použij Safari.", "error");
    return;
  }
  if (!state.currentWord) {
    setFeedback("Není vybrané žádné slovo.", "error");
    return;
  }
  stopRecognition();
  const recognition = new SpeechRecognition();
  recognition.lang = "cs-CZ";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  let gotResult = false;
  recognition.onresult = (event) => {
    gotResult = true;
    handleRecognitionResult(event);
  };
  recognition.onerror = handleRecognitionError;
  recognition.onspeechend = () => {
    try {
      recognition.stop();
    } catch (err) {
      // ignore stop errors
    }
  };
  recognition.onstart = () => {
    setMicListening(true);
    setFeedback("Poslouchám, řekni slovo nahlas.");
    if (state.timeoutId) clearTimeout(state.timeoutId);
    state.timeoutId = window.setTimeout(() => {
      setFeedback("Čas vypršel, zkus to znovu.", "error");
      stopRecognition();
    }, 7000);
  };
  recognition.onend = () => {
    if (!gotResult && state.listening) {
      setFeedback("Neslyším nic. Zkus to znovu.", "error");
    }
    stopRecognition();
  };
  state.recognition = recognition;
  try {
    recognition.start();
  } catch (err) {
    setFeedback("Nelze spustit mikrofon, zkus to prosím znovu.", "error");
    stopRecognition();
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Ignore registration errors
    });
  });
}

function init() {
  ensureExternalData();
  hydrateFromStorage();
  renderLetters();
  setActiveSideTab(state.activeSideTab);
  elements.sideTabs.forEach((btn) => {
    btn.addEventListener("click", () =>
      setActiveSideTab(btn.getAttribute("data-tab-target") || "stickers")
    );
  });
  elements.next.addEventListener("click", updateWord);
  elements.mic.addEventListener("click", startRecognition);
  if (elements.soundToggle) {
    elements.soundToggle.addEventListener("click", toggleSounds);
    updateSoundToggleUI();
  }
  if (elements.rewardClose) {
    elements.rewardClose.addEventListener("click", hideReward);
    elements.rewardClose.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hideReward();
      }
    });
  }
  if (elements.rewardModal) {
    elements.rewardModal.addEventListener("click", (e) => {
      if (e.target === elements.rewardModal) hideReward();
    });
  }
  if (elements.chestButton) {
    elements.chestButton.addEventListener("click", openChest);
  }
  if (elements.maxLengthInput) {
    elements.maxLengthInput.addEventListener("input", (e) =>
      setMaxLength(e.target.value)
    );
    setMaxLength(state.maxWordLength);
  }
  if (elements.includePhrases) {
    elements.includePhrases.addEventListener("change", (e) =>
      setIncludePhrases(e.target.checked)
    );
    setIncludePhrases(state.includePhrases);
  }
  if (!hasSpeechRecognition()) {
    elements.mic.disabled = true;
    setFeedback("Prohlížeč nepodporuje rozpoznávání řeči.", "error");
  } else if (IS_CHROME_IOS) {
    elements.mic.disabled = true;
    setFeedback("Chrome na iOS nepodporuje mikrofon. Otevři v Safari.", "error");
  }
  updateMissionUI();
  renderStickers();
  updateWord();
  registerServiceWorker();
}

init();
