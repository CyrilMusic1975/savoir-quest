// Kiko, la mascotte : choix des phrases (pur, sans interface) pour pouvoir les tester.
export const PHRASES = {
    start: [
        'On y va ! Je suis avec toi.',
        'Coup d’envoi ! Lis bien chaque question.',
        'C’est parti, champion ! Prends ton temps.'
    ],
    think: [
        'Relis bien la question avant de répondre.',
        'Prends ton temps : un bon joueur lève la tête avant de tirer.',
        'Pas sûr ? Élimine les réponses qui ne peuvent pas être bonnes.',
        'Pense à ton cours : quelle règle s’applique ici ?',
        'Fais un petit calcul sur ton brouillon si ça t’aide.',
        'Respire, tu sais plus de choses que tu ne le crois.'
    ],
    correct: [
        'Bien joué !',
        'Excellent, tu as bien réfléchi !',
        'Oui ! Tu as marqué !',
        'Quel beau geste !',
        'Super, continue comme ça !'
    ],
    streak: [
        'Quelle série ! Tu es en feu !',
        'Impossible de t’arrêter, bravo !',
        'Enchaînement parfait !'
    ],
    retry: [
        'Pas encore ! Lis mon coup de pouce et réessaie.',
        'Presque ! Regarde mon indice, tu peux y arriver.',
        'Tu as une seconde chance : réfléchis avec mon indice !'
    ],
    retryok: [
        'Bravo, tu l\'as trouvé en réfléchissant !',
        'Voilà ! Avec un peu d\'aide, tu y es arrivé.',
        'Bien joué, tu as su rebondir !'
    ],
    wrong: [
        'Pas grave, on apprend de ses erreurs. Lis bien l’explication.',
        'Aïe ! Regarde l’explication, tu l’auras la prochaine fois.',
        'Même les meilleurs ratent des tirs. Lis la règle, on repart !'
    ]
};

// Phrase suivante pour un événement ; `n` (compteur de la mission) fait tourner les phrases sans hasard.
export function kikoSays(event, n = 0) {
    const list = PHRASES[event];
    return list[Math.abs(n) % list.length];
}

// Explications des objectifs, une par jour, dans cet ordre (une fois vues, elles ne reviennent plus)
export const TIPS = [
    { id: 'match', text: 'Chaque mission est un match de foot ! Une bonne réponse, c’est un but pour toi. Une erreur, c’est un but pour l’adversaire. Essaie de gagner !' },
    { id: 'championnat', text: 'Tu joues dans un championnat de 10 équipes. Chaque mission est une journée : victoire 3 points, nul 1 point. Vise la première place !' },
    { id: 'xp', text: 'Les XP sont tes points d’expérience. Chaque bonne réponse t’en rapporte, et une série de bonnes réponses en rapporte encore plus.' },
    { id: 'ligue', text: 'Les XP de la semaine te font monter de ligue : Bronze, Argent, Or, puis Champion. Ça repart de zéro chaque lundi !' },
    { id: 'cartes', text: 'Réussis souvent une même matière pour gagner une carte de joueur : bronze, argent, puis or. Tu les retrouves dans « Ma collection ».' },
    { id: 'records', text: 'Ton meilleur score et ta plus longue série de bonnes réponses sont des records. Essaie de les battre !' },
    { id: 'serie', text: 'Fais au moins une mission chaque jour pour garder ta série de jours. Plus elle est longue, plus tu es fort !' }
];

// Prochaine explication à montrer : pas deux le même jour, et seulement celles qu'on n'a pas vues
export function nextTip(seen, day, lastDay) {
    if (lastDay === day) return null;
    return TIPS.find(t => !seen.includes(t.id)) || null;
}

// Événement à annoncer quand la question suivante s'affiche
export const onQuestion = index => (index === 0 ? 'start' : 'think');
// Seconde chance : une question peut en avoir une si elle a un coup de pouce, au moins 3 options (qcm) ou une saisie
export const canRetry = q => !!q.hint && (q.kind === 'input' || ((q.kind || 'qcm') === 'qcm' && q.options.length >= 3));
// Événement après une réponse
export const onResult = (correct, streak) => (!correct ? 'wrong' : streak >= 3 ? 'streak' : 'correct');
