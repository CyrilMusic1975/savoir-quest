// Histoire-géographie de 6e d'après les cours déposés (sources, CANDI, repères spatiaux, repères dans le temps).
import { shuffle, pick, randInt, qcm, tf, match } from './helpers.js';

// ---------- Chiffres romains ----------
const ROMAN_MAP = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export function toRoman(n) {
    let s = '';
    for (const [v, r] of ROMAN_MAP) while (n >= v) { s += r; n -= v; }
    return s;
}
export function fromRoman(str) {
    const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < str.length; i++) {
        const v = val[str[i]], next = val[str[i + 1]] || 0;
        total += v < next ? -v : v;
    }
    return total;
}
const centuryLabel = c => (c === 1 ? 'Ier siècle' : `${toRoman(c)}e siècle`);

function mc(text, answer, wrongs, explanation, extra = {}) {
    const uniq = [...new Set(wrongs)].filter(w => w !== answer).slice(0, 3);
    return { kind: 'qcm', text, answer, options: shuffle([answer, ...uniq]), explanation, ...extra };
}

export function generateRomanQuestion() {
    const n = randInt(1, 39);
    const r = toRoman(n);
    const subtractive = /IV|IX|XL/.test(r);
    const facet = subtractive ? 'avec soustraction (IV, IX, XL)' : 'sans soustraction';
    const mode = randInt(0, 2);
    if (mode === 0) {
        return {
            kind: 'input', numeric: true, accept: [String(n)], answer: String(n), facet,
            text: `Écris ${r} en chiffres arabes.`,
            explanation: `${r} = ${n}. Quand un chiffre plus petit est devant un plus grand, on le soustrait : IV = 5 − 1 = 4, IX = 10 − 1 = 9.`
        };
    }
    if (mode === 1) {
        return {
            kind: 'input', accept: [r], answer: r, facet,
            text: `Écris ${n} en chiffres romains.`,
            explanation: `${n} = ${r}. I = 1, V = 5, X = 10. On ne répète pas plus de 3 fois le même chiffre : 4 s'écrit IV (et non IIII), 9 s'écrit IX.`
        };
    }
    const reversed = r.split('').reverse().join('');
    const wrongs = [fromRoman(reversed), n + 1, n - 1, n + 10, n + 5].filter(x => x > 0 && x !== n).map(String);
    return mc(`Quel nombre représente ${r} ?`, String(n), wrongs, `${r} = ${n}. Attention à l'ordre : IV = 4 mais VI = 6 ; IX = 9 mais XI = 11.`, { facet });
}

export function generateCenturyQuestion() {
    const mode = randInt(0, 2);
    if (mode === 0) {
        const year = Math.random() < 0.3 ? randInt(2, 20) * 100 : randInt(101, 2025);
        const c = Math.ceil(year / 100);
        return mc(`En quel siècle se situe l'année ${year} ?`, centuryLabel(c), [centuryLabel(c - 1 || 2), centuryLabel(c + 1), centuryLabel(c + 2), centuryLabel(c + 3)],
            `Le 1er siècle va de l'an 1 à l'an 100, le 2e de 101 à 200… L'année ${year} est dans le ${centuryLabel(c)} (${(c - 1) * 100 + 1} à ${c * 100}).${year % 100 === 0 ? ' Une année « ronde » est la dernière du siècle, pas la première du suivant.' : ''}`,
            { facet: year % 100 === 0 ? 'année ronde' : 'ap. J.-C.' });
    }
    if (mode === 1) {
        const year = randInt(1, 15) * 100 - randInt(0, 99);
        const c = Math.ceil(year / 100);
        const lab = k => (k === 1 ? 'Ier siècle avant J.-C.' : `${toRoman(k)}e siècle avant J.-C.`);
        return mc(`En quel siècle se situe l'année ${year} avant J.-C. ?`, lab(c), [lab(c + 1), lab(c - 1 || 3), lab(c + 2), lab(c + 3)],
            `Avant J.-C., on compte à l'envers : ${year} av. J.-C. est dans le ${lab(c)} (de ${c * 100} à ${(c - 1) * 100 + 1} av. J.-C.).`, { facet: 'av. J.-C.' });
    }
    const c = randInt(2, 21);
    const good = `de ${(c - 1) * 100 + 1} à ${c * 100}`;
    return mc(`Le ${centuryLabel(c)} correspond aux années…`, good, [`de ${(c - 1) * 100} à ${c * 100 - 1}`, `de ${c * 100} à ${c * 100 + 99}`, `de ${c * 100 + 1} à ${(c + 1) * 100}`],
        `Le ${centuryLabel(c)} commence en l'an ${(c - 1) * 100 + 1} et se termine en l'an ${c * 100}.`, { facet: 'siècle → années' });
}

const EVENTS = [
    { label: 'Domestication du feu', year: -500000, show: 'vers 500 000 av. J.-C.' },
    { label: 'Débuts de l\'agriculture en Europe', year: -6000, show: 'vers 6 000 av. J.-C.' },
    { label: 'Débuts de l\'écriture', year: -3500, show: '3 500 av. J.-C.' },
    { label: 'Premiers Jeux olympiques', year: -776, show: '776 av. J.-C.' },
    { label: 'Mort de Jules César', year: -44, show: '44 av. J.-C.' },
    { label: 'Fin de l\'Empire romain d\'Occident', year: 476, show: '476' }
];
export function generateTimelineQuestion() {
    const picked = shuffle(EVENTS).slice(0, 4).sort((a, b) => a.year - b.year);
    const items = picked.map(e => `${e.label} (${e.show})`);
    return {
        kind: 'order', items, answer: items.join(' → '), facet: 'av. J.-C.',
        text: 'Remets ces événements dans l\'ordre chronologique (du plus ancien au plus récent).',
        explanation: 'Avant J.-C., plus le nombre est grand, plus l\'événement est ancien : 776 av. J.-C. est plus ancien que 44 av. J.-C. Après J.-C., c\'est l\'inverse.'
    };
}

// ---------- Banques ----------
const sources = [
    match('hg_so01', 'Associe chaque type de source à un exemple.', [['Source iconographique', 'photographie, affiche, caricature'], ['Source matérielle', 'outil, ossement, bâtiment, épave'], ['Source cartographique', 'carte, croquis, plan'], ['Source écrite', 'loi, lettre, roman, article de journal'], ['Source orale ou sonore', 'témoignage, discours enregistré']], 'Cinq types de sources : iconographiques (images), matérielles (objets et traces), cartographiques, écrites, orales ou sonores.', 2),
    qcm('hg_so02', 'Un archéologue étudie…', 'toutes les périodes de l\'Histoire, à l\'aide des sources matérielles', ['seulement la Préhistoire', 'uniquement des textes anciens', 'les témoignages oraux'], 'Un archéologue étudie toutes les périodes de l\'Histoire. Un navire coulé pendant la Seconde Guerre mondiale est donc un objet archéologique.', 2),
    qcm('hg_so03', 'Un navire coulé pendant la Seconde Guerre mondiale est…', 'un objet archéologique (une source matérielle)', ['une source écrite', 'une source orale', 'une carte'], 'Les épaves de navires font partie des sources matérielles étudiées en archéologie.', 3),
    qcm('hg_so04', 'Une source directe est un document…', 'qui date de l\'époque étudiée ou a été produit peu après', ['qui a été produit bien après l\'événement', 'qui ne contient que des images', 'qui est toujours écrit'], 'Source directe : de l\'époque étudiée (ou juste après). Source indirecte : produite bien après.'),
    qcm('hg_so05', 'Un sesterce romain en bronze à l\'effigie de Jules César (44 av. J.-C.) est…', 'une source matérielle directe', ['une source écrite indirecte', 'une source iconographique indirecte', 'une source orale directe'], 'C\'est un objet (une pièce) de l\'époque de César : source matérielle directe.', 3),
    qcm('hg_so06', 'Une vignette d\'Astérix (1968) montrant Vercingétorix aux pieds de César est…', 'une source iconographique indirecte', ['une source matérielle directe', 'une source écrite directe', 'une source cartographique'], 'C\'est une image (iconographique) dessinée près de 2 000 ans après les faits : source indirecte.', 3),
    qcm('hg_so07', 'Une photographie ancienne est une source…', 'iconographique', ['écrite', 'cartographique', 'orale'], 'Les sources iconographiques sont les images : photographies, films, caricatures, œuvres d\'art, affiches.'),
    qcm('hg_so08', 'Le témoignage enregistré d\'un habitant est une source…', 'orale ou sonore', ['écrite', 'matérielle', 'iconographique'], 'Les sources orales ou sonores : témoignages, entretiens, discours enregistrés.'),
    qcm('hg_so09', 'Une carte ou un plan est une source…', 'cartographique', ['écrite', 'matérielle', 'orale'], 'Les sources cartographiques : cartes, croquis et plans.'),
    qcm('hg_so10', 'Une lettre ou un roman est une source…', 'écrite', ['orale', 'matérielle', 'cartographique'], 'Les sources écrites : lois, discours politiques, lettres, mémoires, romans, nouvelles, poèmes, articles de journaux.')
];

const candi = [
    qcm('hg_ca01', 'Que signifie CANDI pour analyser un document ?', 'Contexte, Auteur, Nature, Destinataire, Idée', ['Carte, Auteur, Numéro, Date, Image', 'Contexte, Année, Nom, Date, Idée', 'Conclusion, Auteur, Nature, Date, Image'], 'La fiche d\'identité d\'un document comporte cinq éléments, qu\'on retient avec le mot CANDI.'),
    match('hg_ca02', 'Associe chaque lettre de CANDI à sa question.', [['Contexte', 'Que se passe-t-il d\'important à cette date ?'], ['Auteur', 'Qui a produit le document ?'], ['Nature', 'Est-ce un roman, une carte, une caricature, un discours… ?'], ['Destinataire', 'À qui s\'adresse le document ?'], ['Idée', 'Quel est le message principal ?']], 'C pour Contexte, A pour Auteur, N pour Nature, D pour Destinataire, I pour Idée.', 2),
    qcm('hg_ca03', 'Quelle est la « nature » d\'un document ?', 'Son type : roman, texte politique, caricature, carte, graphique…', ['Le nom de son auteur', 'Sa date', 'Le public visé'], 'La nature répond à : un extrait de roman ? Un texte politique ? Un discours ? Une carte ?'),
    qcm('hg_ca04', 'Le destinataire d\'un document, c\'est…', 'le public visé : à qui il s\'adresse', ['celui qui l\'a écrit', 'l\'événement dont il parle', 'sa date de création'], 'Le destinataire n\'est pas toujours indiqué : il faut parfois le deviner.'),
    qcm('hg_ca05', 'Où trouve-t-on d\'où est tiré un document (la source) ?', 'En bas du document, en italique lorsqu\'il s\'agit d\'un texte', ['Au milieu de la page', 'Dans le titre du chapitre', 'On ne la trouve jamais'], 'La source est indiquée en bas, en italique quand c\'est un texte.', 2),
    qcm('hg_ca06', 'En histoire, que faut-il savoir sur l\'auteur d\'un document ?', 'Qui il est, en utilisant sa biographie, et si le document est récent', ['Seulement son âge', 'Sa couleur préférée', 'Rien, ce n\'est pas important'], 'En histoire, l\'auteur doit être présenté rapidement s\'il est connu, en utilisant sa biographie.', 3)
];

const espace = [
    qcm('hg_es01', 'Où est toujours le nord sur une carte ?', 'En haut', ['En bas', 'À gauche', 'À droite'], 'Le nord est toujours en haut : sur une carte, on trouve toujours au moins l\'indication du nord.'),
    qcm('hg_es02', 'Avec le mot ORANGE, où se trouve l\'ouest ?', 'À gauche (la lettre O)', ['À droite (la lettre E)', 'En haut', 'En bas'], 'ORANGE : le O de ouest est à gauche, le E de est est à droite.'),
    qcm('hg_es03', 'Avec le mot ORANGE, où se trouve l\'est ?', 'À droite (la lettre E)', ['À gauche (la lettre O)', 'En haut', 'En bas'], 'Le E de « orangE » est à droite : c\'est l\'est.'),
    match('hg_es04', 'Associe chaque abréviation à son point cardinal.', [['NO', 'nord-ouest'], ['NE', 'nord-est'], ['SO', 'sud-ouest'], ['SE', 'sud-est']], 'Les points cardinaux : nord, sud, est, ouest et leurs combinaisons.', 2),
    qcm('hg_es05', 'Quelle ligne imaginaire coupe le globe en deux hémisphères (nord et sud) ?', 'L\'équateur', ['Le méridien de Greenwich', 'Le tropique du Cancer', 'Le cercle polaire arctique'], 'L\'équateur est le parallèle qui coupe le globe en hémisphère nord et hémisphère sud.'),
    qcm('hg_es06', 'Les parallèles sont des lignes imaginaires…', 'horizontales', ['verticales', 'obliques', 'en spirale'], 'Les parallèles découpent le globe en tranches horizontales.'),
    qcm('hg_es07', 'Les méridiens sont des lignes imaginaires…', 'verticales, comme des quartiers d\'orange', ['horizontales', 'qui n\'existent que sur les cartes anciennes', 'qui séparent les océans'], 'Les méridiens découpent le globe en quartiers d\'orange.'),
    qcm('hg_es08', 'Quel est le méridien d\'origine ?', 'Le méridien de Greenwich', ['L\'équateur', 'Le tropique du Capricorne', 'Le cercle polaire antarctique'], 'Le méridien d\'origine est le méridien de Greenwich.'),
    qcm('hg_es09', 'Quel tropique est dans l\'hémisphère nord ?', 'Le tropique du Cancer', ['Le tropique du Capricorne', 'L\'équateur', 'Le cercle polaire antarctique'], 'Cancer : hémisphère nord. Capricorne : hémisphère sud.', 2),
    qcm('hg_es10', 'Comment retrouver la place du tropique du Capricorne et du cercle polaire antarctique ?', 'Leurs noms ont plus de lettres : ils sont « plus lourds » et tombent en bas du globe', ['Ils sont toujours en haut', 'Ils passent par Greenwich', 'Ils sont au milieu du globe'], 'Capricorne et antarctique sont des mots plus longs : ils « tombent » dans l\'hémisphère sud.', 3),
    qcm('hg_es11', 'Quelle ligne imaginaire se trouve tout en haut du globe, près du pôle Nord ?', 'Le cercle polaire arctique', ['Le cercle polaire antarctique', 'L\'équateur', 'Le tropique du Capricorne'], 'Le cercle polaire arctique est près du pôle Nord, l\'antarctique près du pôle Sud.', 2)
];

const temps = [
    qcm('hg_te01', 'Un siècle dure…', '100 ans', ['10 ans', '1 000 ans', '50 ans'], 'Un siècle = 100 ans. Un millénaire = 1 000 ans.'),
    qcm('hg_te02', 'Un millénaire dure…', '1 000 ans', ['100 ans', '10 000 ans', '500 ans'], 'Un millénaire = 1 000 ans = 10 siècles.'),
    qcm('hg_te03', 'Quel est le point de repère de la frise chronologique ?', 'La naissance supposée de Jésus-Christ', ['La fondation de Rome', 'Le début de l\'écriture', 'La première année de la Préhistoire'], 'On compte les années avant J.-C. et après J.-C. à partir de la naissance supposée de Jésus-Christ.'),
    qcm('hg_te04', 'Le 1er siècle après J.-C. va de l\'an…', '1 à 100', ['0 à 99', '100 à 200', '1 à 1 000'], 'Le 1er siècle va de l\'an 1 à l\'an 100 : il se termine en l\'an 100.'),
    qcm('hg_te05', 'Le 1er siècle avant J.-C. va de l\'an…', '100 av. J.-C. à 1 av. J.-C.', ['1 à 100 après J.-C.', '0 à 100 av. J.-C.', '100 à 200 av. J.-C.'], 'Avant J.-C., on compte à l\'envers : de 100 av. J.-C. à 1 av. J.-C.', 3),
    qcm('hg_te06', 'Une frise chronologique se lit…', 'de gauche à droite, du plus ancien au plus récent', ['de droite à gauche', 'de haut en bas uniquement', 'dans n\'importe quel sens'], 'Plus on va vers la droite, plus on se rapproche du présent.'),
    qcm('hg_te07', 'Parmi 44 av. J.-C., 776 av. J.-C. et 476 après J.-C., lequel est le plus ancien ?', '776 av. J.-C.', ['44 av. J.-C.', '476 après J.-C.', 'Ils sont de la même époque'], 'Avant J.-C., plus le nombre est grand, plus c\'est ancien. 776 av. J.-C. est donc le plus ancien.', 2),
    qcm('hg_te08', 'Les premiers Jeux olympiques (776 av. J.-C.) ont eu lieu…', 'avant la fondation de Rome (753 av. J.-C.)', ['après la fondation de Rome', 'en même temps que la mort de César', 'après la fin de l\'Empire romain'], '776 av. J.-C. est plus ancien que 753 av. J.-C. : les Jeux ont eu lieu avant la fondation de Rome.', 3),
    tf('hg_te09', 'La destruction de Jérusalem (587 av. J.-C.) a eu lieu au 6e siècle avant J.-C.', true, '587 est entre 501 et 600 : c\'est bien le 6e siècle avant J.-C.', 3),
    tf('hg_te10', 'Le 2e siècle après J.-C. est le siècle de la « paix romaine ».', true, 'Sur la frise, la « paix romaine » correspond au IIe siècle après J.-C.', 2),
    tf('hg_te11', 'L\'écriture de la Bible a duré près de 7 millénaires.', false, 'Elle s\'est étalée du VIIIe au IIe siècle avant J.-C. : environ 7 siècles, pas 7 millénaires.', 3),
    qcm('hg_te12', 'Que veut dire « avant J.-C. » ?', 'Avant la naissance supposée de Jésus-Christ', ['Après la naissance supposée de Jésus-Christ', 'Pendant la Préhistoire uniquement', 'Avant l\'invention de l\'écriture'], 'On écrit « av. J.-C. » pour les années avant le point de repère de la frise.')
];

export const histgeo6eSkills = [
    { id: 'hg_sources', label: 'Les types de sources', bank: sources },
    { id: 'hg_candi', label: 'Analyser un document : CANDI', bank: candi },
    { id: 'hg_espace', label: 'Repères spatiaux : points cardinaux et lignes du globe', bank: espace },
    { id: 'hg_temps', label: 'Se repérer dans le temps', bank: temps },
    { id: 'hg_romains', label: 'Chiffres romains', gen: generateRomanQuestion },
    { id: 'hg_siecles', label: 'Siècles et années', gen: generateCenturyQuestion },
    { id: 'hg_frise', label: 'Ranger des événements (frise)', gen: generateTimelineQuestion }
].map(s => ({ ...s, subject: 'histgeo' }));
