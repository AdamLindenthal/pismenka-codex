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
  panelToggle: document.querySelector("[data-toggle-panel]"),
  mic: document.querySelector("[data-mic]"),
  next: document.querySelector("[data-next]"),
};

const STORAGE_KEYS = {
  letters: "pismenkova_hra_enabled_letters_v1",
  panel: "pismenkova_hra_panel_open_v1",
};

const state = {
  enabledLetters: new Set(LETTERS),
  panelCollapsed: false,
  words: WORDS,
  currentWord: null,
  renderedWord: null,
  recognition: null,
  listening: false,
  timeoutId: null,
};

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

function hydrateFromStorage() {
  const savedLetters = safeLoad(STORAGE_KEYS.letters, null);
  if (Array.isArray(savedLetters) && savedLetters.length) {
    state.enabledLetters = new Set(
      savedLetters.filter((letter) => LETTERS.includes(letter))
    );
  }

  const panelOpen = safeLoad(STORAGE_KEYS.panel, true);
  state.panelCollapsed = !panelOpen;
}

function wordUsesDisabledLetters(word) {
  const text = word.toUpperCase();
  const disabled = LETTERS.filter((letter) => !state.enabledLetters.has(letter));
  return disabled.some((letter) => text.includes(letter.toUpperCase()));
}

function getFilteredWords() {
  return state.words.filter((word) => !wordUsesDisabledLetters(word));
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
}

function normalizeWord(word) {
  return word ? word.trim().toLocaleLowerCase("cs-CZ") : "";
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
    setFeedback("Žádné slovo neodpovídá výběru písmen.", "error");
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
  elements.mic.textContent = isListening ? "🎙️ Poslouchám..." : "🎤 Řekni slovo";
  elements.mic.disabled = !state.currentWord || (!isListening && !state.renderedWord);
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
    stopRecognition();
    setTimeout(updateWord, 900);
  } else {
    setFeedback(`Zkus to znovu. Slyšel jsem: ${spoken}`, "error");
    stopRecognition();
  }
}

function handleRecognitionError(event) {
  const message =
    event.error === "no-speech"
      ? "Neslyším nic. Zkus to znovu."
      : "Došlo k chybě mikrofonu. Zkus to prosím znovu.";
  setFeedback(message, "error");
  stopRecognition();
}

function startRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setFeedback("Prohlížeč nepodporuje rozpoznávání řeči.", "error");
    elements.mic.disabled = true;
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
  recognition.onresult = handleRecognitionResult;
  recognition.onerror = handleRecognitionError;
  recognition.onend = () => {
    stopRecognition();
  };
  state.recognition = recognition;
  setMicListening(true);
  setFeedback("Poslouchám, řekni slovo nahlas.");
  recognition.start();
  state.timeoutId = window.setTimeout(() => {
    setFeedback("Čas vypršel, zkus to znovu.", "error");
    stopRecognition();
  }, 7000);
}

function init() {
  hydrateFromStorage();
  renderLetters();
  if (state.panelCollapsed) {
    elements.letters.style.display = "none";
    elements.panelToggle.textContent = "Zobrazit";
    elements.panelToggle.setAttribute("aria-expanded", "false");
  }
  elements.panelToggle.addEventListener("click", togglePanel);
  elements.next.addEventListener("click", updateWord);
  elements.mic.addEventListener("click", startRecognition);
  updateWord();
}

init();
