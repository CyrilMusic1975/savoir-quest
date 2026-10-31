// Contrôle des phrases de Kiko et du choix de l'événement
import { PHRASES, kikoSays, onQuestion, onResult } from '../js/kiko.js';

export function run(fail) {
    const needed = ['start', 'think', 'correct', 'streak', 'wrong'];
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
    return `${total} phrases de Kiko vérifiées`;
}
