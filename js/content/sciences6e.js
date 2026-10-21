// SVT et physique-chimie de 6e d'après les cours déposés (écosystème, espèce, matière et ses propriétés).
import { qcm, tf, order, match } from './helpers.js';

// ===================== SVT =====================
const espece = [
    qcm('sv_e01', 'La grande diversité des espèces vivantes sur Terre s\'appelle…', 'la biodiversité', ['l\'écosystème', 'la classification', 'la reproduction'], 'La Terre abrite une grande diversité d\'espèces vivantes : c\'est la biodiversité.'),
    qcm('sv_e02', 'Deux individus font partie de la même espèce quand…', 'ils peuvent se reproduire entre eux et avoir des descendants', ['ils se ressemblent beaucoup', 'ils vivent au même endroit', 'ils ont la même couleur'], 'Dans l\'élevage d\'escargots, seuls les escargots de la même espèce donnent des œufs quand ils s\'accouplent. La ressemblance ne suffit pas.', 2),
    qcm('sv_e03', 'Pour trouver le nom d\'une espèce, on utilise…', 'une clé de détermination', ['un thermomètre', 'une boussole', 'un herbier'], 'Une clé de détermination est une suite de questions qui mène au nom de l\'espèce.'),
    qcm('sv_e04', 'Quels sont les 4 grands groupes d\'êtres vivants ?', 'Les animaux, les végétaux, les champignons et les bactéries', ['Les mammifères, les oiseaux, les poissons et les reptiles', 'Les animaux, les végétaux, les minéraux et les bactéries', 'Les animaux, les plantes, les roches et les champignons'], 'Il y a 4 grands groupes d\'êtres vivants : animaux, végétaux, champignons et bactéries.'),
    qcm('sv_e05', 'À quel grand groupe appartient une libellule ?', 'les animaux', ['les végétaux', 'les champignons', 'les bactéries'], 'La libellule est un animal (un insecte), comme le triton.'),
    qcm('sv_e06', 'À quel grand groupe appartient une lentille d\'eau ?', 'les végétaux', ['les animaux', 'les champignons', 'les bactéries'], 'La lentille d\'eau est une petite plante qui flotte sur l\'eau : c\'est un végétal.')
];

const cles = [
    qcm('sv_c01', 'À quoi sert une clé de détermination ?', 'À trouver le nom d\'une espèce en répondant à une suite de questions', ['À mesurer la température d\'un milieu', 'À dessiner une feuille', 'À ranger les plantes séchées'], 'À chaque question, on suit la branche qui correspond à ce qu\'on observe, jusqu\'au nom de l\'espèce.'),
    qcm('sv_c02', 'Un oiseau migrateur constructeur de nid a la queue en triangle. Quelle hirondelle est-ce ?', 'L\'hirondelle des rochers', ['L\'hirondelle rustique', 'L\'hirondelle des rivages', 'L\'hirondelle des fenêtres'], 'Dans la clé : queue en triangle → hirondelle des rochers (elle vit sur des falaises, nid de boue).', 2),
    qcm('sv_c03', 'Une hirondelle a la queue en W avec 2 filets. Laquelle est-ce ?', 'L\'hirondelle rustique', ['L\'hirondelle des rochers', 'L\'hirondelle des rivages', 'L\'hirondelle des fenêtres'], 'Queue en W + 2 filets sur la queue → hirondelle rustique (campagne, nid de terre et de paille).', 2),
    qcm('sv_c04', 'Queue en W, tête noire et blanche, collier sombre : quelle hirondelle ?', 'L\'hirondelle des rivages', ['L\'hirondelle rustique', 'L\'hirondelle des rochers', 'L\'hirondelle des fenêtres'], 'Tête noire et blanche + collier sombre → hirondelle des rivages (elle creuse son nid dans la berge).', 2),
    qcm('sv_c05', 'Queue en W, tête noire et blanche, dos noir : quelle hirondelle ?', 'L\'hirondelle des fenêtres', ['L\'hirondelle rustique', 'L\'hirondelle des rochers', 'L\'hirondelle des rivages'], 'Dos noir → hirondelle des fenêtres (elle vit en ville, nid de boue en boules).', 2),
    qcm('sv_c06', 'Une feuille en aiguille appartient à…', 'un thuya', ['un frêne', 'un marronnier', 'un chêne'], 'Dans la clé des végétaux de la cour : feuille en aiguille → thuya.'),
    qcm('sv_c07', 'Une feuille composée de 5 à 7 folioles dentelées appartient à…', 'un marronnier', ['un frêne', 'un tilleul', 'un laurier'], 'Feuille composée de folioles : 5 à 7 folioles dentelées → marronnier ; 7 folioles ou plus → frêne.', 2),
    qcm('sv_c08', 'Une feuille composée est formée…', 'de plusieurs petites feuilles appelées folioles', ['d\'une seule grande feuille lobée', 'd\'aiguilles', 'd\'une feuille en forme de cœur'], 'Les folioles sont les petites feuilles qui forment une feuille composée (comme celle du marronnier ou du frêne).'),
    qcm('sv_c09', 'Une feuille simple, ovale, au bord lisse est celle…', 'du laurier', ['du charme', 'du chêne', 'du tilleul'], 'Feuille simple, une nervure centrale, ovale : bord lisse → laurier ; bord doublement denté → charme.', 3),
    qcm('sv_c10', 'Une feuille dont la base a la forme d\'un cœur et dont le bord est denté est celle…', 'du tilleul', ['du noisetier', 'du chêne', 'du marronnier'], 'Base en forme de cœur : bord denté → tilleul ; bord doublement denté et pétiole velu → noisetier.', 3)
];

const ecosysteme = [
    qcm('sv_s01', 'Un écosystème, c\'est…', 'un milieu de vie avec ses caractéristiques et les êtres vivants qui sont en relation entre eux et avec le milieu', ['un ensemble d\'animaux de la même espèce', 'un endroit sans êtres vivants', 'un type de roche'], 'Exemple d\'écosystème : la cour du collège, avec son sol, son eau, ses plantes, ses animaux.'),
    qcm('sv_s02', 'Un être vivant est un être qui…', 'naît, grandit, se nourrit, respire, se reproduit et meurt', ['bouge et fait du bruit', 'est fabriqué par l\'être humain', 'a une masse et un volume'], 'Une pierre a une masse et un volume mais elle ne naît pas, ne grandit pas et ne se reproduit pas : elle n\'est pas vivante.'),
    qcm('sv_s03', 'Un cloporte est…', 'un élément biologique (un être vivant)', ['un élément géologique', 'une trace de l\'activité humaine', 'de la matière minérale'], 'Les éléments biologiques sont tous les êtres vivants présents dans le milieu.'),
    qcm('sv_s04', 'L\'air et l\'eau sont…', 'des éléments géologiques (matière minérale)', ['des êtres vivants', 'des traces de l\'activité humaine', 'de la matière organique'], 'Les éléments géologiques forment l\'ensemble des éléments minéraux : cailloux, air, eau…'),
    qcm('sv_s05', 'Un grillage ou une poubelle sont…', 'des traces de l\'activité humaine', ['des éléments biologiques', 'des éléments géologiques', 'des êtres vivants'], 'Bâtiments, déchets, plantations, poubelles, grillages : ce sont des traces de l\'activité humaine.'),
    qcm('sv_s06', 'Lequel de ces éléments non vivants est naturel ?', 'un caillou', ['un tube de ketchup', 'une bouteille de lait', 'une balle de ping-pong'], 'Naturel = qui n\'a pas été fabriqué par un être humain. Le ketchup, la bouteille et la balle sont fabriqués.', 2),
    qcm('sv_s07', 'Lequel de ces éléments n\'est ni vivant ni naturel ?', 'un morceau de stylo en plastique', ['un caillou', 'un pigeon', 'l\'eau'], 'Le plastique est une matière fabriquée par l\'être humain : il n\'est ni vivant ni naturel.', 2),
    qcm('sv_s08', 'Un thermomètre mesure…', 'la température, en °C', ['l\'humidité, en %', 'la luminosité, en lux', 'la direction du nord'], 'Pour décrire un milieu on mesure la température (°C), l\'humidité (%) et la luminosité (lux).'),
    match('sv_s09', 'Associe chaque appareil à ce qu\'il mesure.', [['Thermomètre', 'la température (°C)'], ['Hygromètre', 'l\'humidité (%)'], ['Luxmètre', 'la luminosité (lux)']], 'Température en °C, humidité en %, luminosité en lux.', 2),
    qcm('sv_s10', 'Un milieu sec, chaud et éclairé (au soleil) abrite plutôt…', 'des gendarmes, des araignées, des pigeons', ['des cloportes, des mousses, des vers de terre', 'des poissons et des algues', 'seulement des champignons'], 'Les êtres vivants dépendent des conditions du milieu : chaleur, humidité, lumière.', 2),
    qcm('sv_s11', 'Un milieu humide, sombre et frais (sous un buisson) abrite plutôt…', 'des cloportes, des mousses, des vers de terre', ['des gendarmes, des araignées, des pigeons', 'des cactus', 'des animaux du désert'], 'Mousses, cloportes et vers de terre aiment l\'humidité et l\'ombre.', 2),
    tf('sv_s12', 'Une pierre est un être vivant.', false, 'Une pierre ne naît pas, ne se nourrit pas, ne se reproduit pas : c\'est un élément géologique.')
];

const demarche = [
    order('sv_d01', 'Remets les étapes de la démarche d\'investigation dans l\'ordre.', ['Observation', 'Problème scientifique', 'Hypothèses', 'Recherche documentaire ou expérience', 'Conclusion'], 'On observe, on se pose un problème, on propose des hypothèses, on cherche (documents ou expérience) puis on conclut sur l\'hypothèse de départ.', 2),
    match('sv_d02', 'Associe chaque couleur du cahier de SVT à son rôle.', [['Vert', 'le problème scientifique à résoudre'], ['Bleu', 'le cours, le déroulement de la recherche'], ['Rouge', 'les éléments les plus importants du cours']], 'Le code couleur aide à suivre le raisonnement scientifique.', 2),
    order('sv_d03', 'Remets les étapes de la réalisation d\'un herbier dans l\'ordre.', ['Récolter les échantillons', 'Faire sécher les échantillons', 'Fixer les échantillons', 'Étiqueter les échantillons', 'Présenter son travail'], 'On récolte, on sèche, on fixe sur une feuille, on étiquette, puis on range les planches dans un classeur avec une page de garde.', 2),
    qcm('sv_d04', 'Que doit indiquer l\'étiquette d\'un échantillon d\'herbier ?', 'Le nom de la plante, le lieu et la date de la récolte', ['Le nom de l\'élève uniquement', 'La couleur de la plante', 'La température du jour'], 'Le nom se trouve avec la clé de détermination.'),
    qcm('sv_d05', 'Quand récolte-t-on des plantes pour un herbier ?', 'Un jour sans pluie, jamais des végétaux mouillés', ['Juste après la pluie', 'Seulement en hiver', 'Quand elles sont déjà sèches depuis un an'], 'Les végétaux mouillés moisiraient avant d\'être secs.'),
    qcm('sv_d06', 'Combien d\'échantillons met-on sur une page d\'herbier ?', 'Un seul', ['Deux', 'Cinq', 'Autant qu\'on veut'], 'Un seul échantillon par page, avec de la place pour l\'étiquette en bas à droite.')
];

// ===================== Physique-chimie =====================
const matiere = [
    qcm('pc_dm01', 'À l\'échelle humaine, la matière est…', 'tout ce qui a une masse et un volume', ['seulement ce qu\'on peut toucher', 'seulement ce qui est vivant', 'seulement les solides'], 'La matière forme les objets et les êtres vivants, qu\'on puisse les toucher ou non.'),
    qcm('pc_dm02', 'Les trois états physiques de la matière sont…', 'solide, liquide et gazeux', ['solide, mou et dur', 'chaud, tiède et froid', 'minéral, organique et plastique'], 'La matière peut être à l\'état solide, liquide ou gazeux.'),
    qcm('pc_dm03', 'Une matière naturelle est une matière…', 'qui n\'a pas été fabriquée grâce à l\'intervention d\'un être humain', ['qui vient d\'un magasin', 'qui est toujours vivante', 'qui est toujours un solide'], 'L\'eau, l\'air, les roches, le bois sont naturels. Le plastique est fabriqué.'),
    qcm('pc_dm04', 'La matière organique est…', 'la matière produite par les êtres vivants', ['la matière des roches', 'la matière fabriquée en usine', 'l\'air et l\'eau'], 'Les feuilles, le bois, les fourmis, la laine… sont de la matière organique.'),
    qcm('pc_dm05', 'La matière minérale comprend…', 'l\'eau, l\'air et les roches', ['les feuilles et le bois', 'le polyester et le plastique', 'les métaux uniquement'], 'Une roche comme le basalte (roche volcanique), l\'eau, les sels minéraux, l\'air sont de la matière minérale.'),
    qcm('pc_dm06', 'Le polyester d\'un vêtement est…', 'une matière plastique fabriquée par l\'être humain', ['une matière minérale', 'un métal', 'une matière organique naturelle'], 'Le polyester est un plastique : il passe à l\'état liquide vers 260 °C.'),
    qcm('pc_dm07', 'Un métal est une matière qui…', 'laisse bien passer la chaleur et l\'électricité', ['est toujours liquide', 'flotte sur l\'eau', 'est toujours attirée par un aimant'], 'L\'aluminium est un métal que l\'on extrait dans des mines.'),
    qcm('pc_dm08', 'Le basalte est…', 'une roche volcanique, donc de la matière minérale', ['un métal', 'une matière plastique', 'de la matière organique'], 'La statue égyptienne en basalte est faite de matière minérale.', 2),
    qcm('pc_dm09', 'Pourquoi trie-t-on les déchets dans une déchetterie ?', 'Parce que la matière est très diverse et qu\'on recycle certains déchets séparément', ['Pour que ça prenne moins de place', 'Pour que les déchets soient plus beaux', 'Parce que tous les déchets sont identiques'], 'La matière est très diverse (métal, plastique, verre, organique…) : on la trie avant de recycler.'),
    qcm('pc_dm10', 'L\'aluminium passe à l\'état liquide à…', '660 °C', ['260 °C', '100 °C', '1 400 °C'], 'Température de fusion de l\'aluminium : 660 °C. Pour le polyester : environ 260 °C. Pour le verre : environ 1 400 °C.', 2),
    qcm('pc_dm11', 'À 330 °C, dans quel état sont l\'aluminium (fusion à 660 °C) et le polyester (liquide vers 260 °C) ?', 'L\'aluminium est solide et le polyester est liquide', ['Les deux sont liquides', 'Les deux sont solides', 'L\'aluminium est liquide et le polyester est solide'], '330 °C est plus petit que 660 °C : l\'aluminium n\'a pas encore fondu. 330 °C est plus grand que 260 °C : le polyester est déjà liquide.', 3),
    match('pc_dm12', 'Associe chaque matière à sa catégorie.', [['Le polyester', 'matière plastique'], ['L\'aluminium', 'métal'], ['Le basalte', 'matière minérale'], ['Une feuille d\'arbre', 'matière organique']], 'Quatre grandes catégories : métal, matière plastique, matière minérale, matière organique.', 2),
    tf('pc_dm13', 'Le bois est de la matière organique.', true, 'Le bois est produit par un être vivant (l\'arbre) : c\'est de la matière organique.', 2),
    tf('pc_dm14', 'Le verre est de la matière organique.', false, 'Le verre est fabriqué à partir de sable : c\'est de la matière minérale fabriquée, pas de la matière produite par des êtres vivants.', 3)
];

const proprietes = [
    qcm('pc_p01', 'Un matériau qui laisse passer le courant électrique est un…', 'conducteur', ['isolant', 'aimant', 'liquide'], 'Conducteur : le courant peut circuler. Isolant : le courant ne peut pas circuler.'),
    qcm('pc_p02', 'Un matériau qui ne laisse pas passer le courant électrique est un…', 'isolant', ['conducteur', 'métal', 'aimant'], 'Le bois, le plastique et le verre sont des isolants.'),
    qcm('pc_p03', 'Lesquels de ces matériaux sont des isolants ?', 'le bois, le plastique, le verre', ['le fer, le cuivre, l\'aluminium', 'le bois, le cuivre, le verre', 'le plastique, le fer, le verre'], 'Les métaux sont de bons conducteurs ; le bois, le plastique et le verre sont des isolants.'),
    qcm('pc_p04', 'Dans le circuit de l\'expérience, quand l\'objet testé est conducteur…', 'la lampe s\'allume', ['la lampe reste éteinte', 'la pile fond', 'l\'objet devient aimanté'], 'Si le courant circule dans l\'objet, la lampe s\'allume : c\'est comme cela qu\'on repère un conducteur.'),
    qcm('pc_p05', 'Quelle énergie est fournie par une pile ?', 'de l\'énergie électrique', ['de l\'énergie lumineuse', 'de l\'énergie de mouvement', 'de la chaleur uniquement'], 'La pile fournit de l\'énergie électrique au circuit.', 2),
    qcm('pc_p06', 'Parmi les métaux, lequel est attiré par un aimant ?', 'le fer', ['l\'aluminium', 'l\'or', 'le cuivre'], 'Parmi les métaux, seul le fer est attiré par l\'aimant : c\'est le test à l\'aimant.'),
    tf('pc_p07', 'L\'aluminium est attiré par un aimant.', false, 'Seul le fer est attiré par l\'aimant : une canette en aluminium ne l\'est pas, alors qu\'un trombone en fer l\'est.', 2),
    qcm('pc_p08', 'Quand un objet coule dans l\'eau, sa densité est…', 'supérieure à 1', ['inférieure à 1', 'égale à 0', 'impossible à connaître'], 'La densité de l\'eau est 1. Un objet qui coule est plus dense que l\'eau (densité supérieure à 1).'),
    qcm('pc_p09', 'Quand un objet flotte sur l\'eau, sa densité est…', 'inférieure à 1', ['supérieure à 1', 'égale à 10', 'toujours égale à 1'], 'Un objet qui flotte est moins dense que l\'eau (densité inférieure à 1).'),
    qcm('pc_p10', 'Un crayon de bois flotte dans l\'eau. Que peux-tu dire ?', 'Sa densité est inférieure à 1', ['Sa densité est supérieure à 1', 'Sa densité est égale à 1 exactement', 'Il est plus dense que l\'eau'], 'Les objets qui flottent ont une densité inférieure à 1.', 2),
    qcm('pc_p11', 'Des ciseaux en métal coulent dans l\'eau. Que peux-tu dire ?', 'Leur densité est supérieure à 1', ['Leur densité est inférieure à 1', 'Ils sont moins denses que l\'eau', 'Ils sont isolants'], 'Les objets qui coulent ont une densité supérieure à 1.', 2),
    qcm('pc_p12', 'On plonge une bille en polystyrène et une bille en fer dans l\'eau. Que se passe-t-il ?', 'La bille en polystyrène flotte et celle en fer coule', ['Les deux flottent', 'La bille en fer flotte et celle en polystyrène coule', 'Les deux coulent'], 'Le polystyrène est moins dense que l\'eau, le fer est plus dense.', 2),
    qcm('pc_p13', 'Plus un objet est petit et lourd, plus il est…', 'dense', ['léger', 'conducteur', 'liquide'], 'La densité compare la masse d\'un objet à la masse du même volume d\'eau.', 3),
    qcm('pc_p14', 'Pourquoi les températures de fusion permettent-elles de différencier les métaux ?', 'Parce que tous les métaux ne fondent pas à la même température', ['Parce que tous les métaux fondent à 100 °C', 'Parce que les métaux ne fondent jamais', 'Parce que seul le fer fond'], 'La température de fusion fait partie de la « carte d\'identité » d\'un matériau.', 2),
    qcm('pc_p15', 'Quelle propriété permet de différencier l\'or (jaune) du fer (gris) au premier regard ?', 'La couleur', ['La densité de l\'eau', 'Le test à l\'aimant uniquement', 'La masse uniquement'], 'Tous les métaux n\'ont pas la même couleur : l\'or est jaune, le fer est gris.'),
    qcm('pc_p16', 'Comment appelle-t-on l\'ensemble des propriétés qui permettent d\'identifier une matière ?', 'sa carte d\'identité', ['son état civil', 'sa recette', 'son étiquette de prix'], 'Couleur, densité, conductivité, test à l\'aimant, température de fusion : ce sont les propriétés de la matière.', 2)
];

const recyclage = [
    order('pc_r01', 'Remets ces étapes du recyclage du verre dans l\'ordre, en commençant par la collecte.', ['Collecte', 'Broyage', 'Calcin', 'Fusion à 1 400 °C'], 'Le verre collecté est broyé, on obtient le calcin, puis on le fait fondre à 1 400 °C pour fabriquer de nouvelles bouteilles.', 2),
    order('pc_r02', 'Remets le cycle du verre dans l\'ordre, en commençant par la consommation.', ['Consommation', 'Tri', 'Collecte', 'Broyage', 'Calcin', 'Fusion à 1 400 °C', 'Moulage et démoulage', 'Embouteillage', 'Achat'], 'On consomme, on trie (conteneur à verre), on collecte, on broie, on obtient le calcin, on fait fondre à 1 400 °C, on moule et démoule les bouteilles, on les remplit, on les achète : c\'est un cycle.', 3),
    qcm('pc_r03', 'À 1 400 °C, dans quel état se trouve le verre ?', 'liquide', ['solide', 'gazeux', 'il n\'a pas d\'état'], 'À 1 400 °C le verre fond : il est à l\'état liquide, ce qui permet de le mouler.', 2),
    qcm('pc_r04', 'Pendant l\'étape de fusion, le verre passe de l\'état…', 'solide à l\'état liquide', ['liquide à l\'état solide', 'solide à l\'état gazeux', 'gazeux à l\'état liquide'], 'La fusion est le passage de l\'état solide à l\'état liquide.', 2),
    qcm('pc_r05', 'Pourquoi dit-on que le recyclage du verre est un cycle ?', 'Parce qu\'il n\'a ni début ni fin : le verre recyclé redevient des bouteilles', ['Parce qu\'il se fait à vélo', 'Parce qu\'il a lieu chaque année', 'Parce qu\'on le fait dans l\'ordre alphabétique'], 'On peut commencer le cycle par n\'importe quelle étape, puisqu\'on revient toujours au point de départ.')
];

const securite = [
    qcm('pc_s01', 'Que fait-on si on a les cheveux longs pendant un TP de chimie ?', 'On les attache', ['On les laisse libres', 'On les mouille', 'On met un chapeau mouillé'], 'Il faut attacher ses cheveux longs.'),
    qcm('pc_s02', 'Que met-on pour protéger ses yeux pendant un TP ?', 'Des lunettes de protection', ['Des gants de ski', 'Rien du tout', 'Un masque de carnaval'], 'On met des lunettes de protection pour manipuler, et des gants quand le professeur ou le protocole l\'indique.'),
    qcm('pc_s03', 'Peut-on prendre une initiative sans l\'autorisation du professeur ?', 'Non, jamais ; on suit le protocole et on signale tout problème', ['Oui, si on est en avance', 'Oui, si c\'est pour aller plus vite', 'Oui, en groupe'], 'Ne pas prendre d\'initiative sans l\'autorisation du professeur et lui signaler tout problème.'),
    qcm('pc_s04', 'Que fait-on des produits usagés ?', 'On les place dans les récupérateurs adaptés', ['On les jette dans l\'évier', 'On les garde dans sa trousse', 'On les rend à un camarade'], 'On ne jette pas les produits usagés : on les met dans les récupérateurs adaptés.', 2),
    qcm('pc_s05', 'Que fait-on à la fin d\'une séance de TP ?', 'On nettoie sa paillasse, on range le matériel et on se lave les mains', ['On part tout de suite', 'On laisse le matériel sur la table', 'On range seulement son cahier'], 'Nettoyer sa paillasse, ranger le matériel, se laver les mains.'),
    qcm('pc_s06', 'Où range-t-on les vêtements et les sacs pendant un TP ?', 'À l\'abri des projections de liquides dangereux, sans gêner les allées', ['Au milieu de la salle', 'Sur la paillasse', 'Dans le couloir devant la porte'], 'Aucun objet ne doit gêner les allées et venues.', 2),
    tf('pc_s07', 'Pour aller plus vite, on peut brancher une expérience sur une prise de courant.', false, 'On ne réalise jamais d\'expérience avec une prise de courant : risque de s\'électrocuter.', 2),
    qcm('pc_s08', 'Pourquoi utilise-t-on la verrerie appropriée ?', 'Pour éviter la casse', ['Pour faire joli', 'Pour manipuler plus vite', 'Parce qu\'elle est gratuite'], 'Utiliser la verrerie appropriée avec précaution pour éviter la casse.', 2)
];

const consignes = [
    match('pc_k01', 'Associe chaque verbe de consigne à sa définition.', [['Argumenter', 'utiliser des idées et des exemples pour appuyer ses propos'], ['Calculer', 'effectuer un calcul et donner le résultat avec une unité'], ['Comparer', 'faire apparaître les ressemblances et les différences'], ['Décrire', 'communiquer en détail une observation']], 'Bien comprendre le verbe de la consigne évite beaucoup d\'erreurs.', 2),
    match('pc_k02', 'Associe chaque verbe de consigne à sa définition.', [['Définir', 'donner une définition'], ['Déterminer', 'trouver, faire apparaître quelque chose avec précision'], ['Justifier', 'établir qu\'une réponse est exacte en donnant des preuves'], ['Vérifier', 'contrôler l\'exactitude d\'une réponse']], 'Justifier, c\'est toujours donner une preuve ou une explication.', 2),
    match('pc_k03', 'Associe chaque verbe de consigne à sa définition.', [['Identifier', 'reconnaître à partir d\'informations, repérer'], ['Interpréter', 'donner une signification à un résultat'], ['Schématiser', 'organiser une information sous la forme d\'un schéma'], ['Élaborer un protocole', 'concevoir une expérience pour tester une hypothèse']], 'Un protocole est la description des étapes d\'une expérience.', 3),
    qcm('pc_k04', 'Que signifie « justifier » ?', 'Établir qu\'une réponse est exacte en donnant des preuves', ['Recopier la question', 'Répondre par oui ou par non', 'Donner son avis sans explication'], 'Justifie ta réponse = explique pourquoi tu as raison.', 2),
    qcm('pc_k05', 'Que signifie « comparer » ?', 'Faire apparaître les ressemblances et les différences', ['Donner une définition', 'Faire un calcul', 'Dessiner un schéma'], 'Comparer, c\'est chercher à la fois ce qui est pareil et ce qui est différent.', 2)
];

export const sciences6eSkills = [
    { id: 'sv_espece', subject: 'svt', label: 'Biodiversité et espèce', bank: espece },
    { id: 'sv_cles', subject: 'svt', label: 'Clés de détermination', bank: cles },
    { id: 'sv_ecosysteme', subject: 'svt', label: 'Écosystème et êtres vivants', bank: ecosysteme },
    { id: 'sv_demarche', subject: 'svt', label: 'Démarche scientifique et herbier', bank: demarche },
    { id: 'pc_matiere', subject: 'physique', label: 'Diversité de la matière', bank: matiere },
    { id: 'pc_proprietes', subject: 'physique', label: 'Propriétés de la matière', bank: proprietes },
    { id: 'pc_recyclage', subject: 'physique', label: 'Recyclage du verre', bank: recyclage },
    { id: 'pc_securite', subject: 'physique', label: 'Sécurité en TP', bank: securite },
    { id: 'pc_consignes', subject: 'physique', label: 'Comprendre les consignes', bank: consignes }
];
