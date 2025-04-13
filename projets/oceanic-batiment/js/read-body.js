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

// Fonction pour découper le texte en phrases, utilisées pour la lecture phrase par phrase
function splitTextToPhrases(text) {
  return text.match(/[^.!?\n]+[.!?\n]*/g) || [];
}

// Fonction qui commence la lecture
function lire() {
  stop(); // réinitialiser tout
  phrases = splitTextToPhrases(getTextFromMain());
  currentPhraseIndex = 0;
  isPaused = false;
  isStopped = false;

  updateUIStart(); // Mise à jour de l'UI pour démarrer la lecture

  lirePhrase(currentPhraseIndex);
}

// Fonction pour lire une phrase spécifique
function lirePhrase(index) {
  if (index >= phrases.length || isStopped) {
    finLecture(); // Si on a atteint la fin ou l'arrêt, on termine
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
      lirePhrase(currentPhraseIndex); // Lecture de la prochaine phrase
    }
  };

  synth.speak(utterance);
}

// Fonction de pause
function pause() {
  if (!isPaused && synth.speaking) {
    isPaused = true;
    synth.pause(); // Utilisation de pause pour ne pas annuler la lecture
    updateUIPause(); // Mise à jour de l'UI pour la pause
  }
}

// Fonction pour reprendre la lecture après une pause
function resume() {
  if (isPaused) {
    isPaused = false;
    updateUIResume(); // Mise à jour de l'UI pour la reprise
    synth.resume(); // Reprendre la lecture là où elle a été arrêtée
  }
}

// Fonction pour arrêter la lecture
function stop() {
  isStopped = true;
  isPaused = false;
  synth.cancel(); // Annule toute lecture en cours
  currentPhraseIndex = 0; // Réinitialise l'index de la phrase
  updateUIStop(); // Mise à jour de l'UI pour arrêter
}

// Fonction pour la fin de la lecture, met à jour la barre de progression et l'UI
function finLecture() {
  updateProgressBar(1); // Barre de progression complète
  updateUIStop(); // Mise à jour de l'UI à l'arrêt
}

// Fonction pour mettre à jour la barre de progression en fonction du ratio passé
function updateProgressBar(ratio) {
  document.getElementById('progressBar').style.width = `${Math.min(ratio * 100, 100)}%`;
}

// Fonction pour mettre à jour la vitesse de lecture
function updateVitesse() {
  const val = document.getElementById('vitesse').value;
  document.getElementById('valeurVitesse').textContent = val;
}

// === UI state changes ===

// Mise à jour de l'UI au début de la lecture
function updateUIStart() {
  const btnLire = document.getElementById('btnLire');
  btnLire.disabled = true;
  btnLire.classList.add('en-lecture');
  btnLire.textContent = 'Lecture...';

  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
}

// Mise à jour de l'UI lors de la pause
function updateUIPause() {
  document.getElementById('btnPause').classList.add('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
}

// Mise à jour de l'UI lors de la reprise
function updateUIResume() {
  document.getElementById('btnResume').classList.add('en-resume');
  document.getElementById('btnPause').classList.remove('en-pause');
}

// Mise à jour de l'UI lors de l'arrêt
function updateUIStop() {
  const btnLire = document.getElementById('btnLire');
  btnLire.disabled = false;
  btnLire.classList.remove('en-lecture');
  btnLire.textContent = 'Lire';
  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
  updateProgressBar(0); // Barre de progression à 0%
}

// === DOM Ready ===
window.addEventListener('DOMContentLoaded', () => {
  // Ajout des événements sur les boutons et la vitesse
  document.getElementById('btnLire').addEventListener('click', lire);
  document.getElementById('btnPause').addEventListener('click', pause);
  document.getElementById('btnResume').addEventListener('click', resume);
  document.getElementById('btnStop').addEventListener('click', stop);
  document.getElementById('vitesse').addEventListener('input', updateVitesse);

  populateVoix(); // Remplir la liste des voix disponibles
  // S'assurer que les voix sont bien chargées
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoix;
  }

  // Sécuriser si aucune voix n'est disponible
  if (!voixDisponibles.length) populateVoix(); // Garantir que les voix sont toujours disponibles
});