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

const WORDS = [
  "kočka",
  "domeček",
  "jablko",
  "rodina",
  "bota",
  "auto",
  "motorka",
  "brýle",
  "zahrada",
  "pampeliška",
  "motýlek",
  "papoušek",
  "kamarád",
  "písmeno",
  "knihovna",
  "pohádka",
  "třešně",
  "jahoda",
  "višně",
  "banán",
  "sklenice",
  "čokoláda",
  "kytara",
  "písnička",
  "králík",
  "želva",
  "andulka",
  "sněhulák",
  "zvířátko",
  "barevný",
  "barva",
  "malování",
  "sluníčko",
  "hvězdička",
  "měsíček",
  "pískoviště",
  "houpačka",
  "klouzačka",
  "koloběžka",
  "tramvaj",
  "vlakové",
  "nádraží",
  "vafle",
  "dortík",
  "chleba",
  "máslo",
  "polévka",
  "snídaně",
  "svačina",
  "večeře",
  "kamínek",
  "větev",
  "stromek",
  "kapr",
  "pstruh",
  "žirafa",
  "tygr",
  "slonice",
  "krokodýl",
  "ježek",
  "ježibaba",
  "kouzelnice",
  "čaroděj",
  "perníček",
  "sněženka",
  "sedmikráska",
  "pradědeček",
  "babička",
  "dědeček",
  "maminka",
  "tatínek",
  "Petr",
  "Lucie",
  "Tereza",
  "Matyáš",
  "Adéla",
  "Kristýna",
  "Tomáš",
  "Barbora",
  "Dominik",
  "Matouš",
  "Mikuláš",
  "Štěpán",
  "Daniela",
  "Zuzana",
  "Vilém",
  "Hynek",
  "Praha",
  "Brno",
  "Ostrava",
  "Olomouc",
  "Zlín",
  "Plzeň",
  "Tábor",
  "Třebíč",
  "Český Krumlov",
  "Jihlava",
  "Hradec Králové",
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
  soundToggle: document.querySelector("[data-sound-toggle]"),
  maxLengthInput: document.querySelector("[data-max-length]"),
  maxLengthValue: document.querySelector("[data-max-length-value]"),
  rewardModal: document.querySelector("[data-reward-modal]"),
  rewardText: document.querySelector("[data-reward-text]"),
  rewardClose: document.querySelector("[data-reward-close]"),
  rewardImage: document.querySelector("[data-reward-image]"),
  stickersGrid: document.querySelector("[data-stickers-grid]"),
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
};

const DEFAULT_MAX_WORD_LENGTH = 7;
const APP_VERSION = window.APP_VERSION || "1.0.1";

const state = {
  enabledLetters: new Set(LETTERS),
  panelCollapsed: false,
  words: WORDS,
  currentWord: null,
  renderedWord: null,
  recognition: null,
  listening: false,
  timeoutId: null,
  soundsEnabled: false,
  successCount: 0,
  unlockedStickers: new Set(),
  audioCache: {},
  activeSideTab: "stickers",
  maxWordLength: DEFAULT_MAX_WORD_LENGTH,
};

const SOUND_PATHS = {
  tile: "assets/sounds/tile-click.m4a",
  success: "assets/sounds/success.m4a",
  error: "assets/sounds/try-again.m4a",
  sticker: "assets/sounds/sticker-unlocked.m4a",
  micOn: "assets/sounds/mic-on.m4a",
};
const STICKERS = [
  {
    id: "sticker-01",
    name: "Statečný čtenář",
    image: "assets/sticker-01.png",
    threshold: 5,
  },
  {
    id: "sticker-02",
    name: "Mistr kostek",
    image: "assets/sticker-02.png",
    threshold: 10,
  },
  {
    id: "sticker-03",
    name: "Atomový génius",
    image: "assets/sticker-03.png",
    threshold: 20,
  },
];

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

function persistRewards() {
  safeSave(STORAGE_KEYS.rewards, {
    successCount: state.successCount,
    earned: Array.from(state.unlockedStickers),
  });
}

function persistSounds() {
  safeSave(STORAGE_KEYS.sounds, state.soundsEnabled);
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

function nextRewardThreshold() {
  const thresholds = STICKERS.map((s) => s.threshold).sort((a, b) => a - b);
  return thresholds.find((t) => t > state.successCount) || thresholds[thresholds.length - 1] || 1;
}

function updateMissionUI() {
  if (!elements.missionFill || !elements.missionMarker) return;
  const target = nextRewardThreshold();
  const thresholds = STICKERS.map((s) => s.threshold).sort((a, b) => a - b);
  const previousThreshold = thresholds.reduce((acc, t) => (t < target ? t : acc), 0);
  const span = target - previousThreshold || target || 1;
  const progress = Math.min(
    1,
    Math.max(0, (state.successCount - previousThreshold) / span)
  );
  const width = `${progress * 100}%`;
  elements.missionFill.style.width = width;
  elements.missionMarker.style.left = width;
}

function showReward(threshold) {
  if (!elements.rewardModal || !elements.rewardText) return;
  const sticker = STICKERS.find((s) => s.threshold === threshold);
  const name = sticker ? sticker.name : `Splněno ${threshold} slov!`;
  elements.rewardText.textContent = sticker
    ? `Získal jsi nálepku: ${name}!`
    : `Splněno ${threshold} slov!`;
  if (elements.rewardImage) {
    elements.rewardImage.src = sticker ? sticker.image : "";
    elements.rewardImage.alt = sticker ? name : "";
  }
  elements.rewardModal.hidden = false;
  document.body.classList.add("modal-open");
}

function hideReward() {
  if (!elements.rewardModal) return;
  elements.rewardModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function recordSuccess() {
  state.successCount += 1;
  const newlyUnlocked = STICKERS.filter(
    (s) => state.successCount >= s.threshold && !state.unlockedStickers.has(s.id)
  );
  if (newlyUnlocked.length) {
    const sticker = newlyUnlocked[0];
    state.unlockedStickers.add(sticker.id);
    playSound("sticker");
    showReward(sticker.threshold);
    renderStickers();
  }
  persistRewards();
  updateMissionUI();
}

function renderStickers() {
  if (!elements.stickersGrid) return;
  elements.stickersGrid.innerHTML = "";
  STICKERS.forEach((sticker) => {
    const unlocked = state.unlockedStickers.has(sticker.id);
    const card = document.createElement("div");
    card.className = "sticker-card";
    if (unlocked) card.classList.add("is-unlocked");
    const img = document.createElement("img");
    img.src = sticker.image;
    img.alt = sticker.name;
    img.className = "sticker-card__image";
    const name = document.createElement("div");
    name.className = "sticker-card__name";
    name.textContent = sticker.name;
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

  const savedTab = safeLoad(STORAGE_KEYS.sideTab, "stickers");
  state.activeSideTab = savedTab === "settings" ? "settings" : "stickers";

  const savedMax = Number(safeLoad(STORAGE_KEYS.maxLength, DEFAULT_MAX_WORD_LENGTH));
  if (!Number.isNaN(savedMax) && savedMax >= 3 && savedMax <= 12) {
    state.maxWordLength = savedMax;
  } else {
    state.maxWordLength = DEFAULT_MAX_WORD_LENGTH;
  }
}

function wordUsesDisabledLetters(word) {
  const text = word.toUpperCase();
  const disabled = LETTERS.filter((letter) => !state.enabledLetters.has(letter));
  return disabled.some((letter) => text.includes(letter.toUpperCase()));
}

function getFilteredWords() {
  const withinLength = state.words.filter(
    (word) => word.length <= state.maxWordLength
  );
  const pool = withinLength.length ? withinLength : state.words;
  const filtered = pool.filter((word) => !wordUsesDisabledLetters(word));
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
  const clamped = Math.min(12, Math.max(3, Number(value) || DEFAULT_MAX_WORD_LENGTH));
  state.maxWordLength = clamped;
  if (elements.maxLengthInput) {
    elements.maxLengthInput.value = clamped;
  }
  if (elements.maxLengthValue) {
    elements.maxLengthValue.textContent = `${clamped} písmen`;
  }
  persistMaxLength();
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

function init() {
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
  if (elements.maxLengthInput) {
    elements.maxLengthInput.addEventListener("input", (e) =>
      setMaxLength(e.target.value)
    );
    setMaxLength(state.maxWordLength);
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
}

init();
