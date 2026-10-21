import { SUBJECTS, SKILLS, SKILL_BY_ID, QUESTION_BY_ID } from './content/index.js';
import { ctx } from './content/maths.js';
import { shuffle, pick } from './content/helpers.js';
import { today, addDays } from './state.js';

export const SESSION_SIZE = 10;
const INTERVALS = [0, 1, 3, 7, 14, 30]; // jours avant la prochaine révision selon la "boîte"
const MAX_MISSED = 30;
// Une bonne réponse trop lente est « fragile » : elle compte à moitié pour les facettes et ne fait pas avancer la révision espacée
const SLOW_MS = { qcm: 15000, input: 30000, tap: 20000, order: 30000, match: 40000 };

// Badges par compétence : paliers sur le nombre de bonnes réponses ET la réussite récente (20 dernières)
export const TIERS = [
    { name: 'Bronze', emoji: '🥉', ok: 10, rate: 0.7 },
    { name: 'Argent', emoji: '🥈', ok: 30, rate: 0.8 },
    { name: 'Or', emoji: '🥇', ok: 60, rate: 0.9 }
];
function tierFor(st) {
    const last = st.last || [];
    if (last.length < 10) return 0;
    const rate = last.reduce((a, b) => a + b, 0) / last.length;
    let tier = 0;
    TIERS.forEach((t, i) => { if (st.ok >= t.ok && rate >= t.rate) tier = i + 1; });
    return tier;
}
export function badgeProgress(profile, skillId) {
    const st = profile.skillStats[skillId] || { ok: 0, last: [] };
    const tier = profile.badges[skillId] || 0;
    const next = TIERS[tier] || null;
    return { tier, ok: st.ok, next, need: next ? next.ok : null };
}

const skillOf = q => SKILL_BY_ID[q.skill || q.generatorId];
const subjectOf = q => q.subject || skillOf(q)?.subject;

function tag(q, skill) {
    q.skill = skill.id;
    q.generatorId = skill.id; // clé de maîtrise (compatible avec les anciens profils)
    q.subject = skill.subject;
    q.label = skill.label;
    return q;
}

function cloneBankQuestion(src) {
    const q = { ...src };
    if (q.kind === 'qcm' && !q.fixedOrder) q.options = shuffle(q.options);
    return q;
}

function weightedSkill(profile, skills) {
    const weights = skills.map(s => Math.max(1, Math.min(20, 10 - (profile.mastery[s.id] || 0))) * (s.extra ? 0.25 : 1));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < skills.length; i++) { r -= weights[i]; if (r <= 0) return skills[i]; }
    return skills[skills.length - 1];
}

// Matières plus faibles = un peu plus souvent proposées
function pickSubject(profile) {
    const weights = SUBJECTS.map(sub => {
        const skills = SKILLS.filter(s => s.subject === sub.id);
        const avg = skills.reduce((a, s) => a + Math.max(1, Math.min(20, 10 - (profile.mastery[s.id] || 0))), 0) / skills.length;
        return 1 + avg / 10;
    });
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < SUBJECTS.length; i++) { r -= weights[i]; if (r <= 0) return SUBJECTS[i].id; }
    return SUBJECTS[0].id;
}

function questionFromSkill(profile, skill, usedKeys) {
    if (skill.gen) return tag(skill.gen(), skill);
    const level = profile.levels[skill.id] || 1;
    const pool = skill.bank.filter(q => q.level <= level && !usedKeys.has(q.id));
    if (!pool.length) return null;
    const fresh = pool.filter(q => !profile.srs[q.id]);
    const src = fresh.length && Math.random() < 0.7 ? pick(fresh) : pick(pool);
    return tag(cloneBankQuestion(src), skill);
}

export function countToReview(profile) {
    const failed = Object.values(profile.srs).filter(e => e.fail).length;
    return failed + profile.missed.length;
}

export function countDue(profile) {
    const t = today();
    return Object.entries(profile.srs).filter(([id, e]) => e.due <= t && e.last !== t && QUESTION_BY_ID[id]).length;
}

// mode : 'daily' (mission du jour, toutes matières), 'subject' (une matière), 'errors' (carnet d'erreurs)
// Facettes ratées par compétence : au moins 2 essais et moins de 60 % de réussite
function weakFacets(profile) {
    const out = {};
    Object.entries(profile.facets).forEach(([skill, facets]) => {
        const weak = Object.entries(facets)
            .filter(([, st]) => st.total >= 2 && st.ok / st.total < 0.6)
            .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total)
            .map(([name]) => name);
        if (weak.length) out[skill] = weak;
    });
    return out;
}

export function buildSession(profile, mode, subject) {
    ctx.mastery = profile.mastery;
    ctx.weak = weakFacets(profile);
    const qs = [];
    const used = new Set();
    const add = q => {
        if (!q) return false;
        const key = q.id || q.text;
        if (used.has(key)) return false;
        used.add(key);
        qs.push(q);
        return true;
    };
    const inScope = q => mode !== 'subject' || subjectOf(q) === subject;
    const fromSrs = id => {
        const src = QUESTION_BY_ID[id];
        return src && { ...cloneBankQuestion(src), generatorId: src.skill };
    };

    if (mode === 'errors') {
        Object.entries(profile.srs).filter(([id, e]) => e.fail && QUESTION_BY_ID[id]).slice(0, SESSION_SIZE).forEach(([id]) => add(fromSrs(id)));
        profile.missed.splice(0, SESSION_SIZE - qs.length).forEach(add);
        return shuffle(qs);
    }

    const t = today();
    Object.entries(profile.srs)
        .filter(([id, e]) => e.due <= t && e.last !== t && QUESTION_BY_ID[id] && inScope(QUESTION_BY_ID[id]))
        .sort((a, b) => a[1].due.localeCompare(b[1].due))
        .slice(0, 4)
        .forEach(([id]) => add(fromSrs(id)));

    const room = Math.min(2, SESSION_SIZE - qs.length);
    const keep = [];
    const picked = [];
    profile.missed.forEach(q => (picked.length < room && inScope(q) ? picked.push(q) : keep.push(q)));
    profile.missed = keep;
    picked.forEach(add);

    let guard = 0;
    while (qs.length < SESSION_SIZE && guard++ < 400) {
        const subj = mode === 'daily' ? pickSubject(profile) : subject;
        const skills = SKILLS.filter(s => s.subject === subj);
        add(questionFromSkill(profile, weightedSkill(profile, skills), used));
    }
    return shuffle(qs);
}

// Retourne un éventuel nouveau badge obtenu grâce à cette réponse
export function recordAnswer(profile, q, correct, ms) {
    const id = q.skill || q.generatorId;
    const slow = !!(correct && ms && ms > (SLOW_MS[q.kind || 'qcm'] || 20000));
    let newBadge = null;
    if (id) {
        profile.mastery[id] = correct ? (profile.mastery[id] || 0) + 1 : Math.max(-10, (profile.mastery[id] || 0) - 2);
        const stat = (profile.skillStats[id] = profile.skillStats[id] || { ok: 0, total: 0, last: [] });
        stat.total++;
        if (correct) stat.ok++;
        if (correct && ms) stat.ms = stat.ms ? Math.round(stat.ms * 0.8 + ms * 0.2) : ms; // vitesse moyenne (pour la carte)
        stat.last.push(correct ? 1 : 0);
        if (stat.last.length > 20) stat.last.shift();
        const tier = tierFor(stat);
        if (tier > (profile.badges[id] || 0)) {
            profile.badges[id] = tier;
            newBadge = { id, label: SKILL_BY_ID[id]?.label || id, tier: TIERS[tier - 1] };
        }
        const recent = (profile.recent[id] = profile.recent[id] || []);
        recent.push(correct ? 1 : 0);
        if (recent.length > 10) recent.shift();
        const level = profile.levels[id] || 1;
        // Niveau supérieur des questions de cours : 8 bonnes réponses sur les 10 dernières
        if (SKILL_BY_ID[id]?.bank && level < 3 && recent.length >= 10 && recent.reduce((a, b) => a + b, 0) >= 8) {
            profile.levels[id] = level + 1;
            profile.recent[id] = [];
        }
    }
    if (q.facet && id) {
        const f = ((profile.facets[id] = profile.facets[id] || {})[q.facet] = profile.facets[id][q.facet] || { ok: 0, total: 0 });
        f.total++;
        if (correct) f.ok += slow ? 0.5 : 1;
        // on oublie progressivement les anciens essais pour que la facette puisse se "guérir"
        if (f.total > 12) { f.ok = Math.round(f.ok * 0.75); f.total = Math.round(f.total * 0.75); }
    }
    const subj = subjectOf(q);
    if (subj) {
        const st = (profile.stats[subj] = profile.stats[subj] || { ok: 0, total: 0 });
        st.total++;
        if (correct) st.ok++;
    }
    if (q.id) {
        // répétition espacée : une bonne réponse espace la prochaine révision, une erreur la ramène à aujourd'hui
        const e = (profile.srs[q.id] = profile.srs[q.id] || { box: 0, due: today() });
        if (correct && slow) {
            e.due = addDays(today(), 1); // réussie mais hésitante : on la revoit demain, sans avancer
            e.fail = false;
        } else if (correct) {
            e.box = Math.min(5, e.box + 1);
            e.due = addDays(today(), INTERVALS[e.box]);
            e.fail = false;
        } else {
            e.box = 0;
            e.due = today();
            e.fail = true;
        }
        e.last = today();
    } else if (!correct && !profile.missed.some(m => m.text === q.text)) {
        profile.missed.push(q);
        if (profile.missed.length > MAX_MISSED) profile.missed.shift();
    }
    if (correct && q.metadata && q.metadata.type === 'classic') {
        const [a, b] = q.metadata.factors;
        profile.mastery[`${a}x${b}`] = (profile.mastery[`${a}x${b}`] || 0) + 1;
        profile.mastery[`${b}x${a}`] = (profile.mastery[`${b}x${a}`] || 0) + 1;
    }
    return newBadge;
}

// Appelé à la fin d'une séance : met à jour la série de jours consécutifs
export function completeSession(profile) {
    const t = today();
    const d = profile.daily;
    if (d.last !== t) {
        d.streak = d.last === addDays(t, -1) ? d.streak + 1 : 1;
        d.last = t;
    }
    return d.streak;
}

export function currentStreak(profile) {
    const t = today();
    const d = profile.daily;
    return d.last === t || d.last === addDays(t, -1) ? d.streak : 0;
}
export const doneToday = profile => profile.daily.last === today();
