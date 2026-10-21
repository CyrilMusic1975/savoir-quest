import { shuffle, pick, qcm, fill, input, tap } from './helpers.js';

// ===== Fonctions : sujet, COD, COI, CC (chaque phrase est découpée en groupes) =====
// [texte du groupe, fonction, (type de CC : CCL lieu / CCT temps / CCM manière)]
const sentences = [
    { text: 'Le petit chat curieux mange sa pâtée dans la cuisine.', c: [['Le petit chat curieux', 'sujet'], ['mange', 'verbe'], ['sa pâtée', 'cod'], ['dans la cuisine', 'cc', 'CCL']] },
    { text: 'Mon frère parle à son ami doucement ce matin.', c: [['Mon frère', 'sujet'], ['parle', 'verbe'], ['à son ami', 'coi'], ['doucement', 'cc', 'CCM'], ['ce matin', 'cc', 'CCT']] },
    { text: 'Hier, nous avons regardé un film.', c: [['Hier', 'cc', 'CCT'], ['nous', 'sujet'], ['avons regardé', 'verbe'], ['un film', 'cod']] },
    { text: 'Le pirate a trouvé le trésor en creusant rapidement.', c: [['Le pirate', 'sujet'], ['a trouvé', 'verbe'], ['le trésor', 'cod'], ['en creusant rapidement', 'cc', 'CCM']] },
    { text: 'Dès le mois d\'octobre, au fond de leur trou, les jeunes crapauds se nichent.', c: [['Dès le mois d\'octobre', 'cc', 'CCT'], ['au fond de leur trou', 'cc', 'CCL'], ['les jeunes crapauds', 'sujet'], ['se nichent', 'verbe']] },
    { text: 'Cette histoire plaît à mon frère.', c: [['Cette histoire', 'sujet'], ['plaît', 'verbe'], ['à mon frère', 'coi']] },
    { text: 'Dehors, ses petits-enfants construisent une cabane.', c: [['Dehors', 'cc', 'CCL'], ['ses petits-enfants', 'sujet'], ['construisent', 'verbe'], ['une cabane', 'cod']] },
    { text: 'Chaque nuit, elle rêve de victoire.', c: [['Chaque nuit', 'cc', 'CCT'], ['elle', 'sujet'], ['rêve', 'verbe'], ['de victoire', 'coi']] },
    { text: 'Mme Langlois distribue le courrier dans l\'immeuble.', c: [['Mme Langlois', 'sujet'], ['distribue', 'verbe'], ['le courrier', 'cod'], ['dans l\'immeuble', 'cc', 'CCL']] },
    { text: 'Ce soir, mes parents téléphonent à ma grand-mère.', c: [['Ce soir', 'cc', 'CCT'], ['mes parents', 'sujet'], ['téléphonent', 'verbe'], ['à ma grand-mère', 'coi']] },
    { text: 'Les élèves attendent le bus devant le collège.', c: [['Les élèves', 'sujet'], ['attendent', 'verbe'], ['le bus', 'cod'], ['devant le collège', 'cc', 'CCL']] },
    { text: 'Sophie pense à ses vacances depuis ce matin.', c: [['Sophie', 'sujet'], ['pense', 'verbe'], ['à ses vacances', 'coi'], ['depuis ce matin', 'cc', 'CCT']] },
    { text: 'Les randonneurs observent les montagnes avec des jumelles.', c: [['Les randonneurs', 'sujet'], ['observent', 'verbe'], ['les montagnes', 'cod'], ['avec des jumelles', 'cc', 'CCM']] },
    { text: 'Après la pluie, les escargots sortent dans le jardin.', c: [['Après la pluie', 'cc', 'CCT'], ['les escargots', 'sujet'], ['sortent', 'verbe'], ['dans le jardin', 'cc', 'CCL']] },
    { text: 'Mon voisin répare sa moto dans son garage.', c: [['Mon voisin', 'sujet'], ['répare', 'verbe'], ['sa moto', 'cod'], ['dans son garage', 'cc', 'CCL']] },
    { text: 'Les joueurs ressemblent à leur entraîneur.', c: [['Les joueurs', 'sujet'], ['ressemblent', 'verbe'], ['à leur entraîneur', 'coi']] }
];
const CC_NAMES = { CCL: 'Lieu (où ?)', CCT: 'Temps (quand ?)', CCM: 'Manière ou moyen (comment ?)' };
const DEFAULT_EXPL = {
    sujet: 'Le sujet est celui qui fait l\'action. On le trouve avec « Qui est-ce qui … ? » devant le verbe.',
    cod: 'Le COD répond à « Qui ? » ou « Quoi ? » posé juste après le verbe (ex : Il mange quoi ?). Il n\'y a pas de préposition.',
    coi: 'Le COI se construit avec une préposition (à, de…). On pose « À qui / à quoi ? » ou « De qui / de quoi ? » après le verbe.',
    cc: 'Le CC indique les circonstances (lieu, temps, manière). On peut le déplacer ou le supprimer sans que la phrase perde son sens.'
};
const ROLE = { sujet: 'le sujet', cod: 'le COD', coi: 'le COI', cc: 'un complément circonstanciel (CC)' };

function functionQuestion(type) {
    const pool = sentences.filter(s => s.c.some(x => x[1] === type));
    const s = pick(pool);
    const answerChunk = pick(s.c.filter(x => x[1] === type));
    const others = shuffle(s.c.filter(x => x[1] !== type)).slice(0, 3).map(x => x[0]);
    const expl = type === 'cc' && answerChunk[2]
        ? `« ${answerChunk[0]} » est un CC de ${CC_NAMES[answerChunk[2]]}. ${DEFAULT_EXPL.cc}`
        : `${DEFAULT_EXPL[type]} Ici : « ${answerChunk[0]} ».`;
    return {
        kind: 'qcm', type: 'grammaire',
        text: `Dans la phrase ci-dessous, retrouve ${ROLE[type]}.`,
        visual: { type: 'text-display', content: s.text },
        options: shuffle([answerChunk[0], ...others]),
        answer: answerChunk[0],
        explanation: expl
    };
}

// ===== Banques =====
const homophones1 = [
    fill('fr_h101', 'Il ___ faim.', 'a', ['a', 'à'], 'On peut remplacer « a » par « avait » : Il avait faim.'),
    fill('fr_h102', 'Je vais ___ la piscine.', 'à', ['a', 'à'], '« à » est une préposition : on ne peut pas dire « avait » (Je vais avait la piscine).'),
    fill('fr_h103', 'Elle ___ un beau vélo.', 'a', ['a', 'à'], 'Elle avait un beau vélo : c\'est le verbe avoir, « a » sans accent.'),
    fill('fr_h104', 'Nous allons ___ Paris demain.', 'à', ['a', 'à'], '« à Paris » : on ne peut pas remplacer par « avait ».'),
    fill('fr_h105', 'Le chat ___ noir.', 'est', ['est', 'et'], 'On peut dire « était » : Le chat était noir. C\'est le verbe être.'),
    fill('fr_h106', 'Paul ___ Marie jouent au ballon.', 'et', ['est', 'et'], '« et » relie deux mots : on peut dire « et puis ». On ne peut pas dire « était ».'),
    fill('fr_h107', 'Les enfants ___ faim.', 'ont', ['ont', 'on'], 'On peut dire « avaient » : Les enfants avaient faim. C\'est le verbe avoir.'),
    fill('fr_h108', '___ va au cinéma ce soir.', 'On', ['Ont', 'On'], 'On peut dire « il » : Il va au cinéma. « on » est un pronom.'),
    fill('fr_h109', 'Ils ___ partis hier.', 'sont', ['sont', 'son'], 'On peut dire « étaient » : Ils étaient partis. C\'est le verbe être.'),
    fill('fr_h110', 'Léa range ___ cartable.', 'son', ['sont', 'son'], 'On peut dire « mon / ton » : mon cartable. « son » est un déterminant.'),
    fill('fr_h111', 'Mes parents ___ une voiture rouge.', 'ont', ['ont', 'on'], 'Mes parents avaient une voiture rouge : verbe avoir.'),
    fill('fr_h112', 'Les fleurs ___ magnifiques.', 'sont', ['sont', 'son'], 'Les fleurs étaient magnifiques : verbe être.')
];
const homophones2 = [
    fill('fr_h201', 'Paul a perdu ___ clés.', 'ses', ['ses', 'ces', 'c\'est', 's\'est'], '« ses » = « les siennes » : Paul a perdu les siennes (ses clés).'),
    fill('fr_h202', 'Regarde ___ oiseaux, là-bas !', 'ces', ['ses', 'ces', 'c\'est', 's\'est'], '« ces » montre quelque chose : on peut dire « ces oiseaux-là ».'),
    fill('fr_h203', '___ un beau cadeau.', 'C\'est', ['Ses', 'Ces', 'C\'est', 'S\'est'], '« c\'est » = « cela est » : Cela est un beau cadeau.'),
    fill('fr_h204', 'Il ___ blessé en tombant.', 's\'est', ['ses', 'ces', 'c\'est', 's\'est'], 's\'est = « se » + être (verbe pronominal) : il se blesse → il s\'est blessé.', 2),
    fill('fr_h205', 'Veux-tu du thé ___ du café ?', 'ou', ['ou', 'où'], '« ou » peut se remplacer par « ou bien » : thé ou bien café.'),
    fill('fr_h206', '___ habites-tu ?', 'Où', ['Ou', 'Où'], '« où » indique un lieu : on ne peut pas dire « ou bien ».'),
    fill('fr_h207', 'La ville ___ je suis né est très belle.', 'où', ['ou', 'où'], '« où » indique un lieu (la ville où…).'),
    fill('fr_h208', 'Il ___ vu hier au parc.', 'l\'a', ['la', 'là', 'l\'a'], '« l\'a » = « l\'avait » : Il l\'avait vu hier.', 2),
    fill('fr_h209', 'Pose ton sac ___ !', 'là', ['la', 'là', 'l\'a'], '« là » indique un lieu : on peut dire « ici ».'),
    fill('fr_h210', '___ voiture est rouge.', 'La', ['La', 'Là', 'L\'a'], '« la » est un déterminant (comme « une », « ma ») : la voiture.'),
    fill('fr_h211', 'Regarde, il est ___ !', 'là', ['la', 'là', 'l\'a'], '« là » = à cet endroit.')
];
const accord = [
    fill('fr_a01', 'Les oiseaux ___ dans le ciel. (voler)', 'volent', ['vole', 'volent', 'voles'], 'Le sujet « Les oiseaux » est pluriel (ils) : le verbe se termine par -ent.'),
    fill('fr_a02', 'Tu ___ ton devoir. (finir)', 'finis', ['finis', 'finit', 'finissent'], 'Avec « tu », la terminaison est -s : tu finis.'),
    fill('fr_a03', 'Nous ___ au parc. (aller)', 'allons', ['allons', 'allez', 'vont'], 'Avec « nous », la terminaison est -ons : nous allons.'),
    fill('fr_a04', 'Vous ___ très vite. (courir)', 'courez', ['courez', 'courons', 'courent'], 'Avec « vous », la terminaison est -ez : vous courez.'),
    fill('fr_a05', 'Ma sœur et moi ___ la table. (mettre)', 'mettons', ['mettons', 'mettent', 'mettez'], '« Ma sœur et moi » = nous : nous mettons.'),
    fill('fr_a06', 'Ils ___ une belle chanson. (chanter)', 'chantent', ['chante', 'chantes', 'chantent'], 'Avec « ils », la terminaison est -ent : ils chantent.'),
    fill('fr_a07', 'Je ___ le goûter. (préparer)', 'prépare', ['prépare', 'prépares', 'préparent'], 'Avec « je », un verbe en -er se termine par -e : je prépare.'),
    fill('fr_a08', 'Le groupe d\'amis ___ en retard. (arriver)', 'arrive', ['arrive', 'arrivent', 'arrivons'], 'Le noyau du sujet est « groupe » (singulier) : il arrive.', 2),
    fill('fr_a09', 'Les enfants et leur père ___ à vélo. (partir)', 'partent', ['partent', 'part', 'partons'], 'Plusieurs personnes = ils : ils partent.', 2),
    fill('fr_a10', 'On ___ ensemble. (jouer)', 'joue', ['joue', 'jouent', 'jouons'], '« on » = il : on joue.', 2)
];
const conjugaison = [
    input('fr_c01', 'Présent — chanter : nous …', 'chantons', 'Au présent, avec « nous », on ajoute -ons : nous chantons.'),
    input('fr_c02', 'Présent — finir : ils …', 'finissent', 'Verbe du 2e groupe : finir → ils finissent.'),
    input('fr_c03', 'Présent — aller : vous …', 'allez', 'Aller au présent : je vais, tu vas, il va, nous allons, vous allez, ils vont.'),
    input('fr_c04', 'Présent — avoir : tu …', 'as', 'Avoir au présent : j\'ai, tu as, il a, nous avons, vous avez, ils ont.'),
    input('fr_c05', 'Présent — être : vous …', 'êtes', 'Être au présent : je suis, tu es, il est, nous sommes, vous êtes, ils sont.'),
    input('fr_c06', 'Présent — faire : vous …', 'faites', 'Faire au présent : je fais, tu fais, il fait, nous faisons, vous faites, ils font.'),
    input('fr_c07', 'Présent — prendre : nous …', 'prenons', 'Prendre au présent : je prends, tu prends, il prend, nous prenons, vous prenez, ils prennent.'),
    input('fr_c08', 'Imparfait — chanter : je …', 'chantais', 'À l\'imparfait : radical + -ais, -ais, -ait, -ions, -iez, -aient.', [], 2),
    input('fr_c09', 'Imparfait — finir : nous …', 'finissions', 'Imparfait de finir : radical « finiss- » + -ions.', [], 2),
    input('fr_c10', 'Imparfait — avoir : elles …', 'avaient', 'Imparfait d\'avoir : j\'avais, tu avais, il avait, nous avions, vous aviez, ils avaient.', [], 2),
    input('fr_c11', 'Futur — aimer : je …', 'aimerai', 'Au futur : infinitif + -ai, -as, -a, -ons, -ez, -ont.', [], 2),
    input('fr_c12', 'Futur — finir : tu …', 'finiras', 'Au futur : infinitif + -as : tu finiras.', [], 2),
    input('fr_c13', 'Futur — être : nous …', 'serons', 'Futur d\'être : je serai, tu seras, il sera, nous serons, vous serez, ils seront.', [], 3),
    input('fr_c14', 'Futur — avoir : ils …', 'auront', 'Futur d\'avoir : j\'aurai, tu auras, il aura, nous aurons, vous aurez, ils auront.', [], 3),
    input('fr_c15', 'Passé composé — manger : j\'…', 'ai mangé', 'Passé composé = auxiliaire avoir au présent + participe passé : j\'ai mangé.', [], 3),
    input('fr_c16', 'Passé composé — partir : il …', 'est parti', 'Partir se conjugue avec être : il est parti.', [], 3)
];
const nature = [
    qcm('fr_n01', 'Dans « Le chat dort », quelle est la nature du mot « chat » ?', 'nom', ['verbe', 'adjectif', 'déterminant'], 'Un nom désigne un être, un objet, un lieu… : le chat.'),
    qcm('fr_n02', 'Dans « Le chat dort », quelle est la nature du mot « Le » ?', 'déterminant', ['nom', 'pronom', 'adverbe'], 'Le déterminant accompagne le nom : le, la, un, une, mon, des…'),
    qcm('fr_n03', 'Dans « Un grand arbre », quelle est la nature du mot « grand » ?', 'adjectif', ['nom', 'verbe', 'adverbe'], 'L\'adjectif donne une précision sur le nom.'),
    qcm('fr_n04', 'Dans « Elle chante », quelle est la nature du mot « chante » ?', 'verbe', ['nom', 'adjectif', 'pronom'], 'Le verbe change avec le temps et la personne : elle chante, elle chantait.'),
    qcm('fr_n05', 'Dans « Il court vite », quelle est la nature du mot « vite » ?', 'adverbe', ['adjectif', 'nom', 'préposition'], 'L\'adverbe est invariable : il ne change jamais.'),
    qcm('fr_n06', 'Dans « Il parle à Léa », quelle est la nature du mot « à » ?', 'préposition', ['conjonction', 'adverbe', 'déterminant'], 'La préposition introduit un complément : à, de, dans, sur, avec, pour…'),
    qcm('fr_n07', 'Dans « Elle rit », quelle est la nature du mot « Elle » ?', 'pronom personnel', ['déterminant', 'nom', 'adjectif'], '« Elle » remplace un nom : c\'est un pronom.'),
    qcm('fr_n08', 'Dans « Pierre et Paul jouent », quelle est la nature du mot « et » ?', 'conjonction de coordination', ['préposition', 'adverbe', 'pronom'], 'Mais, ou, et, donc, or, ni, car relient des mots ou des phrases.', 2)
];
const verbes = [
    tap('fr_t01', 'Touche le verbe conjugué.', 'Les enfants jouent dans la cour.', [2], 'On cherche ce qui change si on change le temps : hier, les enfants jouaient.'),
    tap('fr_t02', 'Touche le verbe conjugué.', 'Mon voisin répare sa moto.', [2], 'Hier, mon voisin réparait sa moto : « répare » est le verbe.'),
    tap('fr_t03', 'Touche le verbe conjugué.', 'Nous mangeons une pomme.', [1], 'Hier, nous mangions une pomme : « mangeons » est le verbe.'),
    tap('fr_t04', 'Touche les deux mots du verbe conjugué.', 'Elle a mangé un gâteau.', [1, 2], 'Au passé composé, le verbe est formé de deux mots : l\'auxiliaire « a » et le participe « mangé ».', 2),
    tap('fr_t05', 'Touche le sujet (un seul mot).', 'Ils regardent la télévision.', [0], 'Qui est-ce qui regarde ? « Ils ».'),
    tap('fr_t06', 'Touche le verbe conjugué.', 'Le vent souffle très fort ce soir.', [2], 'Ce soir, le vent soufflait : « souffle » est le verbe.')
];
const vocab = [
    qcm('fr_v01', 'Quel mot est un synonyme de « joyeux » ?', 'gai', ['triste', 'fâché', 'lent'], 'Un synonyme a un sens proche.'),
    qcm('fr_v02', 'Quel mot est le contraire de « courageux » ?', 'peureux', ['brave', 'vaillant', 'audacieux'], 'Un antonyme a un sens opposé.'),
    qcm('fr_v03', 'Quel mot est de la même famille que « terre » ?', 'enterrer', ['terrible', 'tarte', 'tête'], 'Les mots d\'une même famille ont le même radical : terr-.'),
    qcm('fr_v04', 'Dans « refaire », que signifie le préfixe « re- » ?', 'de nouveau', ['jamais', 'avant', 'contre'], 'Refaire = faire de nouveau. Autres exemples : relire, recommencer.'),
    qcm('fr_v05', 'Quel préfixe forme le contraire de « possible » ?', 'im-', ['re-', 'pré-', 'sur-'], 'im-possible : devant un p ou un b, in- devient im-.', 2),
    qcm('fr_v06', 'Que signifie « il a un cœur d\'or » ?', 'il est très généreux', ['il porte un bijou en or', 'il est malade', 'il est riche'], 'C\'est un sens figuré : l\'expression ne se comprend pas au sens propre.', 2),
    qcm('fr_v07', 'Le suffixe « -ette » dans « maisonnette » indique…', 'une petite taille', ['un métier', 'un contraire', 'un lieu'], 'Maisonnette = petite maison. Autres : cuvette, fillette.', 2)
];

const skillDefs = [
    { id: 'grammar_sujet', label: 'Le sujet', gen: () => functionQuestion('sujet') },
    { id: 'grammar_cod', label: 'Le COD', gen: () => functionQuestion('cod') },
    { id: 'grammar_coi', label: 'Le COI', gen: () => functionQuestion('coi') },
    { id: 'grammar_cc', label: 'Les compléments circonstanciels', gen: () => functionQuestion('cc') },
    { id: 'fr_homophones1', label: 'Homophones : a/à, et/est, on/ont, son/sont', bank: homophones1 },
    { id: 'fr_homophones2', label: 'Homophones : ces/ses/c\'est/s\'est, ou/où, la/là/l\'a', bank: homophones2 },
    { id: 'fr_accord', label: 'Accord sujet-verbe', bank: accord },
    { id: 'fr_conjugaison', label: 'Conjugaison', bank: conjugaison },
    { id: 'fr_nature', label: 'Nature des mots', bank: nature },
    { id: 'fr_verbes', label: 'Repérer sujet et verbe', bank: verbes },
    { id: 'fr_vocabulaire', label: 'Vocabulaire', bank: vocab }
];
export const francaisSkills = skillDefs.map(s => ({ ...s, subject: 'francais' }));
