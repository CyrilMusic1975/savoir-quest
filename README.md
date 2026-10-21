# Savoir Quest

Application de révision pour élève de 6e, pensée pour être utilisée seul, en sessions courtes, sur un téléphone Android.
C'est une **PWA** (site installable sur l'écran d'accueil, qui fonctionne hors ligne) écrite en JavaScript pur, sans framework ni étape de build.

- **Application :** https://cyrilmusic1975.github.io/savoir-quest/
- **Matières :** mathématiques, français (grammaire, conjugaison, orthographe), SVT, physique-chimie, histoire-géographie, anglais.
- **Principe :** une « mission du jour » de 10 questions, vécue comme un match de football, qui mélange les erreurs récentes, les points à réviser et du nouveau contenu.

## Fonctionnalités

| Domaine | Détail |
|---|---|
| Révision | Mission du jour (toutes matières), entraînement par matière, carnet d'erreurs, reprise d'une séance interrompue |
| Exercices | QCM, saisie de réponse, toucher les mots d'une phrase, remise en ordre, association, figures de géométrie (SVG) |
| Adaptation | Répétition espacée (1, 3, 7, 14, 30 jours), niveaux 1 à 3, suivi des cas précis ratés (une table de multiplication, un rang décimal, un verbe…), réussites lentes détectées |
| Motivation | Match du jour (score contre un adversaire fictif), saison hebdomadaire (Bronze → Champion), records, badges et cartes de joueur par compétence, série de jours, récompenses de paliers d'XP |
| Rappel | Notification quotidienne à 17 h 30 si le profil n'a pas encore joué |
| Suivi parent | Envoi automatique des résultats vers Firebase, tableau de bord web et bilan hebdomadaire en Markdown |
| Robustesse | Hors ligne, sauvegarde/restauration de la progression en fichier, profils multiples, mises à jour automatiques |

## Structure du dépôt

```
index.html            Écrans de l'application (accueil, matières, jeu, fin de mission, collection)
style.css             Styles (mobile d'abord)
sw.js                 Service worker : cache hors ligne, notifications push
manifest.webmanifest  Métadonnées d'installation (nom, icônes, couleurs)
icons/                Icônes de l'application
js/
  main.js             Interface et déroulement d'une mission
  engine.js           Composition des séances, répétition espacée, badges, suivi des cas précis
  progress.js         Match du jour, saison, records, cartes de joueur
  render.js           Affichage des questions (un rendu par type d'exercice)
  state.js            Profils et réglages dans le navigateur (localStorage)
  sync.js             Envoi des résultats vers Firebase (API REST, file hors ligne)
  push.js             Abonnement aux notifications
  content/            Tous les contenus pédagogiques (voir docs/CONTENU.md)
tests/                Contrôles automatiques (npm test)
docs/                 Documentation détaillée
.github/workflows/    Contrôles automatiques à chaque publication
```

## Démarrer

Aucune dépendance à installer. Il faut seulement Node.js 22 ou plus récent.

```bash
npm test                      # lance tous les contrôles
python3 -m http.server 8123   # sert l'application en local → http://localhost:8123
```

Les modules JavaScript ne fonctionnent pas en ouvrant `index.html` directement depuis le disque : il faut un petit serveur local, comme ci-dessus.

## Documentation

| Document | Contenu |
|---|---|
| [docs/GUIDE-PARENT.md](docs/GUIDE-PARENT.md) | Utilisation au quotidien, lecture du bilan, fourniture de cours (sans jargon) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Fonctionnement interne, modèle de données, algorithmes, limites connues |
| [docs/CONTENU.md](docs/CONTENU.md) | Comment ajouter des questions, des générateurs et une matière |
| [docs/TESTS.md](docs/TESTS.md) | Ce que vérifient les contrôles automatiques |
| [docs/DONNEES-ET-CONFIDENTIALITE.md](docs/DONNEES-ET-CONFIDENTIALITE.md) | Données stockées et envoyées, sécurité, droits |
| [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) | Publication, installation sur téléphone, dépannage |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |
| [CLAUDE.md](CLAUDE.md) | Conventions pour travailler sur le projet avec un assistant |

## Écosystème

Le projet se compose de trois éléments :

1. **Cette application** (dépôt public) : le jeu, hébergé sur GitHub Pages.
2. **Le suivi parent** (dossier local `SavoirQuest-suivi`) : base Firestore, règles de sécurité et tableau de bord web protégé par une connexion Google, hébergés par Firebase.
3. **Les tâches planifiées** (dépôt privé `savoir-quest-bilans`) : bilan hebdomadaire envoyé chaque lundi et rappel quotidien de 17 h 30, exécutés par GitHub Actions.

## Licence et contenus

Projet familial : aucune licence open source n'est accordée (tous droits réservés). Les questions sont rédigées pour l'application ; elles s'inspirent des chapitres du programme de 6e sans reproduire les documents des enseignants. Les cours et photographies d'élève ne sont jamais publiés (dossier `_source/`, exclu de Git).
