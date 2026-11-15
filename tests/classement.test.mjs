// Classement des joueurs : pseudo, score, rang recalculé indépendamment, requête et lecture Firestore
import { PSEUDO_MAX, TOP, cleanPseudo, suggestPseudos, scoreOf, docId, rankRows, boardQuery, fromFirestoreRows } from '../js/classement.js';
import { ensureProfile } from '../js/state.js';

export function run(fail) {
    const eq = (a, b, what) => { if (JSON.stringify(a) !== JSON.stringify(b)) fail(`${what} : attendu ${JSON.stringify(b)}, obtenu ${JSON.stringify(a)}`); };

    // pseudo
    const ok = cleanPseudo('  Léo   le  Fort ');
    eq([ok.ok, ok.pseudo], [true, 'Léo le Fort'], 'pseudo nettoyé');
    for (const bad of ['a', 'x'.repeat(PSEUDO_MAX + 1), '', 'M3rde', 'M E R D E', 'PUTAIN', 'Gros Connard']) {
        if (cleanPseudo(bad).ok) fail(`pseudo « ${bad} » aurait dû être refusé`);
        if (!cleanPseudo(bad).reason) fail(`pseudo « ${bad} » refusé sans raison`);
    }
    for (const good of ['Computer', 'Concombre', 'Léa 🦊', "L'aigle-roi", 'Cassandre']) {
        if (!cleanPseudo(good).ok) fail(`pseudo « ${good} » aurait dû être accepté`);
    }
    if (cleanPseudo('<b>x</b>').ok) fail('pseudo avec balises accepté');

    const s1 = suggestPseudos(1), s2 = suggestPseudos(2);
    eq(s1.length, 4, 'nombre de suggestions');
    eq(new Set(s1).size, 4, 'suggestions distinctes');
    if (!s1.every(p => cleanPseudo(p).ok)) fail('une suggestion est refusée par le filtre');
    if (JSON.stringify(s1) === JSON.stringify(s2)) fail('deux graines donnent les mêmes suggestions');
    eq(suggestPseudos(1), s1, 'suggestions déterministes');

    // score
    eq(scoreOf({ totalXP: 900, season: { week: '2026-S47', xp: 120 } }, '2026-S47'), { weekId: '2026-S47', weekXP: 120, totalXP: 900 }, 'score de la semaine courante');
    eq(scoreOf({ totalXP: 900, season: { week: '2026-S46', xp: 120 } }, '2026-S47').weekXP, 0, 'saison d\'une autre semaine');
    eq(scoreOf({ totalXP: 5, season: null }, '2026-S47').weekXP, 0, 'sans saison');
    eq(docId('abc', 'p1'), 'abc_p1', 'identifiant de document');

    // rang : recalculé ici indépendamment (égalités = même rang)
    const pts = [300, 300, 250, 100, 100, 0];
    const rows = pts.map((v, i) => ({ id: 'u' + i, pseudo: i < 2 ? 'Zed' : 'J' + i, avatar: '🦊', weekXP: v, totalXP: v * 10 }));
    const shuffled = [rows[4], rows[2], rows[5], rows[0], rows[3], rows[1]];
    const r = rankRows(shuffled, 'week', 'u2');
    eq(r.list.map(x => x.rank), [1, 1, 3, 4, 4, 6], 'rangs');
    eq([r.me.rank, r.me.gap], [3, 50], 'rang et écart du joueur');
    eq(rankRows(shuffled, 'week', 'u0').me.gap, null, 'le premier n\'a pas d\'écart');
    eq(rankRows(shuffled, 'week', 'u3').me.gap, 150, 'écart au rang 4');
    eq(rankRows(shuffled, 'week', 'inconnu').me.rank, null, 'joueur hors liste');
    eq(r.list.filter(x => x.me).map(x => x.id), ['u2'], 'un seul joueur mis en évidence');
    eq(rankRows(shuffled, 'week', 'u1').list.filter(x => x.me).map(x => x.id), ['u1'], 'deux pseudos identiques restent distincts');
    eq(rankRows(rows, 'total', 'u5').list[0].totalXP, 3000, 'tri sur le total');

    // requête
    const qw = boardQuery('week', '2026-S47').structuredQuery, qt = boardQuery('total', '2026-S47').structuredQuery;
    eq(qw.limit, TOP, 'limite');
    eq(qw.where.fieldFilter.value.stringValue, '2026-S47', 'filtre de semaine');
    eq(qw.orderBy[0].field.fieldPath, 'weekXP', 'tri semaine');
    eq([qt.where, qt.orderBy[0].field.fieldPath], [undefined, 'totalXP'], 'tri total sans filtre');

    // lecture de la réponse Firestore
    const resp = [
        { document: { name: 'projects/p/databases/(default)/documents/scores/abc_p1', fields: { pseudo: { stringValue: 'Zed' }, avatar: { stringValue: '🦊' }, weekXP: { integerValue: '120' }, totalXP: { integerValue: '900' }, weekId: { stringValue: '2026-S47' } } }, readTime: 'x' },
        { readTime: 'y' }
    ];
    eq(fromFirestoreRows(resp), [{ id: 'abc_p1', pseudo: 'Zed', avatar: '🦊', weekXP: 120, totalXP: 900 }], 'lecture runQuery');

    // profil
    eq(ensureProfile({}).board, { pseudo: null }, 'champ board par défaut');
    eq(ensureProfile({ board: { pseudo: 'Zed' } }).board.pseudo, 'Zed', 'pseudo conservé');

    return 'pseudo, score, rang, requête, lecture';
}
