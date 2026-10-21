// Anglais de 6e d'après les fiches du cours (salutations, nombres, ordinaux, jours, mois, classroom English…).
import { shuffle, pick, randInt, qcm, input, order, match } from './helpers.js';

// ---------- Outils : nombres en lettres ----------
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function numberWords(n) {
    if (n < 20) return ONES[n];
    if (n < 100) return n % 10 ? `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}` : TENS[n / 10];
    return 'one hundred';
}
const ORD_SMALL = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const ORD_TENS = { 20: 'twentieth', 30: 'thirtieth', 40: 'fortieth' };
export function ordinalWords(n) {
    if (n < 20) return ORD_SMALL[n];
    if (n % 10 === 0) return ORD_TENS[n];
    return `${TENS[Math.floor(n / 10)]}-${ORD_SMALL[n % 10]}`;
}
export function ordinalSuffix(n) {
    if (n % 100 >= 11 && n % 100 <= 13) return 'th';
    return { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th';
}
const spaced = w => w.replace(/-/g, ' ');

function mc(text, answer, wrongs, explanation, extra = {}) {
    const uniq = [...new Set(wrongs)].filter(w => w !== answer).slice(0, 3);
    return { kind: 'qcm', text, answer, options: shuffle([answer, ...uniq]), explanation, ...extra };
}

// Orthographes classiques mal écrites : [bonne, fautes courantes]
const NUMBER_SPELLING = {
    8: ['eight', 'eigth', 'eigt', 'eit'], 13: ['thirteen', 'thirten', 'thirtheen', 'thirthteen'], 14: ['fourteen', 'forteen', 'fourten', 'fourtheen'],
    15: ['fifteen', 'fiveteen', 'fiften', 'fithteen'], 18: ['eighteen', 'eightteen', 'eigtheen', 'eigthteen'], 40: ['forty', 'fourty', 'fortie', 'fothy'],
    50: ['fifty', 'fivety', 'fifthy', 'fiftie'], 80: ['eighty', 'eigthy', 'eightty', 'eigty'], 90: ['ninety', 'ninty', 'nineity', 'ninetty']
};
const ORDINAL_SPELLING = {
    2: ['second', 'twoth', 'secound', 'seccond'], 3: ['third', 'threeth', 'thrid', 'thirth'], 5: ['fifth', 'fiveth', 'fith', 'fiftth'], 8: ['eighth', 'eightth', 'eigth', 'eighteth'],
    9: ['ninth', 'nineth', 'ninnth', 'nintht'], 12: ['twelfth', 'twelveth', 'twelth', 'twelvth'], 20: ['twentieth', 'twentyth', 'twentith', 'twentieht'],
    21: ['twenty-first', 'twenty-oneth', 'twenty-one', 'twentieth-one'], 30: ['thirtieth', 'thirtyth', 'thirtith', 'thirty']
};

// ---------- Générateurs ----------
export function generateNumberQuestion() {
    const mode = randInt(0, 2);
    if (mode === 2) {
        const n = Number(pick(Object.keys(NUMBER_SPELLING)));
        const [good, ...bad] = NUMBER_SPELLING[n];
        return mc(`Quelle est la bonne orthographe de ${n} en anglais ?`, good, bad, `${n} s'écrit « ${good} » en anglais.`, { facet: n < 20 ? 'teens et 8' : 'dizaines' });
    }
    const n = Math.random() < 0.6 ? randInt(0, 20) : randInt(21, 100);
    const kind = n >= 13 && n <= 19 ? 'teens (13-19)' : n >= 20 && n % 10 === 0 ? 'dizaines (20, 30…)' : n > 20 ? 'nombres composés' : 'de 0 à 12';
    const w = numberWords(n);
    if (mode === 0) {
        const accept = [spaced(w)];
        if (n === 100) accept.push('a hundred', 'hundred');
        return {
            kind: 'input', accept: [w, ...accept], answer: w, facet: kind,
            text: `Écris ${n} en anglais, en toutes lettres.`,
            explanation: `${n} = ${w}.${n >= 21 && n < 100 && n % 10 ? ' À partir de 21, on relie les dizaines et les unités par un tiret : twenty-one.' : ''}${n >= 13 && n <= 19 ? ' Attention à la différence entre -teen (13 à 19) et -ty (30, 40…) : thirteen = 13, thirty = 30.' : ''}`
        };
    }
    const wrongs = [];
    if (n >= 13 && n <= 19) wrongs.push((n % 10) * 10);
    if (n >= 30 && n % 10 === 0) wrongs.push(n / 10 + 10);
    wrongs.push(n + 10, n - 10, n + 1, n - 1, n + 2, n + 11, n + 9);
    if (n >= 10 && n < 100) wrongs.push(Number(String(n).split('').reverse().join('')));
    return mc(`Quel nombre est « ${w} » ?`, String(n), wrongs.filter(x => x >= 0 && x <= 100 && x !== n).map(String),
        `${w} = ${n}.${n >= 13 && n <= 19 ? ' -teen se prononce [tine] (13 à 19), -ty se prononce [ti] (30, 40…).' : ''}`, { facet: kind });
}

export function generateOrdinalQuestion() {
    const mode = randInt(0, 2);
    if (mode === 2) {
        const n = Number(pick(Object.keys(ORDINAL_SPELLING)));
        const [good, ...bad] = ORDINAL_SPELLING[n];
        return mc(`Quelle est la bonne orthographe de « ${n}${n === 1 ? 'er' : 'ème'} » en anglais ?`, good, bad,
            `${n}ème = ${good}. Les ordinaux irréguliers sont à connaître : first, second, third, fifth, eighth, ninth, twelfth.`, { facet: 'orthographe' });
    }
    const n = randInt(1, 31);
    const w = ordinalWords(n);
    if (mode === 0) {
        const accept = [spaced(w), `the ${w}`, `the ${spaced(w)}`];
        return {
            kind: 'input', accept: [w, ...accept], answer: w, facet: 'en lettres',
            text: `Écris en anglais, en toutes lettres : ${n}${n === 1 ? 'er' : 'ème'}`,
            explanation: `${n}ème = ${w}. ${n % 10 === 0 && n >= 20 ? 'Pour 20, 30, 40…, le y devient ie : twentieth, thirtieth.' : 'On ajoute -th à la plupart des nombres (fourth, sixth…), mais first, second, third, fifth, eighth, ninth et twelfth sont irréguliers.'}`
        };
    }
    const suf = ordinalSuffix(n);
    return mc(`Comment abrège-t-on « ${w} » en chiffres ?`, `${n}${suf}`, ['st', 'nd', 'rd', 'th'].map(x => `${n}${x}`),
        `${w} s'écrit ${n}${suf}. Seuls 1, 2 et 3 prennent -st, -nd, -rd (et 21, 22, 23, 31) ; tous les autres prennent -th, même 11, 12 et 13.`, { facet: 'abréviation' });
}

// ---------- Banques ----------
const DAYS = [['lundi', 'Monday'], ['mardi', 'Tuesday'], ['mercredi', 'Wednesday'], ['jeudi', 'Thursday'], ['vendredi', 'Friday'], ['samedi', 'Saturday'], ['dimanche', 'Sunday']];
const MONTHS = [['janvier', 'January'], ['février', 'February'], ['mars', 'March'], ['avril', 'April'], ['mai', 'May'], ['juin', 'June'], ['juillet', 'July'], ['août', 'August'], ['septembre', 'September'], ['octobre', 'October'], ['novembre', 'November'], ['décembre', 'December']];

const joursMois = [
    ...DAYS.map(([fr, en], i) => input(`en_j${i + 1}`, `Comment dit-on « ${fr} » en anglais ?`, en, `${fr} = ${en}. En anglais, les jours prennent toujours une majuscule.`, [], i < 4 ? 1 : 2)),
    ...DAYS.slice(0, 7).map(([fr, en], i) => qcm(`en_jq${i + 1}`, `Que veut dire « ${en} » ?`, fr, DAYS.filter((_, j) => j !== i).map(d => d[0]).slice(i % 3, (i % 3) + 3).concat(DAYS.filter((_, j) => j !== i).map(d => d[0])).filter((v, k, a) => a.indexOf(v) === k).slice(0, 3), `${en} = ${fr}.`)),
    ...MONTHS.map(([fr, en], i) => input(`en_m${i + 1}`, `Comment dit-on « ${fr} » en anglais ?`, en, `${fr} = ${en}. En anglais, les mois prennent toujours une majuscule. Attention à l'orthographe : ${en}.`, [], 1)),
    input('en_jm1', 'Comment dit-on « les jours de la semaine » en anglais ?', 'days of the week', 'les jours de la semaine = the days of the week.', ['the days of the week'], 2),
    input('en_jm2', 'Comment dit-on « les mois de l\'année » en anglais ?', 'months of the year', 'les mois de l\'année = the months of the year.', ['the months of the year'], 2),
    qcm('en_jm3', 'Quel est le huitième mois de l\'année ?', 'August', ['July', 'September', 'October'], 'January, February, March, April, May, June, July, August : le huitième mois est August.', 2),
    qcm('en_jm4', 'Quel est le dernier mois de l\'année ?', 'December', ['November', 'January', 'October'], 'Le dernier mois est December (décembre).'),
    qcm('en_jm5', 'Quel mois est entre April et June ?', 'May', ['March', 'July', 'August'], 'April, May, June.'),
    qcm('en_jm6', 'Quels sont trois mois qui commencent par « J » ?', 'January, June, July', ['January, February, March', 'June, July, August', 'July, August, September'], 'Les mois en J sont January, June et July.', 2),
    qcm('en_jm7', 'Que veut dire « autumn » (en anglais britannique) ?', 'automne', ['printemps', 'été', 'hiver'], 'Autumn (anglais britannique) = Fall (anglais américain) = automne.'),
    match('en_jm8', 'Associe chaque saison à ses mois.', [['Winter', 'December, January, February'], ['Spring', 'March, April, May'], ['Summer', 'June, July, August'], ['Autumn / Fall', 'September, October, November']], 'Winter = hiver, spring = printemps, summer = été, autumn / fall = automne.', 2),
    order('en_jm9', 'Remets ces mois dans l\'ordre de l\'année.', ['June', 'July', 'August', 'September'], 'June, July, August, September.', 2),
    order('en_jm10', 'Remets ces jours dans l\'ordre de la semaine.', ['Monday', 'Wednesday', 'Friday', 'Sunday'], 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.')
];

const saluer = [
    qcm('en_s01', 'Comment dit-on « bonjour » le matin ?', 'Good morning', ['Good afternoon', 'Good evening', 'Good night'], 'Good morning = bonjour (le matin).'),
    qcm('en_s02', 'Comment dit-on « bonjour » l\'après-midi ?', 'Good afternoon', ['Good morning', 'Good evening', 'Good night'], 'Good afternoon = bonjour (l\'après-midi).'),
    qcm('en_s03', 'Comment dit-on « bonsoir » ?', 'Good evening', ['Good night', 'Good afternoon', 'Good morning'], 'Good evening = bonsoir.'),
    qcm('en_s04', 'Comment dit-on « bonne nuit » ?', 'Good night', ['Good evening', 'Good morning', 'Good afternoon'], 'Good night = bonne nuit (on le dit pour aller se coucher).'),
    match('en_s05', 'Associe chaque expression à sa traduction.', [['Good morning', 'bonjour (le matin)'], ['Good afternoon', 'bonjour (l\'après-midi)'], ['Good evening', 'bonsoir'], ['Good night', 'bonne nuit']], 'Ces expressions changent selon le moment de la journée.'),
    input('en_s06', 'Comment dit-on « au revoir » en anglais ?', 'Goodbye', 'Au revoir : Goodbye, Bye-bye ou Bye.', ['good bye', 'bye', 'bye-bye', 'bye bye', 'goodbye!']),
    input('en_s07', 'Comment dit-on « salut » (pour dire bonjour) en anglais ?', 'Hi', 'Hello et Hi veulent tous les deux dire bonjour ou salut.', ['hello', 'hi!']),
    input('en_s08', 'Comment dit-on « merci » en anglais ?', 'Thank you', 'Merci = Thank you (ou Thanks).', ['thanks', 'thank you!']),
    input('en_s09', 'Comment dit-on « s\'il vous plaît » en anglais ?', 'Please', 'S\'il vous plaît = Please.', ['please!']),
    input('en_s10', 'Comment dit-on « à demain » en anglais ?', 'See you tomorrow', 'À demain = See you tomorrow.', ['see you tomorrow!', 'see you tomorow'], 2),
    input('en_s11', 'Comment dit-on « Comment vas-tu aujourd\'hui ? » en anglais ?', 'How are you today?', 'Comment vas-tu aujourd\'hui ? = How are you today?', ['how are you today', 'How are you today ?'], 2),
    input('en_s12', 'Comment dit-on « Je suis fatigué(e) » en anglais ?', 'I\'m tired', 'Je suis fatigué(e) = I\'m tired (ou I am tired).', ['i am tired', 'im tired', 'I\'m tired!', 'i am tired!'], 2),
    qcm('en_s13', 'Que veut dire « I\'m fine » ?', 'Je vais bien', ['Je suis fatigué', 'Je ne vais pas bien', 'Je suis mort'], 'I\'m fine / I\'m well = je vais bien.'),
    match('en_s14', 'Associe chaque réponse à « How are you today ? » à sa traduction.', [['I\'m very well', 'Je vais très bien'], ['I\'m so-so', 'Comme ci, comme ça'], ['I\'m not very well', 'Je ne vais pas très bien'], ['I\'m tired', 'Je suis fatigué(e)']], 'Du plus content au moins content : I\'m very well, I\'m fine, I\'m ok, I\'m so-so, I\'m not very well, I\'m not well.', 2),
    qcm('en_s15', 'Quelle réponse veut dire « Je ne vais pas très bien » ?', 'I\'m not very well', ['I\'m very well', 'I\'m so-so', 'I\'m ok'], 'not very well = pas très bien.'),
    qcm('en_s16', 'Quel mot veut dire « thank you » ?', 'merci', ['s\'il vous plaît', 'au revoir', 'bonjour'], 'Thank you = merci. Please = s\'il vous plaît.'),
    order('en_s17', 'Remets les mots dans l\'ordre : « Comment vas-tu aujourd\'hui ? »', ['How', 'are', 'you', 'today?'], 'How are you today ?', 2)
];

const classe = [
    input('en_c01', 'Comment dit-on « se taire » (Taisez-vous !) en anglais ?', 'Be quiet', 'Se taire = Be quiet.', ['be quiet!', 'be quiet please']),
    input('en_c02', 'Comment dit-on « se lever » en anglais ?', 'Stand up', 'Se lever = Stand up.', ['stand up!']),
    input('en_c03', 'Comment dit-on « écouter » en anglais ?', 'Listen', 'Écouter = Listen.', ['listen!']),
    input('en_c04', 'Comment dit-on « regarder le tableau » en anglais ?', 'Look at the board', 'Regarder le tableau = Look at the board.', ['look at the board!']),
    input('en_c05', 'Comment dit-on « lever la main » en anglais ?', 'Raise your hand', 'Lever la main = Raise your hand.', ['raise my hand', 'raise your hand!'], 2),
    input('en_c06', 'Comment dit-on « ouvrir ton livre » en anglais ?', 'Open your book', 'Ouvrir ton livre = Open your book.', ['open your book!', 'open my book'], 2),
    input('en_c07', 'Comment dit-on « écrire » en anglais ?', 'Write', 'Écrire = Write.', ['write!']),
    input('en_c08', 'Comment dit-on « lire » en anglais ?', 'Read', 'Lire = Read.', ['read!']),
    match('en_c09', 'Associe chaque consigne à sa traduction.', [['Stand up', 'Se lever'], ['Be quiet', 'Se taire'], ['Listen', 'Écouter'], ['Read', 'Lire'], ['Write', 'Écrire']], 'Ce sont les consignes de classe : à connaître par cœur.'),
    match('en_c10', 'Associe chaque consigne à sa traduction.', [['Look at the board', 'Regarder le tableau'], ['Open your book', 'Ouvrir ton livre'], ['Raise your hand', 'Lever la main'], ['Open your copybook', 'Ouvrir ton cahier'], ['Take your copybook', 'Prendre ton cahier']], 'Un « copybook » est un cahier.', 2),
    qcm('en_c11', 'Que veut dire « Don\'t talk in class » ?', 'Ne parle pas en classe', ['Parle en classe', 'Ne cours pas en classe', 'Écoute en classe'], 'Don\'t + verbe = ne… pas (interdiction).'),
    qcm('en_c12', 'Que veut dire « Don\'t run in the corridors » ?', 'Ne cours pas dans les couloirs', ['Cours dans les couloirs', 'Ne parle pas dans les couloirs', 'Ne sors pas'], 'Run = courir, corridor = couloir.', 2),
    qcm('en_c13', 'Que veut dire « Don\'t use your mobiles in class » ?', 'N\'utilise pas ton portable en classe', ['Utilise ton portable', 'N\'écris pas en classe', 'Ne lis pas en classe'], 'Mobile = téléphone portable, use = utiliser.', 2),
    qcm('en_c14', 'Que veut dire « Put your chewing-gum in the bin! » ?', 'Jette ton chewing-gum à la poubelle', ['Mange ton chewing-gum', 'Ne mâche pas de chewing-gum', 'Sors ton chewing-gum'], 'Bin = poubelle.', 2),
    qcm('en_c15', 'Comment dit-on « Ne sors pas ! » ?', 'Don\'t go out!', ['Go out!', 'Don\'t come in!', 'Be quiet!'], 'Go out = sortir. Don\'t go out! = Ne sors pas !', 2),
    qcm('en_c16', 'Que veut dire « Can I go to the toilet, please? » ?', 'Puis-je aller aux toilettes, s\'il vous plaît ?', ['Puis-je ouvrir la fenêtre ?', 'Je ne comprends pas.', 'Comment dit-on… en anglais ?'], 'Can I… ? = Puis-je… ?', 2),
    qcm('en_c17', 'Comment dit-on « Je ne comprends pas » ?', 'I don\'t understand', ['I don\'t know', 'I don\'t like', 'I\'m not well'], 'I don\'t understand = je ne comprends pas.', 2),
    qcm('en_c18', 'Comment demande-t-on « Comment dit-on… en anglais ? »', 'How do you say… in English?', ['What is your name?', 'Can I open the window?', 'How are you?'], 'How do you say… in English ? sert à demander une traduction.', 2),
    qcm('en_c19', 'Que veut dire « Can I open the window? » ?', 'Puis-je ouvrir la fenêtre ?', ['Puis-je fermer la porte ?', 'Ouvre la fenêtre !', 'Je ne comprends pas.'], 'Window = fenêtre.', 2)
];

const phrases = [
    order('en_p01', 'Remets les mots dans l\'ordre pour dire ton prénom.', ['My', 'name', 'is', 'Tom'], 'My name is Tom = Je m\'appelle Tom.'),
    order('en_p02', 'Remets les mots dans l\'ordre pour dire ton âge.', ['I', 'am', 'eleven', 'years', 'old'], 'I am eleven years old = J\'ai onze ans. On peut aussi dire « I am eleven ».'),
    order('en_p03', 'Remets les mots dans l\'ordre pour dire où tu habites.', ['I', 'live', 'in', 'Paris'], 'I live in Paris = J\'habite à Paris.'),
    order('en_p04', 'Remets les mots dans l\'ordre.', ['Look', 'at', 'the', 'board'], 'Look at the board = Regarde le tableau.'),
    order('en_p05', 'Remets les mots dans l\'ordre.', ['Raise', 'your', 'hand'], 'Raise your hand = Lève la main.'),
    order('en_p06', 'Remets les mots dans l\'ordre.', ['Open', 'your', 'copybook'], 'Open your copybook = Ouvre ton cahier.'),
    order('en_p07', 'Remets les mots dans l\'ordre.', ['I\'m', 'not', 'very', 'well'], 'I\'m not very well = Je ne vais pas très bien.', 2),
    order('en_p08', 'Remets les mots dans l\'ordre.', ['See', 'you', 'tomorrow'], 'See you tomorrow = À demain.'),
    order('en_p09', 'Remets les mots dans l\'ordre.', ['Can', 'I', 'go', 'to', 'the', 'toilet,', 'please?'], 'Can I go to the toilet, please ? = Puis-je aller aux toilettes, s\'il vous plaît ?', 3),
    order('en_p10', 'Remets les mots dans l\'ordre.', ['I', 'don\'t', 'understand'], 'I don\'t understand = Je ne comprends pas.', 2),
    order('en_p11', 'Remets les mots dans l\'ordre.', ['How', 'do', 'you', 'say', 'in', 'English?'], 'How do you say… in English ? = Comment dit-on… en anglais ?', 3)
];

const MATH_WORDS = [['add', 'ajouter'], ['subtract', 'soustraire'], ['multiply', 'multiplier'], ['divide', 'diviser'], ['think', 'penser']];
const COLOURS = [['🟥', 'red', 'rouge'], ['🟦', 'blue', 'bleu'], ['🟩', 'green', 'vert'], ['🟨', 'yellow', 'jaune'], ['🟧', 'orange', 'orange'], ['🟪', 'purple', 'violet'], ['⬛', 'black', 'noir'], ['⬜', 'white', 'blanc'], ['🟫', 'brown', 'marron']];
const HALLOWEEN = [['🦇', 'bat', 'chauve-souris'], ['🐈', 'cat', 'chat'], ['🦉', 'owl', 'chouette'], ['👻', 'ghost', 'fantôme'], ['🧙', 'witch', 'sorcière'], ['🕷️', 'spider', 'araignée'], ['💀', 'skeleton', 'squelette'], ['🌙', 'moon', 'lune'], ['🧛', 'vampire', 'vampire'], ['🍬', 'candy', 'bonbon']];

const vocab = [
    ...MATH_WORDS.map(([en, fr], i) => qcm(`en_v${i + 1}`, `Que veut dire « ${en} » ?`, fr, MATH_WORDS.filter((_, j) => j !== i).map(w => w[1]).slice(0, 3), `${en} = ${fr}.`, 2)),
    match('en_v6', 'Associe chaque verbe de calcul à sa traduction.', MATH_WORDS.slice(0, 4).map(([en, fr]) => [en, fr]), 'Add = ajouter (+), subtract = soustraire (−), multiply = multiplier (×), divide = diviser (÷).', 2),
    ...COLOURS.map(([emoji, en], i) => qcm(`en_col${i + 1}`, `Quelle est la couleur de ce carré : ${emoji} ?`, en, COLOURS.filter((_, j) => j !== i).map(c => c[1]).slice(i % 4, (i % 4) + 3).concat(COLOURS.filter((_, j) => j !== i).map(c => c[1])).filter((v, k, a) => a.indexOf(v) === k).slice(0, 3), `${emoji} = ${en} (${COLOURS[i][2]}).`)),
    ...HALLOWEEN.map(([emoji, en, fr], i) => qcm(`en_h${i + 1}`, `Comment dit-on en anglais : ${emoji} ?`, en, HALLOWEEN.filter((_, j) => j !== i).map(h => h[1]).slice(i % 5, (i % 5) + 3).concat(HALLOWEEN.filter((_, j) => j !== i).map(h => h[1])).filter((v, k, a) => a.indexOf(v) === k).slice(0, 3), `${emoji} = ${en} (${fr}).`, 2))
];

export const anglaisSkills = [
    { id: 'en_nombres', label: 'Les nombres (0 à 100)', gen: generateNumberQuestion },
    { id: 'en_ordinaux', label: 'Les nombres ordinaux', gen: generateOrdinalQuestion },
    { id: 'en_jours_mois', label: 'Jours, mois et saisons', bank: joursMois },
    { id: 'en_saluer', label: 'Saluer et prendre des nouvelles', bank: saluer },
    { id: 'en_classe', label: 'Classroom English', bank: classe },
    { id: 'en_phrases', label: 'Construire une phrase', bank: phrases },
    { id: 'en_vocab', label: 'Verbes de calcul, couleurs, Halloween', bank: vocab }
].map(s => ({ ...s, subject: 'anglais' }));
