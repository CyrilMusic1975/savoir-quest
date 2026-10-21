// Vérifie la cohérence de toutes les questions de banque (ajout de contenu = à relancer)
import { SKILLS, SUBJECTS } from '../js/content/index.js';

export function run(fail) {
    const subjects = new Set(SUBJECTS.map(s => s.id));
    const skillIds = new Set();
    const qIds = new Set();
    for (const s of SKILLS) {
        if (skillIds.has(s.id)) fail(`compétence en double : ${s.id}`);
        skillIds.add(s.id);
        if (!subjects.has(s.subject)) fail(`${s.id} : matière inconnue « ${s.subject} »`);
        if (!s.label) fail(`${s.id} : label manquant`);
        if (!s.gen && !(s.bank && s.bank.length)) fail(`${s.id} : ni générateur ni banque`);
        for (const q of s.bank || []) {
            const at = `${s.id}/${q.id}`;
            if (!q.id) { fail(`${s.id} : question sans id`); continue; }
            if (qIds.has(q.id)) fail(`identifiant de question en double : ${q.id}`);
            qIds.add(q.id);
            if (!q.text) fail(`${at} : énoncé manquant`);
            if (!q.explanation) fail(`${at} : explication manquante`);
            if (![1, 2, 3].includes(q.level)) fail(`${at} : niveau invalide`);
            const kind = q.kind || 'qcm';
            if (kind === 'qcm') {
                if (!Array.isArray(q.options) || q.options.length < 2) fail(`${at} : moins de 2 options`);
                else {
                    if (!q.options.includes(q.answer)) fail(`${at} : la bonne réponse n'est pas dans les options`);
                    if (new Set(q.options).size !== q.options.length) fail(`${at} : options en double`);
                }
            } else if (kind === 'order') {
                if (!q.items || q.items.length < 2 || new Set(q.items).size !== q.items.length) fail(`${at} : éléments à ordonner invalides`);
            } else if (kind === 'match') {
                const l = q.pairs.map(p => p[0]), r = q.pairs.map(p => p[1]);
                if (new Set(l).size !== l.length || new Set(r).size !== r.length) fail(`${at} : paires en double`);
            } else if (kind === 'tap') {
                if (!q.answerIdx.length || q.answerIdx.some(i => i < 0 || i >= q.tokens.length)) fail(`${at} : indices de mots invalides`);
            } else if (kind === 'input') {
                if (!q.accept || !q.accept.length) fail(`${at} : réponses acceptées manquantes`);
            } else fail(`${at} : type inconnu « ${kind} »`);
        }
    }
    return `${SKILLS.length} compétences, ${qIds.size} questions de banque`;
}
