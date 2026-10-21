# Architecture

## Vue d'ensemble

```
   Téléphone (PWA)                                   Cloud
┌──────────────────────────┐   résultats    ┌───────────────────────────┐
│ index.html + js/*.js     │ ─────────────► │ Firebase (Firestore)      │
│ localStorage (progression)│  notification  │  events/  push/           │
│ service worker (hors ligne)│ ◄──────────── │ Hosting : tableau de bord │
└──────────────────────────┘                └──────────┬────────────────┘
        ▲  hébergé par GitHub Pages                    │ lecture seule
        │                                   ┌──────────▼────────────────┐
        └──────── dépôt public              │ GitHub Actions (dépôt privé)│
                                            │  bilan du lundi · rappel   │
                                            └───────────────────────────┘
```

L'application fonctionne **entièrement sans le cloud** : la progression vit dans le navigateur. Firebase ne sert qu'à informer le parent ; toute erreur réseau est ignorée sans gêner le jeu.

## Modules

| Fichier | Rôle | Dépend de |
|---|---|---|
| `main.js` | Écrans, navigation, déroulement d'une mission, réglages, sauvegarde/restauration | tous |
| `engine.js` | Construit les séances, enregistre les réponses (maîtrise, répétition espacée, badges, cas précis) | `content`, `state` |
| `progress.js` | Saison, match du jour, records, cartes de joueur (calculs purs, sans interface) | `state` |
| `render.js` | Affiche chaque type de question et appelle `submit(correct, réponse)` | `content/helpers` |
| `state.js` | Lecture/écriture des profils, réglages et séance en cours dans `localStorage` ; dates et semaines | — |
| `sync.js` | Authentification anonyme, file d'attente locale, envoi par lots vers Firestore (REST) | — |
| `push.js` | Abonnement aux notifications web push | `sync` |
| `content/*` | Matières, compétences, banques de questions et générateurs | `helpers` |

`progress.js` et `engine.js` ne touchent pas au DOM : ils sont testés directement par Node.

## Modèle de contenu

- **Matière** (`SUBJECTS`) : `{ id, label, emoji }`.
- **Compétence** (`SKILLS`) : `{ id, subject, label, gen | bank, extra? }`.
  - `gen` : fonction qui fabrique une question à chaque appel (nombres aléatoires, conjugaison…).
  - `bank` : liste de questions écrites à la main, chacune avec un `id` stable et un `level` de 1 à 3.
  - `extra: true` : contenu hors programme actuel, proposé 4 fois moins souvent.
- **Question** : voir [CONTENU.md](CONTENU.md). Types (`kind`) : `qcm`, `input`, `tap`, `order`, `match`, `flash` (ancien type, plus utilisé).

## Modèle de données d'un profil

Stocké sous la clé `mathQuest_profiles` (liste de profils). Les champs absents sont ajoutés à la lecture (`ensureProfile`) : une ancienne sauvegarde reste utilisable.

| Champ | Contenu |
|---|---|
| `id`, `name`, `avatar`, `totalXP` | Identité et points cumulés |
| `mastery{skill}` | Score de maîtrise (+1 bonne réponse, −2 erreur, plancher −10) : pondère le tirage |
| `srs{questionId}` | `{ box, due, fail, last }` : répétition espacée des questions de banque |
| `recent{skill}`, `levels{skill}` | 10 derniers résultats ; niveau de difficulté débloqué (1 à 3) |
| `missed[]` | Questions générées ratées (instantané, 30 au plus) |
| `stats{subject}` | `{ ok, total }` par matière |
| `facets{skill}{facette}` | `{ ok, total }` des cas précis (un rang décimal, une table de multiplication, un verbe) |
| `skillStats{skill}` | `{ ok, total, last[20], ms }` : sert aux badges et aux cartes |
| `badges{skill}` | Palier obtenu : 1 Bronze, 2 Argent, 3 Or |
| `matches[]`, `matchStats` | Historique des matchs (60 au plus) et totaux victoires/nuls/défaites |
| `records` | Meilleur score, meilleure série, plus large victoire, plus longue série de jours |
| `season`, `seasons[]`, `pendingSeasonReview` | Saison en cours (semaine ISO, XP), historique, bilan à afficher |
| `daily{streak,last}` | Série de jours consécutifs |

Autres clés `localStorage` : `mathQuest_activeProfileId`, `sq_settings` (chrono, sons), `sq_session_<profil>` (séance à reprendre), `sq_sync` (jeton et file d'envoi), `sq_push_sub` (abonnement aux notifications), `sq_reminder_dismissed`.

## Déroulement d'une séance (`buildSession`)

1. **Mission du jour** (`daily`) : jusqu'à 4 questions de banque arrivées à échéance, jusqu'à 2 erreurs en attente, puis des questions tirées dans les compétences.
2. **Tirage des compétences** : on choisit d'abord une matière (un peu plus souvent les plus faibles), puis une compétence selon sa maîtrise (`10 − maîtrise`, bornée entre 1 et 20, divisée par 4 si `extra`).
3. **Cas précis** : avant chaque séance, `weakFacets` liste les facettes ratées (au moins 2 essais, moins de 60 % de réussite). Les générateurs concernés les proposent environ une fois sur deux.
4. **Questions de banque** : niveau limité au niveau débloqué ; les nouvelles questions sont préférées (70 %).
5. **Entraînement par matière** (`subject`) et **carnet d'erreurs** (`errors`) suivent le même principe, restreints.

## Enregistrement d'une réponse (`recordAnswer`)

- Met à jour maîtrise, 10 derniers résultats, statistiques de matière, cas précis (une réussite lente compte pour moitié) et `skillStats`.
- **Niveau supérieur** d'une compétence à banque : 8 bonnes réponses sur les 10 dernières.
- **Répétition espacée** (`srs`) : bonne réponse → boîte suivante et délai de 1, 3, 7, 14 ou 30 jours ; erreur → retour à la boîte 0, à revoir ; réussite **lente** (plus de 15 s en QCM, 30 s en saisie…) → revue le lendemain sans avancer.
- **Badges** : Bronze à 10 bonnes réponses et 70 % de réussite sur les 20 dernières, Argent à 30 et 80 %, Or à 60 et 90 % (au moins 10 résultats récents).

## Compétition (`progress.js`)

- **Match du jour** : chaque bonne réponse est un but pour l'élève, chaque erreur un but adverse. Bonus d'XP : victoire 150, nul 50. L'adversaire (nom fictif) est fixé par la date.
- **Saison** : une semaine ISO (lundi → dimanche). Ligues : Bronze 0, Argent 1 500, Or 3 500, Champion 6 000 XP. Au changement de semaine, la saison est archivée et un bilan s'affiche.
- **Records** : un record n'est annoncé que s'il bat une valeur existante.
- **Carte de joueur** : note de 60 à 99 selon le palier et la réussite récente ; statistiques PRÉ (précision), VIT (vitesse moyenne), EXP (expérience).

## Hors ligne et mises à jour

`sw.js` précharge les fichiers de l'application. Pour les requêtes, il interroge **d'abord le réseau** (sans cache HTTP) et ne retombe sur le cache que hors ligne. Une publication est donc visible à la prochaine ouverture avec du réseau.
La constante `VERSION` de `sw.js` doit être **changée à chaque publication** (elle déclenche le renouvellement du cache) ; le numéro est aussi affiché en bas de l'accueil.

## Suivi parent (`sync.js`)

- Connexion **anonyme** automatique (API REST d'identité), sans code ni compte.
- Chaque réponse ajoute un événement à une file locale (3 000 au plus). Envoi par lots de 100, toutes les 3 s après une réponse, au retour du réseau et à la mise en arrière-plan.
- Événement : prénom du profil, compétence, matière, identifiant de question, cas précis, juste ou faux, date, temps de réponse, et pour une erreur la question et les réponses.
- **Sauvegarde automatique** (`backup`) : un instantané des profils est enregistré dans `backups/<identifiant de l'installation>` après chaque mission, à l'ouverture et à la mise en arrière-plan (au plus toutes les 5 minutes, et seulement si la progression a changé). Le parent le télécharge depuis le tableau de bord ; l'élève le restaure avec « Restaurer ». Le bilan hebdomadaire en archive aussi une copie dans le dépôt privé.
- **Développement** : sur `localhost`, rien n'est envoyé (événements, sauvegarde, abonnement) afin que les essais ne polluent pas la base réelle ; `?sync=1` dans l'adresse force l'envoi.
- Le tableau de bord et les tâches planifiées sont décrits dans [DEPLOIEMENT.md](DEPLOIEMENT.md).

## Choix de conception

- **Sans framework ni build** : le dépôt se publie tel quel et reste lisible pour un projet familial.
- **Contenu séparé de la logique** : ajouter des questions ne demande pas de toucher à l'interface (voir [CONTENU.md](CONTENU.md)).
- **Données migrables** : `ensureProfile` complète toujours les profils anciens ; aucune clé de stockage n'a été renommée depuis la première version.
- **Aucune dépendance** à l'exécution : seuls les contrôles s'exécutent avec Node.

## Limites connues

- **Restauration non automatique** : la sauvegarde est automatique, mais après un effacement du téléphone rien ne permet d'identifier l'installation sans compte ni code ; le parent télécharge donc le fichier depuis le tableau de bord et l'élève le restaure à la main. Les sauvegardes d'anciennes installations restent listées (10 plus récentes).
- **Pas de test automatique dans un vrai navigateur** : l'interface a été vérifiée en émulation mobile, par un parcours scripté, pas par une suite de tests.
- **Appareil réel** : l'appli n'a pas été éprouvée sur de nombreux modèles de téléphone ; les notifications dépendent des réglages d'économie de batterie du constructeur.
- **Accessibilité** : annonces `aria-live`, boutons larges et contrastes renforcés, mais aucun audit complet (lecteur d'écran, navigation clavier).
- **Fichier `main.js` volumineux** : il regroupe l'interface ; à découper si le projet grossit (écrans, collection, réglages).
- **Répétition espacée** : elle porte sur les questions de banque. Les questions générées s'appuient sur la maîtrise par compétence et sur les cas précis.
- **Règles Firestore** : contrôlées par un script de refus contre la base réelle (`check-rules.mjs`), sans test automatique des écritures autorisées ni émulateur.
- **Type `flash`** : le rendu existe encore mais aucun contenu ne l'utilise.
