// Championnat : 10 équipes, 18 journées (aller-retour), une mission = une journée.
// Calculs purs, sans interface. Les matchs des autres équipes sont simulés de façon reproductible.
import { OPPONENTS } from './progress.js';

export const MY_TEAM = 'Kiko FC';
export const N_TEAMS = 10;
export const DAYS = 2 * (N_TEAMS - 1); // 18 journées
export const MATCH_LEN = 10;           // buts répartis dans un match simulé (comme les questions d'une mission)

// Les 10 équipes de la saison n : la sienne (indice 0) et 9 équipes fictives qui changent d'une saison à l'autre
export function teamsFor(n) {
    const start = ((n - 1) * 3) % OPPONENTS.length;
    return [MY_TEAM, ...Array.from({ length: N_TEAMS - 1 }, (_, i) => OPPONENTS[(start + i) % OPPONENTS.length])];
}

// Calendrier (méthode du cercle) : paires [domicile, extérieur] (indices d'équipes) de la journée d (0 à 17)
export function round(d) {
    const half = d % (N_TEAMS - 1);
    const others = Array.from({ length: N_TEAMS - 1 }, (_, i) => 1 + ((i + half) % (N_TEAMS - 1)));
    const order = [0, ...others];
    const pairs = [];
    for (let i = 0; i < N_TEAMS / 2; i++) {
        const a = order[i], b = order[N_TEAMS - 1 - i];
        let pair = (half + i) % 2 === 0 ? [a, b] : [b, a];
        if (d >= N_TEAMS - 1) pair = [pair[1], pair[0]]; // le retour inverse le domicile
        pairs.push(pair);
    }
    return pairs;
}

const hash = str => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
const prng = seed => () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const strength = (seed, n, team) => 0.4 + 0.2 * prng(hash(`${seed}|${n}|${team}`))();

// Score simulé de a contre b à la journée d : MATCH_LEN essais, chacun gagné par a avec une probabilité liée à sa force
export function simulate(seed, n, d, a, b) {
    const next = prng(hash(`${seed}|${n}|${d}|${a}|${b}`));
    const pa = strength(seed, n, a) / (strength(seed, n, a) + strength(seed, n, b));
    let ga = 0;
    for (let i = 0; i < MATCH_LEN; i++) if (next() < pa) ga++;
    return [ga, MATCH_LEN - ga];
}

// Classement après les journées jouées par l'élève (champ = { n, days: [[buts pour, buts contre], …] })
export function standings(champ, seed) {
    const teams = teamsFor(champ.n);
    const rows = teams.map((name, i) => ({ name, me: i === 0, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
    const add = (row, f, a) => {
        row.p++; row.gf += f; row.ga += a;
        if (f > a) { row.w++; row.pts += 3; } else if (f === a) { row.d++; row.pts += 1; } else row.l++;
    };
    champ.days.forEach((mine, d) => {
        for (const [h, a] of round(d)) {
            let gh, ga;
            if (h === 0) [gh, ga] = mine;
            else if (a === 0) [ga, gh] = mine;
            else [gh, ga] = simulate(seed, champ.n, d, teams[h], teams[a]);
            add(rows[h], gh, ga); add(rows[a], ga, gh);
        }
    });
    rows.forEach(r => { r.gd = r.gf - r.ga; });
    rows.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name, 'fr'));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
}

// Ouvre la saison si besoin et la retourne
export function ensureChamp(profile) {
    if (!profile.champ) {
        const last = profile.champHistory[profile.champHistory.length - 1];
        profile.champ = { n: last ? last.n + 1 : 1, days: [] };
    }
    return profile.champ;
}

// Prochain adversaire et numéro de la journée (1 à 18)
export function nextMatch(profile) {
    const champ = ensureChamp(profile);
    const d = champ.days.length;
    const pair = round(d).find(([h, a]) => h === 0 || a === 0);
    return { day: d + 1, opponent: teamsFor(champ.n)[pair[0] === 0 ? pair[1] : pair[0]] };
}

export const myRow = (rows) => rows.find(r => r.me);
export const currentTable = profile => standings(ensureChamp(profile), profile.id);

// Enregistre le match de la mission ; la saison se termine à la 18e journée et la suivante s'ouvre
export function recordChampMatch(profile, goalsFor, goalsAgainst) {
    const champ = ensureChamp(profile);
    const rankBefore = champ.days.length ? myRow(standings(champ, profile.id)).rank : null;
    champ.days.push([goalsFor, goalsAgainst]);
    const table = standings(champ, profile.id);
    const me = myRow(table);
    const finished = champ.days.length === DAYS;
    const result = { n: champ.n, day: champ.days.length, rankBefore, rank: me.rank, pts: me.pts, table, finished, champion: finished && me.rank === 1 };
    if (finished) {
        profile.champHistory.push({ n: champ.n, rank: me.rank, pts: me.pts, gd: me.gd });
        if (profile.champHistory.length > 20) profile.champHistory.shift();
        profile.champ = { n: champ.n + 1, days: [] };
    }
    return result;
}

export const ordinal = r => (r === 1 ? '1er' : `${r}e`);
