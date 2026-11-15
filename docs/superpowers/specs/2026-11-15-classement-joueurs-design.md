# Classement des joueurs (design)

## Intention
Le fils veut comparer son score à celui d'autres joueurs (famille, copains) qui utilisent l'appli. Motivation par la comparaison.

## Objectifs
- Tout joueur de l'appli apparaît automatiquement, avec un pseudo, dans un classement commun. Pas de code, pas de lien, pas de bouton d'inscription.
- Deux onglets : **Semaine** (XP de la semaine ISO, remis à zéro le lundi) et **Total** (XP cumulés).
- Le joueur est mis en évidence, avec son rang et l'écart avec celui qui est juste devant.

## Hors objectifs
Pas de comptes, pas de chat, pas de défi entre joueurs, pas de lien avec le championnat (reste inchangé).

## Anti-objectifs
Ne jamais exposer le vrai nom, les réponses, les erreurs ni les matières. Ne jamais gêner le jeu si le réseau échoue.

## Choix décidés avec l'utilisateur
- Classement ouvert à tous les utilisateurs de l'adresse de l'appli (pas de code ni de lien : jugés peu pratiques).
- Visible automatiquement ; **pseudo demandé une seule fois** (suggestions proposées), modifiable dans les réglages.

## Approches envisagées
1. Code famille : écarté (peu pratique). 2. Lien d'invitation : écarté. 3. **Classement ouvert** : retenu, avec garde-fous (pseudo, filtre de mots, retrait par le parent, limites de vraisemblance dans les règles).

## Conception
- Firestore : collection `scores/{uid}-{profil}` : `pseudo`, `avatar`, `weekId`, `weekXP`, `totalXP`, `ts`. Lecture : tout utilisateur connecté (anonyme). Écriture : son propre document, champs et tailles contrôlés, XP bornés. Suppression : parent seulement. Règles dans `SavoirQuest-suivi/firestore.rules`.
- `js/sync.js` : envoi du score après chaque mission (file/anti-rebond) ; lecture des 50 premiers par onglet. Erreur ou hors ligne : dernier classement en cache, jeu non bloqué. Aucun envoi sur `localhost` (sauf `?sync=1`).
- `js/classement.js` (pur) : tri, rang, écart, validation et filtre de pseudo ; testé par Node.
- `ensureProfile` : nouveau champ `board` (`pseudo`). Aucune clé `localStorage` renommée.
- Interface : écran Classement dans `main.js`, demande de pseudo au premier passage, réglage pour le changer.
- Tableau de bord parent : liste des joueurs et bouton Retirer.
- `sw.js` : ajouter le nouveau fichier JS à `FILES`, VERSION 26, numéro dans `index.html`, CHANGELOG.

## Tests
Rang et écart recalculés indépendamment ; filtre de pseudo ; limites des règles ; vérifier qu'un test échoue si on casse le tri.

## Laissé au constructeur
Liste des suggestions de pseudo et des mots filtrés, mise en page exacte, plafonds d'XP des règles.

## Risque connu
Un joueur pourrait tricher en trafiquant l'appli ; accepté entre proches, limité par les règles.
