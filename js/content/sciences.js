import { qcm, tf, order, match, input, flash } from './helpers.js';

// Contenu de départ rédigé d'après le programme de 6e : à ajuster avec les leçons réelles.

const vivant = [
    tf('svt_v01', 'Une pierre est un être vivant.', false, 'Un être vivant naît, se nourrit, grandit, se reproduit et meurt. Une pierre ne fait rien de tout cela.'),
    qcm('svt_v02', 'Quel animal est un mammifère ?', 'le dauphin', ['le requin', 'l\'aigle', 'la grenouille'], 'Le dauphin respire avec des poumons et allaite ses petits : c\'est un mammifère, pas un poisson.'),
    qcm('svt_v03', 'Quel groupe d\'animaux a le corps couvert de plumes ?', 'les oiseaux', ['les mammifères', 'les reptiles', 'les poissons'], 'Les oiseaux ont des plumes, un bec et pondent des œufs.'),
    qcm('svt_v04', 'Une grenouille est…', 'un amphibien', ['un reptile', 'un poisson', 'un mammifère'], 'Les amphibiens ont la peau nue et humide et vivent dans l\'eau (jeune) puis sur terre et dans l\'eau.'),
    qcm('svt_v05', 'Quelle est la particularité d\'un reptile ?', 'sa peau est couverte d\'écailles', ['son corps est couvert de plumes', 'il a des poils', 'il a une peau nue et humide'], 'Le serpent, le lézard et la tortue sont des reptiles : leur peau est couverte d\'écailles.', 2),
    qcm('svt_v06', 'Les animaux sans colonne vertébrale sont les…', 'invertébrés', ['vertébrés', 'mammifères', 'reptiles'], 'Insectes, araignées, escargots, vers : ce sont des invertébrés.'),
    qcm('svt_v07', 'Combien de pattes a un insecte adulte ?', '6', ['4', '8', '10'], 'Un insecte a 6 pattes. L\'araignée en a 8 : ce n\'est pas un insecte.', 2),
    tf('svt_v08', 'Un champignon est une plante.', false, 'Les champignons forment un groupe à part : ce ne sont ni des animaux ni des végétaux.', 2)
];
const alimentation = [
    qcm('svt_a01', 'Un animal qui mange uniquement des végétaux est…', 'herbivore', ['carnivore', 'omnivore', 'insectivore'], 'Herbivore : mange des végétaux. Carnivore : mange des animaux. Omnivore : mange les deux.'),
    qcm('svt_a02', 'Un animal qui mange d\'autres animaux est…', 'carnivore', ['herbivore', 'végétarien', 'producteur'], 'Le lion, le loup, le renard sont carnivores.'),
    qcm('svt_a03', 'L\'être humain est…', 'omnivore', ['herbivore', 'carnivore', 'producteur'], 'L\'humain mange des végétaux et des produits animaux : il est omnivore.'),
    order('svt_a04', 'Remets cette chaîne alimentaire dans l\'ordre (de celui qui est mangé à celui qui mange).', ['Herbe', 'Lapin', 'Renard'], 'La chaîne commence par un végétal, mangé par un herbivore, lui-même mangé par un carnivore.'),
    order('svt_a05', 'Remets cette chaîne alimentaire dans l\'ordre.', ['Graine', 'Mulot', 'Chouette'], 'Graine (végétal) → Mulot (mange la graine) → Chouette (mange le mulot).', 2),
    qcm('svt_a06', 'Dans une chaîne alimentaire, le premier maillon est toujours…', 'un végétal', ['un carnivore', 'un herbivore', 'un champignon'], 'Les végétaux fabriquent leur propre matière : tout commence par eux.'),
    qcm('svt_a07', 'Dans une chaîne alimentaire, la flèche signifie…', '« est mangé par »', ['« mange »', '« ressemble à »', '« vit avec »'], 'Herbe → Lapin se lit : l\'herbe est mangée par le lapin.'),
    match('svt_a08', 'Associe chaque animal à son régime alimentaire.', [['Vache', 'herbivore'], ['Lion', 'carnivore'], ['Ours brun', 'omnivore']], 'La vache mange de l\'herbe, le lion de la viande, l\'ours brun mange les deux.')
];
const plantes = [
    qcm('svt_p01', 'De quoi une plante verte a-t-elle besoin pour fabriquer sa matière ?', 'de lumière, d\'eau, de sels minéraux et de dioxyde de carbone', ['uniquement d\'eau', 'de viande et d\'eau', 'de lait et de sucre'], 'La plante prélève l\'eau et les sels minéraux par ses racines, le dioxyde de carbone par ses feuilles, et utilise la lumière.'),
    qcm('svt_p02', 'Quel gaz une plante verte rejette-t-elle à la lumière ?', 'du dioxygène', ['du dioxyde de carbone', 'de l\'azote', 'de l\'hydrogène'], 'À la lumière, la plante verte rejette du dioxygène : c\'est le gaz que nous respirons.', 2),
    qcm('svt_p03', 'À quoi servent les racines ?', 'à absorber l\'eau et les sels minéraux', ['à fabriquer des graines', 'à capter la lumière', 'à respirer'], 'Les racines tiennent la plante dans le sol et y puisent l\'eau et les sels minéraux.'),
    qcm('svt_p04', 'Quel organe de la plante produit les graines et les fruits ?', 'la fleur', ['la racine', 'la tige', 'la feuille'], 'La fleur permet la reproduction : après la pollinisation, elle donne un fruit contenant des graines.'),
    order('svt_p05', 'Remets les étapes de la vie d\'une plante à fleurs dans l\'ordre.', ['Graine', 'Germination', 'Plante adulte', 'Fleur', 'Fruit avec graines'], 'La graine germe, la plante grandit, fleurit, puis produit des fruits contenant de nouvelles graines.', 2),
    tf('svt_p06', 'Une plante verte peut fabriquer sa matière dans l\'obscurité totale.', false, 'Sans lumière, une plante verte ne peut pas fabriquer sa matière : elle finit par dépérir.', 2)
];
const etats = [
    qcm('pc_e01', 'Un liquide…', 'prend la forme du récipient qui le contient', ['garde toujours sa forme', 'occupe tout l\'espace disponible', 'ne coule jamais'], 'Un liquide n\'a pas de forme propre : il épouse le récipient. Sa surface libre est plane et horizontale.'),
    qcm('pc_e02', 'Un gaz…', 'occupe tout l\'espace disponible', ['garde sa forme', 'a une surface plane', 'ne se comprime pas'], 'Un gaz s\'étend partout et peut être comprimé.'),
    qcm('pc_e03', 'Un solide…', 'garde sa forme propre', ['prend la forme du récipient', 'occupe tout l\'espace', 'coule'], 'Un solide a une forme propre : il ne coule pas.'),
    qcm('pc_e04', 'Comment s\'appelle le passage de l\'état solide à l\'état liquide ?', 'la fusion', ['la solidification', 'la vaporisation', 'la liquéfaction'], 'La glace qui fond : c\'est la fusion.'),
    qcm('pc_e05', 'Comment s\'appelle le passage de l\'état liquide à l\'état solide ?', 'la solidification', ['la fusion', 'la vaporisation', 'la liquéfaction'], 'L\'eau qui gèle : c\'est la solidification.'),
    qcm('pc_e06', 'Comment s\'appelle le passage de l\'état liquide à l\'état gazeux ?', 'la vaporisation', ['la fusion', 'la solidification', 'la liquéfaction'], 'L\'eau qui bout ou qui s\'évapore : c\'est la vaporisation.'),
    qcm('pc_e07', 'Comment s\'appelle le passage de l\'état gazeux à l\'état liquide ?', 'la liquéfaction (condensation)', ['la fusion', 'la solidification', 'la vaporisation'], 'La buée sur une vitre froide : c\'est la liquéfaction (ou condensation).', 2),
    input('pc_e08', 'À quelle température (en °C) l\'eau pure gèle-t-elle ?', '0', 'L\'eau pure change d\'état à 0 °C : elle gèle (et la glace fond).', [], 1, true),
    input('pc_e09', 'À quelle température (en °C) l\'eau pure bout-elle (à pression normale) ?', '100', 'L\'eau pure bout à 100 °C.', [], 1, true),
    tf('pc_e10', 'La glace fond à 100 °C.', false, 'La glace fond à 0 °C. C\'est l\'eau qui bout à 100 °C.'),
    match('pc_e11', 'Associe chaque changement d\'état à son passage.', [['Fusion', 'solide → liquide'], ['Solidification', 'liquide → solide'], ['Vaporisation', 'liquide → gaz'], ['Liquéfaction', 'gaz → liquide']], 'Fusion : solide→liquide. Solidification : liquide→solide. Vaporisation : liquide→gaz. Liquéfaction : gaz→liquide.', 2)
];
const melanges = [
    qcm('pc_m01', 'Quand on mélange du sucre dans de l\'eau et qu\'il se dissout, on obtient…', 'un mélange homogène', ['un mélange hétérogène', 'un corps pur', 'deux liquides séparés'], 'On ne voit plus le sucre : le mélange est homogène (on parle de solution).'),
    qcm('pc_m02', 'Un mélange d\'eau et d\'huile est…', 'hétérogène', ['homogène', 'une solution', 'un corps pur'], 'On voit deux liquides séparés : le mélange est hétérogène.'),
    qcm('pc_m03', 'Comment séparer du sable mélangé à de l\'eau ?', 'par filtration', ['par évaporation', 'par dissolution', 'par aimantation'], 'Le sable reste dans le filtre, l\'eau passe : c\'est la filtration.'),
    qcm('pc_m04', 'Comment récupérer le sel d\'une eau salée ?', 'en faisant évaporer l\'eau', ['par filtration', 'par décantation', 'par aimantation'], 'Le sel est dissous : il traverse le filtre. Quand l\'eau s\'évapore, le sel reste.', 2),
    qcm('pc_m05', 'Dans un sirop (sucre dissous dans l\'eau), l\'eau est…', 'le solvant', ['le soluté', 'le filtrat', 'le dépôt'], 'Le solvant dissout (ici l\'eau). Le soluté est ce qui est dissous (ici le sucre).', 2),
    tf('pc_m06', 'Quand un sucre se dissout dans l\'eau, la masse totale diminue.', false, 'La masse se conserve : elle est égale à celle de l\'eau plus celle du sucre, même si le sucre a disparu à la vue.', 2),
    qcm('pc_m07', 'Quel matériel utilise-t-on pour filtrer un mélange ?', 'un entonnoir et du papier filtre', ['une balance', 'un thermomètre', 'une éprouvette seule'], 'Le papier filtre placé dans un entonnoir retient les particules solides.')
];
const lumiere = [
    qcm('pc_l01', 'Dans un milieu transparent, la lumière se propage…', 'en ligne droite', ['en courbe', 'en zigzag', 'en cercle'], 'La lumière se propage en ligne droite : on la représente par un rayon.'),
    qcm('pc_l02', 'Quelle est une source primaire de lumière ?', 'le Soleil', ['la Lune', 'un miroir', 'un mur blanc'], 'Une source primaire produit elle-même de la lumière. La Lune ne fait que renvoyer celle du Soleil.'),
    qcm('pc_l03', 'La Lune est visible parce qu\'elle…', 'diffuse la lumière du Soleil', ['produit sa propre lumière', 'absorbe toute la lumière', 'est transparente'], 'La Lune est une source secondaire (un objet diffusant).', 2),
    qcm('pc_l04', 'À peu près quelle est la vitesse de la lumière dans le vide ?', '300 000 km/s', ['300 km/s', '3 000 km/h', '30 km/s'], 'La lumière va à environ 300 000 kilomètres par seconde.', 3),
    tf('pc_l05', 'La lumière ne peut pas traverser le vide.', false, 'La lumière du Soleil arrive jusqu\'à la Terre en traversant le vide de l\'espace.', 2),
    qcm('pc_l06', 'Une ombre se forme quand…', 'un objet opaque arrête la lumière', ['la lumière traverse une vitre', 'la lumière est réfléchie', 'il y a un miroir'], 'Un objet opaque bloque la lumière : derrière lui, il n\'y a pas de lumière, c\'est l\'ombre.'),
    qcm('pc_l07', 'Quel objet est transparent ?', 'une vitre', ['une planche de bois', 'un carton', 'une plaque de métal'], 'Un objet transparent laisse passer la lumière et permet de voir à travers.')
];
const skillDefs = [
    { id: 'svt_vivant', subject: 'svt', label: 'Le vivant et sa classification', bank: vivant },
    { id: 'svt_alimentation', subject: 'svt', label: 'Régimes et chaînes alimentaires', bank: alimentation },
    { id: 'svt_plantes', subject: 'svt', label: 'Les végétaux', bank: plantes },
    { id: 'pc_etats', subject: 'physique', label: 'États de la matière', bank: etats },
    { id: 'pc_melanges', subject: 'physique', label: 'Mélanges et solutions', bank: melanges },
    { id: 'pc_lumiere', subject: 'physique', label: 'Lumière', bank: lumiere }
];
export const sciencesSkills = skillDefs;
