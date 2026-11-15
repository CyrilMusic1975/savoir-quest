# Classement des joueurs — plan de réalisation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un classement commun (Semaine / Total) où tout joueur de l'appli apparaît automatiquement avec un pseudo choisi une fois.

**Architecture:** Un module pur `js/classement.js` (pseudo, tri, rang, écart) testé par Node ; `js/sync.js` écrit le score du joueur dans une collection Firestore `scores` et lit le top 50 par REST ; l'écran est ajouté dans `main.js`/`index.html`. Les règles Firestore, l'index et la modération parent vivent dans `~/Desktop/SavoirQuest-suivi`.

**Tech Stack:** JavaScript pur (modules ES), Firestore REST, tests Node (`npm test`).

**Spec:** `docs/superpowers/specs/2026-11-15-classement-joueurs-design.md`

## Global Constraints

- Tout texte visible est en français soigné ; pas de dépendance, pas de framework, pas de logique dans `index.html`.
- Aucune clé `localStorage` existante renommée ; nouveau champ de profil uniquement via `ensureProfile` (`js/state.js`) ; nouvelle clé autorisée : `sq_board` (cache du classement).
- Ne jamais envoyer le vrai nom (`profile.name`), ni réponses, erreurs ou matières : seulement `pseudo`, `avatar`, `weekId`, `weekXP`, `totalXP`, `ts`.
- Sur `localhost`, `js/sync.js` n'envoie rien (sauf `?sync=1`). Après tout essai d'envoi réel, **supprimer les données d'essai** de Firestore (`scores`, `bans`), après avoir vérifié qu'aucun vrai profil n'y figure.
- Toute erreur réseau est ignorée : le jeu n'est jamais bloqué.
- Tout nouveau fichier JS est ajouté à `FILES` dans `sw.js`. Publication : `VERSION` 26 dans `sw.js` **et** numéro dans `index.html`, `CHANGELOG.md`, `npm test` vert, puis `curl -s <url>/sw.js | grep VERSION`.
- Les règles Firestore et l'index doivent être déployés **avant** la publication de l'appli (`--project savoir-quest-suivi`). Déployer les règles et publier sont des actions sortantes : demander l'accord de l'utilisateur au moment voulu.

## Review Focus

- Pseudo contournant le filtre (« m3rde », majuscules, accents, espaces multiples, émojis) : refusé ou nettoyé de façon prévisible.
- Lundi : le classement Semaine est vide → message amical, pas d'écran cassé.
- Premier lancement hors ligne, ou erreur réseau : dernier classement en cache, sinon message « Classement indisponible pour l'instant », jeu intact.
- Le joueur sort du top 50 : sa ligne reste affichée en bas avec son rang inconnu (« 50+ »).
- Égalités de points : même rang, et le joueur reste identifiable par son identifiant de document, pas par son pseudo (deux joueurs peuvent avoir le même pseudo).
- Un joueur retiré par le parent ne réapparaît pas à sa mission suivante (liste `bans`).
- Restauration d'une ancienne sauvegarde : XP total plus bas que celui déjà publié → l'envoi n'est pas bloqué par les règles.

---

### Task 1: Module pur `classement.js` et champ `board`

**Files:**
- Create: `js/classement.js`, `tests/classement.test.mjs`
- Modify: `js/state.js` (`ensureProfile`), `tests/run.mjs`

**Interfaces:**
- Produces (`js/classement.js`):
  - `PSEUDO_MIN = 2`, `PSEUDO_MAX = 16`, `TOP = 50`
  - `cleanPseudo(raw: string) -> { ok: boolean, pseudo: string, reason?: string }` : trim, espaces multiples réduits, 2 à 16 caractères, lettres/chiffres/espace/tiret/apostrophe/émoji simples, refus des mots de `BAD_WORDS` après normalisation (minuscules, sans accents, `0→o 1→i 3→e 4→a 5→s 7→t @→a $→s`, séparateurs retirés).
  - `suggestPseudos(seed: number) -> string[]` (4 pseudos amusants, déterministe selon `seed`).
  - `scoreOf(profile, week: string) -> { weekId, weekXP, totalXP }` : `weekXP` = `profile.season.xp` si `profile.season?.week === week`, sinon 0.
  - `docId(uid: string, profileId: string) -> string` = `${uid}_${profileId}` (identifiant de document).
  - `rankRows(rows: {id, pseudo, avatar, weekXP, totalXP}[], tab: 'week'|'total', meId: string) -> { list: (row & {rank:number, me:boolean})[], me: {rank:number|null, gap:number|null, row} | null }` : tri décroissant sur la clé de l'onglet, rang de compétition (égalités = même rang), `gap` = points manquants pour égaler le joueur juste devant (`null` si premier), `rank: null` si `meId` absent de `rows` (hors top).
  - `boardQuery(tab, week) -> object` : corps `structuredQuery` Firestore (collection `scores` ; onglet `week` : filtre `weekId == week`, tri `weekXP` desc ; onglet `total` : tri `totalXP` desc ; `limit: TOP`).
- Produces (`state.js`) : `ensureProfile` ajoute `p.board = p.board || { pseudo: null }`.

- [ ] **Step 1: Écrire les tests dans `tests/classement.test.mjs`** (même style que `championnat.test.mjs` : `export function run(fail)`, helper `eq`), à enregistrer dans `tests/run.mjs` sous le nom « classement ». Assertions :
  - `cleanPseudo('  Léo   le  Fort ')` → `ok`, pseudo `'Léo le Fort'` ; `'a'` et `'x'.repeat(17)` → `ok:false` ; `'M3rde'`, `'M E R D E'` → `ok:false` (mot de `BAD_WORDS` choisi par le constructeur, au moins une dizaine de mots courants) ; `''` → `ok:false`.
  - `suggestPseudos(1)` : 4 éléments distincts, tous acceptés par `cleanPseudo` ; deux graines différentes donnent des listes différentes.
  - `scoreOf` : saison de la semaine courante → `weekXP = season.xp` ; saison d'une autre semaine ou absente → `weekXP = 0`.
  - `rankRows` recalculé indépendamment : jeu de 6 lignes avec égalités (ex. 300, 300, 250, 100, 100, 0) → rangs 1,1,3,4,4,6 ; `gap` du joueur au rang 3 = 50 ; le premier a `gap: null` ; `meId` absent → `me.rank === null` ; deux lignes de même pseudo restent distinguées par `id`.
  - `boardQuery('week','2026-S47')` contient le filtre `weekId` et `limit` 50 ; `boardQuery('total', …)` n'en contient pas.
  - `ensureProfile({})` → `board.pseudo === null` ; un profil avec `board.pseudo = 'Zed'` est conservé.
- [ ] **Step 2:** Lancer `npm test` ; attendu : échec (module absent).
- [ ] **Step 3:** Implémenter `js/classement.js` selon les signatures ci-dessus et le champ `board` dans `ensureProfile`.
- [ ] **Step 4:** `npm test` ; attendu : tout passe. Casser volontairement le tri (inverser la comparaison) et vérifier que `classement` échoue, puis rétablir.
- [ ] **Step 5:** Commit : `git add js/classement.js js/state.js tests && git commit -m "Classement : calculs purs, pseudo et tests"`

### Task 2: Règles Firestore, index et vérification (dépôt `SavoirQuest-suivi`)

**Files:** (dans `~/Desktop/SavoirQuest-suivi`)
- Modify: `firestore.rules`, `firestore.indexes.json`, `check-rules.mjs`

**Interfaces:**
- Produces : collection `scores/{sid}` et collection `bans/{sid}`.
  - `scores` lecture : `request.auth != null`. Écriture (create/update) : `request.auth != null`, `sid.matches(request.auth.uid + '_.*')`, `!exists(/databases/$(database)/documents/bans/$(sid))`, `keys().hasOnly(['pseudo','avatar','weekId','weekXP','totalXP','ts'])`, `pseudo` string 2–16, `avatar` string ≤ 8, `weekId` string qui respecte `^[0-9]{4}-S[0-9]{2}$`, `weekXP` entier 0–20000, `totalXP` entier 0–1000000, `ts` nombre. À la mise à jour, hausse de `weekXP` et de `totalXP` ≤ 5000 par écriture (pas de contrainte de baisse). Suppression : parent seulement.
  - `bans` : lecture/écriture/suppression parent seulement (la règle `scores` lit son existence, ce qui est permis par `exists`).
  - Index composite `scores` : `weekId` ASC + `weekXP` DESC.

- [ ] **Step 1:** Ajouter dans `check-rules.mjs` les contrôles de refus (même forme que les existants, attendu 403) : écrire `scores/<autre-uid>_x` ; champ inconnu ; `weekXP` de 99999 ; `pseudo` d'un caractère ; `weekId` mal formé ; supprimer un score. Contrôle d'autorisation : **lire** `scores?pageSize=1` doit renvoyer 200. Le contrôle existant « lire une autre collection » reste inchangé (collection `families`).
- [ ] **Step 2:** Lancer `node check-rules.mjs` ; attendu : les nouveaux refus échouent (règles pas encore écrites).
- [ ] **Step 3:** Écrire les règles et l'index.
- [ ] **Step 4:** Valider avec l'outil `firebase_validate_security_rules` (ou `firebase deploy --only firestore:rules --project savoir-quest-suivi --dry-run` si disponible).
- [ ] **Step 5 (accord de l'utilisateur requis) :** `firebase deploy --only firestore:rules,firestore:indexes --project savoir-quest-suivi`, attendre la fin de la construction de l'index, puis `node check-rules.mjs` ; attendu : tout au vert.
- [ ] **Step 6:** Commit dans ce dépôt : `git commit -am "Règles : classement des joueurs (scores, bans)"`.

### Task 3: Envoi et lecture dans `sync.js`

**Files:**
- Modify: `js/sync.js`
- Test: `tests/classement.test.mjs` (partie pure uniquement ; le réseau se vérifie en Task 6)

**Interfaces:**
- Consumes: `docId`, `scoreOf`, `boardQuery`, `cleanPseudo` de `js/classement.js` ; `token()`, `putDoc`-style PATCH existants ; `state.uid`.
- Produces (exports de `sync.js`) :
  - `pushScore(profile: object, week: string) -> Promise<boolean>` : ne fait rien si `profile.board.pseudo` est vide ; PATCH `scores/${docId(uid, profile.id)}` avec `pseudo`, `avatar`, `weekId`, `weekXP`, `totalXP`, `ts` ; anti-rebond de 30 s sauf `force`; un refus 403 (retiré par le parent) est ignoré sans réessai en boucle.
  - `fetchBoard(tab: 'week'|'total', week: string) -> Promise<{ rows: {id,pseudo,avatar,weekXP,totalXP}[], fromCache: boolean } | null>` : POST `${DOCS}:runQuery` avec `boardQuery` ; convertit les champs Firestore en lignes (`id` = dernier segment du nom du document) ; met le résultat en cache sous la clé `sq_board` (par onglet) ; en cas d'échec renvoie le cache avec `fromCache: true`, ou `null` s'il n'y en a pas. Respecte `DEV` : sur `localhost`, ne contacte rien et renvoie le cache ou `null`.
  - `myDocId(profile) -> string | null` (`null` tant que `state.uid` est inconnu).

- [ ] **Step 1:** Ajouter à `tests/classement.test.mjs` un test de la fonction pure de conversion extraite dans `classement.js` : `fromFirestoreRows(response: object[]) -> row[]` (ignore les éléments sans `document`, lit `stringValue`/`integerValue`). Assertions sur un exemple réaliste de réponse `runQuery`, dont un élément `{readTime}` sans document.
- [ ] **Step 2:** `npm test` ; attendu : échec. Implémenter `fromFirestoreRows` ; attendu : succès.
- [ ] **Step 3:** Implémenter `pushScore`, `fetchBoard`, `myDocId` dans `sync.js` en réutilisant `token()` et la gestion du 401 existante.
- [ ] **Step 4:** `npm test` vert ; commit : `git add js tests && git commit -m "Classement : envoi et lecture du score"`.

### Task 4: Écran Classement, pseudo et réglages

**Files:**
- Modify: `index.html` (structure seulement), `js/main.js`, `style.css`, `sw.js` (`FILES` : `js/classement.js`)
- Test: vérification manuelle ci-dessous

**Interfaces:**
- Consumes: `rankRows`, `cleanPseudo`, `suggestPseudos`, `scoreOf` ; `Sync.pushScore`, `Sync.fetchBoard`, `Sync.myDocId`.
- Produces : carte « Classement » sur l'accueil (même pattern que `champ-card`, écran `board` avec bouton retour) ; deux onglets *Semaine* / *Total* ; liste du top 50 avec rang, avatar, pseudo, points, ligne du joueur mise en évidence ; sous la liste « Il te manque N points pour dépasser <pseudo> » (ou « Tu es en tête ! ») ; ligne du joueur en bas avec « 50+ » s'il est hors top ; messages : liste vide de la semaine (« Personne n'a encore joué cette semaine. Sois le premier ! »), indisponible (« Classement indisponible pour l'instant. »), mention « (hors ligne) » si `fromCache`.
- Fenêtre de pseudo à l'affichage de l'accueil quand `profile.board.pseudo` est vide : champ prérempli avec la première suggestion, puces cliquables pour les trois autres, bouton OK ; si `cleanPseudo` refuse, afficher la raison en français sans fermer. Un champ « Pseudo du classement » dans les réglages permet de le changer (même validation).
- `pushScore(profile, S.weekId(), force)` est appelé : en fin de mission (`endGame`, à côté de `Sync.backup(..., true)`, après `addSeasonXP`), après choix ou changement de pseudo, et à l'ouverture de l'écran classement.

- [ ] **Step 1:** Ajouter l'écran, la carte et la fenêtre dans `index.html` (structure uniquement, comme `champ`) ; styles dans `style.css`.
- [ ] **Step 2:** Brancher dans `main.js` : `renderBoard(tab)`, ouverture/fermeture, fenêtre de pseudo, réglage, appels à `pushScore`. Textes visibles en français.
- [ ] **Step 3:** Ajouter `js/classement.js` à `FILES` de `sw.js`.
- [ ] **Step 4:** Vérification manuelle avec `python3 -m http.server 8123` et `?sync=1` : (a) premier affichage → fenêtre de pseudo, OK d'un seul geste ; (b) écran classement, deux onglets ; (c) couper le réseau → message ou cache ; (d) lundi simulé (semaine vide) → message ; (e) profil sans pseudo n'apparaît nulle part. **Supprimer ensuite les documents d'essai** de `scores` dans Firestore.
- [ ] **Step 5:** `npm test` ; commit : `git add -A && git commit -m "Classement : écran, pseudo et réglage"` (sans `_source/`).

### Task 5: Modération dans le tableau de bord parent

**Files:** (dans `~/Desktop/SavoirQuest-suivi`)
- Modify: `dashboard.template.html` (puis `build.py` pour régénérer `public/index.html`)

**Interfaces:**
- Consumes: règles de la Task 2 (`scores` suppression et `bans` écriture : parent seulement).
- Produces : carte « Classement » listant `scores` (pseudo, semaine, total, dernière activité) avec un bouton « Retirer » qui écrit `bans/<sid>` puis supprime `scores/<sid>`, et un bouton « Réautoriser » qui supprime le `ban` (liste des bannis visible).

- [ ] **Step 1:** Ajouter la carte, sur le modèle de « Sauvegardes automatiques » (`getDocs`, `setDoc`, `deleteDoc` importés depuis le SDK déjà chargé).
- [ ] **Step 2:** `python3 build.py`, ouvrir le tableau de bord connecté en parent, retirer puis réautoriser un joueur d'essai ; vérifier que l'appli (avec `?sync=1`) ne le republie pas après le retrait. Supprimer les données d'essai.
- [ ] **Step 3 (accord de l'utilisateur requis) :** déployer l'hébergement (`./deploy.sh`) ; commit dans ce dépôt.

### Task 6: Documentation, version, vérification et publication

**Files:**
- Modify: `sw.js` (`VERSION = 'sq-v26'`), `index.html` (numéro affiché), `CHANGELOG.md`, `README.md`, `docs/ARCHITECTURE.md` (module `classement.js`, collection `scores`/`bans`, champ `board`, clé `sq_board`), `CLAUDE.md` (piège : « Le classement commun lit `scores` ; les règles `scores`/`bans` sont dans SavoirQuest-suivi »)

- [ ] **Step 1:** Mettre à jour les fichiers ci-dessus ; décrire dans la documentation la confidentialité (pseudo, avatar, points seulement).
- [ ] **Step 2:** `npm test` ; attendu : « Tous les contrôles sont passés. »
- [ ] **Step 3:** Contrôle de bout en bout sur la base réelle avec `?sync=1` : deux profils d'essai envoient un score, le classement les liste dans le bon ordre, retrait par le parent, puis **suppression des données d'essai** (`scores`, `bans`).
- [ ] **Step 4 (accord de l'utilisateur requis, règles déjà déployées) :** `git push origin main`, puis `curl -s <url>/sw.js | grep VERSION` ; attendu : `sq-v26`.
