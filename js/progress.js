// Compétition : match du jour, saison hebdomadaire, records, cartes de joueur.
import { weekId, today } from './state.js';

// ---------- Saison (une semaine, du lundi au dimanche) ----------
export const LEAGUES = [
    { name: 'Bronze', emoji: '🥉', xp: 0 },
    { name: 'Argent', emoji: '🥈', xp: 1500 },
    { name: 'Or', emoji: '🥇', xp: 3500 },
    { name: 'Champion', emoji: '🏆', xp: 6000 }
];
export const leagueFor = xp => [...LEAGUES].reverse().find(l => xp >= l.xp) || LEAGUES[0];

export function leagueProgress(xp) {
    const league = leagueFor(xp);
    const next = LEAGUES[LEAGUES.indexOf(league) + 1] || null;
    return { league, next, need: next ? next.xp - xp : 0, pct: next ? Math.round(((xp - league.xp) / (next.xp - league.xp)) * 100) : 100 };
}

// Ouvre la saison de la semaine ; si la précédente vient de finir, la range dans l'historique et la signale
export function ensureSeason(profile, week = weekId()) {
    if (!profile.season) { profile.season = { week, xp: 0 }; return; }
    if (profile.season.week === week) return;
    const old = profile.season;
    if (old.xp > 0) {
        profile.seasons.push({ week: old.week, xp: old.xp, league: leagueFor(old.xp).name });
        if (profile.seasons.length > 40) profile.seasons.shift();
        profile.pendingSeasonReview = { week: old.week, xp: old.xp, league: leagueFor(old.xp).name };
    }
    profile.season = { week, xp: 0 };
}

// Ajoute des XP à la saison ; retourne la ligue atteinte si elle vient de changer
export function addSeasonXP(profile, xp) {
    ensureSeason(profile);
    const before = leagueFor(profile.season.xp);
    profile.season.xp += xp;
    const after = leagueFor(profile.season.xp);
    return after !== before ? after : null;
}

// ---------- Match du jour ----------
export const OPPONENTS = ['FC Fractions', 'Real Décimal', 'Olympique des Équations', 'AS Géométrie', 'Paris Saint-Grammaire', 'Inter Multiplication', 'Atlético Syntaxe', 'Borussia Conjugaison', 'Bayern Divisible', 'Juventus Verbe', 'Lyon Logique', 'Manchester Mesure'];
export function opponentOf(dateStr = today()) {
    let h = 0;
    for (const c of dateStr) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return OPPONENTS[h % OPPONENTS.length];
}
export const matchOutcome = (f, a) => (f > a ? 'win' : f === a ? 'draw' : 'loss');
export const MATCH_BONUS = { win: 150, draw: 50, loss: 0 };
export const OUTCOME_LABEL = { win: '🏆 VICTOIRE !', draw: '🤝 MATCH NUL', loss: '💪 DÉFAITE… REVANCHE DEMAIN !' };

export function recordMatch(profile, goalsFor, goalsAgainst, opponent) {
    const outcome = matchOutcome(goalsFor, goalsAgainst);
    profile.matches.push({ date: today(), f: goalsFor, a: goalsAgainst, opponent, outcome });
    if (profile.matches.length > 60) profile.matches.shift();
    const key = { win: 'w', draw: 'd', loss: 'l' }[outcome];
    profile.matchStats[key]++;
    return outcome;
}

// ---------- Records ----------
// Retourne les records battus (un record n'est annoncé que s'il en existait déjà un à battre)
export function updateRecords(profile, { score, maxStreak, goalDiff }) {
    const r = profile.records;
    const broken = [];
    const check = (key, value, text) => {
        if (value > r[key]) {
            if (r[key] > 0) broken.push(text(value));
            r[key] = value;
        }
    };
    check('bestScore', score, v => `Meilleur score : ${v} points`);
    check('bestStreak', maxStreak, v => `Meilleure série : ${v} bonnes réponses d'affilée`);
    check('bestDiff', goalDiff, v => `Plus large victoire : +${v} buts`);
    check('bestDayStreak', profile.daily.streak, v => `Plus longue série de jours : ${v}`);
    return broken;
}

// ---------- Cartes de joueur ----------
export const POSITIONS = { maths: 'ATT', francais: 'MIL', svt: 'DEF', physique: 'GAR', histgeo: 'CAP', anglais: 'AIL' };
export function playerCard(profile, skillId) {
    const tier = profile.badges[skillId] || 0;
    const st = profile.skillStats[skillId] || { ok: 0, last: [], ms: 0 };
    const last = st.last || [];
    const rate = last.length ? last.reduce((a, b) => a + b, 0) / last.length : 0;
    const base = [0, 60, 72, 86][tier];
    const span = [0, 9, 12, 13][tier];
    return {
        tier,
        ovr: tier ? Math.min(99, base + Math.round(rate * span)) : null,
        pre: Math.round(rate * 100),
        vit: st.ms ? Math.max(50, Math.min(99, Math.round(99 - ((st.ms - 3000) * 49) / 12000))) : 60,
        exp: Math.min(99, st.ok)
    };
}
