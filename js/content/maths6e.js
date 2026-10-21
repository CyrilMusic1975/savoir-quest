// Maths de 6e d'après les fiches du cours : géométrie (chapitre II) et nombres décimaux (chapitre III).
import { shuffle, pick, randInt, qcm, tf, match, input } from './helpers.js';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
const pickLetters = n => shuffle(LETTERS).slice(0, n);
const num = s => parseFloat(String(s).replace(',', '.'));

// Question à choix multiple générée (les mauvaises réponses sont dédoublonnées, il en faut 3)
function mc(text, answer, wrongs, explanation, extra = {}) {
    const uniq = [...new Set(wrongs)].filter(w => w !== answer).slice(0, 3);
    return { kind: 'qcm', text, answer, options: shuffle([answer, ...uniq]), explanation, ...extra };
}
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const randDigits = (len, lastNonZero = true) => {
    const d = Array.from({ length: len }, () => randInt(0, 9));
    if (lastNonZero) d[len - 1] = randInt(1, 9);
    return d;
};

// ===================== Nombres décimaux =====================

// Réécrire sans les zéros facultatifs (fiche 6) : 09,080 -> 9,08
export function generateOptionalZerosQuestion() {
    const ipLen = randInt(1, 3);
    const ip = ipLen === 1 ? String(randInt(0, 9)) : String(randInt(10 ** (ipLen - 1), 10 ** ipLen - 1));
    const dl = randInt(1, 3);
    const digs = randDigits(dl);
    if (dl >= 2 && Math.random() < 0.6) digs[0] = 0; // zéro « intérieur » à conserver (9,08)
    const dec = digs.join('');
    const canonical = `${ip},${dec}`;
    const lead = '0'.repeat(randInt(1, 2));
    const trail = '0'.repeat(randInt(1, 2));
    const wrongs = [
        `${lead}${ip},${dec}`, // zéros de gauche gardés
        `${ip},${dec}${trail}`, // zéros de droite gardés
        `${ip.replace(/0/g, '') || '0'},${dec.replace(/0/g, '')}`, // tous les zéros supprimés
        `${ip}${dec}`, // virgule oubliée
        `${lead}${lead}${ip},${dec}`
    ];
    const hasInterior = dec.includes('0') || ip.replace(/0/g, '') !== ip;
    return mc(`Réécris sans les zéros facultatifs : ${lead}${ip},${dec}${trail}`, canonical, wrongs,
        `Les zéros facultatifs sont à gauche dans la partie entière (sauf celui des unités) et à droite dans la partie décimale. ${hasInterior ? 'Les zéros qui sont entre deux autres chiffres, eux, ne sont jamais facultatifs. ' : ''}On obtient ${canonical}.`);
}

// Compléter par = ou ≠ (fiche 6)
export function generateEqualityQuestion() {
    for (let guard = 0; guard < 50; guard++) {
        const ip = String(randInt(1, 99));
        const dl = randInt(1, 2);
        const dec = randDigits(dl).join('');
        const a = `${ip},${dec}`;
        const same = Math.random() < 0.5;
        const candidates = same
            ? [`0${ip},${dec}`, `${ip},${dec}0`, `${ip},${dec}00`, `00${ip},${dec}0`]
            : [`${ip},0${dec}`, `${ip}${dec[0]},${dec.slice(1) || '0'}`, `${ip}0,${dec}`, `${ip},${dec.split('').reverse().join('')}`];
        const b = pick(candidates);
        if ((num(a) === num(b)) !== same) continue;
        const [left, right] = Math.random() < 0.5 ? [a, b] : [b, a];
        return {
            kind: 'qcm', fixedOrder: true, text: `Complète : ${left} … ${right}`, options: ['=', '≠'], answer: same ? '=' : '≠',
            explanation: same
                ? `Ajouter ou enlever des zéros facultatifs ne change pas le nombre : ${left} = ${right}.`
                : `Ce ne sont pas les mêmes nombres : ${left} ≠ ${right}. Seuls les zéros à gauche de la partie entière (sauf celui des unités) et à droite de la partie décimale sont facultatifs.`
        };
    }
}

// Partie entière / partie décimale (fiche 5)
export function generatePartsQuestion() {
    const ip = randInt(0, 3) === 0 ? 0 : randInt(1, 999);
    const dec = randDigits(randInt(1, 3)).join('');
    const nb = `${ip},${dec}`;
    const mode = randInt(0, 3);
    if (mode === 0) {
        return mc(`Quelle est la partie entière de ${nb} ?`, String(ip), [String(Number(dec)), `0,${dec}`, String(ip + 1), nb, String(ip + 10), "il n'y en a pas"],
            `La partie entière est ce qui est avant la virgule : ${ip}. La partie décimale est ce qui reste : 0,${dec}.`);
    }
    if (mode === 1) {
        return mc(`Quelle est la partie décimale de ${nb} ?`, `0,${dec}`, [String(Number(dec)), String(ip), `0,0${dec}`, nb, String(ip + 1)],
            `La partie décimale n'est pas « ${dec} » : c'est un nombre plus petit que 1, ici 0,${dec} (${dec} ${['', 'dixièmes', 'centièmes', 'millièmes'][dec.length]}).`);
    }
    if (mode === 2) {
        const last = ip % 10;
        const lessIp = Math.floor(ip / 10);
        return mc(`Décompose ${nb} en partie entière + partie décimale.`, `${ip} + 0,${dec}`,
            [`${ip} + ${Number(dec)}`, `${lessIp} + ${last},${dec}`, `${ip} + 0,0${dec}`, `${ip}0 + 0,${dec}`],
            `${nb} = ${ip} (partie entière) + 0,${dec} (partie décimale).`);
    }
    const isInt = Math.random() < 0.2;
    const arg = isInt ? String(ip) : nb;
    return {
        kind: 'input', numeric: true, accept: [String(ip)], answer: String(ip),
        text: `E(${arg}) désigne la partie entière de ${arg}. Combien vaut E(${arg}) ?`,
        explanation: isInt ? `${ip} n'a pas de partie décimale : E(${ip}) = ${ip}.` : `La partie entière de ${nb} est ${ip} : E(${nb}) = ${ip}. Attention : E(0,91) = 0, pas 0,91.`
    };
}

// Construire un nombre à partir des « paquets » (fiche 2A) : 3 unités, 0 dixièmes, 1 centième -> 3,01
export function generatePacketsQuestion() {
    const withTens = Math.random() < 0.5;
    const tens = withTens ? randInt(1, 9) : 0;
    const units = randInt(0, 9);
    const tenths = randInt(0, 9);
    const hundredths = randInt(1, 9);
    const ip = String(tens * 10 + units);
    const answer = `${ip},${tenths}${hundredths}`;
    const parts = [];
    if (withTens) parts.push(plural(tens, 'dizaine'));
    parts.push(plural(units, 'unité'), plural(tenths, 'dixième'), plural(hundredths, 'centième'));
    const text = `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]} : quel est ce nombre ?`;
    const wrongs = [
        `${ip},${hundredths}${tenths}`, // dixièmes et centièmes échangés
        tenths === 0 ? `${ip},${hundredths}` : `${ip}${tenths},${hundredths}`, // zéro oublié / virgule décalée
        withTens ? (units === 0 ? `${tens},${tenths}${hundredths}` : `${units * 10 + tens},${tenths}${hundredths}`) : `${ip},0${tenths}${hundredths}`,
        `${ip},0${tenths}${hundredths}`,
        `${ip},${tenths}0${hundredths}`, // zéro mal placé
        `${ip}${tenths}${hundredths}` // virgule oubliée
    ].filter(w => num(w) !== num(answer));
    return mc(text, answer, wrongs,
        `Chaque paquet va à son rang : ${withTens ? 'dizaines, ' : ''}unités, puis la virgule, puis dixièmes, centièmes. Un rang vide s'écrit 0. Ici : ${answer}.`);
}

// Fraction décimale <-> nombre décimal (fiche 4)
export function generateFractionDecimalQuestion() {
    const den = pick([10, 100, 1000]);
    const decLen = String(den).length - 1;
    let n;
    do { n = randInt(1, den - 1); } while (n % 10 === 0 && den > 10);
    const ans = (n / den).toFixed(decLen).replace('.', ',');
    const clean = ans.replace(/0+$/, '');
    if (Math.random() < 0.55) {
        return {
            kind: 'input', numeric: true, accept: [ans, clean], answer: clean, facet: `x/${den}`,
            text: `Écris ${n}/${den} sous la forme d'un nombre décimal.`,
            explanation: `${n}/${den} : le dénominateur ${den} indique le rang ${['', 'des dixièmes', 'des centièmes', 'des millièmes'][decLen]}. Donc ${n}/${den} = ${ans} (jamais ${n},0 !).`
        };
    }
    const wrongs = [`${n}/${den * 10}`, `${n}/${Math.max(10, den / 10)}`, `${n * 10}/${den}`, `${n}/${den * 100}`]
        .filter(w => { const [a, b] = w.split('/').map(Number); return a / b !== n / den; });
    return mc(`Écris ${ans} sous la forme d'une fraction décimale.`, `${n}/${den}`, wrongs,
        `${ans} a ${decLen} chiffre${decLen > 1 ? 's' : ''} après la virgule : on met ${n} sur ${den}.`, { facet: `x/${den}` });
}

// ===================== Géométrie =====================

const ENV = { line: 'droite', ray: 'demi-droite', segment: 'segment' };
const notation = (type, a, b) => (type === 'line' ? `(${a}${b})` : type === 'ray' ? `[${a}${b})` : `[${a}${b}]`);
const phrase = (type, a, b) => (type === 'line'
    ? `la droite passant par ${a} et ${b}`
    : type === 'ray' ? `la demi-droite d'origine ${a} passant par ${b}` : `le segment d'extrémités ${a} et ${b}`);
const GEO_RULE = 'Le crochet « [ » coupe la figure (comme des ciseaux), la parenthèse « ( » la laisse continuer. Droite (AB) : ni l\'un ni l\'autre. Demi-droite [AB) : coupée en A seulement. Segment [AB] : coupé en A et en B.';

function geoPoints(n) {
    const letters = pickLetters(n);
    const xs = [0.18, 0.4, 0.62, 0.84].slice(0, n);
    return letters.map((l, i) => ({ l, x: xs[i] }));
}

// Figure <-> notation <-> phrase (fiches 2, 3A, 3B)
export function generateGeoNotationQuestion() {
    const type = pick(['line', 'ray', 'segment']);
    const mode = randInt(0, 2);
    const [a, b] = pickLetters(2);
    const wrongsFor = t => ({
        line: [`[${a}${b})`, `[${a}${b}]`, `[${b}${a})`],
        ray: [`[${b}${a})`, `(${a}${b})`, `[${a}${b}]`],
        segment: [`(${a}${b})`, `[${a}${b})`, `[${b}${a})`]
    }[t]);
    if (mode === 0) {
        const flip = Math.random() < 0.5;
        const pts = flip ? [{ l: a, x: 0.7 }, { l: b, x: 0.3 }] : [{ l: a, x: 0.3 }, { l: b, x: 0.7 }];
        return mc('Quelle est la notation de la figure tracée en bleu ?', notation(type, a, b), wrongsFor(type), GEO_RULE,
            { visual: { type: 'geo', points: pts, obj: { type, from: a, to: b } }, facet: ENV[type] });
    }
    if (mode === 1) {
        const names = { line: `la droite passant par ${a} et ${b}`, ray: `la demi-droite d'origine ${a} passant par ${b}`, segment: `le segment d'extrémités ${a} et ${b}` };
        const wrongNames = Object.entries(names).filter(([t]) => t !== type).map(([, v]) => v);
        wrongNames.push(type === 'ray' ? `la demi-droite d'origine ${b} passant par ${a}` : `la demi-droite d'origine ${b} passant par ${a}`);
        return mc(`Que désigne ${notation(type, a, b)} ?`, names[type], wrongNames, GEO_RULE, { facet: ENV[type] });
    }
    return mc(`Comment note-t-on ${phrase(type, a, b)} ?`, notation(type, a, b), wrongsFor(type), GEO_RULE, { facet: ENV[type] });
}

// Appartenance : B ∈ [AC] ? (fiche 4)
export function generateGeoBelongQuestion() {
    const type = pick(['segment', 'segment', 'ray', 'line']);
    const pts = geoPoints(4);
    const L = pts.map(p => p.l);
    let objFrom, objTo, testIdx, off = null;
    let inside;
    if (type === 'segment') {
        const i = randInt(0, 2), j = randInt(i + 1, 3);
        [objFrom, objTo] = Math.random() < 0.5 ? [i, j] : [j, i];
        testIdx = randInt(0, 3);
        inside = testIdx >= i && testIdx <= j;
    } else if (type === 'ray') {
        const i = randInt(0, 3);
        const toRight = i < 3 && (i === 0 || Math.random() < 0.5);
        objFrom = i;
        objTo = toRight ? randInt(i + 1, 3) : randInt(0, i - 1);
        testIdx = randInt(0, 3);
        inside = toRight ? testIdx >= i : testIdx <= i;
    } else {
        objFrom = randInt(0, 2); objTo = randInt(objFrom + 1, 3);
        testIdx = randInt(0, 3); inside = true;
    }
    let testLabel = L[testIdx];
    if (type === 'line' && Math.random() < 0.6) {
        const [n] = pickLetters(5).filter(l => !L.includes(l));
        off = { l: n, x: pts[randInt(0, 3)].x };
        testLabel = n; inside = false;
    }
    const obj = { type, from: L[objFrom], to: L[objTo] };
    const sym = inside ? '∈' : '∉';
    const reason = type === 'segment'
        ? 'Un point appartient au segment s\'il est entre ses deux extrémités (extrémités comprises).'
        : type === 'ray' ? 'Une demi-droite commence à son origine et continue à l\'infini dans un seul sens : un point placé avant l\'origine n\'en fait pas partie.'
            : 'Un point appartient à la droite s\'il est posé dessus ; un point à côté de la droite n\'en fait pas partie.';
    return {
        kind: 'qcm', fixedOrder: true, options: ['∈', '∉'], answer: sym, facet: ENV[type],
        text: `Complète : ${testLabel} … ${notation(type, obj.from, obj.to)}`,
        visual: { type: 'geo', points: pts, obj, off },
        explanation: `${reason} Ici ${testLabel} ${inside ? 'appartient' : "n'appartient pas"} à ${notation(type, obj.from, obj.to)} : ${testLabel} ${sym} ${notation(type, obj.from, obj.to)}.`
    };
}

// Nombre de noms d'une droite (fiche 3B, exercice 6)
export function generateGeoNamesQuestion() {
    const n = randInt(2, 5);
    const pts = geoPoints(Math.min(n, 4));
    if (n === 5) pts.push({ l: pickLetters(9).find(l => !pts.some(p => p.l === l)), x: 0.96 });
    const names = n * (n - 1);
    return {
        kind: 'input', numeric: true, accept: [String(names)], answer: String(names),
        text: `${n} points sont placés sur une droite. Combien de noms différents permettent de désigner cette droite ? (Par exemple (${pts[0].l}${pts[1].l}) et (${pts[1].l}${pts[0].l}) comptent pour 2.)`,
        visual: { type: 'geo', points: pts, obj: { type: 'line', from: pts[0].l, to: pts[1].l } },
        explanation: `On choisit un premier point (${n} choix) puis un deuxième, différent (${n - 1} choix) : ${n} × ${n - 1} = ${names} noms.`
    };
}

// ===================== Questions de cours (banques) =====================

const decDef = [
    qcm('dec_d01', 'Un nombre décimal est un nombre dont la partie décimale…', "s'arrête au bout d'un moment", ['ne s\'arrête jamais', 'vaut toujours 0', 'est toujours plus grande que 1'], "Un nombre décimal a une partie décimale qui « s'arrête » (0,13 ; 5,1 ; 18,48)."),
    qcm('dec_d02', 'Un nombre entier est un nombre dont la partie décimale…', 'vaut 0', ["s'arrête au bout de trois chiffres", 'ne s\'arrête jamais', 'vaut 1'], "Un nombre entier est un nombre décimal particulier : sa partie décimale « s'arrête » tout de suite, elle vaut 0 (5 = 5,0)."),
    tf('dec_d03', '5 et 5,0 sont deux écritures du même nombre.', true, 'Le zéro à droite de la partie décimale est un zéro facultatif : 5 = 5,0 = 5,00.'),
    tf('dec_d04', '6,66 et 6,66… sont deux écritures du même nombre.', false, '6,66… a une infinité de 6 après la virgule : ce n\'est pas le même nombre que 6,66.', 2),
    tf('dec_d05', 'Tous les nombres entiers sont des nombres décimaux.', true, 'Un nombre entier est un cas particulier de nombre décimal (sa partie décimale vaut 0).'),
    tf('dec_d06', 'Tous les nombres décimaux sont des nombres entiers.', false, '0,13 est décimal mais n\'est pas entier : sa partie décimale ne vaut pas 0.'),
    tf('dec_d07', 'L\'ensemble des nombres entiers est inclus dans l\'ensemble des nombres décimaux.', true, 'Les entiers sont des décimaux particuliers : ils sont « à l\'intérieur » de l\'ensemble des décimaux.', 2),
    tf('dec_d08', 'L\'ensemble des nombres décimaux est inclus dans l\'ensemble des nombres entiers.', false, 'C\'est l\'inverse : tout entier est décimal, mais 0,5 est décimal sans être entier.', 2),
    qcm('dec_d09', 'Lequel de ces nombres n\'est pas un nombre décimal ?', '0,333…', ['0,333', '5,1', '18,48'], 'Dans 0,333… les 3 se répètent sans jamais s\'arrêter : la partie décimale ne s\'arrête pas.', 2),
    qcm('dec_d10', 'La calculatrice affiche 100 ÷ 3 = 33,333333… Le résultat est-il un nombre décimal ?', 'Non : les 3 ne s\'arrêtent jamais', ['Oui, car il y a une virgule', 'Oui, car il s\'écrit avec des chiffres', 'Non, car c\'est un nombre entier'], 'Avoir une virgule ne suffit pas : une écriture décimale doit « s\'arrêter ». 33,333… ne s\'arrête jamais.', 3),
    qcm('dec_d11', '7/10 est-il un nombre décimal ?', 'Oui, c\'est 0,7', ['Non, c\'est une fraction', 'Non, car 7 ÷ 10 ne s\'arrête pas', 'Oui, c\'est 7,10'], 'Une fraction décimale (dénominateur 10, 100, 1000…) est un nombre décimal : 7/10 = 0,7.', 2),
    qcm('dec_d12', '10/7 est-il un nombre décimal ?', 'Non : 10 ÷ 7 = 1,428571… ne s\'arrête jamais', ['Oui, c\'est 1,4', 'Oui, c\'est 10,7', 'Oui, c\'est 1,43'], 'Quand on divise 10 par 7, la partie décimale ne s\'arrête jamais : ce n\'est pas un nombre décimal.', 3)
];

const decZerosCours = [
    qcm('dec_z01', 'Où se trouvent les zéros facultatifs d\'un nombre décimal ?', 'À gauche dans la partie entière (sauf celui des unités) et à droite dans la partie décimale', ['Partout dans le nombre', 'Seulement à gauche de la virgule', 'Entre la virgule et le premier chiffre'], 'Dans 003 570,020 : les zéros de gauche (sauf celui des unités) et celui de droite sont facultatifs. Le zéro entre deux chiffres ne l\'est jamais.'),
    qcm('dec_z02', 'Marco affirme que 9,5 € correspond à 9 euros et 5 centimes. Qu\'en penses-tu ?', 'C\'est faux : 9,5 € = 9,50 € = 9 euros et 50 centimes', ['C\'est vrai', 'C\'est faux : 9,5 € = 9 euros et 500 centimes', 'C\'est faux : 9,5 € = 95 centimes'], 'Un euro = 100 centimes. 9,5 est égal à 9,50 : le dernier zéro est facultatif. Donc 9,5 € = 9 euros et 50 centimes.', 2),
    qcm('dec_z03', 'Que vaut 0 000,000 une fois les zéros facultatifs enlevés ?', '0', ['0,000', '0000', 'Il n\'y a rien'], 'On garde toujours le zéro des unités : 0 000,000 = 0.', 3),
    tf('dec_z04', '0,190 et 190 sont égaux.', false, '0,190 = 0,19 : un zéro devant la virgule ne change pas la valeur, mais 190 est un nombre très différent.')
];

const decPartiesCours = [
    tf('dec_p01', 'La partie entière d\'un nombre est toujours un nombre entier.', true, 'La partie entière est ce qui est avant la virgule : c\'est toujours un nombre entier (26 pour 26,53).'),
    tf('dec_p02', 'La partie décimale d\'un nombre est toujours un nombre compris entre 0 et 1.', true, 'La partie décimale de 26,53 est 0,53 : un nombre plus petit que 1.', 2),
    tf('dec_p03', 'La partie décimale de 26,53 est 53.', false, 'C\'est 0,53 (53 centièmes), et non 53.'),
    tf('dec_p04', 'Pour le nombre 0,53, la partie décimale est plus grande que la partie entière.', true, 'La partie entière de 0,53 est 0 et sa partie décimale est 0,53, qui est plus grande que 0.', 3),
    tf('dec_p05', 'La partie décimale de la somme d\'argent 27,76 € représente le nombre de centimes.', true, '0,76 € = 76 centimes.', 2),
    tf('dec_p06', 'Pour 12,168 m, la partie décimale représente le nombre de centimètres.', false, '0,168 m = 168 millimètres (et non 168 centimètres).', 3)
];

const geoCours = [
    qcm('geo_c01', 'Un point est…', 'le plus petit élément de l\'espace', ['un petit rond sur la feuille', 'un trait très court', 'un ensemble de lignes'], 'Un point désigne un emplacement. On le représente par une croix, à l\'intersection de deux petits traits.'),
    qcm('geo_c02', 'Comment nomme-t-on un point ?', 'Avec une seule lettre majuscule', ['Avec deux lettres', 'Avec une lettre minuscule', 'Avec un chiffre'], 'On nomme toujours un point avec une seule lettre majuscule : A, B, C…'),
    tf('geo_c03', 'Un point est infiniment petit.', true, 'Pour le montrer sur un dessin, on le représente par une croix.'),
    tf('geo_c04', 'La longueur d\'un point vaut 1.', false, 'Un point est infiniment petit : sa longueur est 0.'),
    tf('geo_c05', 'Un point désigne seulement une position.', true, 'Un point désigne un emplacement, une position dans l\'espace.', 2),
    tf('geo_c06', 'Une ligne contient une infinité de points.', true, 'Une ligne est un ensemble de points qui se suivent continuellement.'),
    tf('geo_c07', 'Une ligne n\'a pas de longueur.', false, 'Une ligne a une longueur, finie ou infinie.', 2),
    tf('geo_c08', 'Toutes les figures du plan et de l\'espace sont constituées d\'ensembles de points.', true, 'Une ligne, un cercle, une surface… sont des ensembles de points.', 2),
    match('geo_c09', 'Associe chaque figure à sa description.', [['Une droite', 'va à l\'infini dans les 2 directions'], ['Une demi-droite', 'est coupée dans 1 direction et va à l\'infini dans l\'autre'], ['Un segment', 'est coupé dans les 2 directions']], GEO_RULE),
    match('geo_c10', 'Associe chaque figure à sa notation.', [['Une droite', 'se note avec 2 parenthèses ( )'], ['Une demi-droite', 'se note avec 1 crochet puis 1 parenthèse [ )'], ['Un segment', 'se note avec 2 crochets [ ]']], GEO_RULE),
    qcm('geo_c11', 'Que signifie « les points A, B et C sont alignés » ?', 'Ils sont sur une même droite', ['Ils sont les trois sommets d\'un triangle', 'Ils sont à la même distance les uns des autres', 'Ils sont sur le même segment de 5 cm'], 'Des points alignés sont des points qui peuvent être reliés par une seule droite : on vérifie avec la règle.'),
    qcm('geo_c12', 'Que signifie P ∈ [CD] ?', 'P appartient au segment [CD]', ['P n\'appartient pas au segment [CD]', 'P est le milieu de [CD]', 'P est à l\'extérieur de [CD]'], 'Le signe ∈ se lit « appartient à ». Le signe ∉ se lit « n\'appartient pas à ».'),
    qcm('geo_c13', 'Que signifie N ∉ [CD] ?', 'N n\'appartient pas au segment [CD]', ['N appartient au segment [CD]', 'N est une extrémité de [CD]', 'N est le milieu de [CD]'], 'N est « à l\'extérieur » du segment : il n\'est pas posé dessus.'),
    qcm('geo_c14', 'Dans « Tracer [AB) », que trace-t-on ?', 'La demi-droite d\'origine A passant par B', ['La droite passant par A et B', 'Le segment d\'extrémités A et B', 'La demi-droite d\'origine B passant par A'], GEO_RULE, 2)
];

export const maths6eSkills = [
    { id: 'geo_cours', label: 'Géométrie : points, lignes, figures', bank: geoCours },
    { id: 'geo_notations', label: 'Droite, demi-droite, segment : notations', gen: generateGeoNotationQuestion },
    { id: 'geo_appartenance', label: 'Appartenance : ∈ et ∉', gen: generateGeoBelongQuestion },
    { id: 'geo_noms', label: 'Combien de noms pour une droite ?', gen: generateGeoNamesQuestion },
    { id: 'dec_def', label: 'Nombre décimal ou entier ?', bank: decDef },
    { id: 'dec_zeros', label: 'Zéros facultatifs', gen: generateOptionalZerosQuestion },
    { id: 'dec_egalite', label: 'Égal ou différent ?', gen: generateEqualityQuestion },
    { id: 'dec_zeros_cours', label: 'Zéros facultatifs : les règles', bank: decZerosCours },
    { id: 'dec_parties', label: 'Partie entière et partie décimale', gen: generatePartsQuestion },
    { id: 'dec_parties_cours', label: 'Partie entière et décimale : vrai ou faux', bank: decPartiesCours },
    { id: 'dec_paquets', label: 'Construire un nombre décimal', gen: generatePacketsQuestion },
    { id: 'dec_fraction_dec', label: 'Fraction décimale et écriture décimale', gen: generateFractionDecimalQuestion }
].map(s => ({ ...s, subject: 'maths' }));
