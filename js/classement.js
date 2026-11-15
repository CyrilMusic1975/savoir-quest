// Classement commun des joueurs : pseudo, score publié, rang, requête et lecture Firestore (calculs purs, sans réseau ni interface)
export const PSEUDO_MIN = 2;
export const PSEUDO_MAX = 16;
export const TOP = 50;

// Mots refusés dans un pseudo. Les mots courts ne comptent que s'ils forment un mot entier (« computer » reste permis).
const BAD_LONG = ['merde', 'putain', 'salope', 'connard', 'connasse', 'encule', 'niquer', 'batard', 'couille', 'pedophile', 'nazi', 'bordel', 'salaud', 'enfoire', 'trouduc', 'branleur'];
const BAD_WORD = ['pute', 'nique', 'bite', 'con', 'cul', 'fdp', 'ntm', 'pd', 'chier', 'sexe', 'porno', 'zob', 'tg'];

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i' };
// Lettres cyrilliques qui ressemblent à des lettres latines
const LOOKALIKE = { а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', х: 'x', у: 'y', і: 'i', ѕ: 's', ј: 'j', к: 'k', м: 'm', н: 'h', т: 't', в: 'b' };
// NFKD ramène les lettres pleine chasse (ｍ) et accentuées à leur forme simple
const normalize = s => [...s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')].map(c => LOOKALIKE[c] || LEET[c] || c).join('');

function isBad(pseudo) {
    const norm = normalize(pseudo);
    const tokens = norm.split(/[^a-z]+/).filter(Boolean);
    if (tokens.some(t => BAD_WORD.includes(t))) return true;
    const collapsed = norm.replace(/[^a-z]/g, '');
    return BAD_LONG.some(w => collapsed.includes(w));
}

export function cleanPseudo(raw) {
    const pseudo = String(raw ?? '').trim().replace(/\s+/g, ' ');
    const len = [...pseudo].length;
    if (len < PSEUDO_MIN) return { ok: false, pseudo, reason: `Ton pseudo doit faire au moins ${PSEUDO_MIN} caractères.` };
    if (len > PSEUDO_MAX) return { ok: false, pseudo, reason: `Ton pseudo doit faire ${PSEUDO_MAX} caractères au plus.` };
    if (!/^[\p{L}\p{N} '’_-]+$|^[\p{L}\p{N} '’_\-\p{Extended_Pictographic}‍️]+$/u.test(pseudo)) {
        return { ok: false, pseudo, reason: 'Utilise seulement des lettres, des chiffres, des espaces ou des tirets.' };
    }
    if (!/[\p{L}\p{N}]/u.test(pseudo)) return { ok: false, pseudo, reason: 'Ton pseudo doit contenir au moins une lettre ou un chiffre.' };
    if (isBad(pseudo)) return { ok: false, pseudo, reason: 'Choisis un autre pseudo, celui-ci n\'est pas possible.' };
    return { ok: true, pseudo };
}

const ADJ = ['Rapide', 'Malin', 'Super', 'Brave', 'Agile', 'Fort', 'Joyeux', 'Rusé', 'Vif', 'Cool', 'Zen', 'Épique'];
const ANIMALS = ['Renard', 'Lynx', 'Tigre', 'Aigle', 'Requin', 'Dragon', 'Loup', 'Panda', 'Lion', 'Faucon', 'Koala', 'Cobra'];

// 4 pseudos distincts : on avance d'un pas premier avec 144 combinaisons, donc aucun doublon
export function suggestPseudos(seed) {
    const n = ADJ.length * ANIMALS.length;
    let i = ((Math.abs(Math.trunc(seed)) * 2654435761) >>> 0) % n;
    const out = [];
    for (let k = 0; k < 4; k++) {
        out.push(`${ADJ[i % ADJ.length]} ${ANIMALS[Math.floor(i / ADJ.length)]}`);
        i = (i + 37) % n;
    }
    return out;
}

export function scoreOf(profile, week) {
    const s = profile.season;
    return { weekId: week, weekXP: s && s.week === week ? s.xp || 0 : 0, totalXP: profile.totalXP || 0 };
}

export const docId = (uid, profileId) => `${uid}_${profileId}`;

// Classement de compétition : les égalités partagent le rang. `me` : rang, points manquants pour égaler le joueur juste devant.
export function rankRows(rows, tab, meId) {
    const key = tab === 'week' ? 'weekXP' : 'totalXP';
    const sorted = [...rows].sort((a, b) => b[key] - a[key] || String(a.id).localeCompare(String(b.id)));
    const list = sorted.map((r, i) => {
        const rank = sorted.findIndex(x => x[key] === r[key]) + 1;
        return { ...r, rank, me: r.id === meId };
    });
    const mine = list.find(r => r.me);
    if (!mine) return { list, me: { rank: null, gap: null, row: null } };
    const ahead = list.filter(r => r[key] > mine[key]);
    const gap = ahead.length ? ahead[ahead.length - 1][key] - mine[key] : null;
    return { list, me: { rank: mine.rank, gap, row: mine } };
}

export function boardQuery(tab, week) {
    const q = { from: [{ collectionId: 'scores' }], limit: TOP };
    if (tab === 'week') {
        q.where = { fieldFilter: { field: { fieldPath: 'weekId' }, op: 'EQUAL', value: { stringValue: week } } };
        q.orderBy = [{ field: { fieldPath: 'weekXP' }, direction: 'DESCENDING' }];
    } else {
        q.orderBy = [{ field: { fieldPath: 'totalXP' }, direction: 'DESCENDING' }];
    }
    return { structuredQuery: q };
}

// Réponse brute de runQuery -> lignes simples
export function fromFirestoreRows(resp) {
    const num = f => Number(f?.integerValue ?? f?.doubleValue ?? 0) || 0;
    return (Array.isArray(resp) ? resp : []).filter(x => x && x.document).map(({ document: d }) => ({
        id: String(d.name).split('/').pop(),
        pseudo: d.fields?.pseudo?.stringValue || '',
        avatar: d.fields?.avatar?.stringValue || '',
        weekXP: num(d.fields?.weekXP),
        totalXP: num(d.fields?.totalXP)
    }));
}

// Phrase sous le classement : en tête, écart avec celui qui précède, ou écart pour entrer dans le top
export function gapText(ranked, tab) {
    const key = tab === 'week' ? 'weekXP' : 'totalXP';
    const i = ranked.findIndex(r => r.me);
    if (i < 0) return '';
    const mine = ranked[i];
    const ahead = ranked.filter(r => r[key] > mine[key]);
    if (!ahead.length) return ranked.length > 1 && ranked.filter(r => r[key] === mine[key]).length === 1 ? '🏆 Tu es en tête !' : '';
    const plural = n => `${n} point${n > 1 ? 's' : ''}`;
    if (i >= TOP) return `Il te manque ${plural(ranked[TOP - 1][key] - mine[key])} pour rejoindre le top ${TOP}.`;
    return `Il te manque ${plural(ahead[ahead.length - 1][key] - mine[key])} pour rejoindre ${ahead[ahead.length - 1].pseudo}.`;
}

// Message d'état au-dessus de la liste ; `res` vient de fetchBoard (null = rien de disponible)
export function boardMessage(res, tab, ranked) {
    if (!res) return 'Classement indisponible pour l\'instant.';
    if (res.fromCache) return res.reason === 'server' ? 'Classement momentanément indisponible : dernier classement connu.' : 'Hors ligne : dernier classement connu.';
    if (tab === 'week' && ranked.every(r => !r.weekXP)) return 'Personne n\'a encore joué cette semaine. Sois le premier !';
    return '';
}
