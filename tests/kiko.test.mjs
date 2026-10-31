// Contrôle des phrases de Kiko et du choix de l'événement
import { PHRASES, kikoSays, onQuestion, onResult, canRetry, TIPS, nextTip } from '../js/kiko.js';

export function run(fail) {
    const needed = ['start', 'think', 'correct', 'streak', 'retry', 'retryok', 'wrong'];
    let total = 0;
    for (const ev of needed) {
        const list = PHRASES[ev];
        if (!Array.isArray(list) || list.length < 3) { fail(`kiko/${ev} : moins de 3 phrases`); continue; }
        if (new Set(list).size !== list.length) fail(`kiko/${ev} : phrases en double`);
        for (const t of list) {
            total++;
            if (!t.trim() || t.length > 90) fail(`kiko/${ev} : phrase vide ou trop longue « ${t} »`);
        }
        // la rotation parcourt toutes les phrases, dans l'ordre, sans répéter deux fois de suite
        const seen = new Set();
        for (let n = 0; n < list.length; n++) {
            const t = kikoSays(ev, n);
            seen.add(t);
            if (n > 0 && t === kikoSays(ev, n - 1)) fail(`kiko/${ev} : même phrase deux fois de suite`);
        }
        if (seen.size !== list.length) fail(`kiko/${ev} : la rotation ne parcourt pas toutes les phrases`);
    }
    // Aucune phrase d'erreur ne doit donner la réponse ni se moquer
    for (const t of PHRASES.wrong) if (/nul|bête|idiot|raté/i.test(t)) fail(`kiko/wrong : ton à revoir « ${t} »`);
    // choix de l'événement, recalculé ici de façon indépendante
    const expected = (ok, s) => (ok ? (s >= 3 ? 'streak' : 'correct') : 'wrong');
    for (const ok of [true, false]) for (let s = 0; s < 6; s++) {
        if (onResult(ok, s) !== expected(ok, s)) fail(`kiko : événement faux pour ok=${ok}, série=${s}`);
    }
    if (onQuestion(0) !== 'start' || onQuestion(4) !== 'think') fail('kiko : événement de question incorrect');
    // seconde chance : seulement avec un coup de pouce et au moins 3 choix (ou une saisie)
    const qc = n => ({ kind: 'qcm', hint: 'indice', options: Array.from({ length: n }, (_, i) => String(i)) });
    if (canRetry(qc(2))) fail('kiko : pas de seconde chance sur un vrai/faux');
    if (!canRetry(qc(3)) || !canRetry(qc(4))) fail('kiko : seconde chance attendue à partir de 3 options');
    if (canRetry({ ...qc(4), hint: undefined })) fail('kiko : pas de seconde chance sans coup de pouce');
    if (!canRetry({ kind: 'input', hint: 'indice' })) fail('kiko : seconde chance attendue sur une saisie');
    if (canRetry({ kind: 'order', hint: 'indice', items: ['a', 'b', 'c'] })) fail('kiko : seconde chance non gérée pour remettre dans l\'ordre');
    // explications des objectifs : uniques, courtes, une par jour, jamais deux fois la même
    if (new Set(TIPS.map(t => t.id)).size !== TIPS.length) fail('kiko : identifiants d\'explication en double');
    for (const t of TIPS) if (!t.text || t.text.length > 170) fail(`kiko : explication vide ou trop longue (${t.id})`);
    const seen = [];
    let day = 0;
    const order = [];
    for (let i = 0; i < TIPS.length + 3; i++) {
        const t = nextTip(seen, `j${day}`, i ? `j${day - 1}` : null);
        if (nextTip(seen, `j${day}`, `j${day}`) !== null) fail('kiko : deux explications le même jour');
        if (t) { order.push(t.id); seen.push(t.id); }
        day++;
    }
    if (order.join() !== TIPS.map(t => t.id).join()) fail(`kiko : ordre des explications incorrect (${order.join()})`);
    if (nextTip(seen, 'j99', 'j98') !== null) fail('kiko : une explication déjà vue est revenue');
    return `${total} phrases de Kiko vérifiées`;
}
