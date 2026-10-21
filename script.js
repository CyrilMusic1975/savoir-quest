const gameState = {
    score: 0,
    currentQuestion: 0,
    totalQuestions: 10,
    timer: 0,
    timerInterval: null,
    questions: [],
    streak: 0,
    // Profile-specific data managed via localStorage
    _profilesCache: null,
    get profiles() {
        if (!this._profilesCache) {
            try { this._profilesCache = JSON.parse(localStorage.getItem('mathQuest_profiles')) || []; }
            catch (e) { this._profilesCache = []; }
        }
        return this._profilesCache;
    },
    set profiles(val) {
        this._profilesCache = val;
        try { localStorage.setItem('mathQuest_profiles', JSON.stringify(val)); }
        catch (e) { console.error("Could not save profiles", e); }
    },
    get currentProfileId() {
        try { return localStorage.getItem('mathQuest_activeProfileId') || null; }
        catch (e) { return null; }
    },
    set currentProfileId(val) {
        try {
            if (val) localStorage.setItem('mathQuest_activeProfileId', val);
            else localStorage.removeItem('mathQuest_activeProfileId');
        } catch (e) { console.error("Could not save active profile ID", e); }
    },
    // Short-hand for current profile data
    get currentProfile() {
        return this.profiles.find(p => p.id === this.currentProfileId);
    },
    // Data that swaps when profile changes
    get missedQuestions() { return this.currentProfile?.missed || []; },
    set missedQuestions(val) { if (this.currentProfile) this.currentProfile.missed = val; },
    get mastery() { return this.currentProfile?.mastery || {}; },
    set mastery(val) { if (this.currentProfile) this.currentProfile.mastery = val; },
    get totalXP() { return this.currentProfile?.totalXP || 0; },
    set totalXP(val) { if (this.currentProfile) this.currentProfile.totalXP = val; }
};

// Elements
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const visualArea = document.getElementById('visual-area');
const progressBar = document.getElementById('progress-bar');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const levelTitle = document.getElementById('level-title');
const feedback = document.getElementById('feedback');
const streakBadge = document.getElementById('streak-badge');
const explanationBox = document.getElementById('explanation-box');
const explanationText = document.getElementById('explanation-text');
const continueBtn = document.getElementById('continue-btn');

// Sound Synth
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("AudioContext not supported");
        }
    }
    return audioCtx;
}

function playSound(freq, type = 'sine', duration = 0.1) {
    const ctx = getAudioCtx();
    if (!ctx) return;

    // Resume context if suspended (browser requirements)
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}

// Profile Elements
const profileSelectionArea = document.getElementById('profile-selection-area');
const profilesGrid = document.getElementById('profiles-grid');
const addProfileBtn = document.getElementById('add-profile-btn');
const activeProfileInfo = document.getElementById('active-profile-info');
const profileModal = document.getElementById('profile-modal');
const profileNameInput = document.getElementById('profile-name-input');
const confirmProfileBtn = document.getElementById('confirm-profile-btn');
const cancelProfileBtn = document.getElementById('cancel-profile-btn');
const startBtn = document.getElementById('start-btn');
const switchProfileBtn = document.getElementById('switch-profile-btn');

// Init
startBtn.addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
continueBtn.addEventListener('click', () => {
    explanationBox.classList.add('hidden');
    gameState.currentQuestion++;
    startTimer();
    nextQuestion();
});
addProfileBtn.addEventListener('click', () => profileModal.classList.remove('hidden'));
cancelProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));
confirmProfileBtn.addEventListener('click', createProfile);
switchProfileBtn.addEventListener('click', () => {
    gameState.currentProfileId = null;
    updateUI();
});

// Starfield generation
function createStarfield() {
    const starfield = document.getElementById('starfield');
    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
        star.style.animationDelay = `${Math.random() * 3}s`;
        starfield.appendChild(star);
    }
}
createStarfield();

function createProfile() {
    const name = profileNameInput.value.trim();
    if (!name) return;

    const newProfile = {
        id: 'p_' + Date.now(),
        name: name,
        totalXP: 0,
        missed: [],
        mastery: {},
        avatar: ['🦉', '🦁', '🦊', '🐼', '🐨', '🐯'][Math.floor(Math.random() * 6)]
    };

    const profiles = gameState.profiles;
    profiles.push(newProfile);
    gameState.profiles = profiles;

    gameState.currentProfileId = newProfile.id;

    profileNameInput.value = '';
    profileModal.classList.add('hidden');
    updateUI();
}

function selectProfile(id) {
    gameState.currentProfileId = id;
    updateUI();
}

function saveProfiles() {
    gameState.profiles = gameState.profiles;
}

function updateUI() {
    renderProfiles();

    const current = gameState.currentProfile;
    if (current) {
        profileSelectionArea.classList.add('hidden');
        activeProfileInfo.classList.remove('hidden');
        startBtn.classList.remove('hidden');
        switchProfileBtn.classList.remove('hidden');

        const xpDisplay = document.getElementById('total-xp-display');
        if (xpDisplay) xpDisplay.textContent = `${current.name} : ${current.totalXP || 0} XP`;
    } else {
        profileSelectionArea.classList.remove('hidden');
        activeProfileInfo.classList.add('hidden');
        startBtn.classList.add('hidden');
        switchProfileBtn.classList.add('hidden');
    }
}

function renderProfiles() {
    profilesGrid.innerHTML = '';
    gameState.profiles.forEach(p => {
        const card = document.createElement('div');
        card.className = `profile-card ${p.id === gameState.currentProfileId ? 'active' : ''}`;
        const avatar = document.createElement('div');
        avatar.className = 'profile-avatar';
        avatar.textContent = p.avatar;
        const name = document.createElement('div');
        name.className = 'profile-name';
        name.textContent = p.name;
        const xp = document.createElement('div');
        xp.className = 'profile-xp';
        xp.textContent = `${p.totalXP || 0} XP`;
        card.append(avatar, name, xp);
        card.onclick = () => selectProfile(p.id);
        profilesGrid.appendChild(card);
    });
}

function startGame() {
    if (!gameState.currentProfileId) return;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.correct = 0;
    gameState.currentQuestion = 0;
    gameState.timer = 0;
    gameState.questions = generateQuestions();

    scoreDisplay.textContent = `Score: 0`;

    showScreen(gameScreen);
    startTimer();
    nextQuestion();
}

function showScreen(screen) {
    [homeScreen, gameScreen, endScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');

    if (screen === homeScreen) {
        updateUI();
    }
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        const mins = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
        const secs = (gameState.timer % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `Temps: ${mins}:${secs}`;
    }, 1000);
}

function getQuestionGenerators() {
    return [
        { id: 'math_decimal', gen: generateDecimalQuestion },
        { id: 'math_fraction', gen: generateFractionQuestion },
        { id: 'math_comparison', gen: generateComparisonQuestion },
        { id: 'math_construction', gen: generateConstructionQuestion },
        { id: 'math_multiplication', gen: generateSimpleMultiplicationQuestion },
        { id: 'math_line', gen: generateGraduatedLineQuestion },
        { id: 'math_conversion', gen: generateUnitConversionQuestion },
        { id: 'math_mental', gen: generateMentalMathQuestion },
        { id: 'grammar_sujet', gen: () => generateGrammarQuestion('sujet') },
        { id: 'grammar_cod', gen: () => generateGrammarQuestion('cod') },
        { id: 'grammar_coi', gen: () => generateGrammarQuestion('coi') },
        { id: 'grammar_cc', gen: () => generateGrammarQuestion('cc') }
    ];
}

function generateQuestions() {
    let questions = [];

    if (gameState.missedQuestions.length > 0) {
        const toRepeat = gameState.missedQuestions.splice(0, 4);
        questions = [...toRepeat];
        saveProfiles();
    }

    const generators = getQuestionGenerators();

    while (questions.length < gameState.totalQuestions) {
        let totalWeight = 0;
        const weightedGens = generators.map(g => {
            const masteryLevel = gameState.mastery[g.id] || 0;
            let w = 10 - masteryLevel; // adaptive calculation
            if (w < 1) w = 1;
            if (w > 20) w = 20;
            totalWeight += w;
            return { ...g, w };
        });

        let rnd = Math.random() * totalWeight;
        let selectedGen = weightedGens[weightedGens.length - 1].gen;
        let chosenId = weightedGens[weightedGens.length - 1].id;
        for (let wg of weightedGens) {
            rnd -= wg.w;
            if (rnd <= 0) {
                selectedGen = wg.gen;
                chosenId = wg.id;
                break;
            }
        }

        const q = selectedGen();
        q.generatorId = chosenId; 
        questions.push(q);
    }
    return questions.sort(() => Math.random() - 0.5);
}

function generateUnitConversionQuestion() {
    const isLevel1 = Math.random() < 0.5;

    const units = [
        { name: 'km', pow: 6 },
        { name: 'hm', pow: 5 },
        { name: 'dam', pow: 4 },
        { name: 'm', pow: 3 },
        { name: 'dm', pow: 2 },
        { name: 'cm', pow: 1 },
        { name: 'mm', pow: 0 }
    ];

    const fromIdx = Math.floor(Math.random() * units.length);
    let toIdx;
    do {
        toIdx = Math.floor(Math.random() * units.length);
    } while (toIdx === fromIdx);

    const from = units[fromIdx];
    const to = units[toIdx];

    let val;
    if (isLevel1) {
        if (from.pow > to.pow) {
            val = Math.floor(Math.random() * 9) + 1;
        } else {
            const diff = to.pow - from.pow;
            const base = Math.floor(Math.random() * 9) + 1;
            val = base * Math.pow(10, diff);
        }
    } else {
        val = parseFloat((Math.random() * 9 + 1).toFixed(1)); 
    }

    const diff = from.pow - to.pow;
    let convertedMatch = (val * Math.pow(10, diff));
    let converted = parseFloat(convertedMatch.toPrecision(7)); 
    
    const valStr = val.toString().replace('.', ',');
    const convertedStr = converted.toString().replace('.', ',');

    const answer = `${convertedStr} ${to.name}`;
    const text = isLevel1 ? `Combien de ${to.name} dans ${valStr} ${from.name} ?` : `Convertis : ${valStr} ${from.name} = ... ${to.name}`;

    let usedFactors = new Set([1]);
    const options = generateOptions(answer, false, () => {
         const factors = [0.001, 0.01, 0.1, 10, 100, 1000, 10000];
         let f = factors[Math.floor(Math.random() * factors.length)];
         while(usedFactors.has(f)) f = factors[Math.floor(Math.random() * factors.length)];
         usedFactors.add(f);
         let fake = parseFloat((converted * f).toPrecision(7));
         return `${fake.toString().replace('.', ',')} ${to.name}`;
    });

    return {
        text: text,
        visual: { type: 'conversion-table' },
        options: options,
        answer: answer,
        type: 'mesure',
        explanation: `Pour convertir les ${from.name} en ${to.name}, déplace la virgule ou ajoute/retire des zéros en fonction de leur distance dans le tableau de conversion (km, hm, dam, m, dm, cm, mm).`
    };
}


const grammarBank = [
    { text: "Le petit chat curieux mange sa pâtée dans la cuisine.", parts: {
        sujet: { answer: "Le petit chat curieux", options: ["mange", "sa pâtée", "dans la cuisine"] },
        cod: { answer: "sa pâtée", options: ["Le petit chat curieux", "mange", "dans la cuisine"] },
        cc: { answer: "dans la cuisine", options: ["Le petit chat curieux", "mange", "sa pâtée"], expl: "C'est un CCL (Complément Circonstanciel de Lieu) qui répond à la question 'Où ?'." }
    }},
    { text: "Mon frère parle à son ami doucement ce matin.", parts: {
        sujet: { answer: "Mon frère", options: ["parle", "à son ami", "ce matin"] },
        coi: { answer: "à son ami", options: ["Mon frère", "doucement", "ce matin"], expl: "Le COI répond à 'à qui' ou 'à quoi'. Il parle à qui ? à son ami." },
        cc: { answer: "ce matin", options: ["Mon frère", "parle", "à son ami"], expl: "C'est un CCT (Temps) qui répond à 'Quand ?'." }
    }},
    { text: "Hier, nous avons regardé un film.", parts: {
        sujet: { answer: "nous", options: ["Hier", "avons regardé", "un film"] },
        cod: { answer: "un film", options: ["Hier", "nous", "avons regardé"] },
        cc: { answer: "Hier", options: ["nous", "avons regardé", "un film"], expl: "C'est un CCT (Temps) qui répond à 'Quand ?'." }
    }},
    { text: "Le pirate a trouvé le trésor en creusant rapidement.", parts: {
        sujet: { answer: "Le pirate", options: ["a trouvé", "le trésor", "rapidement"] },
        cod: { answer: "le trésor", options: ["Le pirate", "a trouvé", "rapidement"] },
        cc: { answer: "en creusant rapidement", options: ["Le pirate", "a trouvé", "le trésor"], expl: "C'est un CCM (Manière) qui répond à 'Comment ?'." }
    }}
];

function generateGrammarQuestion(type) {
    const validSentences = grammarBank.filter(s => s.parts[type]);
    const sentence = validSentences[Math.floor(Math.random() * validSentences.length)];
    const data = sentence.parts[type];
    
    let roleText = type.toUpperCase();
    if (type === 'sujet') roleText = "Sujet";
    else if (type === 'cc') roleText = "Complément Circonstanciel (CC)";
    
    let defaultExplanation = "";
    if (type === 'sujet') defaultExplanation = "Le sujet est celui qui fait l'action. On le trouve en posant la question 'Qui est-ce qui ... ?' (Qui est-ce qui fait l'action du verbe ?).";
    if (type === 'cod') defaultExplanation = "Le COD subit l'action. On le trouve en posant la question 'Qui ?' ou 'Quoi ?' juste après le verbe (ex: Il mange quoi ?).";
    if (type === 'coi') defaultExplanation = "Le COI se construit avec une préposition (à, de...). On pose la question 'À qui/quoi ?' ou 'De qui/quoi ?' après le verbe.";
    if (type === 'cc') defaultExplanation = "Le CC indique les circonstances (lieu, temps, manière). On peut souvent le déplacer ou le supprimer dans la phrase sans qu'elle perde son sens.";

    const expl = data.expl || defaultExplanation;

    return {
        text: `Grammaire : Dans la phrase ci-dessous, retrouve le ${roleText}.`,
        visual: { type: 'text-display', content: sentence.text },
        options: [data.answer, ...data.options].sort(() => Math.random() - 0.5),
        answer: data.answer,
        type: `grammaire`,
        explanation: expl
    };
}

// --- Question Generators ---

function generateComparisonQuestion() {
    const nums = [];
    const seen = new Set();
    while (nums.length < 4) {
        const val = (Math.random() * 2).toFixed(Math.floor(Math.random() * 3) + 1);
        if (seen.has(parseFloat(val))) continue; // valeurs égales (1,5 et 1,50) = réponse ambiguë
        seen.add(parseFloat(val));
        nums.push(val.replace('.', ','));
    }

    // Sort to find the max
    const sorted = [...nums].sort((a, b) => parseFloat(b.replace(',', '.')) - parseFloat(a.replace(',', '.')));
    const answer = sorted[0];

    return {
        text: "Quel est le plus grand nombre parmi ceux-ci ?",
        options: nums,
        answer: answer,
        type: 'decimal',
        explanation: "Pour comparer des décimaux, compare d'abord la partie entière. Si elles sont égales, compare le chiffre des dixièmes, puis des centièmes."
    };
}

function generateConstructionQuestion() {
    const dizaines = Math.floor(Math.random() * 9) + 1;
    const dixienes = Math.floor(Math.random() * 9) + 1;

    const correctVal = (dizaines * 10) + (dixienes / 10);
    const answer = correctVal.toFixed(1).replace('.', ',');

    // Trap options like in the PDF (e.g., 8,5 instead of 80,5)
    const trap1 = (dizaines + dixienes / 10).toFixed(1).replace('.', ',');
    const trap2 = (dizaines * 10 + dixienes / 100).toFixed(2).replace('.', ',');
    const trap3 = (dizaines + dixienes).toString();

    const options = [answer, trap1, trap2, trap3].sort(() => Math.random() - 0.5);

    return {
        text: `${dizaines} dizaines et ${dixienes} dixièmes, est-ce :`,
        options: options,
        answer: answer,
        type: 'decimal',
        explanation: `Attention au piège ! ${dizaines} dizaines = ${dizaines * 10}. Et ${dixienes} dixièmes, c'est ${dixienes / 10} ou ${dixienes} à droite de la virgule.`
    };
}

function generateSimpleMultiplicationQuestion() {
    // Check mastery: count how many tables are mastered (2+ correct)
    let masteredCount = 0;
    for (let i = 2; i <= 9; i++) {
        for (let j = 2; j <= 9; j++) {
            if ((gameState.mastery[`${i}x${j}`] || 0) >= 2) masteredCount++;
        }
    }

    const isMaster = masteredCount >= 40; // threshold for progression

    if (isMaster) {
        const n1 = 11 + Math.floor(Math.random() * 20); // 11 to 30
        const n2 = 2 + Math.floor(Math.random() * 7); // 2 to 8
        const a = n1 * n2;
        return {
            text: `EXPERT : combien font ${n1} x ${n2} ?`,
            options: generateOptions(a.toString(), true),
            answer: a.toString(),
            type: 'math',
            metadata: { type: 'expert', factors: [n1, n2] }
        };
    } else {
        const n1 = 2 + Math.floor(Math.random() * 8); // 2 to 9
        const n2 = 2 + Math.floor(Math.random() * 8);
        const a = n1 * n2;
        return {
            text: `Multiplication : combien font ${n1} x ${n2} ?`,
            options: generateOptions(a.toString(), true),
            answer: a.toString(),
            type: 'math',
            metadata: { type: 'classic', factors: [n1, n2] }
        };
    }
}

function generateGraduatedLineQuestion() {
    const totalUnits = 2;
    const subdivision = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
    const chosenUnit = Math.floor(Math.random() * (totalUnits));
    const chosenSub = 1 + Math.floor(Math.random() * (subdivision - 1));

    // Position of A
    const value = chosenUnit + (chosenSub / subdivision);
    const answer = `${chosenUnit * subdivision + chosenSub}/${subdivision}`;

    const options = generateOptions(answer, false, () => {
        const f = 1 + Math.floor(Math.random() * (totalUnits * subdivision));
        return `${f}/${subdivision}`;
    });

    return {
        text: "Quelle fraction correspond au repère A sur cette ligne graduée ?",
        visual: { type: 'graduated', subdivision, chosenUnit, chosenSub },
        options: options,
        answer: answer,
        type: 'fraction',
        explanation: `L'unité entre chaque grand trait est découpée en ${subdivision} parties. Le repère est sur le morceau n°${chosenUnit * subdivision + chosenSub}. Donc la fraction est ${chosenUnit * subdivision + chosenSub}/${subdivision}.`
    };
}

function generateDecimalQuestion() {
    let num, integer, decimal;
    let roles = ['unités', 'dixièmes', 'centièmes'];

    // On ajoute 'dizaines' seulement si le nombre sera >= 10
    if (Math.random() > 0.5) {
        roles.push('dizaines');
        num = (10 + Math.random() * 89).toFixed(2);
    } else {
        num = (1 + Math.random() * 8).toFixed(2);
    }

    const parts = num.split('.');
    integer = parts[0];
    decimal = parts[1];

    // Choisir un rôle présent dans la liste
    const chosenRole = roles[Math.floor(Math.random() * roles.length)];

    let answer = "";
    if (chosenRole === 'unités') answer = integer.slice(-1);
    else if (chosenRole === 'dizaines') answer = integer.slice(-2, -1);
    else if (chosenRole === 'dixièmes') answer = decimal[0];
    else if (chosenRole === 'centièmes') answer = decimal[1];

    // Pour éviter toute confusion (ex: 11,11), on s'assure que le chiffre-réponse 
    // n'apparaît pas ailleurs si possible, ou on régénère
    const numStr = num.replace('.', ',');
    const firstIndex = numStr.indexOf(answer);
    const lastIndex = numStr.lastIndexOf(answer);

    // Si le chiffre apparaît plusieurs fois, on recommence la génération pour la clarté
    if (firstIndex !== lastIndex) {
        return generateDecimalQuestion();
    }

    const options = generateOptions(answer, true);

    return {
        text: `Dans le nombre ${numStr}, quel est le chiffre des ${chosenRole} ?`,
        options: options,
        answer: answer,
        type: 'decimal'
    };
}

function generateFractionQuestion() {
    const total = 2 + Math.floor(Math.random() * 8); // 2 to 10
    const filled = 1 + Math.floor(Math.random() * (total - 1));
    const answer = `${filled}/${total}`;

    const options = generateOptions(answer, false, () => {
        const f = 1 + Math.floor(Math.random() * 9);
        const t = 2 + Math.floor(Math.random() * 8);
        // pas de fraction égale à la bonne réponse (2/4 = 1/2)
        return f * total === filled * t ? null : `${f}/${t}`;
    });

    return {
        text: "Quelle fraction correspond à cette barre coloriée ?",
        visual: { type: 'fraction', filled, total },
        options: options,
        answer: answer,
        type: 'fraction'
    };
}

function generateMentalMathQuestion() {
    const types = ['add', 'sub', 'mul', 'div'];
    const type = types[Math.floor(Math.random() * types.length)];
    let q, a;

    if (type === 'add') {
        const n1 = 100 + Math.floor(Math.random() * 400);
        const n2 = 99; // Common pattern in PDF
        q = `${n1} + ${n2}`;
        a = n1 + n2;
    } else if (type === 'sub') {
        const n1 = 100 + Math.floor(Math.random() * 400);
        const n2 = 99;
        q = `${n1} - ${n2}`;
        a = n1 - n2;
    } else if (type === 'mul') {
        const factor1 = 2 + Math.floor(Math.random() * 8); // 2 to 9
        const factor2 = Math.random() < 0.5 ? 40 : 80; // Pattern from PDF
        const result = factor1 * factor2;

        // Transform into a "missing factor" question like "4 x ? = 320"
        q = `${factor1} x ... = ${result}`;
        a = factor2;
    } else {
        const n1 = 20 + Math.floor(Math.random() * 30);
        const n2 = 8;
        q = `Quotient de ${n1} : ${n2}`;
        a = Math.floor(n1 / n2);
    }

    const options = generateOptions(a.toString(), true);

    return {
        text: `Calcule rapidement : ${q}`,
        options: options,
        answer: a.toString(),
        type: 'math'
    };
}

function generateOptions(correct, isNumeric, customGen = null) {
    const opts = [correct];
    const val = parseInt(correct);
    // Pour un nombre : leurres proches, positifs, et dans 0-9 si la réponse est un chiffre
    const spread = Math.max(5, Math.round(Math.abs(val) * 0.15));
    const max = val < 10 ? 9 : Infinity;
    let guard = 0;
    while (opts.length < 4 && guard++ < 500) {
        let fake;
        if (customGen) fake = customGen();
        else {
            const delta = (1 + Math.floor(Math.random() * spread)) * (Math.random() < 0.5 ? -1 : 1);
            const n = val + delta;
            if (n < 0 || n > max) continue;
            fake = n.toString();
        }
        if (fake && !opts.includes(fake)) opts.push(fake);
    }
    return opts.sort(() => Math.random() - 0.5);
}

// --- UI Logic ---

function nextQuestion() {
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        endGame();
        return;
    }

    const q = gameState.questions[gameState.currentQuestion];
    questionText.textContent = q.text;
    levelTitle.textContent = `Mission : ${q.type.toUpperCase()}`;

    // Streak UI
    if (gameState.streak >= 2) {
        streakBadge.style.display = 'block';
        streakBadge.textContent = `COMBO x${gameState.streak} 🔥`;
    } else {
        streakBadge.style.display = 'none';
    }

    // Update progress
    const progress = (gameState.currentQuestion / gameState.totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;

    // Visual Area
    visualArea.innerHTML = '';
    if (q.visual && q.visual.type === 'fraction') {
        const container = document.createElement('div');
        container.className = 'fraction-viz';
        for (let i = 0; i < q.visual.total; i++) {
            const seg = document.createElement('div');
            seg.className = `bar-segment ${i < q.visual.filled ? 'filled' : ''}`;
            container.appendChild(seg);
        }
        visualArea.appendChild(container);
    } else if (q.visual && q.visual.type === 'graduated') {
        const container = document.createElement('div');
        container.className = 'graduated-line-container';

        const axis = document.createElement('div');
        axis.className = 'axis';

        const totalNotches = 2 * q.visual.subdivision;
        for (let i = 0; i <= totalNotches; i++) {
            const notch = document.createElement('div');
            const pos = (i / totalNotches) * 100;
            notch.className = `notch ${i % q.visual.subdivision === 0 ? 'main' : ''}`;
            notch.style.left = `${pos}%`;

            if (i % q.visual.subdivision === 0) {
                const label = document.createElement('div');
                label.className = 'notch-label';
                label.textContent = i / q.visual.subdivision;
                notch.appendChild(label);
            }
            axis.appendChild(notch);
        }

        const marker = document.createElement('div');
        marker.className = 'marker-a';
        const markerPos = ((q.visual.chosenUnit * q.visual.subdivision + q.visual.chosenSub) / totalNotches) * 100;
        marker.style.left = `${markerPos}%`;
        marker.innerHTML = '<div class="label">A</div><div class="arrow"></div>';

        axis.appendChild(marker); // le repère suit la ligne (même repère de position)
        container.appendChild(axis);
        visualArea.appendChild(container);
    } else if (q.visual && q.visual.type === 'conversion-table') {
        const container = document.createElement('div');
        container.className = 'conversion-table-container';
        
        const unitsList = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];
        
        const table = document.createElement('table');
        table.className = 'conversion-table';
        
        const caption = document.createElement('caption');
        caption.textContent = 'Tableau de conversion : chaque colonne vaut 10 fois la suivante';
        table.appendChild(caption);
        const thead = document.createElement('tr');
        unitsList.forEach(u => {
            const th = document.createElement('th');
            th.textContent = u;
            thead.appendChild(th);
        });
        table.appendChild(thead);
        
        container.appendChild(table);
        visualArea.appendChild(container);
    } else if (q.visual && q.visual.type === 'text-display') {
        const div = document.createElement('div');
        div.className = 'text-display';
        div.textContent = `« ${q.visual.content} »`;
        visualArea.appendChild(div);
    }

    // Options
    optionsContainer.innerHTML = '';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-option animate-pop';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(chosen, btn) {
    const q = gameState.questions[gameState.currentQuestion];
    const isCorrect = chosen === q.answer;

    const btns = optionsContainer.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);
    
    const gid = q.generatorId;

    if (isCorrect) {
        if (gid) gameState.mastery[gid] = (gameState.mastery[gid] || 0) + 1;
        
        btn.classList.add('correct');
        gameState.correct++;
        gameState.streak++;
        const bonus = gameState.streak >= 3 ? 150 : (gameState.streak >= 2 ? 120 : 100);
        gameState.score += bonus;
        showFeedback(gameState.streak >= 3 ? '🔥 INCROYABLE !' : '✨ BIEN JOUÉ !');
        playSound(440 + (gameState.streak * 50), 'triangle', 0.2); 

        if (q.metadata && q.metadata.type === 'classic') {
            const key = `${q.metadata.factors[0]}x${q.metadata.factors[1]}`;
            const altKey = `${q.metadata.factors[1]}x${q.metadata.factors[0]}`;
            gameState.mastery[key] = (gameState.mastery[key] || 0) + 1;
            gameState.mastery[altKey] = (gameState.mastery[altKey] || 0) + 1;
        }
        saveProfiles();

        scoreDisplay.textContent = `Score: ${gameState.score}`;
        setTimeout(() => {
            gameState.currentQuestion++;
            nextQuestion();
        }, 1500);

    } else {
        if (gid) gameState.mastery[gid] = Math.max(-10, (gameState.mastery[gid] || 0) - 2); 
        
        btn.classList.add('wrong');
        gameState.streak = 0;
        playSound(150, 'sawtooth', 0.3); 
        
        const currentFailed = gameState.questions[gameState.currentQuestion];
        if (!gameState.missedQuestions.some(err => err.text === currentFailed.text)) {
            gameState.missedQuestions.push(currentFailed);
        }
        saveProfiles();

        btns.forEach(b => {
            if (b.textContent === q.answer) b.classList.add('correct');
        });
        showFeedback('🚀 OUUPSS !');
        scoreDisplay.textContent = `Score: ${gameState.score}`;

        clearInterval(gameState.timerInterval);
        
        explanationBox.classList.remove('hidden');
        explanationBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        explanationText.textContent = q.explanation || "Astuce mathématique : Prends ton temps pour relire ! Sers-toi de ton brouillon au besoin.";
    }
}

function showFeedback(text) {
    feedback.textContent = text;
    feedback.style.opacity = '1';
    feedback.style.transform = 'translate(-50%, -50%) scale(1.2)';
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }, 1000);
}

function endGame() {
    clearInterval(gameState.timerInterval);

    // Update Total XP
    const previousXP = gameState.totalXP;
    gameState.totalXP += gameState.score;
    saveProfiles();

    showScreen(endScreen);
    document.getElementById('final-score').textContent = gameState.score;

    let msg = "Mission accomplie !";
    if (gameState.correct === gameState.totalQuestions) msg = "PARFAIT ! 10 sur 10, tu es un véritable génie !";
    else if (gameState.correct >= 7) msg = "Excellent travail, tu maîtrises bien ces notions !";
    else msg = "Bien joué ! Continue de t'entraîner pour devenir encore plus fort.";

    const endMessage = document.getElementById('end-message');
    endMessage.textContent = `${msg} (${gameState.correct}/${gameState.totalQuestions})`;
    const totalLine = document.createElement('div');
    totalLine.className = 'end-total';
    totalLine.textContent = `Total XP : ${gameState.totalXP}`;
    endMessage.appendChild(totalLine);

    // PSG Milestones
    checkPSGMilestones(previousXP, gameState.totalXP);
}

function checkPSGMilestones(oldXP, newXP) {
    const milestones = [
        { points: 2000, player: "Marquinhos", msg: "Ici c'est Paris ! Quel mental de capitaine, continue comme ça champion !" },
        { points: 5000, player: "Achraf Hakimi", msg: "Quelle vitesse de calcul ! Tu es un vrai crack sur le terrain des maths !" },
        { points: 10000, player: "Ousmane Dembélé", msg: "Incroyable technique ! Tu dribbles les chiffres comme personne. Bravo !" },
        { points: 15000, player: "Warren Zaïre-Emery", msg: "La maturité d'un grand ! À ton âge, c'est impressionnant. Ne t'arrête pas !" },
        { points: 20000, player: "Bradley Barcola", msg: "Une précision chirurgicale ! Le talent est là, continue de progresser !" }
    ];

    const reached = milestones.find(m => oldXP < m.points && newXP >= m.points);

    if (reached) {
        setTimeout(() => {
            showSpecialReward(reached);
        }, 1000);
    }
}

function showSpecialReward(reward) {
    const rewardOverlay = document.createElement('div');
    rewardOverlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.98); display: flex; flex-direction: column;
        justify-content: safe center; align-items: center; z-index: 1000;
        overflow-y: auto; padding: 1rem; text-align: center; color: white;
    `;

    rewardOverlay.innerHTML = `
        <div style="background: linear-gradient(135deg, #004170, #da291c); padding: 2rem; border-radius: 2rem; border: 4px solid white; box-shadow: 0 0 50px rgba(218, 41, 28, 0.5); max-width: 500px; width: 90%;" class="animate-pop">
            <h2 style="font-size: 2rem; margin-bottom: 1.5rem; letter-spacing: 2px;">RÉCOMPENSE PSG 🔴🔵</h2>
            <div style="font-size: 6rem; margin-bottom: 1rem;" aria-hidden="true">🏆</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: white; margin-bottom: 1rem;">Palier ${reward.player}</div>
            <div style="font-size: 1.2rem; margin-bottom: 1rem; line-height: 1.4;">${reward.msg}</div>
            <button class="btn btn-primary" style="margin-top: 2rem; width: 100%;" onclick="this.parentElement.parentElement.remove()">CONTINUER L'AVENTURE</button>
        </div>
    `;
    document.body.appendChild(rewardOverlay);
}

// --- Sauvegarde / restauration de la progression ---
const backupStatus = document.getElementById('backup-status');
document.getElementById('export-btn').addEventListener('click', () => {
    const data = JSON.stringify({ app: 'savoir-quest', version: 1, exportedAt: new Date().toISOString(), profiles: gameState.profiles }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `savoir-quest-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    backupStatus.textContent = 'Sauvegarde téléchargée.';
});
const importInput = document.getElementById('import-input');
document.getElementById('import-btn').addEventListener('click', () => importInput.click());
importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    importInput.value = '';
    if (!file) return;
    try {
        const data = JSON.parse(await file.text());
        if (data.app !== 'savoir-quest' || !Array.isArray(data.profiles)) throw new Error('format');
        // fusion : on garde le profil qui a le plus d'XP
        const merged = [...gameState.profiles];
        data.profiles.forEach(inc => {
            const i = merged.findIndex(p => p.id === inc.id);
            if (i === -1) merged.push(inc);
            else if ((inc.totalXP || 0) > (merged[i].totalXP || 0)) merged[i] = inc;
        });
        gameState.profiles = merged;
        updateUI();
        backupStatus.textContent = `Sauvegarde restaurée (${data.profiles.length} profil(s)).`;
    } catch (e) {
        backupStatus.textContent = "Ce fichier n'est pas une sauvegarde Savoir Quest valide.";
    }
});

// --- PWA : hors ligne + stockage durable ---
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW non enregistré', e));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

// Start on home screen
showScreen(homeScreen);
