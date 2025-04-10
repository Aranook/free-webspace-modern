document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");
  const declineBtn = document.getElementById("decline-cookies");

  // Vérifier si l'utilisateur a déjà pris une décision sur les cookies
  if (!localStorage.getItem("cookieConsent")) {
    // Si aucune décision n'a été prise, afficher le bandeau
    banner.style.display = "flex";
  } else {
    // Si une décision a été prise, ne pas afficher le bandeau
    banner.style.display = "none";
  }

  // Si l'utilisateur accepte les cookies
  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted"); // Sauvegarder la décision
    banner.style.display = "none"; // Masquer le bandeau
  });

  // Si l'utilisateur refuse les cookies
  declineBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined"); // Sauvegarder la décision
    banner.style.display = "none"; // Masquer le bandeau
  });
  
  // Scroll to top button
  const btn = document.getElementById("scrollToTop");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      btn.style.display = "block";
    } else {
      btn.style.display = "none";
    }
  });

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  
});