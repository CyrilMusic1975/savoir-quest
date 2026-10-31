// Championnat : calendrier, classement recalculé indépendamment, fin de saison
import { MY_TEAM, N_TEAMS, DAYS, MATCH_LEN, teamsFor, round, simulate, standings, nextMatch, recordChampMatch, ordinal } from '../js/championnat.js';
import { ensureProfile } from '../js/state.js';

export function run(fail) {
    const eq = (a, b, what) => { if (a !== b) fail(`${what} : attendu ${b}, obtenu ${a}`); };

    // équipes
    for (let n = 1; n <= 8; n++) {
        const t = teamsFor(n);
        eq(t.length, N_TEAMS, `nombre d'équipes (saison ${n})`);
        eq(t[0], MY_TEAM, 'première équipe');
        if (new Set(t).size !== N_TEAMS) fail(`saison ${n} : équipes en double`);
        if (!t.every(x => x.length < 26)) fail(`saison ${n} : nom d'équipe trop long pour le classement`);
    }

    // calendrier : chaque équipe joue une fois par journée ; chaque couple (domicile, extérieur) apparaît exactement une fois
    const seen = new Map();
    for (let d = 0; d < DAYS; d++) {
        const teamsOfDay = round(d).flat();
        if (teamsOfDay.length !== N_TEAMS || new Set(teamsOfDay).size !== N_TEAMS) fail(`journée ${d + 1} : une équipe joue deux fois ou pas du tout`);
        for (const [h, a] of round(d)) seen.set(`${h}-${a}`, (seen.get(`${h}-${a}`) || 0) + 1);
    }
    eq(seen.size, N_TEAMS * (N_TEAMS - 1), 'couples domicile-extérieur distincts');
    if ([...seen.values()].some(v => v !== 1)) fail('un match est programmé plusieurs fois');
    for (let h = 0; h < N_TEAMS; h++) for (let a = 0; a < N_TEAMS; a++) if (h !== a && !seen.has(`${h}-${a}`)) fail(`match ${h}-${a} jamais programmé`);
    // le retour reprend les rencontres de l'aller dans le même ordre
    for (let d = 0; d < N_TEAMS - 1; d++) {
        const aller = round(d).map(([h, a]) => `${Math.min(h, a)}-${Math.max(h, a)}`).join();
        const retour = round(d + N_TEAMS - 1).map(([h, a]) => `${Math.min(h, a)}-${Math.max(h, a)}`).join();
        eq(retour, aller, `retour de la journée ${d + 1}`);
    }

    // simulation : somme constante, reproductible, résultats variés
    const sims = new Set();
    for (let d = 0; d < 30; d++) {
        const [x, y] = simulate('p', 1, d, 'A', 'B');
        eq(x + y, MATCH_LEN, 'buts simulés'); eq(simulate('p', 1, d, 'A', 'B').join(), [x, y].join(), 'simulation reproductible');
        sims.add(x);
    }
    if (sims.size < 4) fail('simulation trop uniforme');

    // classement recalculé indépendamment (journal de matchs, tableau par nom) avec des résultats variés de l'élève
    let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const days = Array.from({ length: DAYS }, () => { const f = Math.floor(rnd() * 11); return [f, 10 - f]; });
    for (const k of [1, 5, 9, 14, 18]) {
        const champ = { n: 2, days: days.slice(0, k) };
        const rows = standings(champ, 'profil-test');
        const teams = teamsFor(2);
        const log = [];
        for (let d = 0; d < k; d++) for (const [h, a] of round(d)) {
            let sc;
            if (h === 0) sc = champ.days[d]; else if (a === 0) sc = [champ.days[d][1], champ.days[d][0]]; else sc = simulate('profil-test', 2, d, teams[h], teams[a]);
            log.push({ home: teams[h], away: teams[a], sc });
        }
        for (const r of rows) {
            const mine = log.filter(m => m.home === r.name || m.away === r.name);
            const res = mine.map(m => (m.home === r.name ? m.sc : [m.sc[1], m.sc[0]]));
            const pts = res.reduce((s, [f, a]) => s + (f > a ? 3 : f === a ? 1 : 0), 0);
            const gf = res.reduce((s, [f]) => s + f, 0), ga = res.reduce((s, [, a]) => s + a, 0);
            eq(r.p, k, `${r.name} : matchs joués (J${k})`); eq(r.pts, pts, `${r.name} : points (J${k})`); eq(r.gf, gf, `${r.name} : buts pour`); eq(r.ga, ga, `${r.name} : buts contre`); eq(r.gd, gf - ga, `${r.name} : différence`);
            eq(r.w + r.d + r.l, k, `${r.name} : V+N+D`);
        }
        eq(rows.reduce((s, r) => s + r.gf, 0), rows.reduce((s, r) => s + r.ga, 0), `buts pour = buts contre (J${k})`);
        const nuls = log.filter(m => m.sc[0] === m.sc[1]).length;
        eq(rows.reduce((s, r) => s + r.pts, 0), 3 * (log.length - nuls) + 2 * nuls, `total des points (J${k})`);
        for (let i = 1; i < rows.length; i++) {
            const a = rows[i - 1], b = rows[i];
            if (a.pts < b.pts || (a.pts === b.pts && a.gd < b.gd) || (a.pts === b.pts && a.gd === b.gd && a.gf < b.gf)) fail(`classement mal trié à la J${k} (${a.name} / ${b.name})`);
            eq(b.rank, i + 1, 'rang');
        }
    }

    // prochain adversaire : deux fois chacun sur la saison
    const p = ensureProfile({ id: 'champ', name: 'T' });
    eq(p.champ, null, 'pas de championnat avant le premier match'); eq(p.champHistory.length, 0, 'historique vide');
    const opp = {};
    for (let d = 0; d < DAYS; d++) {
        const nm = nextMatch(p);
        eq(nm.day, d + 1, 'numéro de journée'); opp[nm.opponent] = (opp[nm.opponent] || 0) + 1;
        const r = recordChampMatch(p, d % 2 ? 8 : 2, d % 2 ? 2 : 8);
        eq(r.day, d + 1, 'journée enregistrée'); eq(r.finished, d === DAYS - 1, 'fin de saison à la 18e journée');
        if (d === 0) eq(r.rankBefore, null, 'pas de rang avant le premier match');
    }
    eq(Object.keys(opp).length, N_TEAMS - 1, 'nombre d\'adversaires'); if (Object.values(opp).some(v => v !== 2)) fail('un adversaire n\'est pas rencontré deux fois');
    eq(p.champHistory.length, 1, 'saison archivée'); eq(p.champ.n, 2, 'nouvelle saison'); eq(p.champ.days.length, 0, 'nouvelle saison vide');
    eq(p.champHistory[0].pts, 9 * 3, '9 victoires = 27 points');
    // une saison tout en victoires est gagnée ; tout en défaites, on finit dernier
    const w = ensureProfile({ id: 'w', name: 'W' }); let last; for (let i = 0; i < DAYS; i++) last = recordChampMatch(w, 9, 1);
    eq(last.champion, true, 'saison parfaite = champion'); eq(w.champHistory[0].pts, 54, '18 victoires');
    const l = ensureProfile({ id: 'l', name: 'L' }); for (let i = 0; i < DAYS; i++) last = recordChampMatch(l, 1, 9);
    eq(last.rank, N_TEAMS, 'saison catastrophique = dernier'); eq(last.champion, false, 'pas champion');
    eq(ordinal(1), '1er', 'ordinal 1'); eq(ordinal(3), '3e', 'ordinal 3');
    return `${DAYS} journées, calendrier et classement vérifiés par recalcul`;
}
