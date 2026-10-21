// Conjugaison de 6e : présent, imparfait, futur, passé composé, impératif, passé simple (3e personne), plus-que-parfait.
// Les formes sont calculées à partir de tables vérifiées (voir tests/conjugaison.test.mjs).
import { shuffle, pick, randInt, weakFacet } from './helpers.js';

const PRONOUNS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
const IMP_END = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const FUT_END = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
const AUX = {
    avoir: { pres: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], imp: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'] },
    être: { pres: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], imp: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'] }
};

// ---------- Verbes irréguliers (3e groupe et auxiliaires) ----------
const IRREGULAR = {
    être: { pres: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], imp: 'ét', fut: 'ser', pp: 'été', aux: 'avoir', ps: ['fut', 'furent'], imper: ['sois', 'soyons', 'soyez'] },
    avoir: { pres: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], imp: 'av', fut: 'aur', pp: 'eu', aux: 'avoir', ps: ['eut', 'eurent'], imper: ['aie', 'ayons', 'ayez'] },
    aller: { pres: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], imp: 'all', fut: 'ir', pp: 'allé', aux: 'être', ps: ['alla', 'allèrent'], imper: ['va', 'allons', 'allez'] },
    faire: { pres: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], imp: 'fais', fut: 'fer', pp: 'fait', aux: 'avoir', ps: ['fit', 'firent'], imper: ['fais', 'faisons', 'faites'] },
    dire: { pres: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], imp: 'dis', fut: 'dir', pp: 'dit', aux: 'avoir', ps: ['dit', 'dirent'], imper: ['dis', 'disons', 'dites'] },
    venir: { pres: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], imp: 'ven', fut: 'viendr', pp: 'venu', aux: 'être', ps: ['vint', 'vinrent'], imper: ['viens', 'venons', 'venez'] },
    pouvoir: { pres: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], imp: 'pouv', fut: 'pourr', pp: 'pu', aux: 'avoir', ps: ['put', 'purent'], imper: null },
    vouloir: { pres: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'], imp: 'voul', fut: 'voudr', pp: 'voulu', aux: 'avoir', ps: ['voulut', 'voulurent'], imper: null },
    prendre: { pres: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], imp: 'pren', fut: 'prendr', pp: 'pris', aux: 'avoir', ps: ['prit', 'prirent'], imper: ['prends', 'prenons', 'prenez'] },
    voir: { pres: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], imp: 'voy', fut: 'verr', pp: 'vu', aux: 'avoir', ps: ['vit', 'virent'], imper: ['vois', 'voyons', 'voyez'] },
    savoir: { pres: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'], imp: 'sav', fut: 'saur', pp: 'su', aux: 'avoir', ps: ['sut', 'surent'], imper: ['sache', 'sachons', 'sachez'] },
    mettre: { pres: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'], imp: 'mett', fut: 'mettr', pp: 'mis', aux: 'avoir', ps: ['mit', 'mirent'], imper: ['mets', 'mettons', 'mettez'] },
    partir: { pres: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'], imp: 'part', fut: 'partir', pp: 'parti', aux: 'être', ps: ['partit', 'partirent'], imper: ['pars', 'partons', 'partez'] }
};
const ER = ['chanter', 'jouer', 'parler', 'regarder', 'donner', 'marcher', 'aimer', 'travailler', 'écouter', 'trouver', 'danser', 'laver', 'manger', 'ranger', 'commencer', 'lancer', 'nager'];
const IR = ['finir', 'choisir', 'grandir', 'réussir', 'remplir', 'réfléchir', 'obéir'];
const ER_ETRE = ['tomber', 'arriver', 'rester', 'entrer', 'rentrer', 'monter']; // verbes en -er conjugués avec être
export const VERBS = [...ER, ...IR, ...Object.keys(IRREGULAR)];

const isEr = v => ER.includes(v) || ER_ETRE.includes(v);
const isIr = v => IR.includes(v);
const radical = v => v.slice(0, -2);
const startsSoft = suffix => /^[aouâ]/.test(suffix); // a, o, u : le g garde un e, le c prend une cédille

// Radical d'un verbe en -er devant une terminaison donnée (manger → mange- devant a/o, commencer → commenç- devant a/o)
function erStem(v, suffix) {
    const r = radical(v);
    if (r.endsWith('g') && startsSoft(suffix)) return r + 'e';
    if (r.endsWith('c') && startsSoft(suffix)) return r.slice(0, -1) + 'ç';
    return r;
}

export function participle(v) {
    if (IRREGULAR[v]) return IRREGULAR[v].pp;
    if (isEr(v)) return radical(v) + 'é';
    return radical(v) + 'i'; // 2e groupe
}
export function auxiliaryOf(v) {
    if (IRREGULAR[v]) return IRREGULAR[v].aux;
    return ER_ETRE.includes(v) ? 'être' : 'avoir';
}

// Formes simples (6 personnes) : 'present' | 'imparfait' | 'futur'
export function simpleForms(v, tense) {
    const irr = IRREGULAR[v];
    if (tense === 'present') {
        if (irr) return irr.pres;
        if (isIr(v)) { const r = radical(v); return [r + 'is', r + 'is', r + 'it', r + 'issons', r + 'issez', r + 'issent']; }
        const r = radical(v);
        return [r + 'e', r + 'es', r + 'e', erStem(v, 'o') + 'ons', r + 'ez', r + 'ent'];
    }
    if (tense === 'imparfait') {
        if (irr) return IMP_END.map(e => irr.imp + e);
        if (isIr(v)) return IMP_END.map(e => radical(v) + 'iss' + e);
        return IMP_END.map(e => erStem(v, e) + e);
    }
    // futur : infinitif (sans le e final des verbes en -re) ou radical irrégulier
    const stem = irr ? irr.fut : (v.endsWith('re') ? v.slice(0, -1) : v);
    return FUT_END.map(e => stem + e);
}

// Impératif présent : [tu, nous, vous] (null si le verbe ne s'emploie pas à l'impératif ici)
export function imperativeForms(v) {
    const irr = IRREGULAR[v];
    if (irr) return irr.imper;
    const pres = simpleForms(v, 'present');
    return [isIr(v) ? pres[1] : pres[0], pres[3], pres[4]];
}
// Passé simple : [il, ils]
export function pastSimpleForms(v) {
    const irr = IRREGULAR[v];
    if (irr) return irr.ps;
    if (isIr(v)) return [radical(v) + 'it', radical(v) + 'irent'];
    return [erStem(v, 'a') + 'a', radical(v) + 'èrent'];
}

// Sujets utilisables pour un verbe selon son auxiliaire (avec être : pas de je/tu/nous/vous, à cause de l'accord)
const SUBJECTS_ETRE = [{ p: 'il', n: 2, fem: false, pl: false }, { p: 'elle', n: 2, fem: true, pl: false }, { p: 'ils', n: 5, fem: false, pl: true }, { p: 'elles', n: 5, fem: true, pl: true }];
const agree = (pp, fem, pl) => pp + (fem ? 'e' : '') + (pl ? 's' : '');

// Forme composée : 'passeCompose' | 'plusQueParfait'
export function compoundForm(v, tense, personIndex, subject = null) {
    const aux = auxiliaryOf(v);
    const auxForms = AUX[aux][tense === 'passeCompose' ? 'pres' : 'imp'];
    const pp = participle(v);
    if (aux === 'être') {
        const s = subject || SUBJECTS_ETRE[0];
        return `${auxForms[s.n]} ${agree(pp, s.fem, s.pl)}`;
    }
    return `${auxForms[personIndex]} ${pp}`;
}

export const TENSE_LABEL = { present: 'Présent', imparfait: 'Imparfait', futur: 'Futur simple', passeCompose: 'Passé composé', plusQueParfait: 'Plus-que-parfait', imperatif: 'Impératif présent', passeSimple: 'Passé simple' };

const elide = (pronoun, form) => (pronoun === 'je' && /^[aeiouyéèêàâîôû]/i.test(form) ? "j'" : `${pronoun} `);

// Choix du verbe (en suivant les erreurs récentes de l'élève), avec une répartition réaliste
function chooseVerb(skillId, pool) {
    const weak = weakFacet(skillId);
    if (weak && pool.includes(weak)) return weak;
    const r = Math.random();
    const ers = pool.filter(isEr), irs = pool.filter(isIr), others = pool.filter(v => IRREGULAR[v]);
    if (r < 0.4 && ers.length) return pick(ers);
    if (r < 0.55 && irs.length) return pick(irs);
    return pick(others.length ? others : pool);
}

function inputQuestion(skillId, text, answer, accept, explanation, verb) {
    return { kind: 'input', text, answer, accept: [answer, ...accept], explanation, facet: verb };
}

const simpleGenerator = (skillId, tense, explain) => () => {
    const pool = VERBS;
    const v = chooseVerb(skillId, pool);
    const i = randInt(0, 5);
    const form = simpleForms(v, tense)[i];
    const subj = elide(PRONOUNS[i], form);
    return inputQuestion(skillId, `${TENSE_LABEL[tense]} — ${v} : ${subj}…`, form, [`${subj}${form}`], explain(v, i, form), v);
};

const EXPLAIN = {
    present: (v, i, form) => `${v} au présent : ${simpleForms(v, 'present').map((f, k) => elide(PRONOUNS[k], f) + f).join(', ')}.`,
    imparfait: (v, i, form) => `À l'imparfait, on prend le radical de « nous » au présent et on ajoute -ais, -ais, -ait, -ions, -iez, -aient : ${simpleForms(v, 'imparfait').map((f, k) => elide(PRONOUNS[k], f) + f).join(', ')}.`,
    futur: (v, i, form) => `Au futur, on part de l'infinitif (ou d'un radical irrégulier) et on ajoute -ai, -as, -a, -ons, -ez, -ont : ${simpleForms(v, 'futur').map((f, k) => elide(PRONOUNS[k], f) + f).join(', ')}.`
};

function compoundGenerator(skillId, tense) {
    return () => {
        const v = chooseVerb(skillId, VERBS.concat(ER_ETRE));
        const aux = auxiliaryOf(v);
        let i, subject = null, pronounText;
        if (aux === 'être') {
            subject = pick(SUBJECTS_ETRE);
            i = subject.n;
            pronounText = subject.p + ' ';
        } else {
            i = randInt(0, 5);
            const form = compoundForm(v, tense, i);
            pronounText = elide(PRONOUNS[i], form);
        }
        const answer = compoundForm(v, tense, i, subject);
        const auxName = aux === 'être' ? 'être' : 'avoir';
        const how = tense === 'passeCompose' ? `auxiliaire ${auxName} au présent + participe passé` : `auxiliaire ${auxName} à l'imparfait + participe passé`;
        const explain = `${TENSE_LABEL[tense]} de « ${v} » : ${how}. ${aux === 'être' ? 'Avec être, le participe passé s\'accorde avec le sujet (elle est allée, ils sont allés). ' : ''}Ici : ${pronounText}${answer}.`;
        return inputQuestion(skillId, `${TENSE_LABEL[tense]} — ${v} : ${pronounText}…`, answer, [`${pronounText}${answer}`], explain, v);
    };
}

function generateImperative() {
    const pool = VERBS.filter(v => imperativeForms(v));
    const v = chooseVerb('fr_cj_imperatif', pool);
    const i = randInt(0, 2);
    const form = imperativeForms(v)[i];
    const who = ['(tu)', '(nous)', '(vous)'][i];
    const note = isEr(v) && i === 0 ? ' Les verbes en -er n\'ont pas de -s à la 2e personne du singulier de l\'impératif : chante !' : '';
    return inputQuestion('fr_cj_imperatif', `Impératif présent — ${v} : ${who}…`, form, [`${form} !`], `À l'impératif, on n'écrit pas le pronom : ${imperativeForms(v).join(', ')}.${note}`, v);
}

function generatePastSimple() {
    const v = chooseVerb('fr_cj_ps', VERBS);
    const k = randInt(0, 1);
    const form = pastSimpleForms(v)[k];
    const pron = k === 0 ? 'il' : 'ils';
    return inputQuestion('fr_cj_ps', `Passé simple — ${v} : ${pron} …`, form, [`${pron} ${form}`], `Passé simple de « ${v} » à la 3e personne : il ${pastSimpleForms(v)[0]}, ils ${pastSimpleForms(v)[1]}. On l'emploie surtout dans les récits.`, v);
}

// Retrouver le temps d'une forme conjuguée
function generateTenseRecognition() {
    const v = chooseVerb('fr_cj_temps', VERBS.concat(ER_ETRE));
    const tense = pick(['present', 'imparfait', 'futur', 'passeCompose']);
    let form, text;
    if (tense === 'passeCompose') {
        const aux = auxiliaryOf(v);
        const subject = aux === 'être' ? pick(SUBJECTS_ETRE) : null;
        const i = subject ? subject.n : randInt(0, 5);
        form = compoundForm(v, tense, i, subject);
        text = `${subject ? subject.p + ' ' : elide(PRONOUNS[i], form)}${form}`;
    } else {
        const i = randInt(0, 5);
        form = simpleForms(v, tense)[i];
        text = `${elide(PRONOUNS[i], form)}${form}`;
    }
    const labels = { present: 'au présent', imparfait: 'à l\'imparfait', futur: 'au futur simple', passeCompose: 'au passé composé' };
    const answer = TENSE_LABEL[tense];
    const hint = {
        present: 'Le présent se dit « maintenant » : aujourd\'hui, je…',
        imparfait: 'L\'imparfait se reconnaît à ses terminaisons -ais, -ait, -ions, -iez, -aient : il décrit une habitude ou un décor dans le passé.',
        futur: 'Le futur se reconnaît à la lettre r devant la terminaison : -rai, -ras, -ra, -rons, -rez, -ront. Il se dit « demain ».',
        passeCompose: 'Le passé composé a toujours deux mots : un auxiliaire (avoir ou être) et un participe passé.'
    }[tense];
    return {
        kind: 'qcm', text: `À quel temps est conjugué « ${text} » ?`, answer,
        options: shuffle(['Présent', 'Imparfait', 'Futur simple', 'Passé composé']),
        explanation: `« ${text} » est conjugué ${labels[tense]}. ${hint}`, facet: tense
    };
}

// Retrouver l'infinitif
function generateInfinitiveRecognition() {
    const v = chooseVerb('fr_cj_infinitif', Object.keys(IRREGULAR).concat(ER.slice(0, 6), IR.slice(0, 3)));
    const tense = pick(['present', 'imparfait', 'futur']);
    const i = randInt(0, 5);
    const form = simpleForms(v, tense)[i];
    const wrongs = shuffle(VERBS.filter(x => x !== v && !simpleForms(x, tense).includes(form))).slice(0, 3);
    return {
        kind: 'qcm', text: `Quel est l'infinitif du verbe conjugué dans « ${elide(PRONOUNS[i], form)}${form} » ?`, answer: v, options: shuffle([v, ...wrongs]),
        explanation: `${elide(PRONOUNS[i], form)}${form} est une forme du verbe « ${v} » (${simpleForms(v, tense).join(', ')}).`, facet: v
    };
}

// Infinitif en -er ou participe passé en -é ?
const INF_FRAMES = ['Il veut', 'Nous allons', 'Elle peut', 'Tu vas', 'Ils vont', 'Je dois', 'Vous pouvez', 'Il faut', 'Nous aimons'];
const PP_FRAMES = [['Il a', 'avoir'], ['Nous avons', 'avoir'], ['Elle a', 'avoir'], ['Tu as', 'avoir'], ['Ils ont', 'avoir'], ["J'ai", 'avoir'], ['Vous avez', 'avoir']];
function generateInfinitiveOrParticiple() {
    const v = pick(ER.filter(x => !['lancer', 'commencer'].includes(x)));
    const inf = v, pp = participle(v);
    const isInf = Math.random() < 0.5;
    const frame = isInf ? pick(INF_FRAMES) : pick(PP_FRAMES)[0];
    const answer = isInf ? inf : pp;
    const wrongs = isInf ? [pp, radical(v) + 'ez', radical(v) + 'ée'] : [inf, radical(v) + 'ez', radical(v) + 'ée'];
    const sentence = `${frame} ___ (${inf})`;
    return {
        kind: 'qcm', text: `Complète : ${sentence}.`, answer, options: shuffle([answer, ...wrongs]),
        explanation: `Astuce : remplace par un verbe du 3e groupe, comme « vendre » ou « prendre ». Si on peut dire « vendre » → infinitif en -er (${frame} vendre). Si on dit « vendu » → participe passé en -é (${frame} vendu). Ici : ${frame} ${answer}.`,
        facet: isInf ? 'infinitif en -er' : 'participe passé en -é'
    };
}

// Accord du participe passé avec être
const AGREE_VERBS = ['partir', 'venir', 'aller', ...ER_ETRE];
function generateAgreement() {
    const v = pick(AGREE_VERBS);
    const s = pick([{ t: 'Il', fem: false, pl: false, aux: 'est' }, { t: 'Elle', fem: true, pl: false, aux: 'est' }, { t: 'Ils', fem: false, pl: true, aux: 'sont' }, { t: 'Elles', fem: true, pl: true, aux: 'sont' },
        { t: 'Les filles', fem: true, pl: true, aux: 'sont' }, { t: 'Les garçons', fem: false, pl: true, aux: 'sont' }, { t: 'Ma sœur', fem: true, pl: false, aux: 'est' }]);
    const pp = participle(v);
    const answer = agree(pp, s.fem, s.pl);
    const options = [pp, pp + 'e', pp + 's', pp + 'es'];
    return {
        kind: 'qcm', text: `Complète : ${s.t} ${s.aux} ___ (${v}) hier.`, answer, options: shuffle(options),
        explanation: `Avec l'auxiliaire être, le participe passé s'accorde avec le sujet : on ajoute -e au féminin et -s au pluriel. ${s.t} ${s.aux} ${answer}.`,
        facet: 'accord avec être'
    };
}

export const conjugaisonSkills = [
    { id: 'fr_cj_present', label: 'Conjugaison : présent', gen: simpleGenerator('fr_cj_present', 'present', EXPLAIN.present) },
    { id: 'fr_cj_imparfait', label: 'Conjugaison : imparfait', gen: simpleGenerator('fr_cj_imparfait', 'imparfait', EXPLAIN.imparfait) },
    { id: 'fr_cj_futur', label: 'Conjugaison : futur simple', gen: simpleGenerator('fr_cj_futur', 'futur', EXPLAIN.futur) },
    { id: 'fr_cj_pc', label: 'Conjugaison : passé composé', gen: compoundGenerator('fr_cj_pc', 'passeCompose') },
    { id: 'fr_cj_imperatif', label: 'Conjugaison : impératif présent', gen: generateImperative },
    { id: 'fr_cj_ps', label: 'Conjugaison : passé simple (il, ils)', gen: generatePastSimple, extra: true },
    { id: 'fr_cj_pqp', label: 'Conjugaison : plus-que-parfait', gen: compoundGenerator('fr_cj_pqp', 'plusQueParfait'), extra: true },
    { id: 'fr_cj_temps', label: 'Reconnaître le temps d\'un verbe', gen: generateTenseRecognition },
    { id: 'fr_cj_infinitif', label: 'Retrouver l\'infinitif', gen: generateInfinitiveRecognition },
    { id: 'fr_cj_er_e', label: 'Infinitif en -er ou participe passé en -é', gen: generateInfinitiveOrParticiple },
    { id: 'fr_cj_accord', label: 'Accord du participe passé avec être', gen: generateAgreement }
].map(s => ({ ...s, subject: 'francais' }));

