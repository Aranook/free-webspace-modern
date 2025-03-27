# Ajout d'un En-Tête HTTP Conditionnellement selon le Navigateur

## Introduction
Certains en-têtes HTTP, comme `Permissions-Policy: interest-cohort=()`, ne sont pas reconnus par tous les navigateurs. Pour éviter les erreurs ou avertissements, il est possible d'ajouter ces en-têtes de manière conditionnelle en fonction du navigateur utilisé.

---

## 1. Configuration selon le serveur

### Apache
Avec Apache, on peut utiliser des règles `SetEnvIf` et `Header` pour ajouter un en-tête conditionnellement.

```apache
<IfModule mod_headers.c>
    SetEnvIfNoCase User-Agent ".*Chrome.*" is_chrome
    Header set Permissions-Policy "interest-cohort=()" env=is_chrome
</IfModule>
```

**Explication :**
- Vérifie si l'agent utilisateur (`User-Agent`) contient "Chrome".
- Si c'est le cas, définit l'en-tête `Permissions-Policy` uniquement pour Chrome.

---

### NGINX
Avec NGINX, on peut utiliser `map` pour détecter le navigateur et ajouter l'en-tête si nécessaire.

```nginx
map $http_user_agent $add_interest_cohort {
    default "";
    ~Chrome "Permissions-Policy: interest-cohort=()";
}

server {
    listen 80;
    add_header $add_interest_cohort;
}
```

**Explication :**
- Vérifie si le `User-Agent` contient "Chrome".
- Si oui, ajoute l'en-tête `Permissions-Policy`.

---

### Node.js (Express)
Dans une application Node.js utilisant Express, on peut conditionner l'ajout de l'en-tête en fonction du `User-Agent`.

```javascript
const express = require('express');
const app = express();

app.use((req, res, next) => {
    if (/Chrome/.test(req.headers['user-agent'])) {
        res.setHeader("Permissions-Policy", "interest-cohort=()");
    }
    next();
});

app.listen(3000, () => console.log('Serveur en écoute sur le port 3000'));
```

**Explication :**
- Vérifie si le `User-Agent` contient "Chrome".
- Si oui, ajoute l'en-tête `Permissions-Policy` uniquement pour ces requêtes.

---

## 2. Liste des En-Têtes Sécurisés à Ajouter Conditionnellement

| En-Tête | Description | Quand l'utiliser ? |
|---------|------------|---------------------|
| `Permissions-Policy: interest-cohort=()` | Désactive le suivi FLoC de Google | Navigateur Chrome |
| `X-Frame-Options: DENY` | Bloque l'affichage du site dans un iframe | Pour éviter le clickjacking |
| `Content-Security-Policy` | Définit les sources autorisées pour les scripts et contenus | Pour limiter les attaques XSS |
| `Strict-Transport-Security` | Force l'utilisation de HTTPS | Lorsque HTTPS est activé |
| `Referrer-Policy: strict-origin-when-cross-origin` | Restreint l'envoi de l'URL référente | Amélioration de la confidentialité |

---

## Conclusion
En fonction du serveur utilisé, il est possible d'ajouter des en-têtes HTTP de manière conditionnelle pour éviter les erreurs et améliorer la sécurité. Adapter ces configurations selon les navigateurs permet d'optimiser la compatibilité et la protection des utilisateurs.
