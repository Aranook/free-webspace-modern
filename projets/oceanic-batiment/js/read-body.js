// Initialisation
let synth = window.speechSynthesis;
let voixDisponibles = [];
let phrases = [];
let currentPhraseIndex = 0;
let isPaused = false;
let isStopped = false;
let isTouchEvent = false;

// Récupère le texte contenu dans la balise <main>
function getTextFromMain() {
  const main = document.querySelector('main');
  return main ? main.textContent : '';
}

// Charge les voix disponibles en français dans le <select>
function populateVoix() {
  voixDisponibles = synth.getVoices().filter(v => v.lang.startsWith('fr'));
  const select = document.getElementById('voix');
  select.innerHTML = '';
  voixDisponibles.forEach((voix, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${voix.name} (${voix.lang})`;
    select.appendChild(option);
  });
}

// Coupe le texte en phrases basées sur la ponctuation
function splitTextToPhrases(text) {
  return text.match(/[^.!?\n]+[.!?\n]*/g) || [];
}

// Lance la lecture depuis le début ou reprend si en pause
function lire() {
  if (synth.speaking && !isPaused) return; // Déjà en train de lire

  if (isPaused) {
    resume(); // Si on est en pause → on reprend
    return;
  }

  stop(); // Arrête tout avant de relancer
  phrases = splitTextToPhrases(getTextFromMain());
  currentPhraseIndex = 0;
  isPaused = false;
  isStopped = false;
  updateUIStart();
  lirePhrase(currentPhraseIndex);
}

// Lit une phrase à un index donné
function lirePhrase(index) {
  if (index >= phrases.length || isStopped) {
    finLecture();
    return;
  }

  const phrase = phrases[index];
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.rate = parseFloat(document.getElementById('vitesse').value) || 1;
  utterance.lang = 'fr-FR';

  const voixIndex = document.getElementById('voix').value;
  if (voixDisponibles[voixIndex]) {
    utterance.voice = voixDisponibles[voixIndex];
  }

  // Quand la phrase est finie → lire la suivante si pas en pause/stop
  utterance.onend = () => {
    if (!isPaused && !isStopped) {
      currentPhraseIndex++;
      updateProgressBar(currentPhraseIndex / phrases.length);
      lirePhrase(currentPhraseIndex);
    }
  };

  synth.speak(utterance);
}

// Met en pause la lecture
function pause() {
  if (!isPaused && synth.speaking) {
    isPaused = true;
    synth.pause();
    updateUIPause();
  }
}

// Reprend la lecture si en pause
function resume() {
  if (isPaused) {
    isPaused = false;
    updateUIResume();
    synth.resume();
  }
}

// Stoppe totalement la lecture et réinitialise
function stop() {
  isStopped = true;
  isPaused = false;
  synth.cancel();
  currentPhraseIndex = 0;
  updateUIStop();
}

// Fin de lecture (après dernière phrase)
function finLecture() {
  updateProgressBar(1);
  updateUIStop();
}

// Met à jour la barre de progression en %
function updateProgressBar(ratio) {
  document.getElementById('progressBar').style.width = `${Math.min(ratio * 100, 100)}%`;
}

// Affiche la vitesse choisie
function updateVitesse() {
  const val = document.getElementById('vitesse').value;
  document.getElementById('valeurVitesse').textContent = val;
}

// === Fonctions de mise à jour de l'interface ===

// UI quand la lecture démarre
function updateUIStart() {
  const btnLire = document.getElementById('btnLire');
  btnLire.disabled = true;
  btnLire.classList.add('en-lecture');
  btnLire.textContent = 'Lecture...';
  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');

  // Anti double-clic
  setTimeout(() => {
    btnLire.disabled = false;
  }, 500);
}

// UI quand on met en pause
function updateUIPause() {
  document.getElementById('btnPause').classList.add('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
}

// UI quand on reprend
function updateUIResume() {
  document.getElementById('btnResume').classList.add('en-resume');
  document.getElementById('btnPause').classList.remove('en-pause');
}

// UI quand on stoppe
function updateUIStop() {
  const btnLire = document.getElementById('btnLire');
  btnLire.disabled = false;
  btnLire.classList.remove('en-lecture');
  btnLire.textContent = 'Lire';
  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
  updateProgressBar(0);
}

// === Événements DOM ===
window.addEventListener('DOMContentLoaded', () => {
  // Boutons (clic)
  document.getElementById('btnLire').addEventListener('click', (e) => {
    if (!isTouchEvent) lire(e);
    isTouchEvent = false;
  });

  document.getElementById('btnPause').addEventListener('click', pause);
  document.getElementById('btnResume').addEventListener('click', resume);
  document.getElementById('btnStop').addEventListener('click', stop);
  document.getElementById('vitesse').addEventListener('input', updateVitesse);

  // Boutons (mobile - tactile)
  document.getElementById('btnLire').addEventListener('touchstart', (e) => {
    isTouchEvent = true;
    lire(e);
  });

  document.getElementById('btnPause').addEventListener('touchstart', (e) => {
    isTouchEvent = true;
    pause(e);
  });

  document.getElementById('btnResume').addEventListener('touchstart', (e) => {
    isTouchEvent = true;
    resume(e);
  });

  document.getElementById('btnStop').addEventListener('touchstart', (e) => {
    isTouchEvent = true;
    stop(e);
  });

  // Chargement des voix
  populateVoix();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoix;
  }

  // Tooltip dynamique au survol de la barre de progression
  const progressContainer = document.getElementById('progressContainer');
  const tooltip = document.createElement('div');
  tooltip.id = 'progressTooltip';
  document.body.appendChild(tooltip);

  progressContainer.addEventListener('mousemove', (e) => {
    if (!phrases.length) return;

    const rect = progressContainer.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const index = Math.floor(ratio * phrases.length);

    // Utilise pageX/pageY pour tenir compte du scroll vertical
    tooltip.textContent = phrases[index]?.trim().slice(0, 80) || '';
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY - 40}px`;
    tooltip.classList.add('visible');
  });

  progressContainer.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });

  // Clique sur la barre pour naviguer dans les phrases
  progressContainer.addEventListener('click', function (e) {
    if (!phrases.length) return;

    const rect = this.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newIndex = Math.floor(ratio * phrases.length);

    currentPhraseIndex = newIndex;
    isPaused = false;
    isStopped = false;
    synth.cancel();
    updateUIStart();
    lirePhrase(currentPhraseIndex);
  });
});