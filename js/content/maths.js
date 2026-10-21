import { shuffle, pick, randInt, fmtNum, generateOptions, numOptions, qcm } from './helpers.js';

// Renseigné par le moteur avant chaque génération (maîtrise du profil actif)
export const ctx = { mastery: {}, weak: {} };

// Une fois sur deux, on cible une facette que le joueur rate (ex : les millièmes, la table 7×8)
function weakFacet(skillId) {
    const list = ctx.weak[skillId];
    return list && list.length && Math.random() < 0.5 ? list[Math.floor(Math.random() * list.length)] : null;
}

// ===== Générateurs d'origine (conservés tels quels) =====
export function generateUnitConversionQuestion() {
    const isLevel1 = Math.random() < 0.5;

    const units = [
        { name: 'km', pow: 6 },
        { name: 'hm', pow: 5 },
        { name: 'dam', pow: 4 },
        { name: 'm', pow: 3 },
        { name: 'dm', pow: 2 },
        { name: 'cm', pow: 1 },
        { name: 'mm', pow: 0 }
    ];

    const fromIdx = Math.floor(Math.random() * units.length);
    let toIdx;
    do {
        toIdx = Math.floor(Math.random() * units.length);
    } while (toIdx === fromIdx);

    const from = units[fromIdx];
    const to = units[toIdx];

    let val;
    if (isLevel1) {
        if (from.pow > to.pow) {
            val = Math.floor(Math.random() * 9) + 1;
        } else {
            const diff = to.pow - from.pow;
            const base = Math.floor(Math.random() * 9) + 1;
            val = base * Math.pow(10, diff);
        }
    } else {
        val = parseFloat((Math.random() * 9 + 1).toFixed(1)); 
    }

    const diff = from.pow - to.pow;
    let convertedMatch = (val * Math.pow(10, diff));
    let converted = parseFloat(convertedMatch.toPrecision(7)); 
    
    const valStr = val.toString().replace('.', ',');
    const convertedStr = converted.toString().replace('.', ',');

    const answer = `${convertedStr} ${to.name}`;
    const text = isLevel1 ? `Combien de ${to.name} dans ${valStr} ${from.name} ?` : `Convertis : ${valStr} ${from.name} = ... ${to.name}`;

    let usedFactors = new Set([1]);
    const options = generateOptions(answer, false, () => {
         const factors = [0.001, 0.01, 0.1, 10, 100, 1000, 10000];
         let f = factors[Math.floor(Math.random() * factors.length)];
         while(usedFactors.has(f)) f = factors[Math.floor(Math.random() * factors.length)];
         usedFactors.add(f);
         let fake = parseFloat((converted * f).toPrecision(7));
         return `${fake.toString().replace('.', ',')} ${to.name}`;
    });

    return {
        text: text,
        visual: { type: 'conversion-table' },
        options: options,
        answer: answer,
        type: 'mesure',
        explanation: `Pour convertir les ${from.name} en ${to.name}, déplace la virgule ou ajoute/retire des zéros en fonction de leur distance dans le tableau de conversion (km, hm, dam, m, dm, cm, mm).`
    };
}


// --- Question Generators ---

export function generateComparisonQuestion() {
    const nums = [];
    const seen = new Set();
    while (nums.length < 4) {
        const val = (Math.random() * 2).toFixed(Math.floor(Math.random() * 3) + 1);
        if (seen.has(parseFloat(val))) continue; // valeurs égales (1,5 et 1,50) = réponse ambiguë
        seen.add(parseFloat(val));
        nums.push(val.replace('.', ','));
    }

    // Sort to find the max
    const sorted = [...nums].sort((a, b) => parseFloat(b.replace(',', '.')) - parseFloat(a.replace(',', '.')));
    const answer = sorted[0];

    return {
        text: "Quel est le plus grand nombre parmi ceux-ci ?",
        options: nums,
        answer: answer,
        type: 'decimal',
        explanation: "Pour comparer des décimaux, compare d'abord la partie entière. Si elles sont égales, compare le chiffre des dixièmes, puis des centièmes."
    };
}

export function generateConstructionQuestion() {
    const dizaines = Math.floor(Math.random() * 9) + 1;
    const dixienes = Math.floor(Math.random() * 9) + 1;

    const correctVal = (dizaines * 10) + (dixienes / 10);
    const answer = correctVal.toFixed(1).replace('.', ',');

    // Trap options like in the PDF (e.g., 8,5 instead of 80,5)
    const trap1 = (dizaines + dixienes / 10).toFixed(1).replace('.', ',');
    const trap2 = (dizaines * 10 + dixienes / 100).toFixed(2).replace('.', ',');
    const trap3 = (dizaines + dixienes).toString();

    const options = [answer, trap1, trap2, trap3].sort(() => Math.random() - 0.5);

    return {
        text: `${dizaines} dizaines et ${dixienes} dixièmes, est-ce :`,
        options: options,
        answer: answer,
        type: 'decimal',
        explanation: `Attention au piège ! ${dizaines} dizaines = ${dizaines * 10}. Et ${dixienes} dixièmes, c'est ${dixienes / 10} ou ${dixienes} à droite de la virgule.`
    };
}

export function generateSimpleMultiplicationQuestion() {
    // Check mastery: count how many tables are mastered (2+ correct)
    let masteredCount = 0;
    for (let i = 2; i <= 9; i++) {
        for (let j = 2; j <= 9; j++) {
            if ((ctx.mastery[`${i}x${j}`] || 0) >= 2) masteredCount++;
        }
    }

    const isMaster = masteredCount >= 40; // threshold for progression

    if (isMaster) {
        const n1 = 11 + Math.floor(Math.random() * 20); // 11 to 30
        const n2 = 2 + Math.floor(Math.random() * 7); // 2 to 8
        const a = n1 * n2;
        return {
            text: `EXPERT : combien font ${n1} x ${n2} ?`,
            options: generateOptions(a.toString(), true),
            answer: a.toString(),
            type: 'math',
            explanation: `Décompose : ${n1} × ${n2} = (${Math.floor(n1 / 10) * 10} × ${n2}) + (${n1 % 10} × ${n2}) = ${a}.`,
            metadata: { type: 'expert', factors: [n1, n2] }
        };
    } else {
        let n1 = 2 + Math.floor(Math.random() * 8); // 2 to 9
        let n2 = 2 + Math.floor(Math.random() * 8);
        const wf = weakFacet('math_multiplication');
        if (wf) [n1, n2] = wf.split('×').map(Number);
        const a = n1 * n2;
        return {
            facet: `${Math.min(n1, n2)}×${Math.max(n1, n2)}`,
            text: `Multiplication : combien font ${n1} x ${n2} ?`,
            options: generateOptions(a.toString(), true),
            answer: a.toString(),
            type: 'math',
            explanation: `${n1} × ${n2} = ${a}. Si tu hésites, révise la table de ${Math.min(n1, n2)} ou la table de ${Math.max(n1, n2)}.`,
            metadata: { type: 'classic', factors: [n1, n2] }
        };
    }
}

export function generateGraduatedLineQuestion() {
    const totalUnits = 2;
    const subdivision = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
    const chosenUnit = Math.floor(Math.random() * (totalUnits));
    const chosenSub = 1 + Math.floor(Math.random() * (subdivision - 1));

    // Position of A
    const value = chosenUnit + (chosenSub / subdivision);
    const answer = `${chosenUnit * subdivision + chosenSub}/${subdivision}`;

    const options = generateOptions(answer, false, () => {
        const f = 1 + Math.floor(Math.random() * (totalUnits * subdivision));
        return `${f}/${subdivision}`;
    });

    return {
        text: "Quelle fraction correspond au repère A sur cette ligne graduée ?",
        visual: { type: 'graduated', subdivision, chosenUnit, chosenSub },
        options: options,
        answer: answer,
        type: 'fraction',
        explanation: `L'unité entre chaque grand trait est découpée en ${subdivision} parties. Le repère est sur le morceau n°${chosenUnit * subdivision + chosenSub}. Donc la fraction est ${chosenUnit * subdivision + chosenSub}/${subdivision}.`
    };
}

export function generateDecimalQuestion() {
    let num, integer, decimal;
    let roles = ['unités', 'dixièmes', 'centièmes'];

    // On ajoute 'dizaines' seulement si le nombre sera >= 10
    if (Math.random() > 0.5) {
        roles.push('dizaines');
        num = (10 + Math.random() * 89).toFixed(2);
    } else {
        num = (1 + Math.random() * 8).toFixed(2);
    }

    const parts = num.split('.');
    integer = parts[0];
    decimal = parts[1];

    // Choisir un rôle présent dans la liste
    const chosenRole = roles[Math.floor(Math.random() * roles.length)];

    let answer = "";
    if (chosenRole === 'unités') answer = integer.slice(-1);
    else if (chosenRole === 'dizaines') answer = integer.slice(-2, -1);
    else if (chosenRole === 'dixièmes') answer = decimal[0];
    else if (chosenRole === 'centièmes') answer = decimal[1];

    // Pour éviter toute confusion (ex: 11,11), on s'assure que le chiffre-réponse 
    // n'apparaît pas ailleurs si possible, ou on régénère
    const numStr = num.replace('.', ',');
    const firstIndex = numStr.indexOf(answer);
    const lastIndex = numStr.lastIndexOf(answer);

    // Si le chiffre apparaît plusieurs fois, on recommence la génération pour la clarté
    if (firstIndex !== lastIndex) {
        return generateDecimalQuestion();
    }

    const options = generateOptions(answer, true);

    return {
        text: `Dans le nombre ${numStr}, quel est le chiffre des ${chosenRole} ?`,
        options: options,
        answer: answer,
        type: 'decimal',
        explanation: `Avant la virgule : unités, puis dizaines en allant vers la gauche. Après la virgule : dixièmes, puis centièmes. Ici le chiffre des ${chosenRole} est ${answer}.`
    };
}

export function generateFractionQuestion() {
    const total = 2 + Math.floor(Math.random() * 8); // 2 to 10
    const filled = 1 + Math.floor(Math.random() * (total - 1));
    const answer = `${filled}/${total}`;

    const options = generateOptions(answer, false, () => {
        const f = 1 + Math.floor(Math.random() * 9);
        const t = 2 + Math.floor(Math.random() * 8);
        // pas de fraction égale à la bonne réponse (2/4 = 1/2)
        return f * total === filled * t ? null : `${f}/${t}`;
    });

    return {
        text: "Quelle fraction correspond à cette barre coloriée ?",
        visual: { type: 'fraction', filled, total },
        options: options,
        answer: answer,
        type: 'fraction',
        explanation: `Le dénominateur est le nombre total de parts (${total}) et le numérateur le nombre de parts coloriées (${filled}) : ${filled}/${total}.`
    };
}

export function generateMentalMathQuestion() {
    const types = ['add', 'sub', 'mul', 'div'];
    const type = types[Math.floor(Math.random() * types.length)];
    let q, a;

    if (type === 'add') {
        const n1 = 100 + Math.floor(Math.random() * 400);
        const n2 = 99; // Common pattern in PDF
        q = `${n1} + ${n2}`;
        a = n1 + n2;
    } else if (type === 'sub') {
        const n1 = 100 + Math.floor(Math.random() * 400);
        const n2 = 99;
        q = `${n1} - ${n2}`;
        a = n1 - n2;
    } else if (type === 'mul') {
        const factor1 = 2 + Math.floor(Math.random() * 8); // 2 to 9
        const factor2 = Math.random() < 0.5 ? 40 : 80; // Pattern from PDF
        const result = factor1 * factor2;

        // Transform into a "missing factor" question like "4 x ? = 320"
        q = `${factor1} x ... = ${result}`;
        a = factor2;
    } else {
        const n1 = 20 + Math.floor(Math.random() * 30);
        const n2 = 8;
        q = `Quotient de ${n1} : ${n2}`;
        a = Math.floor(n1 / n2);
    }

    const options = generateOptions(a.toString(), true);

    const hints = {
        add: 'Pour ajouter 99, ajoute 100 puis enlève 1.',
        sub: 'Pour enlever 99, enlève 100 puis ajoute 1.',
        mul: 'Cherche le nombre qui, multiplié par le premier, donne le résultat : utilise la division ou les tables.',
        div: 'Cherche combien de fois 8 rentre dans le nombre (table de 8) : c\'est le quotient entier.'
    };
    return {
        text: `Calcule rapidement : ${q}`,
        options: options,
        answer: a.toString(),
        type: 'math',
        explanation: `${hints[type]} Résultat : ${a}.`
    };
}



// ===== Nombres décimaux 6e (fiches : rangs, décompositions, fractions décimales) =====
const PLACES = [
    { name: 'milliers', int: 1000 }, { name: 'centaines', int: 100 }, { name: 'dizaines', int: 10 }, { name: 'unités', int: 1 },
    { name: 'dixièmes', den: 10 }, { name: 'centièmes', den: 100 }, { name: 'millièmes', den: 1000 }
];

// Nombre avec 3 décimales, parfois à 4 chiffres avant la virgule (ex : 217,384 ou 4 038,026)
function randomDecimalDigits(withThousands) {
    const n = withThousands ? 4 : 3;
    const intDigits = Array.from({ length: n }, (_, i) => (i === 0 ? randInt(1, 9) : randInt(0, 9)));
    const decDigits = [randInt(0, 9), randInt(0, 9), randInt(1, 9)];
    return { intDigits, decDigits };
}
function digitsToText({ intDigits, decDigits }) {
    const ip = intDigits.join('');
    const spaced = ip.length >= 4 ? ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ip;
    return `${spaced},${decDigits.join('')}`;
}
function digitAt(num, placeName) {
    const nI = num.intDigits.length;
    const idx = PLACES.findIndex(p => p.name === placeName);
    if (idx <= 3) return num.intDigits[nI - 1 - (3 - idx)];
    return num.decDigits[idx - 4];
}

export function generateDigitRankQuestion() {
    const forced = PLACES.find(p => p.name === weakFacet('dec_chiffre'));
    const withThousands = forced ? forced.name === 'milliers' || Math.random() < 0.4 : Math.random() < 0.4;
    const num = randomDecimalDigits(withThousands);
    const places = PLACES.filter(p => withThousands || p.name !== 'milliers');
    const place = forced || pick(places);
    const answer = String(digitAt(num, place.name));
    const all = [...num.intDigits, ...num.decDigits].map(String);
    const wrongs = shuffle([...new Set(all)].filter(d => d !== answer)).slice(0, 3);
    while (wrongs.length < 3) { const r = String(randInt(0, 9)); if (r !== answer && !wrongs.includes(r)) wrongs.push(r); }
    const q = qcm(null, `Dans ${digitsToText(num)}, quel est le chiffre des ${place.name} ?`, answer, wrongs, null);
    q.options = shuffle(q.options);
    delete q.id;
    q.type = 'decimal';
    q.facet = place.name;
    q.explanation = `Avant la virgule : unités, puis dizaines, centaines, milliers en allant vers la gauche. Après la virgule : dixièmes, centièmes, millièmes en allant vers la droite. Ici le chiffre des ${place.name} est ${answer}.`;
    return q;
}

export function generateDigitValueQuestion() {
    const num = randomDecimalDigits(false);
    const place = PLACES.find(p => p.den && p.name === weakFacet('dec_valeur')) || pick(PLACES.filter(p => p.den));
    const d = digitAt(num, place.name);
    const dd = d === 0 ? 5 : d;
    if (d === 0) num.decDigits[PLACES.indexOf(place) - 4] = dd;
    const answer = `${dd}/${place.den}`;
    const wrongs = [10, 100, 1000].filter(x => x !== place.den).map(x => `${dd}/${x}`).concat([String(dd)]);
    const q = qcm(null, `Dans ${digitsToText(num)}, quelle est la valeur du chiffre des ${place.name} ?`, answer, wrongs.slice(0, 3), null);
    q.options = shuffle(q.options);
    delete q.id;
    q.type = 'decimal';
    q.facet = place.name;
    q.explanation = `Le chiffre des ${place.name} vaut ${answer} : il faut écrire le chiffre au-dessus d'une fraction dont le dénominateur est ${place.den}.`;
    return q;
}

// Décomposition en fractions décimales (ex : 48,37 = 40 + 8 + 3/10 + 7/100)
function decompParts(intDigits, decDigits) {
    const parts = [];
    const nI = intDigits.length;
    intDigits.forEach((d, i) => { if (d !== 0) parts.push({ v: d * Math.pow(10, nI - 1 - i), k: 'int' }); });
    decDigits.forEach((d, i) => { if (d !== 0) parts.push({ d, den: Math.pow(10, i + 1), k: 'dec' }); });
    return parts;
}
const partText = p => (p.k === 'int' ? String(p.v) : `${p.d}/${p.den}`);

export function generateDecompositionQuestion() {
    const intDigits = [randInt(1, 9), randInt(0, 9)];
    if (Math.random() < 0.5) intDigits.push(randInt(0, 9));
    let decDigits = [randInt(0, 9), randInt(0, 9)];
    if (decDigits.every(d => d === 0)) decDigits = [randInt(1, 9), randInt(1, 9)];
    const parts = decompParts(intDigits, decDigits);
    const correctText = parts.map(partText).join(' + ');
    const number = digitsToText({ intDigits, decDigits }).replace(/,(\d+)$/, (m, g) => ',' + g.replace(/0+$/, ''));
    const numberDisp = number.endsWith(',') ? number.slice(0, -1) : number;

    if (Math.random() < 0.5) {
        // nombre -> décomposition
        const traps = new Set();
        const decParts = parts.filter(p => p.k === 'dec');
        const intParts = parts.filter(p => p.k === 'int');
        const build = arr => arr.map(partText).join(' + ');
        let guard = 0;
        while (traps.size < 3 && guard++ < 60) {
            const t = randInt(0, 3);
            let cand;
            if (t === 0 && decParts.length) { // mauvais dénominateur
                const i = randInt(0, decParts.length - 1);
                cand = build([...intParts, ...decParts.map((p, j) => j === i ? { ...p, den: p.den * 10 } : p)]);
            } else if (t === 1 && decParts.length > 1) { // chiffres échangés
                cand = build([...intParts, ...decParts.map((p, j) => ({ ...p, d: decParts[decParts.length - 1 - j].d }))]);
            } else if (t === 2 && intParts.length) { // oubli des zéros : 40 -> 4
                const j = randInt(0, intParts.length - 1);
                cand = build([...intParts.map((p, i) => i === j ? { ...p, v: parseInt(String(p.v)[0]) } : p), ...decParts]);
            } else if (decParts.length) { // dénominateur décalé partout
                cand = build([...intParts, ...decParts.map(p => ({ ...p, den: p.den * 10 }))]);
            }
            if (cand && cand !== correctText) traps.add(cand);
        }
        while (traps.size < 3) traps.add(`${correctText} + ${randInt(1, 9)}/${pick([10, 100, 1000])}`);
        const q = qcm(null, `Quelle décomposition en fractions décimales est correcte pour ${numberDisp} ?`, correctText, [...traps], null);
        q.options = shuffle(q.options); delete q.id; q.type = 'decimal';
        q.explanation = `Chaque chiffre est écrit avec sa valeur : les dixièmes sur 10, les centièmes sur 100, les millièmes sur 1000. Pour ${numberDisp} : ${correctText}.`;
        return q;
    }
    // décomposition -> nombre
    const wrongs = new Set();
    const swapped = [...decDigits].reverse();
    wrongs.add(digitsToText({ intDigits, decDigits: swapped }));
    wrongs.add(intDigits.join('') + decDigits.join(''));
    wrongs.add(digitsToText({ intDigits: intDigits.slice(0, -1).length ? intDigits.slice(0, -1) : [0], decDigits: [intDigits[intDigits.length - 1], ...decDigits] }));
    wrongs.add(digitsToText({ intDigits: [...intDigits, decDigits[0]], decDigits: decDigits.slice(1).concat([0]) }));
    const clean = s => s.replace(/,(\d*?)0+$/, (m, g) => (g ? ',' + g : ''));
    const ansTxt = clean(digitsToText({ intDigits, decDigits }));
    const opts = [...wrongs].map(clean).filter(w => w !== ansTxt && w !== '');
    const uniq = [...new Set(opts)].slice(0, 3);
    while (uniq.length < 3) { const f = `${randInt(10, 999)},${randInt(1, 99)}`; if (f !== ansTxt && !uniq.includes(f)) uniq.push(f); }
    const q = qcm(null, `Quel nombre correspond à la décomposition : ${correctText} ?`, ansTxt, uniq, null);
    q.options = shuffle(q.options); delete q.id; q.type = 'decimal';
    q.explanation = `Place chaque morceau à son rang : les fractions sur 10, 100, 1000 donnent les chiffres après la virgule. ${correctText} = ${ansTxt}.`;
    return q;
}

export function generateDecimalFractionQuestion() {
    const rank = randInt(1, 3);
    const x = randInt(1, 9);
    const den = Math.pow(10, rank);
    const dec = `0,${'0'.repeat(rank - 1)}${x}`;
    const wrongs = [10, 100, 1000].filter(v => v !== den).map(v => `${x}/${v}`);
    wrongs.push(`${x * 10}/${den}`);
    if (Math.random() < 0.5) {
        const q = qcm(null, `Quelle fraction décimale est égale à ${dec} ?`, `${x}/${den}`, shuffle(wrongs).slice(0, 3), null);
        q.options = shuffle(q.options); delete q.id; q.type = 'decimal';
        q.explanation = `${dec} a son dernier chiffre au rang des ${PLACES[3 + rank].name} : c'est donc ${x}/${den}.`;
        return q;
    }
    const decWrongs = [`0,${x}`, `0,0${x}`, `0,00${x}`, `${x},0`].filter(v => v !== dec);
    const q = qcm(null, `Quel nombre décimal est égal à la fraction ${x}/${den} ?`, dec, decWrongs.slice(0, 3), null);
    q.options = shuffle(q.options); delete q.id; q.type = 'decimal';
    q.explanation = `${x}/${den} se lit « ${x} ${PLACES[3 + rank].name} » : le chiffre ${x} se place au rang des ${PLACES[3 + rank].name}, ce qui donne ${dec}.`;
    return q;
}

// ===== Nouveaux thèmes 6e =====
export function generateMultipleQuestion() {
    const d = pick([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const right = d * randInt(3, Math.floor(150 / d));
    const wrongs = new Set();
    while (wrongs.size < 3) { const n = randInt(10, 150); if (n % d !== 0) wrongs.add(String(n)); }
    const q = qcm(null, `Parmi ces nombres, lequel est un multiple de ${d} ?`, String(right), [...wrongs], null);
    q.options = shuffle(q.options); delete q.id; q.type = 'multiples';
    q.explanation = `Un multiple de ${d} se trouve dans la table de ${d} : ${right} = ${d} × ${right / d}.`;
    return q;
}

export function generateDivisibilityQuestion() {
    const d = pick([2, 3, 5, 9, 10]);
    const rule = {
        2: 'Un nombre est divisible par 2 si son dernier chiffre est 0, 2, 4, 6 ou 8.',
        3: 'Un nombre est divisible par 3 si la somme de ses chiffres est dans la table de 3.',
        5: 'Un nombre est divisible par 5 si son dernier chiffre est 0 ou 5.',
        9: 'Un nombre est divisible par 9 si la somme de ses chiffres est dans la table de 9.',
        10: 'Un nombre est divisible par 10 si son dernier chiffre est 0.'
    }[d];
    const right = d * randInt(Math.ceil(100 / d), Math.floor(999 / d));
    const wrongs = new Set();
    while (wrongs.size < 3) { const n = randInt(100, 999); if (n % d !== 0) wrongs.add(String(n)); }
    const q = qcm(null, `Lequel de ces nombres est divisible par ${d} ?`, String(right), [...wrongs], null);
    q.options = shuffle(q.options); delete q.id; q.type = 'divisibilite';
    q.explanation = rule;
    return q;
}

export function generatePriorityQuestion() {
    const t = randInt(0, 3);
    const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
    let expr, val, wrong, expl;
    if (t === 0) { expr = `${a} + ${b} × ${c}`; val = a + b * c; wrong = (a + b) * c; expl = 'La multiplication est prioritaire sur l\'addition : on calcule d\'abord ' + `${b} × ${c}.`; }
    else if (t === 1) { expr = `(${a} + ${b}) × ${c}`; val = (a + b) * c; wrong = a + b * c; expl = 'On calcule d\'abord ce qui est entre parenthèses.'; }
    else if (t === 2) { const B = randInt(2, 6), C = randInt(2, 6), A = randInt(B * C + 1, B * C + 30); expr = `${A} − ${B} × ${C}`; val = A - B * C; wrong = (A - B) * C; expl = 'La multiplication est prioritaire sur la soustraction.'; }
    else { const C = randInt(1, Math.min(9, a * b - 1)); expr = `${a} × ${b} − ${C}`; val = a * b - C; wrong = a * (b - C); expl = 'On calcule d\'abord la multiplication, puis la soustraction.'; }
    const q = qcm(null, `Calcule : ${expr}`, String(val), [], null);
    q.options = numOptions(val, [wrong]); delete q.id; q.type = 'priorites';
    q.explanation = expl;
    return q;
}

export function generateEuclideanQuestion() {
    let a, b, qq, r;
    do { a = randInt(20, 99); b = randInt(3, 9); qq = Math.floor(a / b); r = a % b; } while (r === 0);
    const askQuotient = Math.random() < 0.5;
    const ans = String(askQuotient ? qq : r);
    return {
        kind: 'input', numeric: true, accept: [ans], answer: ans, type: 'division',
        text: `Division euclidienne de ${a} par ${b} : quel est le ${askQuotient ? 'quotient' : 'reste'} ?`,
        explanation: `${a} = ${b} × ${qq} + ${r}. Le quotient est ${qq} et le reste est ${r} (le reste est toujours plus petit que ${b}).`
    };
}

export function generatePerimeterAreaQuestion() {
    const square = Math.random() < 0.3;
    const askArea = Math.random() < 0.5;
    let text, val, expl;
    if (square) {
        const c = randInt(2, 12);
        text = `Un carré a un côté de ${c} cm. Quel est ${askArea ? 'son aire (en cm²)' : 'son périmètre (en cm)'} ?`;
        val = askArea ? c * c : 4 * c;
        expl = askArea ? `Aire du carré = côté × côté = ${c} × ${c} = ${val}.` : `Périmètre du carré = 4 × côté = 4 × ${c} = ${val}.`;
    } else {
        const L = randInt(4, 15), l = randInt(2, L - 1);
        text = `Un rectangle mesure ${L} cm de long et ${l} cm de large. Quel est ${askArea ? 'son aire (en cm²)' : 'son périmètre (en cm)'} ?`;
        val = askArea ? L * l : 2 * (L + l);
        expl = askArea ? `Aire du rectangle = longueur × largeur = ${L} × ${l} = ${val}.` : `Périmètre du rectangle = 2 × (longueur + largeur) = 2 × (${L} + ${l}) = ${val}.`;
    }
    return { kind: 'input', numeric: true, accept: [String(val)], answer: String(val), type: 'geometrie', text, explanation: expl };
}

export function generatePercentQuestion() {
    const p = pick([10, 20, 25, 50]);
    const base = pick([20, 40, 60, 80, 100, 120, 200]);
    const val = (base * p) / 100;
    const how = { 10: 'prendre 10 %, c\'est diviser par 10', 20: 'prendre 20 %, c\'est diviser par 5', 25: 'prendre 25 %, c\'est prendre le quart : on divise par 4', 50: 'prendre 50 %, c\'est prendre la moitié : on divise par 2' }[p];
    return {
        kind: 'input', numeric: true, accept: [String(val)], answer: String(val), type: 'pourcentages',
        text: `Combien font ${p} % de ${base} ?`,
        explanation: `${p} % de ${base} : ${how}. ${base} → ${val}.`
    };
}

const fmtTime = m => { const t = ((m % 1440) + 1440) % 1440; return `${Math.floor(t / 60)} h ${String(t % 60).padStart(2, '0')}`; };
export function generateDurationQuestion() {
    if (Math.random() < 0.5) {
        const h = randInt(1, 4), m = pick([5, 10, 15, 20, 30, 40, 45, 50]);
        const val = h * 60 + m;
        return {
            kind: 'input', numeric: true, accept: [String(val)], answer: String(val), type: 'durees',
            text: `${h} h ${m} min = ... min`,
            explanation: `1 h = 60 min, donc ${h} h = ${h * 60} min. Puis on ajoute ${m} min : ${h * 60} + ${m} = ${val}.`
        };
    }
    const start = randInt(8, 18) * 60 + pick([0, 10, 15, 20, 30, 40, 45, 50]);
    const dur = randInt(1, 2) * 60 + pick([15, 20, 25, 30, 35, 40, 45]);
    const end = fmtTime(start + dur);
    const wrongs = new Set();
    [-60, -10, 10, 20, 40, 60, -20, 25].forEach(o => { if (wrongs.size < 6) wrongs.add(fmtTime(start + dur + o)); });
    wrongs.delete(end);
    const q = qcm(null, `Un film commence à ${fmtTime(start)} et dure ${Math.floor(dur / 60)} h ${String(dur % 60).padStart(2, '0')} min. À quelle heure finit-il ?`, end, shuffle([...wrongs]).slice(0, 3), null);
    q.options = shuffle(q.options); delete q.id; q.type = 'durees';
    q.explanation = `On ajoute les heures, puis les minutes (60 min = 1 h) : ${fmtTime(start)} + ${Math.floor(dur / 60)} h ${String(dur % 60).padStart(2, '0')} = ${end}.`;
    return q;
}

export function generateOrderDecimalsQuestion() {
    const seen = new Set(); const items = [];
    while (items.length < 4) {
        const dec = randInt(1, 2);
        const v = (Math.random() * 20).toFixed(dec);
        if (seen.has(parseFloat(v))) continue;
        seen.add(parseFloat(v)); items.push(v);
    }
    const sorted = [...items].sort((x, y) => parseFloat(x) - parseFloat(y)).map(fmtNum);
    return {
        kind: 'order', type: 'decimal', items: sorted, answer: sorted.join(' → '),
        text: 'Range ces nombres du plus petit au plus grand.',
        explanation: 'Compare d\'abord les parties entières, puis les dixièmes, puis les centièmes.'
    };
}

export function generateDecimalOperationQuestion() {
    const a = randInt(11, 99), b = randInt(11, 99); // a en dixièmes, b en centièmes
    const add = Math.random() < 0.5;
    const A = a / 10, B = b / 100;
    const res = add ? a * 10 + b : a * 10 - b;
    const ans = fmtNum((res / 100).toFixed(2));
    return {
        kind: 'input', numeric: true, accept: [ans], answer: ans, type: 'decimal',
        text: `Calcule : ${fmtNum(A.toFixed(1))} ${add ? '+' : '−'} ${fmtNum(B.toFixed(2))}`,
        explanation: `Aligne les virgules : ${fmtNum(A.toFixed(2))} ${add ? '+' : '−'} ${fmtNum(B.toFixed(2))} = ${ans}.`
    };
}

// ===== Questions de cours (vocabulaire des rangs, issues de la fiche 6e "Nombres décimaux") =====
const rangsBank = [
    qcm('dec_r01', 'Le premier chiffre avant la virgule est toujours le chiffre des…', 'unités', ['dizaines', 'dixièmes', 'centièmes'], 'Le chiffre juste avant la virgule est toujours celui des unités.'),
    qcm('dec_r02', 'Le premier chiffre après la virgule est toujours le chiffre des…', 'dixièmes', ['centièmes', 'unités', 'dizaines'], 'Après la virgule : dixièmes, puis centièmes, puis millièmes.'),
    qcm('dec_r03', 'Le deuxième chiffre après la virgule est celui des…', 'centièmes', ['dixièmes', 'millièmes', 'unités'], 'Dixièmes (1er), centièmes (2e), millièmes (3e).'),
    qcm('dec_r04', 'Le troisième chiffre après la virgule est celui des…', 'millièmes', ['centièmes', 'dixièmes', 'dizaines'], 'Dixièmes (1er), centièmes (2e), millièmes (3e).'),
    qcm('dec_r05', 'Juste à gauche du chiffre des unités, on trouve le chiffre des…', 'dizaines', ['dixièmes', 'centaines', 'centièmes'], 'En allant vers la gauche : unités, dizaines, centaines, milliers.'),
    qcm('dec_r06', 'Combien de centièmes y a-t-il dans 1 dixième ?', '10', ['100', '1', '1 000'], '1 dixième = 10 centièmes, car 1/10 = 10/100.', 2),
    qcm('dec_r07', 'Quel nombre est égal à 3 unités et 5 centièmes ?', '3,05', ['3,5', '3,005', '35'], '5 centièmes s\'écrivent au 2e rang après la virgule : 3,05.', 2)
];

export const mathsSkills = [
    { id: 'math_decimal', label: 'Chiffre d\'un rang', gen: generateDecimalQuestion },
    { id: 'math_fraction', label: 'Fractions', gen: generateFractionQuestion },
    { id: 'math_comparison', label: 'Comparer des décimaux', gen: generateComparisonQuestion },
    { id: 'math_construction', label: 'Décomposer un décimal', gen: generateConstructionQuestion },
    { id: 'math_multiplication', label: 'Tables de multiplication', gen: generateSimpleMultiplicationQuestion },
    { id: 'math_line', label: 'Droite graduée', gen: generateGraduatedLineQuestion },
    { id: 'math_conversion', label: 'Mesures et conversions', gen: generateUnitConversionQuestion },
    { id: 'math_mental', label: 'Calcul mental', gen: generateMentalMathQuestion },
    { id: 'dec_rangs', label: 'Vocabulaire des rangs', bank: rangsBank },
    { id: 'dec_chiffre', label: 'Chiffre d\'un rang (jusqu\'aux millièmes)', gen: generateDigitRankQuestion },
    { id: 'dec_valeur', label: 'Valeur d\'un chiffre', gen: generateDigitValueQuestion },
    { id: 'dec_decomp', label: 'Décomposer en fractions décimales', gen: generateDecompositionQuestion },
    { id: 'dec_fraction', label: 'Fractions décimales et décimaux', gen: generateDecimalFractionQuestion },
    { id: 'dec_ordre', label: 'Ranger des décimaux', gen: generateOrderDecimalsQuestion },
    { id: 'dec_operations', label: 'Additions et soustractions de décimaux', gen: generateDecimalOperationQuestion },
    { id: 'math_multiples', label: 'Multiples', gen: generateMultipleQuestion },
    { id: 'math_divisibilite', label: 'Critères de divisibilité', gen: generateDivisibilityQuestion },
    { id: 'math_priorites', label: 'Priorités opératoires', gen: generatePriorityQuestion },
    { id: 'math_division', label: 'Division euclidienne', gen: generateEuclideanQuestion },
    { id: 'math_geometrie', label: 'Périmètres et aires', gen: generatePerimeterAreaQuestion },
    { id: 'math_pourcentages', label: 'Pourcentages simples', gen: generatePercentQuestion },
    { id: 'math_durees', label: 'Durées et horaires', gen: generateDurationQuestion }
].map(s => ({ ...s, subject: 'maths' }));
