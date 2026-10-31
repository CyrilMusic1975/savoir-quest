# Journal des versions

Le numéro (`sq-vN`) est celui du service worker et de l'écran d'accueil.

## v23 — Seconde chance avec un coup de pouce de Kiko
- Quand l'élève se trompe sur une question qui a un coup de pouce (champ `hint`), la bonne réponse n'est pas révélée : Kiko donne une piste, l'option ratée est écartée et l'élève réessaie une fois.
- Second essai juste : un but pour l'élève et 50 points (ni série ni badge). Second essai raté : but adverse et explication complète, comme avant.
- La première erreur reste enregistrée dans le suivi, les erreurs à revoir et le bilan du lundi ; le second essai n'est pas envoyé (aucun nouveau champ Firebase).
- Les coups de pouce sont écrits pour les questions à 3 options ou plus sur les décimaux (`dec_d01`, `d02`, `d09` à `d13`). Les vrai/faux, les remises en ordre et les associations n'ont pas de seconde chance.
- Nouveaux contrôles : un coup de pouce doit faire 15 à 160 caractères, ne pas contenir la réponse et être utilisable (saisie ou au moins 3 options) ; règle de seconde chance testée.

## v22 — Championnat à 10 équipes
- Chaque mission est désormais un match de championnat : 10 équipes (Kiko FC et 9 équipes fictives), 18 journées aller-retour, victoire 3 points, nul 1. Plus de « mission du jour » seule : toutes les missions comptent.
- La place de l'équipe est bien visible : grande carte « 8e sur 10 » sur l'accueil (avec le podium), classement complet en fin de mission avec la ligne de Kiko FC en évidence et la flèche de progression, écran dédié avec l'historique des saisons.
- À la 18e journée : fin de saison (champion ou non), puis nouvelle saison avec d'autres équipes.
- Le match affiche l'adversaire de la journée et le numéro de journée ; le bonus d'XP du match s'applique à toutes les missions. La saison hebdomadaire (Bronze → Champion) est conservée.
- Nouveau contrôle : calendrier (chaque rencontre deux fois, une fois à domicile) et classement recalculés de façon indépendante ; vérifié en cassant volontairement le calcul des points.

## v21 — Kiko, la mascotte
- Kiko (personnage en pixels avec un ballon, image `img/kiko.png`) accompagne l'élève pendant les missions : une bulle l'accueille, l'encourage après une bonne réponse (plus fort en série), lui donne un conseil pour réfléchir à chaque question, et le rassure après une erreur. Il saute de joie ou penche la tête.
- L'encadré d'explication s'appelle désormais « Kiko t'explique ». Réglage « Kiko, la mascotte » pour le masquer.
- Phrases dans `js/kiko.js` (choix pur et testé, sans hasard) ; nouveau contrôle `tests/kiko.test.mjs`.
- Décimaux : « s'arrête » (ambigu pour un enfant) remplacé par « a une fin » / « continue sans fin » dans `dec_d01`, `d02`, `d09` à `d13`. Nouveau contrôle qui refuse l'ancienne formulation.
- Pas encore fait : seconde chance après un rappel, expressions dessinées différentes.

## v20 — Question sur l'association « décimal » / « nombre à virgule »
- Nouvelle question `dec_d13` : repérer le nombre décimal qui n'est pas entier parmi 7,0 (égal à un entier), 4,333… (ne s'arrête pas), 12 et 4,25. Elle montre si l'élève confond « décimal » et « écrit avec une virgule ».
- Nouveau contrôle : la bonne réponse est recalculée de façon indépendante (écriture qui s'arrête, partie décimale non nulle).

## v19 — Aide visuelle pour les soustractions de décimaux
- Sur chaque soustraction de décimaux, des cases (0,40 ; 0,05 ; 0,10…) s'affichent d'emblée : en les touchant, l'élève retire le nombre par morceaux et voit le total évoluer. Il saisit lui-même la réponse.
- Nouveau contrôle : l'aide est recalculée de façon indépendante (départ, nombre à retirer, cases suffisantes).
- Test de saison rendu indépendant de la date du jour (`addSeasonXP` accepte une semaine en paramètre).

## v18 — Sauvegarde automatique de la progression
- La progression est sauvegardée automatiquement dans Firebase (collection `backups`, un document par installation) après chaque mission, à l'ouverture et à la mise en arrière-plan.
- Tableau de bord : section « Sauvegardes automatiques » avec téléchargement du fichier, restaurable par le bouton « Restaurer » de l'application.
- Le bilan hebdomadaire archive une copie de la dernière sauvegarde dans le dépôt privé.
- Règles Firestore : une installation ne peut écrire que sa propre sauvegarde ; `check-rules.mjs` vérifie désormais 15 refus.
- Sur `localhost`, l'application n'envoie plus rien (`?sync=1` pour forcer) afin que les essais ne polluent pas la base.

## v17 — Précision sur le point géométrique
- L'affirmation « un point est infiniment petit » précise qu'on parle du point géométrique ; l'explication distingue le point (idée) de sa représentation (croix, point de crayon).

## v16 — Astuce ORANGE
- Les questions sur l'est et l'ouest expliquent l'astuce du mot ORANGE ; deux questions directes ajoutées.

## v15 — Conjugaison
- Onze exercices générés : présent, imparfait, futur, passé composé, impératif, passé simple, plus-que-parfait, reconnaissance du temps, retrouver l'infinitif, infinitif en -er ou participe en -é, accord avec être.
- 37 verbes ; ciblage automatique des verbes ratés ; contrôles sur une table de formes écrites à la main.

## v14 — Contenus d'après les cours déposés
- Nouvelle matière : anglais (nombres, ordinaux, salutations, classroom English, jours et mois, couleurs, Halloween).
- Maths : géométrie (notations, appartenance, noms d'une droite) et décimaux (zéros facultatifs, partie entière, fractions décimales, construction d'un nombre) avec figures SVG.
- Physique-chimie, SVT, histoire-géographie : contenus propres aux chapitres vus (matière, propriétés, recyclage du verre, écosystème, clés de détermination, sources, CANDI, repères spatiaux, frise, chiffres romains, siècles).
- Le contenu hors programme actuel est proposé 4 fois moins souvent.
- Contrôles recalculant indépendamment 19 500 questions.

## v13 — Compétition
- Match du jour, saison hebdomadaire (Bronze → Champion), records, cartes de joueur par compétence, collection.

## v12 — Rappel quotidien
- Notification web push à 17 h 30 si le profil n'a pas joué (tâche planifiée sans serveur payant).

## v11 — Badges, temps de réponse, contrôles automatiques
- Badges par compétence ; temps de réponse mesuré (réussites lentes signalées) ; suite de contrôles `npm test` exécutée à chaque publication.

## v10 → v9 — Mots à retenir
- Les cartes à auto-évaluer deviennent des questions corrigées (choix entre deux définitions).

## v8 — Suivi parent automatique
- Plus de code d'association : envoi automatique des résultats ; tableau de bord web ; bilan en Markdown ; bilan hebdomadaire planifié.

## v7 — Suivi parent (première version avec code)
- Projet Firebase dédié, règles de sécurité, adaptation par cas précis.

## v6 — Missions et nouveaux exercices
- Mission du jour, choix de la matière, carnet d'erreurs, répétition espacée, niveaux, reprise de séance.
- Types d'exercices : saisie, toucher les mots, remise en ordre, association.
- Contenu de départ : français, SVT, physique-chimie, histoire-géographie.

## v5 → v2 — Corrections d'affichage
- Contraste des cases de fraction, repère de la droite graduée, mise à jour fiable du cache.

## v1 — Version mobile (PWA)
- Adaptation au téléphone, installation sur l'écran d'accueil, fonctionnement hors ligne.
- Corrections : mauvaises réponses plausibles, comparaisons sans ex æquo, fractions non équivalentes, message de réussite.
- Sauvegarde et restauration de la progression ; images allégées ; police système.

## Version d'origine
- Jeu de révision (décimaux, fractions, multiplications, conversions, grammaire) créé avec Antigravity, conservé et étendu.
