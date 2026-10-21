# Contrôles automatiques

```bash
npm test               # tous les contrôles (quelques secondes, sans dépendance)
SHOW=30 npm test       # afficher davantage de problèmes en cas d'échec
```

Ils se lancent aussi automatiquement à **chaque publication** sur la branche `main` et à chaque demande de fusion (`.github/workflows/test.yml`). Un échec n'empêche pas la mise en ligne (GitHub Pages publie en parallèle) mais envoie un e-mail : il faut alors corriger vite.

## Ce qui est vérifié

| Fichier | Vérifie |
|---|---|
| `content.test.mjs` | Cohérence de **toutes les questions de banque** : identifiants uniques, énoncé et explication présents, niveau valide, bonne réponse présente dans les options, pas d'options en double, éléments à ordonner et paires d'association distincts, indices de mots valides |
| `generators.test.mjs` | Générateurs de maths d'origine : quatre réponses distinctes et justes, pas de nombres égaux ou de fractions équivalentes dans les choix, calcul exact (priorités, division euclidienne, pourcentages, durées…) |
| `generators6e.test.mjs` | Décimaux, géométrie, histoire et anglais : **chaque réponse est recalculée de façon indépendante** (zéros facultatifs, partie entière, construction d'un nombre, fractions décimales, appartenance ∈/∉, nombre de noms d'une droite, chiffres romains, siècles, frise, nombres et ordinaux anglais) |
| `conjugaison.test.mjs` | Environ 250 formes verbales écrites à la main, comparées au moteur ; puis les questions générées : élision, accord avec être, absence d'ambiguïté sur le temps ou l'infinitif demandé |
| `engine.test.mjs` | 300 missions simulées : 10 questions valides, toutes les matières proposées, séances par matière, badges attribués, une réussite lente n'avance pas la répétition espacée, une erreur est marquée « à revoir » |
| `progress.test.mjs` | Ligues, semaines ISO (dont le passage d'année), archivage de saison, match, records (le premier record est silencieux), notes des cartes |

## Principe

Un test ne doit pas recopier le code qu'il vérifie : les références (formes verbales, ordinaux anglais, chiffres romains, semaines) sont écrites à la main, et les réponses générées sont recalculées par une méthode différente. Ces contrôles ont déjà détecté de vrais défauts (résultats négatifs en priorités opératoires, QCM n'ayant que deux mauvaises réponses possibles, réponses numériques ambiguës).

## Ajouter un contrôle

- **Nouvelle banque** : rien à faire, `content.test.mjs` la couvre.
- **Nouveau générateur** : ajouter un recalcul indépendant dans le fichier de test le plus proche (ou en créer un), puis l'enregistrer dans `tests/run.mjs`. Chaque fichier exporte `run(fail)` et retourne un résumé.
- Après avoir écrit un test, **vérifier qu'il échoue** en introduisant volontairement une erreur, puis la retirer.

## Ce qui n'est pas couvert

- L'interface dans un vrai navigateur (pas de test de bout en bout).
- Les règles de sécurité Firestore : elles sont contrôlées par `check-rules.mjs` (dossier du suivi parent), qui vérifie 11 refus contre la base réelle, mais pas par l'émulateur ni dans la suite `npm test`.
- Le service worker, les notifications et la synchronisation hors ligne.
- L'accessibilité (aucun outil d'audit automatisé).
