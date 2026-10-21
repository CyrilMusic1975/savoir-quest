// Vérifie le moteur de séances : 10 questions valides, toutes matières, répétition espacée et badges
import { buildSession, recordAnswer, TIERS } from '../js/engine.js';
import { ensureProfile } from '../js/state.js';
import { SUBJECTS } from '../js/content/index.js';

export function run(fail) {
    const p = ensureProfile({ id: 't', name: 'Test' });
    const seenSubjects = new Set();
    let badges = 0;
    for (let i = 0; i < 300; i++) {
        const s = buildSession(p, 'daily');
        if (s.length !== 10) fail(`mission du jour de ${s.length} questions`);
        s.forEach(q => {
            seenSubjects.add(q.subject);
            if ((q.kind || 'qcm') === 'qcm' && (!q.options.includes(q.answer) || new Set(q.options).size !== q.options.length)) fail(`QCM invalide : ${q.text}`);
            if (recordAnswer(p, q, Math.random() < 0.9, 3000)) badges++;
        });
    }
    SUBJECTS.forEach(sub => {
        if (!seenSubjects.has(sub.id)) fail(`matière jamais proposée : ${sub.id}`);
        const s = buildSession(p, 'subject', sub.id);
        if (s.length !== 10 || s.some(q => q.subject && q.subject !== sub.id)) fail(`séance de ${sub.id} incorrecte`);
    });
    if (!badges) fail('aucun badge obtenu après 3000 réponses à 90 %');
    if (TIERS.length !== 3) fail('les paliers de badges ont changé');
    // une bonne réponse lente ne doit pas faire avancer la révision espacée
    const q = { id: 'x_test', skill: 'fr_accord', subject: 'francais', kind: 'qcm', text: 't', answer: 'a', options: ['a', 'b'] };
    recordAnswer(p, q, true, 1000);
    const box = p.srs.x_test.box;
    recordAnswer(p, q, true, 60000);
    if (p.srs.x_test.box !== box) fail('une réponse lente a fait avancer la révision espacée');
    recordAnswer(p, q, false, 1000);
    if (!p.srs.x_test.fail) fail('une erreur doit être marquée à revoir');
    return `300 missions simulées, ${badges} badges attribués`;
}
