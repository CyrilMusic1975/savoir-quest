import { qcm, tf, order, match, flash } from './helpers.js';

// Contenu de départ rédigé d'après le programme de 6e : à ajuster avec les leçons réelles.

const prehistoire = [
    order('hg_p01', 'Remets ces événements dans l\'ordre chronologique.', ['Apparition d\'Homo sapiens', 'Début du Néolithique (agriculture, élevage)', 'Invention de l\'écriture', 'Fondation légendaire de Rome'], 'Homo sapiens : il y a environ 300 000 ans. Néolithique : vers -10 000. Écriture : vers -3300. Rome : -753 (selon la légende).', 2),
    qcm('hg_p02', 'Qu\'est-ce que le Néolithique ?', 'la période où l\'humain devient agriculteur et éleveur', ['la période où l\'écriture est inventée', 'la période des premiers outils en pierre', 'la période des cités grecques'], 'Au Néolithique, les humains cultivent la terre, élèvent des animaux et se sédentarisent.'),
    qcm('hg_p03', 'Au Paléolithique, les humains vivent surtout…', 'de chasse, de pêche et de cueillette', ['d\'agriculture', 'de commerce', 'd\'élevage'], 'Ce sont des chasseurs-cueilleurs nomades : ils se déplacent pour suivre le gibier.'),
    qcm('hg_p04', 'Que veut dire « se sédentariser » ?', 'vivre toujours au même endroit', ['voyager sans arrêt', 'chasser des mammouths', 'inventer l\'écriture'], 'Une population sédentaire s\'installe durablement dans un village.'),
    qcm('hg_p05', 'Lucy est…', 'une australopithèque vieille d\'environ 3,2 millions d\'années', ['un Homo sapiens', 'un Romain', 'un animal disparu'], 'Lucy est un squelette d\'australopithèque découvert en Éthiopie en 1974.', 3),
    qcm('hg_p06', 'Quelle maîtrise permet de se chauffer, cuire les aliments et se protéger des animaux ?', 'celle du feu', ['celle de la roue', 'celle de l\'écriture', 'celle de la poterie'], 'Le feu est maîtrisé très tôt dans la Préhistoire.'),
    qcm('hg_p07', 'Dans quelle région de France se trouve la grotte de Lascaux ?', 'en Dordogne', ['en Bretagne', 'en Alsace', 'en Provence'], 'Les peintures de Lascaux datent d\'environ 18 000 ans.', 2)
];
const antiquite1 = [
    qcm('hg_m01', 'Quel fleuve est au cœur de la civilisation égyptienne ?', 'le Nil', ['le Rhin', 'le Tigre', 'la Seine'], 'Les crues du Nil rendaient les terres fertiles : « l\'Égypte est un don du Nil ».'),
    qcm('hg_m02', 'Quels sont les deux fleuves de la Mésopotamie ?', 'le Tigre et l\'Euphrate', ['le Nil et le Congo', 'le Rhône et la Loire', 'le Danube et le Rhin'], 'Mésopotamie signifie « entre les fleuves ».'),
    qcm('hg_m03', 'Comment s\'appelle l\'écriture inventée en Mésopotamie ?', 'l\'écriture cunéiforme', ['les hiéroglyphes', 'l\'alphabet latin', 'l\'alphabet grec'], 'Elle est gravée en forme de clous sur des tablettes d\'argile.'),
    qcm('hg_m04', 'Comment s\'appelle l\'écriture des anciens Égyptiens ?', 'les hiéroglyphes', ['le cunéiforme', 'l\'alphabet latin', 'le braille'], 'Les hiéroglyphes sont des signes dessinés.'),
    qcm('hg_m05', 'Comment s\'appelle le souverain de l\'Égypte ancienne ?', 'le pharaon', ['l\'empereur', 'le sultan', 'le consul'], 'Le pharaon est à la fois roi et considéré comme un dieu.'),
    qcm('hg_m06', 'À quoi servaient les pyramides ?', 'de tombeaux pour les pharaons', ['de temples pour les marchands', 'de greniers à blé', 'de forteresses'], 'La pyramide de Khéops a été construite vers -2500.', 2),
    match('hg_m07', 'Associe chaque mot à sa définition.', [['Pharaon', 'souverain égyptien'], ['Pyramide', 'tombeau d\'un pharaon'], ['Cunéiforme', 'écriture sur tablettes d\'argile'], ['Hiéroglyphes', 'écriture égyptienne en images']], 'Retiens ces mots : ils reviennent dans tout le chapitre sur les premiers États.', 2)
];
const grecerome = [
    qcm('hg_g01', 'Quel régime politique est inventé à Athènes ?', 'la démocratie', ['la monarchie', 'la dictature', 'l\'empire'], 'La démocratie athénienne naît vers -508.'),
    qcm('hg_g02', 'Que signifie « démocratie » ?', 'le pouvoir du peuple', ['le pouvoir d\'un seul', 'le pouvoir des riches', 'le pouvoir des armées'], 'Du grec « dêmos » (peuple) et « kratos » (pouvoir).'),
    qcm('hg_g03', 'Quelle cité grecque est célèbre pour son armée ?', 'Sparte', ['Athènes', 'Corinthe', 'Rome'], 'À Sparte, les garçons sont formés très jeunes au métier de soldat.'),
    qcm('hg_g04', 'Où avaient lieu les Jeux olympiques antiques ?', 'à Olympie', ['à Athènes', 'à Rome', 'à Sparte'], 'Les premiers Jeux datent de -776, en l\'honneur de Zeus.', 2),
    qcm('hg_g05', 'Selon la légende, qui a fondé Rome ?', 'Romulus', ['Jules César', 'Auguste', 'Zeus'], 'La légende raconte que Romulus fonde Rome en -753.'),
    qcm('hg_g06', 'Qui est le premier empereur romain ?', 'Auguste', ['Jules César', 'Romulus', 'Néron'], 'Auguste devient empereur en -27.', 2),
    qcm('hg_g07', 'Quelle langue parlaient les Romains ?', 'le latin', ['le grec', 'l\'italien', 'le français'], 'Le français vient en grande partie du latin.'),
    order('hg_g08', 'Remets ces événements dans l\'ordre chronologique.', ['Premiers Jeux olympiques (-776)', 'Fondation légendaire de Rome (-753)', 'Démocratie à Athènes (-508)', 'Auguste premier empereur (-27)'], 'Pour les dates avant J.-C., plus le nombre est grand, plus l\'événement est ancien.', 3)
];
const geo = [
    qcm('hg_geo01', 'La densité de population se mesure en…', 'habitants par km²', ['kilomètres', 'mètres par seconde', 'habitants par an'], 'Densité = nombre d\'habitants divisé par la superficie.'),
    qcm('hg_geo02', 'Une métropole est…', 'une très grande ville qui concentre population, activités et pouvoirs', ['un village de montagne', 'un port de pêche', 'une zone agricole'], 'Paris, Lyon, Marseille sont des métropoles françaises.'),
    qcm('hg_geo03', 'Le littoral est…', 'l\'espace à la limite entre la terre et la mer', ['la partie centrale d\'un continent', 'un fleuve', 'une montagne'], 'Les littoraux sont souvent très peuplés et très aménagés.'),
    tf('hg_geo04', 'Plus de la moitié de la population mondiale vit en ville.', true, 'Environ 56 % des habitants de la planète vivent en ville.', 2),
    qcm('hg_geo05', 'Combien d\'habitants compte environ la Terre ?', '8 milliards', ['800 millions', '80 milliards', '2 milliards'], 'La population mondiale a dépassé 8 milliards en 2022.'),
    qcm('hg_geo06', 'Quel continent est le plus peuplé ?', 'l\'Asie', ['l\'Afrique', 'l\'Europe', 'l\'Amérique'], 'Plus de la moitié des humains vivent en Asie.'),
    qcm('hg_geo07', 'Quel est le plus grand océan ?', 'l\'océan Pacifique', ['l\'océan Atlantique', 'l\'océan Indien', 'l\'océan Arctique'], 'Le Pacifique couvre à lui seul près d\'un tiers de la surface de la Terre.'),
    qcm('hg_geo08', 'Le développement durable consiste à…', 'répondre aux besoins d\'aujourd\'hui sans empêcher les générations futures de répondre aux leurs', ['produire le plus possible', 'ne plus utiliser aucune énergie', 'construire des grandes villes'], 'C\'est un développement qui respecte à la fois l\'économie, la société et l\'environnement.', 2)
];
const mots = [
    flash('hg_f01', 'Néolithique', 'Période où les humains deviennent agriculteurs, éleveurs et sédentaires (vers -10 000).'),
    flash('hg_f02', 'Sédentaire', 'Qui vit toujours au même endroit.'),
    flash('hg_f03', 'Pharaon', 'Roi de l\'Égypte ancienne, considéré comme un dieu.'),
    flash('hg_f04', 'Cité-État', 'Ville indépendante avec son propre gouvernement (ex : Athènes, Sparte).'),
    flash('hg_f05', 'Démocratie', 'Régime où le pouvoir appartient au peuple (« dêmos » = peuple).'),
    flash('hg_f06', 'Densité de population', 'Nombre d\'habitants par kilomètre carré.'),
    flash('hg_f07', 'Littoral', 'Zone de contact entre la terre et la mer.')
];
export const histgeoSkills = [
    { id: 'hg_prehistoire', subject: 'histgeo', label: 'Préhistoire et Néolithique', bank: prehistoire },
    { id: 'hg_antiquite1', subject: 'histgeo', label: 'Mésopotamie et Égypte', bank: antiquite1 },
    { id: 'hg_grecerome', subject: 'histgeo', label: 'Grèce et Rome', bank: grecerome },
    { id: 'hg_geo', subject: 'histgeo', label: 'Géographie : habiter la Terre', bank: geo },
    { id: 'hg_mots', subject: 'histgeo', label: 'Mots à retenir', bank: mots }
];
