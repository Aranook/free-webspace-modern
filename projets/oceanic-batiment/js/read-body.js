let synth = window.speechSynthesis;
let voixDisponibles = [];
let phrases = [];
let currentPhraseIndex = 0;
let isPaused = false;
let isStopped = false;

function getTextFromMain() {
  const main = document.querySelector('main');
  return main ? main.textContent : '';
}

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

function splitTextToPhrases(text) {
  return text.match(/[^.!?\n]+[.!?\n]*/g) || [];
}

function lire() {
  stop(); // reset state
  phrases = splitTextToPhrases(getTextFromMain());
  currentPhraseIndex = 0;
  isPaused = false;
  isStopped = false;

  document.getElementById('btnLire').disabled = true;
  document.getElementById('btnLire').classList.add('en-lecture');
  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
  document.getElementById('btnLire').textContent = 'Lecture en cours...';

  lirePhrase(currentPhraseIndex);
}

function lirePhrase(index) {
  if (index >= phrases.length || isStopped) {
    finLecture();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(phrases[index]);
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

function pause() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
    isPaused = true;
    document.getElementById('btnPause').classList.add('en-pause');
    document.getElementById('btnResume').classList.remove('en-resume');
  }
}

function resume() {
  if (synth.paused) {
    synth.resume();
    isPaused = false;
    document.getElementById('btnResume').classList.add('en-resume');
    document.getElementById('btnPause').classList.remove('en-pause');
  }
}

function stop() {
  isStopped = true;
  isPaused = false;
  synth.cancel();

  document.getElementById('btnLire').disabled = false;
  document.getElementById('btnLire').classList.remove('en-lecture');
  document.getElementById('btnLire').textContent = 'Lire';
  document.getElementById('btnPause').classList.remove('en-pause');
  document.getElementById('btnResume').classList.remove('en-resume');
  updateProgressBar(0);
}

function finLecture() {
  document.getElementById('btnLire').disabled = false;
  document.getElementById('btnLire').classList.remove('en-lecture');
  document.getElementById('btnLire').textContent = 'Lire';
  updateProgressBar(1);
}

function updateProgressBar(ratio) {
  document.getElementById('progressBar').style.width = `${ratio * 100}%`;
}

function updateVitesse() {
  const val = document.getElementById('vitesse').value;
  document.getElementById('valeurVitesse').textContent = val;
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnLire').addEventListener('click', lire);
  document.getElementById('btnPause').addEventListener('click', pause);
  document.getElementById('btnResume').addEventListener('click', resume);
  document.getElementById('btnStop').addEventListener('click', stop);
  document.getElementById('vitesse').addEventListener('input', updateVitesse);

  populateVoix();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoix;
  }
});