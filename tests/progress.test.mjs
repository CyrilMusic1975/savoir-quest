// Vérifie la saison, le match, les records et les cartes de joueur
import { LEAGUES, leagueFor, leagueProgress, ensureSeason, addSeasonXP, opponentOf, OPPONENTS, matchOutcome, recordMatch, updateRecords, playerCard } from '../js/progress.js';
import { ensureProfile, weekId } from '../js/state.js';

export function run(fail) {
    const eq = (a, b, what) => { if (a !== b) fail(`${what} : attendu ${b}, obtenu ${a}`); };
    // ligues
    eq(leagueFor(0).name, 'Bronze', 'ligue à 0 XP'); eq(leagueFor(1499).name, 'Bronze', 'ligue à 1499'); eq(leagueFor(1500).name, 'Argent', 'ligue à 1500');
    eq(leagueFor(3500).name, 'Or', 'ligue à 3500'); eq(leagueFor(99999).name, 'Champion', 'ligue max');
    eq(leagueProgress(2000).next.name, 'Or', 'prochaine ligue'); eq(leagueProgress(2000).need, 1500, 'XP restants'); eq(leagueProgress(7000).pct, 100, 'barre au maximum');
    // semaines ISO
    eq(weekId(new Date(2026, 9, 21)), '2026-S43', 'semaine du 21/10/2026'); eq(weekId(new Date(2026, 9, 19)), '2026-S43', 'lundi de la même semaine'); eq(weekId(new Date(2026, 9, 18)), '2026-S42', 'dimanche précédent');
    eq(weekId(new Date(2027, 0, 1)), '2026-S53', 'passage d\'année');
    // saison : changement de semaine
    const p = ensureProfile({ id: 'p', name: 'T' });
    ensureSeason(p, '2026-S43'); addSeasonXP(p, 100);
    const up = addSeasonXP(p, 1500);
    eq(up && up.name, 'Argent', 'passage en Argent');
    ensureSeason(p, '2026-S44');
    eq(p.season.xp, 0, 'saison remise à zéro'); eq(p.seasons.length, 1, 'saison archivée'); eq(p.seasons[0].league, 'Argent', 'ligue archivée'); eq(p.pendingSeasonReview.week, '2026-S43', 'bilan de saison à montrer');
    ensureSeason(p, '2026-S45'); eq(p.seasons.length, 1, 'une semaine vide n\'est pas archivée');
    // match
    eq(matchOutcome(7, 3), 'win', 'victoire'); eq(matchOutcome(5, 5), 'draw', 'nul'); eq(matchOutcome(2, 8), 'loss', 'défaite');
    eq(recordMatch(p, 6, 4, 'X'), 'win', 'match enregistré'); eq(p.matchStats.w, 1, 'compteur de victoires');
    eq(opponentOf('2026-10-21'), opponentOf('2026-10-21'), 'adversaire stable dans la journée');
    if (new Set(['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27'].map(d => opponentOf(d))).size < 3) fail('adversaires trop répétitifs');
    if (!OPPONENTS.every(o => o.length < 30)) fail('nom d\'adversaire trop long pour l\'écran');
    // records : le premier score fixe la référence sans « record battu »
    const q = ensureProfile({ id: 'q', name: 'Q' });
    eq(updateRecords(q, { score: 900, maxStreak: 4, goalDiff: 2 }).length, 0, 'premier record silencieux');
    eq(updateRecords(q, { score: 1200, maxStreak: 4, goalDiff: 2 }).length, 1, 'un seul record battu'); eq(q.records.bestScore, 1200, 'record enregistré');
    eq(updateRecords(q, { score: 1000, maxStreak: 3, goalDiff: 1 }).length, 0, 'pas de record si moins bien'); eq(q.records.bestScore, 1200, 'record conservé');
    // cartes
    const c = ensureProfile({ id: 'c', name: 'C', badges: { a: 1, b: 2, c: 3 }, skillStats: { a: { ok: 12, last: Array(12).fill(1), ms: 4000 }, b: { ok: 40, last: Array(20).fill(1), ms: 9000 }, c: { ok: 80, last: Array(20).fill(1), ms: 3000 } } });
    const ca = playerCard(c, 'a'), cb = playerCard(c, 'b'), cc = playerCard(c, 'c');
    if (!(ca.ovr >= 60 && ca.ovr <= 69)) fail(`note Bronze hors plage : ${ca.ovr}`);
    if (!(cb.ovr >= 72 && cb.ovr <= 84)) fail(`note Argent hors plage : ${cb.ovr}`);
    if (!(cc.ovr >= 86 && cc.ovr <= 99)) fail(`note Or hors plage : ${cc.ovr}`);
    eq(playerCard(c, 'zzz').ovr, null, 'pas de carte sans badge');
    // temps moyens : c = 3 s, a = 4 s, b = 9 s
    if (!(cc.vit > ca.vit && ca.vit > cb.vit)) fail(`la vitesse doit augmenter quand le temps de réponse baisse (${cc.vit}, ${ca.vit}, ${cb.vit})`);
    return `${LEAGUES.length} ligues, saisons, match, records et cartes vérifiés`;
}
