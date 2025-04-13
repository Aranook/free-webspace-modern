// outil de lecture du texte contenu dans body
let utterance;
let synth = window.speechSynthesis;
let voixDisponibles = [];

//function getTextFromPage() {
// return document.body.textContent;
//}

function getTextFromMain() {
  const main = document.querySelector('main');
  return main ? main.textContent : '';
}

// Vérifie que la synthèse vocale est supportée
if (!('speechSynthesis' in window)) {
  alert('La synthèse vocale n’est pas supportée par ce navigateur.');
}

// Remplit le menu déroulant avec les voix disponibles en français
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

function lire() {
  if (synth.speaking) synth.cancel();

  //utterance = new SpeechSynthesisUtterance(getTextFromPage());
  utterance = new SpeechSynthesisUtterance(getTextFromMain());
  const vitesseInput = document.getElementById('vitesse');
  const rate = vitesseInput ? parseFloat(vitesseInput.value) || 1 : 1;

  utterance.lang = 'fr-FR';
  utterance.rate = rate;
  
  const voixIndex = document.getElementById('voix').value;
  if (voixDisponibles[voixIndex]) {
    utterance.voice = voixDisponibles[voixIndex];
  }
  
  // BONUS UX
  utterance.onstart = () => {
    document.getElementById('btnLire').disabled = true;
  };

  utterance.onend = () => {
    document.getElementById('btnLire').disabled = false;
  };
  
  synth.speak(utterance);
}

function pause() {
  if (synth.speaking && !synth.paused) synth.pause();
}

function resume() {
  if (synth.paused) synth.resume();
}

function stop() {
  if (synth.speaking) {
    synth.cancel();
    document.getElementById('btnLire').disabled = false;
  }
}

function updateVitesse() {
  const val = document.getElementById('vitesse').value;
  document.getElementById('valeurVitesse').textContent = val;
}

// Connexion des boutons aux fonctions après le chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnLire').addEventListener('click', lire);
  document.getElementById('btnPause').addEventListener('click', pause);
  document.getElementById('btnResume').addEventListener('click', resume);
  document.getElementById('btnStop').addEventListener('click', stop);
  document.getElementById('vitesse').addEventListener('input', updateVitesse);


 // Charge la liste des voix une première fois
  populateVoix();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoix;
  }
});