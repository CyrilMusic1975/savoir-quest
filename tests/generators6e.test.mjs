// Vérifie, par un recalcul indépendant, les générateurs des chapitres 6e (décimaux, géométrie, anglais, histoire-géo)
import * as M from '../js/content/maths6e.js';
import * as H from '../js/content/histgeo6e.js';
import * as A from '../js/content/anglais.js';

const ROUNDS = 1500;
const num = s => parseFloat(String(s).replace(/[\s ]/g, '').replace(',', '.'));

// Écriture « canonique » d'un nombre décimal avec virgule (zéros facultatifs supprimés)
function canonical(s) {
    let [ip, dp = ''] = s.split(',');
    ip = ip.replace(/^0+(?=\d)/, '');
    dp = dp.replace(/0+$/, '');
    return dp ? `${ip},${dp}` : ip;
}
const ROMAN_TABLE = { 1: 'I', 4: 'IV', 5: 'V', 9: 'IX', 10: 'X', 14: 'XIV', 19: 'XIX', 24: 'XXIV', 29: 'XXIX', 39: 'XXXIX', 40: 'XL', 1994: 'MCMXCIV', 2026: 'MMXXVI' };
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
const CARDINALS = { 0: 'zero', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 18: 'eighteen', 20: 'twenty', 21: 'twenty-one', 30: 'thirty', 40: 'forty', 44: 'forty-four', 58: 'fifty-eight', 80: 'eighty', 99: 'ninety-nine', 100: 'one hundred' };

// Une notation désigne-t-elle le même objet géométrique qu'une autre ? ((AB) = (BA), [AB] = [BA], [AB) ≠ [BA))
const geoKey = n => {
    const t = n[0] === '(' ? 'line' : n[n.length - 1] === ']' ? 'segment' : 'ray';
    const l = n.slice(1, 3);
    return t === 'ray' ? `ray${l}` : `${t}${[...l].sort().join('')}`;
};

export function run(fail) {
    let n = 0;
    const bad = (g, q, why) => fail(`${g} : ${why} — « ${q.text} » options=${JSON.stringify(q.options)} réponse=${q.answer}`);
    const checkQcm = (g, q) => {
        if (q.kind === 'qcm' && (!q.options.includes(q.answer) || new Set(q.options).size !== q.options.length || q.options.length < 2)) bad(g, q, 'options invalides');
        if (q.kind === 'qcm' && q.options.length === 3) bad(g, q, 'il manque une mauvaise réponse');
        if (!q.explanation) bad(g, q, 'explication manquante');
    };

    // Chiffres romains : table de référence
    Object.entries(ROMAN_TABLE).forEach(([k, v]) => {
        if (H.toRoman(Number(k)) !== v) fail(`toRoman(${k}) devrait valoir ${v}, obtenu ${H.toRoman(Number(k))}`);
        if (H.fromRoman(v) !== Number(k)) fail(`fromRoman(${v}) devrait valoir ${k}`);
    });
    for (let i = 1; i < 4000; i++) if (H.fromRoman(H.toRoman(i)) !== i) { fail(`aller-retour romain faux pour ${i}`); break; }
    // Nombres en anglais : références écrites à la main
    Object.entries(CARDINALS).forEach(([k, v]) => { if (A.numberWords(Number(k)) !== v) fail(`numberWords(${k}) = ${A.numberWords(Number(k))}, attendu ${v}`); });
    for (let i = 1; i <= 31; i++) {
        if (A.ordinalWords(i) !== ORDINALS[i]) fail(`ordinalWords(${i}) = ${A.ordinalWords(i)}, attendu ${ORDINALS[i]}`);
        const exp = [11, 12, 13].includes(i) ? 'th' : i % 10 === 1 ? 'st' : i % 10 === 2 ? 'nd' : i % 10 === 3 ? 'rd' : 'th';
        if (A.ordinalSuffix(i) !== exp) fail(`ordinalSuffix(${i}) = ${A.ordinalSuffix(i)}, attendu ${exp}`);
    }

    for (let r = 0; r < ROUNDS; r++) {
        // --- Zéros facultatifs ---
        let q = M.generateOptionalZerosQuestion(); n++; checkQcm('zéros', q);
        const shown = q.text.split(': ')[1];
        if (canonical(shown) !== q.answer) bad('zéros', q, `la bonne réponse devrait être ${canonical(shown)}`);
        if (q.options.some(o => o !== q.answer && canonical(o) === o && num(o) === num(q.answer))) bad('zéros', q, 'une mauvaise réponse vaut la bonne');

        // --- Égal / différent ---
        q = M.generateEqualityQuestion(); n++; checkQcm('égalité', q);
        const [a, b] = q.text.replace('Complète : ', '').split(' … ');
        if ((num(a) === num(b) ? '=' : '≠') !== q.answer) bad('égalité', q, 'mauvais signe');

        // --- Partie entière / décimale ---
        q = M.generatePartsQuestion(); n++; checkQcm('parties', q);
        const nb = (q.text.match(/\d+,\d+|E\((\d+)\)/) || [])[0];
        if (q.kind === 'qcm') {
            const m = q.text.match(/(\d+),(\d+)/);
            const [ip, dec] = [m[1], m[2]];
            if (q.text.startsWith('Quelle est la partie entière') && q.answer !== ip) bad('parties', q, 'partie entière fausse');
            if (q.text.startsWith('Quelle est la partie décimale') && q.answer !== `0,${dec}`) bad('parties', q, 'partie décimale fausse');
            if (q.text.startsWith('Décompose') && q.answer !== `${ip} + 0,${dec}`) bad('parties', q, 'décomposition fausse');
        } else {
            const m = q.text.match(/E\((\d+)(?:,(\d+))?\)/);
            if (String(Math.floor(num(m[2] ? `${m[1]},${m[2]}` : m[1]))) !== q.answer) bad('parties', q, 'E(x) faux');
        }

        // --- Paquets ---
        q = M.generatePacketsQuestion(); n++; checkQcm('paquets', q);
        const get = w => { const mm = q.text.match(new RegExp(`(\\d) ${w}`)); return mm ? Number(mm[1]) : 0; };
        const expected = get('dizaine') * 10 + get('unité') + get('dixième') / 10 + get('centième') / 100;
        if (Math.abs(num(q.answer) - expected) > 1e-9) bad('paquets', q, `valeur attendue ${expected}`);
        if (q.options.some(o => o !== q.answer && Math.abs(num(o) - expected) < 1e-9)) bad('paquets', q, 'une mauvaise réponse vaut la bonne');

        // --- Fraction décimale ---
        q = M.generateFractionDecimalQuestion(); n++; checkQcm('fraction décimale', q);
        const f = q.text.match(/(\d+)\/(\d+)/);
        if (f) {
            if (Math.abs(num(q.answer) - Number(f[1]) / Number(f[2])) > 1e-9) bad('fraction décimale', q, 'valeur fausse');
        } else {
            const d = num(q.text.match(/Écris ([\d,]+) sous/)[1]);
            const [x, y] = q.answer.split('/').map(Number);
            if (Math.abs(x / y - d) > 1e-9) bad('fraction décimale', q, 'fraction fausse');
            if (q.options.some(o => { const [p, s] = o.split('/').map(Number); return o !== q.answer && Math.abs(p / s - d) < 1e-9; })) bad('fraction décimale', q, 'mauvaise réponse équivalente');
        }

        // --- Géométrie : notations ---
        q = M.generateGeoNotationQuestion(); n++; checkQcm('notation', q);
        if (new Set(q.options.filter(o => /^[(\[]/.test(o)).map(geoKey)).size !== q.options.filter(o => /^[(\[]/.test(o)).length) bad('notation', q, 'deux notations désignent le même objet');
        if (q.visual) {
            const o = q.visual.obj;
            const exp = o.type === 'line' ? `(${o.from}${o.to})` : o.type === 'ray' ? `[${o.from}${o.to})` : `[${o.from}${o.to}]`;
            if (geoKey(q.answer) !== geoKey(exp)) bad('notation', q, `la figure montre ${exp}`);
            if (o.type === 'ray') {
                const pa = q.visual.points.find(p => p.l === o.from), pb = q.visual.points.find(p => p.l === o.to);
                if (pa.x === pb.x) bad('notation', q, 'points confondus');
            }
        }

        // --- Géométrie : appartenance ---
        q = M.generateGeoBelongQuestion(); n++; checkQcm('appartenance', q);
        const t = q.text.match(/Complète : (\w) … ([(\[])(\w)(\w)([)\]])/);
        const pts = Object.fromEntries(q.visual.points.map(p => [p.l, p.x]));
        const type = t[2] === '(' ? 'line' : t[5] === ']' ? 'segment' : 'ray';
        let inside;
        if (q.visual.off && q.visual.off.l === t[1]) inside = false;
        else if (type === 'line') inside = true;
        else if (type === 'segment') inside = pts[t[1]] >= Math.min(pts[t[3]], pts[t[4]]) && pts[t[1]] <= Math.max(pts[t[3]], pts[t[4]]);
        else inside = pts[t[4]] > pts[t[3]] ? pts[t[1]] >= pts[t[3]] : pts[t[1]] <= pts[t[3]];
        if ((inside ? '∈' : '∉') !== q.answer) bad('appartenance', q, 'appartenance fausse');
        if (new Set(q.visual.points.map(p => p.l)).size !== q.visual.points.length || (q.visual.off && q.visual.points.some(p => p.l === q.visual.off.l))) bad('appartenance', q, 'lettres en double');

        // --- Géométrie : nombre de noms ---
        q = M.generateGeoNamesQuestion(); n++;
        const k = Number(q.text.match(/^(\d+) points/)[1]);
        if (String(k * (k - 1)) !== q.answer || q.visual.points.length !== k) bad('noms', q, 'nombre de noms ou de points faux');
        if (new Set(q.visual.points.map(p => p.l)).size !== k) bad('noms', q, 'lettres en double');

        // --- Histoire : romains, siècles, frise ---
        q = H.generateRomanQuestion(); n++; checkQcm('romains', q);
        if (q.kind === 'input' && q.numeric) { const rr = q.text.match(/Écris ([IVXLCDM]+) en/)[1]; if (String(H.fromRoman(rr)) !== q.answer) bad('romains', q, 'conversion fausse'); }
        else if (q.kind === 'input') { const nn = Number(q.text.match(/Écris (\d+) en/)[1]); if (H.toRoman(nn) !== q.answer) bad('romains', q, 'conversion fausse'); }
        else { const rr = q.text.match(/représente ([IVXLCDM]+)/)[1]; if (String(H.fromRoman(rr)) !== q.answer) bad('romains', q, 'valeur fausse'); }

        q = H.generateCenturyQuestion(); n++; checkQcm('siècles', q);
        let m2;
        if ((m2 = q.text.match(/l'année (\d+) avant J\.-C\./))) { const c = Math.ceil(Number(m2[1]) / 100); if (!q.answer.startsWith(c === 1 ? 'Ier' : `${H.toRoman(c)}e`) || !q.answer.endsWith('avant J.-C.')) bad('siècles', q, 'siècle av. J.-C. faux'); }
        else if ((m2 = q.text.match(/l'année (\d+) \?/))) { const c = Math.ceil(Number(m2[1]) / 100); if (!q.answer.startsWith(c === 1 ? 'Ier' : `${H.toRoman(c)}e`)) bad('siècles', q, 'siècle faux'); }
        else { m2 = q.text.match(/Le ([IVXLCDM]+|Ier)e? siècle/); const c = m2[1] === 'Ier' ? 1 : H.fromRoman(m2[1]); if (q.answer !== `de ${(c - 1) * 100 + 1} à ${c * 100}`) bad('siècles', q, 'années du siècle fausses'); }

        q = H.generateTimelineQuestion(); n++;
        const years = q.items.map(it => { const d = it.match(/\(([^)]+)\)$/)[1]; const v = Number(d.replace(/[^\d]/g, '')); return d.includes('av. J.-C.') ? -v : v; });
        if (years.some((y, i) => i && y < years[i - 1]) || new Set(q.items).size !== q.items.length) bad('frise', q, 'ordre chronologique faux');

        // --- Anglais ---
        q = A.generateNumberQuestion(); n++; checkQcm('nombres anglais', q);
        if (q.kind === 'input') {
            const v = Number(q.text.match(/Écris (\d+) en anglais/)[1]);
            if (q.answer !== A.numberWords(v)) bad('nombres anglais', q, 'mot faux');
            if (!q.accept.includes(q.answer)) bad('nombres anglais', q, 'réponse non acceptée');
        } else if (/Quel nombre est/.test(q.text)) {
            const w = q.text.match(/« (.+) »/)[1];
            if (A.numberWords(Number(q.answer)) !== w) bad('nombres anglais', q, 'nombre faux');
        }
        q = A.generateOrdinalQuestion(); n++; checkQcm('ordinaux', q);
        if (q.kind === 'input') {
            const v = Number(q.text.match(/: (\d+)/)[1]);
            if (q.answer !== ORDINALS[v]) bad('ordinaux', q, 'ordinal faux');
        } else if (/Comment abrège-t-on/.test(q.text)) {
            const w = q.text.match(/« (.+) »/)[1];
            const v = ORDINALS.indexOf(w);
            if (q.answer !== `${v}${A.ordinalSuffix(v)}`) bad('ordinaux', q, 'abréviation fausse');
        }
    }
    return `${n} questions des chapitres 6e vérifiées par recalcul`;
}
