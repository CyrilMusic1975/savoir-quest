// Vérifie la conjugaison avec des formes écrites à la main (références indépendantes du moteur)
import * as C from '../js/content/conjugaison.js';

const T = (v, s) => s.split(' ');
const PRESENT = {
    chanter: 'chante chantes chante chantons chantez chantent', manger: 'mange manges mange mangeons mangez mangent', commencer: 'commence commences commence commençons commencez commencent',
    nager: 'nage nages nage nageons nagez nagent', finir: 'finis finis finit finissons finissez finissent', choisir: 'choisis choisis choisit choisissons choisissez choisissent',
    être: 'suis es est sommes êtes sont', avoir: 'ai as a avons avez ont', aller: 'vais vas va allons allez vont', faire: 'fais fais fait faisons faites font',
    dire: 'dis dis dit disons dites disent', venir: 'viens viens vient venons venez viennent', pouvoir: 'peux peux peut pouvons pouvez peuvent',
    vouloir: 'veux veux veut voulons voulez veulent', prendre: 'prends prends prend prenons prenez prennent', voir: 'vois vois voit voyons voyez voient',
    savoir: 'sais sais sait savons savez savent', mettre: 'mets mets met mettons mettez mettent', partir: 'pars pars part partons partez partent'
};
const IMPARFAIT = {
    chanter: 'chantais chantais chantait chantions chantiez chantaient', manger: 'mangeais mangeais mangeait mangions mangiez mangeaient',
    commencer: 'commençais commençais commençait commencions commenciez commençaient', finir: 'finissais finissais finissait finissions finissiez finissaient',
    être: 'étais étais était étions étiez étaient', avoir: 'avais avais avait avions aviez avaient', aller: 'allais allais allait allions alliez allaient',
    faire: 'faisais faisais faisait faisions faisiez faisaient', voir: 'voyais voyais voyait voyions voyiez voyaient', prendre: 'prenais prenais prenait prenions preniez prenaient',
    venir: 'venais venais venait venions veniez venaient', dire: 'disais disais disait disions disiez disaient', pouvoir: 'pouvais pouvais pouvait pouvions pouviez pouvaient'
};
const FUTUR = {
    chanter: 'chanterai chanteras chantera chanterons chanterez chanteront', finir: 'finirai finiras finira finirons finirez finiront',
    être: 'serai seras sera serons serez seront', avoir: 'aurai auras aura aurons aurez auront', aller: 'irai iras ira irons irez iront', faire: 'ferai feras fera ferons ferez feront',
    venir: 'viendrai viendras viendra viendrons viendrez viendront', voir: 'verrai verras verra verrons verrez verront', pouvoir: 'pourrai pourras pourra pourrons pourrez pourront',
    vouloir: 'voudrai voudras voudra voudrons voudrez voudront', savoir: 'saurai sauras saura saurons saurez sauront', prendre: 'prendrai prendras prendra prendrons prendrez prendront',
    mettre: 'mettrai mettras mettra mettrons mettrez mettront', dire: 'dirai diras dira dirons direz diront', partir: 'partirai partiras partira partirons partirez partiront',
    manger: 'mangerai mangeras mangera mangerons mangerez mangeront'
};
const PASSE_SIMPLE = {
    chanter: 'chanta chantèrent', manger: 'mangea mangèrent', commencer: 'commença commencèrent', finir: 'finit finirent', être: 'fut furent', avoir: 'eut eurent',
    aller: 'alla allèrent', faire: 'fit firent', prendre: 'prit prirent', venir: 'vint vinrent', voir: 'vit virent', dire: 'dit dirent', mettre: 'mit mirent', pouvoir: 'put purent', savoir: 'sut surent'
};
const IMPERATIF = {
    chanter: 'chante chantons chantez', manger: 'mange mangeons mangez', finir: 'finis finissons finissez', être: 'sois soyons soyez', avoir: 'aie ayons ayez', aller: 'va allons allez',
    faire: 'fais faisons faites', prendre: 'prends prenons prenez', venir: 'viens venons venez', dire: 'dis disons dites', savoir: 'sache sachons sachez', voir: 'vois voyons voyez'
};
const PARTICIPES = { chanter: 'chanté', finir: 'fini', être: 'été', avoir: 'eu', aller: 'allé', faire: 'fait', prendre: 'pris', venir: 'venu', voir: 'vu', mettre: 'mis', savoir: 'su', pouvoir: 'pu', vouloir: 'voulu', partir: 'parti', dire: 'dit', tomber: 'tombé', arriver: 'arrivé' };
const PC = {
    chanter: ['ai chanté', 'as chanté', 'a chanté', 'avons chanté', 'avez chanté', 'ont chanté'], faire: ['ai fait', 'as fait', 'a fait', 'avons fait', 'avez fait', 'ont fait'],
    prendre: ['ai pris', 'as pris', 'a pris', 'avons pris', 'avez pris', 'ont pris'], voir: ['ai vu', 'as vu', 'a vu', 'avons vu', 'avez vu', 'ont vu'], finir: ['ai fini', 'as fini', 'a fini', 'avons fini', 'avez fini', 'ont fini']
};
const PQP = { chanter: ['avais chanté', 'avais chanté', 'avait chanté', 'avions chanté', 'aviez chanté', 'avaient chanté'], faire: ['avais fait', 'avais fait', 'avait fait', 'avions fait', 'aviez fait', 'avaient fait'] };
const ETRE_SUBJECTS = [
    { p: 'il', n: 2, fem: false, pl: false }, { p: 'elle', n: 2, fem: true, pl: false }, { p: 'ils', n: 5, fem: false, pl: true }, { p: 'elles', n: 5, fem: true, pl: true }
];
const PC_ETRE = { aller: ['est allé', 'est allée', 'sont allés', 'sont allées'], venir: ['est venu', 'est venue', 'sont venus', 'sont venues'], partir: ['est parti', 'est partie', 'sont partis', 'sont parties'], tomber: ['est tombé', 'est tombée', 'sont tombés', 'sont tombées'] };
const PQP_ETRE = { aller: ['était allé', 'était allée', 'étaient allés', 'étaient allées'], venir: ['était venu', 'était venue', 'étaient venus', 'étaient venues'] };

export function run(fail) {
    let n = 0;
    const eq = (got, want, what) => { n++; if (got !== want) fail(`${what} : attendu « ${want} », obtenu « ${got} »`); };
    const eqList = (got, want, what) => want.forEach((w, i) => eq(got[i], w, `${what} [${i}]`));

    Object.entries(PRESENT).forEach(([v, f]) => eqList(C.simpleForms(v, 'present'), T(v, f), `présent de ${v}`));
    Object.entries(IMPARFAIT).forEach(([v, f]) => eqList(C.simpleForms(v, 'imparfait'), T(v, f), `imparfait de ${v}`));
    Object.entries(FUTUR).forEach(([v, f]) => eqList(C.simpleForms(v, 'futur'), T(v, f), `futur de ${v}`));
    Object.entries(PASSE_SIMPLE).forEach(([v, f]) => eqList(C.pastSimpleForms(v), T(v, f), `passé simple de ${v}`));
    Object.entries(IMPERATIF).forEach(([v, f]) => eqList(C.imperativeForms(v), T(v, f), `impératif de ${v}`));
    Object.entries(PARTICIPES).forEach(([v, f]) => eq(C.participle(v), f, `participe de ${v}`));
    Object.entries(PC).forEach(([v, f]) => f.forEach((w, i) => eq(C.compoundForm(v, 'passeCompose', i), w, `passé composé de ${v}`)));
    Object.entries(PQP).forEach(([v, f]) => f.forEach((w, i) => eq(C.compoundForm(v, 'plusQueParfait', i), w, `plus-que-parfait de ${v}`)));
    Object.entries(PC_ETRE).forEach(([v, f]) => ETRE_SUBJECTS.forEach((s, i) => eq(C.compoundForm(v, 'passeCompose', s.n, s), f[i], `passé composé de ${v} (${s.p})`)));
    Object.entries(PQP_ETRE).forEach(([v, f]) => ETRE_SUBJECTS.forEach((s, i) => eq(C.compoundForm(v, 'plusQueParfait', s.n, s), f[i], `plus-que-parfait de ${v} (${s.p})`)));

    // Tous les verbes ont des formes complètes et sans trou
    C.VERBS.forEach(v => {
        ['present', 'imparfait', 'futur'].forEach(t => { const f = C.simpleForms(v, t); if (f.length !== 6 || f.some(x => !x || /undefined/.test(x))) fail(`formes incomplètes : ${v} ${t}`); });
        const p = C.pastSimpleForms(v); if (p.length !== 2 || p.some(x => !x)) fail(`passé simple incomplet : ${v}`);
        if (!C.participle(v) || /undefined/.test(C.participle(v))) fail(`participe manquant : ${v}`);
    });

    // Générateurs
    const skills = Object.fromEntries(C.conjugaisonSkills.map(s => [s.id, s]));
    const simple = { fr_cj_present: 'present', fr_cj_imparfait: 'imparfait', fr_cj_futur: 'futur' };
    const PERS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
    // table : forme affichée -> temps possibles (pour vérifier que la reconnaissance du temps n'est pas ambiguë)
    const display = (p, f) => (p === 'je' && /^[aeiouyéèêàâîôû]/i.test(f) ? `j'${f}` : `${p} ${f}`);
    const tenseOf = new Map(), verbOf = new Map();
    C.VERBS.concat(['tomber', 'arriver', 'rester', 'entrer', 'rentrer', 'monter']).forEach(v => {
        ['present', 'imparfait', 'futur'].forEach(t => C.simpleForms(v, t).forEach((f, i) => {
            const k = display(PERS[i], f);
            (tenseOf.get(k) || tenseOf.set(k, new Set()).get(k)).add(t);
            (verbOf.get(k) || verbOf.set(k, new Set()).get(k)).add(v);
        }));
        const subs = C.auxiliaryOf(v) === 'être' ? ETRE_SUBJECTS.map(s => [s.p, s.n, s]) : PERS.map((p, i) => [p, i, null]);
        subs.forEach(([p, i, s]) => { const f = C.compoundForm(v, 'passeCompose', i, s); const k = p === 'je' ? display(p, f) : `${p} ${f}`; (tenseOf.get(k) || tenseOf.set(k, new Set()).get(k)).add('passeCompose'); });
    });
    const label = { present: 'Présent', imparfait: 'Imparfait', futur: 'Futur simple', passeCompose: 'Passé composé' };

    for (let r = 0; r < 600; r++) {
        Object.entries(simple).forEach(([id, tense]) => {
            const q = skills[id].gen(); n++;
            const m = q.text.match(/— (\S+) : (j'|je|tu|il|nous|vous|ils)\s?…/);
            const f = C.simpleForms(m[1], tense)[PERS.indexOf(m[2] === "j'" ? 'je' : m[2])];
            if (q.answer !== f) fail(`${id} : « ${q.text} » → ${q.answer}, attendu ${f}`);
            if (m[2] === "j'" && !/^[aeiouyéèêàâîôû]/i.test(f)) fail(`${id} : élision à tort dans « ${q.text} »`);
            if (m[2] === 'je' && /^[aeiouyéèêàâîôû]/i.test(f)) fail(`${id} : élision manquante dans « ${q.text} »`);
            if (!q.explanation) fail(`${id} : explication manquante`);
        });
        ['fr_cj_pc', 'fr_cj_pqp'].forEach(id => {
            const q = skills[id].gen(); n++;
            const m = q.text.match(/— (\S+) : (j'|je|tu|il|elle|nous|vous|ils|elles)\s?…/);
            const tense = id === 'fr_cj_pc' ? 'passeCompose' : 'plusQueParfait';
            if (C.auxiliaryOf(m[1]) === 'être') {
                const s = ETRE_SUBJECTS.find(x => x.p === m[2]);
                if (!s) fail(`${id} : sujet impossible avec être : « ${q.text} »`);
                else if (q.answer !== C.compoundForm(m[1], tense, s.n, s)) fail(`${id} : « ${q.text} » → ${q.answer}`);
            } else if (q.answer !== C.compoundForm(m[1], tense, PERS.indexOf(m[2] === "j'" ? 'je' : m[2]))) fail(`${id} : « ${q.text} » → ${q.answer}`);
        });
        let q = skills.fr_cj_imperatif.gen(); n++;
        let m = q.text.match(/— (\S+) : \((tu|nous|vous)\)/);
        if (q.answer !== C.imperativeForms(m[1])[['tu', 'nous', 'vous'].indexOf(m[2])]) fail(`impératif : « ${q.text} » → ${q.answer}`);
        if (C.imperativeForms(m[1]) === null) fail(`impératif impossible pour ${m[1]}`);
        q = skills.fr_cj_ps.gen(); n++;
        m = q.text.match(/— (\S+) : (il|ils) /);
        if (q.answer !== C.pastSimpleForms(m[1])[m[2] === 'il' ? 0 : 1]) fail(`passé simple : « ${q.text} » → ${q.answer}`);

        // reconnaissance du temps : la forme affichée ne doit correspondre qu'à un seul temps
        q = skills.fr_cj_temps.gen(); n++;
        if (new Set(q.options).size !== 4 || !q.options.includes(q.answer)) fail('temps : options invalides');
        const shown = q.text.match(/« (.+) »/)[1];
        const set = tenseOf.get(shown);
        if (!set || set.size !== 1 || label[[...set][0]] !== q.answer) fail(`temps : « ${shown} » est ambigu ou faux (${[...(set || [])]}) → ${q.answer}`);

        // infinitif : la forme affichée ne doit venir que d'un seul verbe
        q = skills.fr_cj_infinitif.gen(); n++;
        const form = q.text.match(/« (.+) »/)[1];
        const vs = verbOf.get(form);
        if (!vs || vs.size !== 1 || ![...vs][0] === q.answer || [...vs][0] !== q.answer) fail(`infinitif : « ${form} » est ambigu ou faux (${[...(vs || [])]}) → ${q.answer}`);
        if (new Set(q.options).size !== 4 || !q.options.includes(q.answer)) fail('infinitif : options invalides');
        if (q.options.filter(o => o !== q.answer).some(o => C.VERBS.includes(o) && ['present', 'imparfait', 'futur'].some(t => C.simpleForms(o, t).includes(form.split(/[' ]/).pop())))) fail(`infinitif : une mauvaise réponse produit aussi « ${form} »`);

        // infinitif en -er ou participe en -é
        q = skills.fr_cj_er_e.gen(); n++;
        const frame = q.text.match(/Complète : (.+?) ___/)[1];
        const infFrames = ['Il veut', 'Nous allons', 'Elle peut', 'Tu vas', 'Ils vont', 'Je dois', 'Vous pouvez', 'Il faut', 'Nous aimons'];
        if (infFrames.includes(frame) ? !q.answer.endsWith('er') : !q.answer.endsWith('é')) fail(`-er / -é : « ${q.text} » → ${q.answer}`);
        if (new Set(q.options).size !== 4 || !q.options.includes(q.answer)) fail('-er / -é : options invalides');

        // accord du participe avec être
        q = skills.fr_cj_accord.gen(); n++;
        const subj = q.text.match(/Complète : (.+?) (est|sont) ___ \((\S+)\)/);
        const SUBJ = { Il: [false, false], Elle: [true, false], Ils: [false, true], Elles: [true, true], 'Les filles': [true, true], 'Les garçons': [false, true], 'Ma sœur': [true, false] };
        const [fem, pl] = SUBJ[subj[1]];
        if (q.answer !== C.participle(subj[3]) + (fem ? 'e' : '') + (pl ? 's' : '')) fail(`accord : « ${q.text} » → ${q.answer}`);
        if ((pl && subj[2] !== 'sont') || (!pl && subj[2] !== 'est')) fail(`accord : auxiliaire incorrect dans « ${q.text} »`);
        if (new Set(q.options).size !== 4 || !q.options.includes(q.answer)) fail('accord : options invalides');
    }
    return `${n} formes et questions de conjugaison vérifiées`;
}
