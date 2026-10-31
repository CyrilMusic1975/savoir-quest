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

// Événement à annoncer quand la question suivante s'affiche
export const onQuestion = index => (index === 0 ? 'start' : 'think');
// Événement après une réponse
export const onResult = (correct, streak) => (!correct ? 'wrong' : streak >= 3 ? 'streak' : 'correct');
