// outil de lecture du texte contenu dans body
let utterance;
let synth = window.speechSynthesis;

//function getTextFromPage() {
// return document.body.textContent;
//}

function getTextFromMain() {
  const main = document.querySelector('main');
  return main ? main.textContent : '';
}

function lire() {
  if (synth.speaking) synth.cancel();

  //utterance = new SpeechSynthesisUtterance(getTextFromPage());
  utterance = new SpeechSynthesisUtterance(getTextFromMain());
  utterance.lang = 'fr-FR';
  utterance.rate = parseFloat(document.getElementById('vitesse').value);
  synth.speak(utterance);
}

function pause() {
  if (synth.speaking && !synth.paused) synth.pause();
}

function resume() {
  if (synth.paused) synth.resume();
}

function stop() {
  if (synth.speaking) synth.cancel();
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
});