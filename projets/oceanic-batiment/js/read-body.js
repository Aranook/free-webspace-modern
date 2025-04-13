let synth = window.speechSynthesis;
let voixDisponibles = [];
let phrases = [];
let currentPhraseIndex = 0;
let isPaused = false;
let isStopped = false;

// Fonction pour récupérer le texte principal de la page
function getTextFromMain() {
  const main = document.querySelector('main');
  return main ? main.textContent : '';
}

// Fonction pour charger les voix disponibles pour la synthèse vocale
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

// Fonction pour découper le texte en phrases
function splitTextToPhrases(text) {
  return text.match(/[^.!?\n]+[.!?\n]*/g) || [];
}

// Fonction pour commencer la lecture
function lire() {
  stop();
  phrases = splitTextToPhrases(getTextFromMain());
  currentPhraseIndex = 0;
  isPaused = false;
  isStopped = false;
  updateUIStart();
  lirePhrase(currentPhraseIndex);
}

// Fonction pour lire une phrase spécifique
function lirePhrase(index) {
  if (index >= phrases.length || isStopped) {
    finLecture();
    return;
  }

  const phrase = phrases[index];
  const utterance = new SpeechSynthesisUtterance(phrase);
  const rate = parseFloat(document.getElementById('vitesse').value) || 1;
  utterance.rate = rate;
  utterance.lang = 'fr-FR';

  const voixIndex = document.getElementById('voix').value;
  if (voixDisponibles[voixIndex]) {
    utterance.voice = voixDisponibles[voixIndex];
  }

  utterance.onend = () => {
    if (!isPaused && !isStopped) {
      currentPhraseIndex++;
      updateProgressBar(currentPhraseIndex / phrases.length);
      lirePhrase(currentPhraseIndex);
    }
  };

  synth.speak(utterance);
}

// Pause
function pause() {
  if (!isPaused && synth.speaking) {
    isPaused = true;
    synth.pause();
    updateUIPause();
  }
}

// Reprise
function resume() {
  if (isPaused) {
    isPaused = false;
    updateUIResume();
    synth.resume();
  }
}

// Stop
function stop() {
  isStopped = true;
  isPaused = false;
  synth.cancel();
  currentPhraseIndex = 0;
  updateUIStop();
}

// Fin de lecture
function finLecture() {
  updateProgressBar(1);
  updateUIStop();
}

// Mise à jour de la barre de progression
function updateProgressBar(ratio) {
  document.getElementById('progressBar').style.width = `${Math.min(ratio * 100, 100)}%`;
}

// Mise à jour vitesse
function updateVitesse() {
  const val = document.getElementById('vitesse').value;
  document.getElementById('valeurVitesse').textContent = val;
}

// === UI state changes ===

function updateUIStart() {
  const btnLire = document.getElementById('btnLire');
  btnLire.disabled = true;
  btnLire.classList.add('en-lecture');
  btnLire.textContent = 'Lecture...';
  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
}

function updateUIPause() {
  document.getElementById('btnPause').classList.add('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
}

function updateUIResume() {
  document.getElementById('btnResume').classList.add('en-resume');
  document.getElementById('btnPause').classList.remove('en-pause');
}

function updateUIStop() {
  const btnLire = document.getElementById('btnLire');
  btnLire.disabled = false;
  btnLire.classList.remove('en-lecture');
  btnLire.textContent = 'Lire';
  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
  updateProgressBar(0);
}

// === DOM Ready ===
window.addEventListener('DOMContentLoaded', () => {
  // Boutons
  document.getElementById('btnLire').addEventListener('click', lire);
  document.getElementById('btnPause').addEventListener('click', pause);
  document.getElementById('btnResume').addEventListener('click', resume);
  document.getElementById('btnStop').addEventListener('click', stop);
  document.getElementById('vitesse').addEventListener('input', updateVitesse);

  // Voix
  populateVoix();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoix;
  }
  if (!voixDisponibles.length) populateVoix();

  // Navigation dans la barre de progression
  const progressContainer = document.getElementById('progressContainer');
  const tooltip = document.createElement('div');
  tooltip.id = 'progressTooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.background = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '2px 6px';
  tooltip.style.fontSize = '12px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.display = 'none';
  tooltip.style.zIndex = 10;
  document.body.appendChild(tooltip);

  // Survol pour tooltip
  progressContainer.addEventListener('mousemove', (e) => {
    if (!phrases.length) return;

    const rect = progressContainer.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const index = Math.floor(ratio * phrases.length);
    tooltip.textContent = phrases[index]?.trim().slice(0, 80) || '';
    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.top = `${e.clientY - 30}px`;
    tooltip.style.display = 'block';
  });

  progressContainer.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  // Clic pour naviguer dans les phrases
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