# Ajouter du contenu

Tout le contenu pédagogique est dans `js/content/`. On n'a **jamais besoin de modifier l'interface** pour ajouter des questions, une compétence ou une matière.

## Deux façons de fournir des questions

| | Banque (`bank`) | Générateur (`gen`) |
|---|---|---|
| Principe | Questions écrites à la main | Une fonction fabrique une question à chaque appel |
| Idéal pour | Cours, définitions, vrai/faux, associations, ordres | Calculs, conjugaison, orthographe de nombres, figures |
| Identifiant | Obligatoire, stable (`id`) | Aucun (la compétence sert de clé) |
| Répétition espacée | Oui (par `id`) | Non (maîtrise par compétence et cas précis) |
| Niveaux 1 à 3 | Oui (`level`) | Non |

Une compétence est **soit** une banque, **soit** un générateur, jamais les deux.

## Définir une compétence

Dans le fichier de la matière (par exemple `js/content/sciences6e.js`) :

```js
export const maSerie = [
  { id: 'sv_cles', subject: 'svt', label: 'Clés de détermination', bank: cles },
  { id: 'dec_zeros', subject: 'maths', label: 'Zéros facultatifs', gen: generateOptionalZerosQuestion }
];
```

Puis l'exporter et l'ajouter à `SKILLS` dans `js/content/index.js`.

- `id` : **ne jamais le changer** ensuite. C'est la clé de la maîtrise, des badges et du suivi.
- `label` : le nom affiché (collection, titre pendant la mission, tableau de bord).
- `extra: true` : contenu hors du programme actuel de l'élève ; il est proposé 4 fois moins souvent. La liste `EXTRA` de `index.js` fait la même chose pour des compétences déjà écrites.

## Écrire une banque de questions

Les constructeurs sont dans `js/content/helpers.js`.

| Constructeur | Usage | Exemple |
|---|---|---|
| `qcm(id, texte, bonne, [mauvaises], explication, niveau)` | Choix multiple | `qcm('pc_p06', 'Quel métal est attiré par un aimant ?', 'le fer', ['l\'aluminium', 'l\'or', 'le cuivre'], 'Seul le fer…')` |
| `tf(id, affirmation, vrai, explication, niveau)` | Vrai ou faux | `tf('dec_d03', '5 et 5,0 sont le même nombre.', true, '…')` |
| `fill(id, phrase, réponse, options, explication, niveau)` | Phrase à compléter | `fill('fr_h101', 'Il ___ faim.', 'a', ['a', 'à'], '…')` |
| `input(id, texte, réponse, explication, acceptées, niveau, numérique)` | Réponse saisie | `input('en_c01', '« se taire » en anglais ?', 'Be quiet', '…', ['be quiet!'])` |
| `order(id, texte, [éléments dans le bon ordre], explication, niveau)` | Remettre dans l'ordre | `order('sv_d01', 'Les étapes…', ['Observation', 'Problème'], '…')` |
| `match(id, texte, [[gauche, droite], …], explication, niveau)` | Associer | `match('geo_c09', 'Associe…', [['Une droite', '…'], …], '…')` |
| `tap(id, texte, phrase, [indices des mots], explication, niveau)` | Toucher les bons mots | `tap('fr_t01', 'Touche le verbe.', 'Les enfants jouent.', [2], '…')` |

### Règles à respecter

1. **Identifiant unique et stable.** Le test de contenu refuse les doublons. Ne réutilise jamais un identifiant pour une autre question : la répétition espacée s'en servirait à tort.
2. **Une explication obligatoire** : elle s'affiche après une erreur, c'est là que l'élève apprend.
3. **QCM** : la bonne réponse ne doit pas figurer deux fois ; prévois 3 mauvaises réponses **plausibles**. Le mieux est de reprendre de vraies erreurs de l'élève (voir ci-dessous).
4. **Association** : les éléments de chaque colonne doivent être tous différents.
5. **Remise en ordre** : tous les éléments doivent être différents ; l'ordre donné est le bon ordre.
6. **Niveau** : 1 par défaut ; 2 et 3 pour les questions plus difficiles. Un niveau supérieur se débloque à 8 bonnes réponses sur 10.
7. **Texte** : français soigné, apostrophes droites ou typographiques, guillemets « … ». Pas de nom d'élève ni de donnée personnelle.

### Comment une saisie est corrigée

La réponse saisie est comparée sans tenir compte des majuscules, des espaces en trop et du type d'apostrophe. Pour les nombres (`numérique`), `0,5`, `0.5` et `0,50` sont équivalents. Les **accents comptent** ; ajoute les variantes acceptées dans la liste `acceptées`.

## Écrire un générateur

Un générateur retourne un objet question **sans `id`** :

```js
export function generateEuclideanQuestion() {
  const a = randInt(20, 99), b = randInt(3, 9);
  return {
    kind: 'input', numeric: true,
    text: `Division euclidienne de ${a} par ${b} : quel est le reste ?`,
    answer: String(a % b), accept: [String(a % b)],
    explanation: `${a} = ${b} × ${Math.floor(a / b)} + ${a % b}.`,
    facet: 'reste'            // facultatif : cas précis suivi dans le bilan
  };
}
```

Champs d'une question (tous types) : `kind`, `text`, `explanation`, et selon le type `options` + `answer` (QCM), `accept` + `numeric` (saisie), `items` (ordre), `pairs` (association), `tokens` + `answerIdx` (toucher les mots). Facultatifs : `visual`, `facet`, `fixedOrder` (ne pas mélanger les options).

- **QCM généré** : mélange les options toi-même et garantis qu'elles sont distinctes ; la fonction `mc(...)` présente dans plusieurs fichiers le fait.
- **Cas précis (`facet`)** : un libellé court (« millièmes », « 7×8 », « aller »). Il apparaît dans le bilan. Un générateur peut aussi *cibler* les cas ratés avec `weakFacet('id_de_la_compétence')`, comme la conjugaison.
- **Figures** : `visual: { type: 'geo', points: [...], obj: { type, from, to }, off }` pour les droites, demi-droites et segments ; `fraction`, `graduated`, `conversion-table`, `text-display` existent aussi (voir `render.js`).

## Ajouter une matière

1. Ajouter l'objet dans `SUBJECTS` (`js/content/index.js`) : `{ id, label, emoji }`.
2. Ajouter son poste d'équipe dans `POSITIONS` de `js/progress.js` (abréviation de 3 lettres affichée sur les cartes).
3. Créer le fichier de contenu, l'exporter et l'ajouter à `SKILLS`.
4. Lancer `npm test`.

## À partir de cours et de contrôles d'élève

Le processus suivi pour les cours déposés :

1. Déposer les PDF ou photos dans `_source/cours/<matière>/` (dossier **jamais publié**).
2. Lire les pages, relever **les chapitres** et **les erreurs** (réponses fausses de l'élève, corrections du professeur).
3. Écrire des questions **reformulées**, pas recopiées : le dépôt est public.
4. Construire les mauvaises réponses à partir des vraies confusions (ex. « dizaines » pour « dixièmes »).
5. Compléter `_source/cours/NOTES-lecture.md` (résumé local des chapitres et erreurs).
6. Lancer `npm test`, vérifier à l'écran, publier (voir [DEPLOIEMENT.md](DEPLOIEMENT.md)).

## Liste de contrôle avant publication

- [ ] `npm test` est au vert
- [ ] Les questions nouvelles ont été relues pour l'exactitude du fond (date, orthographe, règle)
- [ ] Les identifiants sont nouveaux et stables
- [ ] Aucun nom d'élève ni document de cours dans les fichiers
- [ ] `VERSION` de `sw.js` et le numéro affiché dans `index.html` ont été incrémentés
- [ ] `CHANGELOG.md` est à jour
