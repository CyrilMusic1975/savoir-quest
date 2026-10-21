export function shuffle(a) {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
}
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
// Cas précis que l'élève rate (renseigné par le moteur avant chaque séance) : on les propose plus souvent
export const focus = { weak: {} };
export function weakFacet(skillId) {
    const list = focus.weak[skillId];
    return list && list.length && Math.random() < 0.5 ? list[Math.floor(Math.random() * list.length)] : null;
}
export const fmtNum = n => String(n).replace('.', ',');

export function generateOptions(correct, isNumeric, customGen = null) {
    const opts = [correct];
    const val = parseInt(correct);
    // Pour un nombre : leurres proches, positifs, et dans 0-9 si la réponse est un chiffre
    const spread = Math.max(5, Math.round(Math.abs(val) * 0.15));
    const max = val < 10 ? 9 : Infinity;
    let guard = 0;
    while (opts.length < 4 && guard++ < 500) {
        let fake;
        if (customGen) fake = customGen();
        else {
            const delta = (1 + Math.floor(Math.random() * spread)) * (Math.random() < 0.5 ? -1 : 1);
            const n = val + delta;
            if (n < 0 || n > max) continue;
            fake = n.toString();
        }
        if (fake && !opts.includes(fake)) opts.push(fake);
    }
    return shuffle(opts);
}

// Options numériques avec des leurres "pièges" imposés (ex : résultat en ignorant les priorités)
export function numOptions(correct, extras = []) {
    const c = String(correct);
    const opts = [c];
    extras.map(String).forEach(e => { if (!opts.includes(e) && !e.startsWith('-') && opts.length < 4) opts.push(e); });
    if (opts.length >= 4) return shuffle(opts);
    return generateOptions(c, true, null).filter(o => !opts.includes(o)).slice(0, 4 - opts.length).concat(opts).sort(() => Math.random() - 0.5);
}

// --- Constructeurs de questions "banque" (id stable = suivi par répétition espacée) ---
export const qcm = (id, text, answer, wrongs, explanation, level = 1) =>
    ({ id, kind: 'qcm', text, answer, options: [answer, ...wrongs], explanation, level });
export const tf = (id, statement, truth, explanation, level = 1) =>
    ({ id, kind: 'qcm', fixedOrder: true, text: 'Vrai ou faux ? ' + statement, answer: truth ? 'Vrai' : 'Faux', options: ['Vrai', 'Faux'], explanation, level });
export const fill = (id, sentence, answer, options, explanation, level = 1) =>
    qcm(id, 'Complète : ' + sentence, answer, options.filter(o => o !== answer), explanation, level);
export const order = (id, text, items, explanation, level = 1) =>
    ({ id, kind: 'order', text, items, answer: items.join(' → '), explanation, level });
export const match = (id, text, pairs, explanation, level = 1) =>
    ({ id, kind: 'match', text, pairs, answer: pairs.map(p => p.join(' = ')).join(' ; '), explanation, level });
export const input = (id, text, answer, explanation, accept = [], level = 1, numeric = false) =>
    ({ id, kind: 'input', text, answer, accept: [answer, ...accept], numeric, explanation, level });
export const tap = (id, text, sentence, answerWords, explanation, level = 1) =>
    ({ id, kind: 'tap', text, tokens: sentence.split(' '), answerIdx: answerWords, answer: answerWords.map(i => sentence.split(' ')[i]).join(' '), explanation, level });
export const flash = (id, front, back, level = 1) =>
    ({ id, kind: 'flash', text: front, answer: back, explanation: back, level });
