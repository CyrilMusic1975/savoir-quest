import { SUBJECTS, SKILLS } from './content/index.js';
import * as S from './state.js';
import { buildSession, recordAnswer, completeSession, countToReview, countDue, currentStreak, doneToday, badgeProgress, TIERS } from './engine.js';
import { renderQuestion } from './render.js';
import * as Sync from './sync.js';
import * as Push from './push.js';
import * as P from './progress.js';

const $ = id => document.getElementById(id);
const screens = { home: $('home-screen'), subjects: $('subject-screen'), badges: $('badges-screen'), game: $('game-screen'), end: $('end-screen') };
const questionText = $('question-text');
const optionsBox = $('options-container');
const visualArea = $('visual-area');
const progressBar = $('progress-bar');
const scoreDisplay = $('score-display');
const timerDisplay = $('timer-display');
const levelTitle = $('level-title');
const feedback = $('feedback');
const streakBadge = $('streak-badge');
const explanationBox = $('explanation-box');
const explanationText = $('explanation-text');

// Séance en cours
let game = null;
let timerInterval = null;
let feedbackTimeout = null;

// ---------- Sons ----------
let audioCtx = null;
function playSound(freq, type = 'sine', duration = 0.1) {
    if (!S.getSettings().sound) return;
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* son non disponible */ }
}

// ---------- Fond étoilé ----------
(function createStarfield() {
    const starfield = $('starfield');
    for (let i = 0; i < 40; i++) {
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
})();

// ---------- Navigation ----------
function show(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[name].classList.remove('hidden');
    window.scrollTo(0, 0);
    if (name === 'home') updateHome();
}

// ---------- Profils ----------
const profileModal = $('profile-modal');
const nameInput = $('profile-name-input');
$('add-profile-btn').addEventListener('click', () => { profileModal.classList.remove('hidden'); setTimeout(() => nameInput.focus(), 50); });
$('cancel-profile-btn').addEventListener('click', () => profileModal.classList.add('hidden'));
$('confirm-profile-btn').addEventListener('click', createProfile);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') createProfile(); });
$('switch-profile-btn').addEventListener('click', () => { S.setActiveId(null); updateHome(); });

function createProfile() {
    const name = nameInput.value.trim();
    if (!name) return;
    const profiles = S.getProfiles();
    const p = S.ensureProfile({
        id: 'p_' + Date.now(),
        name,
        avatar: ['🦉', '🦁', '🦊', '🐼', '🐨', '🐯'][Math.floor(Math.random() * 6)]
    });
    profiles.push(p);
    S.saveProfiles();
    S.setActiveId(p.id);
    nameInput.value = '';
    profileModal.classList.add('hidden');
    updateHome();
}

function renderProfiles() {
    const grid = $('profiles-grid');
    grid.innerHTML = '';
    S.getProfiles().forEach(p => {
        const card = document.createElement('div');
        card.className = `profile-card ${p.id === S.getActiveId() ? 'active' : ''}`;
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
        card.onclick = () => { S.setActiveId(p.id); updateHome(); };
        grid.appendChild(card);
    });
}

function updateHome() {
    renderProfiles();
    const p = S.currentProfile();
    const settings = S.getSettings();
    $('setting-timer').checked = settings.timer;
    $('setting-sound').checked = settings.sound;
    const loggedIn = !!p;
    $('profile-selection-area').classList.toggle('hidden', loggedIn);
    $('active-profile-info').classList.toggle('hidden', !loggedIn);
    ['daily-btn', 'subjects-btn', 'badges-btn', 'switch-profile-btn'].forEach(id => $(id).classList.toggle('hidden', !loggedIn));
    if (!p) { $('resume-btn').classList.add('hidden'); $('errors-btn').classList.add('hidden'); return; }

    $('total-xp-display').textContent = `${p.name} : ${p.totalXP || 0} XP`;
    if (typeof updateReminderUI === 'function') updateReminderUI();
    if (Push.isEnabled()) Push.register(p.name);
    P.ensureSeason(p);
    renderSeason(p);
    const streak = currentStreak(p);
    $('streak-info').textContent = streak > 0
        ? `🔥 ${streak} jour${streak > 1 ? 's' : ''} de suite${doneToday(p) ? ' — mission du jour faite ✅' : ''}`
        : 'Fais une mission aujourd\'hui pour lancer ta série !';

    const saved = S.loadSession(p.id);
    $('resume-btn').classList.toggle('hidden', !saved);
    if (saved) $('resume-btn').textContent = `▶ REPRENDRE MA MISSION (${saved.index}/${saved.questions.length})`;

    const review = countToReview(p);
    $('errors-btn').classList.toggle('hidden', review === 0);
    $('errors-btn').textContent = `🔁 MES ERREURS (${review})`;
    const due = countDue(p);
    $('daily-btn').textContent = doneToday(p) ? '⭐ ENCORE UNE MISSION' : (due > 0 ? `⭐ MISSION DU JOUR (${due} à réviser)` : '⭐ MISSION DU JOUR');
}

// ---------- Saison ----------
function renderSeason(p) {
    const card = $('season-card');
    card.replaceChildren();
    const pr = P.leagueProgress(p.season.xp);
    const title = document.createElement('div');
    title.className = 'season-title';
    title.textContent = `🏟️ Saison ${p.season.week} · ${pr.league.emoji} ${pr.league.name}`;
    const bar = document.createElement('div');
    bar.className = 'badge-bar';
    const fill = document.createElement('i');
    fill.style.width = `${pr.pct}%`;
    bar.appendChild(fill);
    const sub = document.createElement('div');
    sub.className = 'badge-sub';
    sub.textContent = pr.next ? `${p.season.xp} XP cette semaine · encore ${pr.need} XP pour ${pr.next.emoji} ${pr.next.name}` : `${p.season.xp} XP cette semaine · niveau maximum atteint 🏆`;
    card.append(title, bar, sub);
    if (p.pendingSeasonReview) {
        const r = p.pendingSeasonReview;
        p.pendingSeasonReview = null;
        S.saveProfiles();
        const lg = P.LEAGUES.find(l => l.name === r.league);
        showOverlay({ title: `FIN DE SAISON ${r.week}`, emoji: lg.emoji, headline: `Tu finis en ${lg.name} !`, text: `${r.xp} XP gagnés la semaine dernière. Une nouvelle saison commence : fais encore mieux !`, button: 'C\'EST PARTI !' });
    }
}

// ---------- Choix de la matière ----------
$('subjects-btn').addEventListener('click', () => { renderSubjects(); show('subjects'); });
$('subjects-back-btn').addEventListener('click', () => show('home'));
function renderSubjects() {
    const p = S.currentProfile();
    const grid = $('subjects-grid');
    grid.innerHTML = '';
    SUBJECTS.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'subject-card';
        const emoji = document.createElement('span');
        emoji.className = 'subject-emoji';
        emoji.textContent = sub.emoji;
        const label = document.createElement('span');
        label.className = 'subject-label';
        label.textContent = sub.label;
        btn.append(emoji, label);
        const st = p.stats[sub.id];
        if (st && st.total >= 5) {
            const pct = document.createElement('span');
            pct.className = 'subject-pct';
            pct.textContent = `${Math.round((st.ok / st.total) * 100)} % de réussite`;
            btn.appendChild(pct);
        }
        btn.onclick = () => startSession('subject', sub.id);
        grid.appendChild(btn);
    });
}

// ---------- Collection : cartes, records, matchs ----------
$('badges-btn').addEventListener('click', () => { renderCollection(); show('badges'); });
$('badges-back-btn').addEventListener('click', () => show('home'));
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

function renderCollection() {
    const p = S.currentProfile();
    P.ensureSeason(p);
    // résumé : matchs, records, saisons
    const sum = $('collection-summary');
    sum.replaceChildren();
    const ms = p.matchStats;
    const lines = [
        ['⚽ Matchs', `${ms.w} victoire${ms.w > 1 ? 's' : ''} · ${ms.d} nul${ms.d > 1 ? 's' : ''} · ${ms.l} défaite${ms.l > 1 ? 's' : ''}`],
        ['🏆 Meilleur score', p.records.bestScore ? `${p.records.bestScore} points` : '—'],
        ['🔥 Meilleure série', p.records.bestStreak ? `${p.records.bestStreak} bonnes réponses d'affilée` : '—'],
        ['📅 Série de jours', p.records.bestDayStreak ? `${p.records.bestDayStreak} jour${p.records.bestDayStreak > 1 ? 's' : ''}` : '—']
    ];
    lines.forEach(([k, v]) => { const row = el('div', 'sum-row'); row.append(el('span', 'sum-k', k), el('span', 'sum-v', v)); sum.appendChild(row); });
    if (p.seasons.length) {
        const best = [...p.seasons].sort((a, b) => b.xp - a.xp)[0];
        const row = el('div', 'sum-row');
        row.append(el('span', 'sum-k', '🏟️ Meilleure saison'), el('span', 'sum-v', `${best.league} (${best.xp} XP, ${best.week})`));
        sum.appendChild(row);
    }
    // cartes
    const root = $('badges-list');
    root.replaceChildren();
    let total = 0;
    SUBJECTS.forEach(sub => {
        root.appendChild(el('h2', 'badge-subject', `${sub.emoji} ${sub.label}`));
        const grid = el('div', 'cards-grid');
        SKILLS.filter(s => s.subject === sub.id).sort((a, b) => (p.badges[b.id] || 0) - (p.badges[a.id] || 0)).forEach(skill => {
            const c = P.playerCard(p, skill.id);
            const pr = badgeProgress(p, skill.id);
            if (c.tier) total++;
            const card = el('div', `pcard ${c.tier ? 't' + c.tier : 'locked'}`);
            const top = el('div', 'ptop');
            top.append(el('span', 'ovr', c.tier ? String(c.ovr) : '?'), el('span', 'pos', P.POSITIONS[sub.id] || ''));
            const art = el('div', 'art', c.tier ? sub.emoji : '🔒');
            const name = el('div', 'pname', skill.label);
            card.append(top, art, name);
            if (c.tier) {
                const stats = el('div', 'pstats');
                [['PRÉ', c.pre], ['VIT', c.vit], ['EXP', c.exp]].forEach(([k, v]) => { const s = el('div'); s.append(el('b', null, String(v)), document.createTextNode(k)); stats.appendChild(s); });
                card.appendChild(stats);
            } else {
                card.appendChild(el('div', 'plock', `${pr.ok} / ${pr.need}`));
            }
            if (c.tier) card.title = `Carte ${TIERS[c.tier - 1].name}`;
            grid.appendChild(card);
        });
        root.appendChild(grid);
    });
    $('badges-total').textContent = `${total} carte${total > 1 ? 's' : ''} sur ${SKILLS.length}`;
}

// ---------- Séance ----------
$('daily-btn').addEventListener('click', () => startSession('daily'));
$('errors-btn').addEventListener('click', () => startSession('errors'));
$('resume-btn').addEventListener('click', resumeSession);
$('restart-btn').addEventListener('click', () => show('home'));
$('quit-btn').addEventListener('click', () => {
    stopTimer();
    if (game.locked) game.index++; // la question déjà répondue ne sera pas reposée
    persistSession();
    show('home');
});

function startSession(mode, subject) {
    const p = S.currentProfile();
    if (!p) return;
    const questions = buildSession(p, mode, subject);
    S.saveProfiles(); // les erreurs reprises ont quitté le carnet
    if (!questions.length) return;
    game = { mode, subject, questions, index: 0, score: 0, streak: 0, correct: 0, timer: 0, locked: false, newBadges: [], against: 0, maxStreak: 0 };
    begin();
}

function resumeSession() {
    const p = S.currentProfile();
    const saved = p && S.loadSession(p.id);
    if (!saved) return;
    game = { newBadges: [], maxStreak: 0, ...saved, locked: false };
    if (game.against === undefined) game.against = Math.max(0, game.index - game.correct);
    begin();
}

function updateBoard() {
    $('goals-for').textContent = game.correct;
    $('goals-against').textContent = game.against;
}
function begin() {
    scoreDisplay.textContent = `Score: ${game.score}`;
    const isMatch = game.mode === 'daily';
    $('match-board').classList.toggle('hidden', !isMatch);
    if (isMatch) { $('opponent-name').textContent = P.opponentOf(); updateBoard(); }
    show('game');
    startTimer();
    nextQuestion();
}

function persistSession() {
    const p = S.currentProfile();
    if (!p || !game) return;
    if (game.index >= game.questions.length) S.clearSession(p.id);
    else S.saveSession(p.id, { mode: game.mode, subject: game.subject, questions: game.questions, index: game.index, score: game.score, streak: game.streak, correct: game.correct, timer: game.timer, newBadges: game.newBadges, against: game.against, maxStreak: game.maxStreak });
}

function startTimer() {
    clearInterval(timerInterval);
    timerDisplay.classList.toggle('hidden', !S.getSettings().timer);
    timerInterval = setInterval(() => {
        game.timer++;
        const m = String(Math.floor(game.timer / 60)).padStart(2, '0');
        const s = String(game.timer % 60).padStart(2, '0');
        timerDisplay.textContent = `Temps: ${m}:${s}`;
    }, 1000);
}
const stopTimer = () => clearInterval(timerInterval);

function nextQuestion() {
    if (game.index >= game.questions.length) { endGame(); return; }
    game.locked = false;
    explanationBox.classList.add('hidden');
    const q = game.questions[game.index];
    questionText.textContent = q.text;
    levelTitle.textContent = q.label || (q.type ? q.type.toUpperCase() : 'Mission');

    if (game.streak >= 2) {
        streakBadge.style.display = 'block';
        streakBadge.textContent = `COMBO x${game.streak} 🔥`;
    } else {
        streakBadge.style.display = 'none';
    }
    progressBar.style.width = `${(game.index / game.questions.length) * 100}%`;
    persistSession();
    game.qStart = Date.now();
    renderQuestion(q, { visualArea, optionsBox }, onAnswer);
}

function onAnswer(correct, given) {
    if (game.locked) return;
    game.locked = true;
    const q = game.questions[game.index];
    const p = S.currentProfile();
    const ms = game.qStart ? Math.min(120000, Date.now() - game.qStart) : undefined;
    const badge = recordAnswer(p, q, correct, ms);
    if (badge) game.newBadges.push(badge);
    Sync.logEvent({
        ms,
        profile: p.name, skill: q.skill || q.generatorId, subject: q.subject, qid: q.id, facet: q.facet, correct,
        given: correct ? undefined : given,
        ans: correct ? undefined : q.answer,
        qtext: correct ? undefined : [q.visual && q.visual.content, q.text].filter(Boolean).join(' — ')
    });

    if (correct) {
        game.correct++;
        game.streak++;
        game.maxStreak = Math.max(game.maxStreak, game.streak);
        game.score += game.streak >= 3 ? 150 : (game.streak >= 2 ? 120 : 100);
        showFeedback(badge ? `${badge.tier.emoji} BADGE ${badge.tier.name.toUpperCase()} !` : (game.mode === 'daily' ? (game.streak >= 3 ? '⚽ BUT ! 🔥' : '⚽ BUT !') : (game.streak >= 3 ? '🔥 INCROYABLE !' : '✨ BIEN JOUÉ !')));
        if (game.mode === 'daily') updateBoard();
        playSound(440 + game.streak * 50, 'triangle', 0.2);
        scoreDisplay.textContent = `Score: ${game.score}`;
        S.saveProfiles();
        setTimeout(() => { game.index++; nextQuestion(); }, 1500);
    } else {
        game.streak = 0;
        game.against++;
        playSound(150, 'sawtooth', 0.3);
        showFeedback(game.mode === 'daily' ? '🥅 BUT ADVERSE' : '🚀 OUUPSS !');
        if (game.mode === 'daily') updateBoard();
        S.saveProfiles();
        stopTimer();
        explanationBox.classList.remove('hidden');
        explanationText.textContent = q.explanation || 'Prends ton temps pour relire ! Sers-toi de ton brouillon au besoin.';
        explanationBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

$('continue-btn').addEventListener('click', () => {
    game.index++;
    startTimer();
    nextQuestion();
});

function showFeedback(text) {
    clearTimeout(feedbackTimeout);
    feedback.textContent = text;
    feedback.style.opacity = '1';
    feedback.style.transform = 'translate(-50%, -50%) scale(1.2)';
    feedbackTimeout = setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }, 1000);
}

function endGame() {
    stopTimer();
    const p = S.currentProfile();
    const previousXP = p.totalXP;
    const total = game.questions.length;
    const isMatch = game.mode === 'daily';
    P.ensureSeason(p);

    // match du jour : résultat, bonus d'XP, adversaire du jour
    let outcome = null;
    let bonus = 0;
    const opponent = P.opponentOf();
    if (isMatch) {
        outcome = P.recordMatch(p, game.correct, game.against, opponent);
        bonus = P.MATCH_BONUS[outcome];
    }
    const gained = game.score + bonus;
    p.totalXP += gained;
    const newLeague = P.addSeasonXP(p, gained);
    const wasDone = doneToday(p);
    const streak = completeSession(p);
    const records = P.updateRecords(p, { score: gained, maxStreak: game.maxStreak, goalDiff: isMatch ? Math.max(0, game.correct - game.against) : 0 });
    S.saveProfiles();
    S.clearSession(p.id);
    Sync.backup(S.getProfiles(), true);

    show('end');
    $('final-score').textContent = gained;
    $('end-title').textContent = isMatch ? { win: 'Victoire !', draw: 'Match nul', loss: 'Fin du match' }[outcome] : 'Mission terminée !';
    const matchBox = $('end-match');
    matchBox.classList.toggle('hidden', !isMatch);
    matchBox.replaceChildren();
    if (isMatch) {
        matchBox.append(el('div', 'end-match-score', `⚽ ${game.correct} – ${game.against} ${opponent}`), el('div', `end-match-result ${outcome}`, P.OUTCOME_LABEL[outcome]));
        if (bonus) matchBox.appendChild(el('div', 'muted', `Bonus de match : +${bonus} XP`));
    }
    let msg;
    if (game.correct === total) msg = `PARFAIT ! ${total} sur ${total}, tu es un véritable génie !`;
    else if (game.correct >= total * 0.7) msg = 'Excellent travail, tu maîtrises bien ces notions !';
    else msg = 'Bien joué ! Continue de t\'entraîner pour devenir encore plus fort.';
    const endMessage = $('end-message');
    endMessage.textContent = `${msg} (${game.correct}/${total})`;
    const addLine = text => endMessage.appendChild(el('div', 'end-total', text));
    addLine(`Total XP : ${p.totalXP}`);
    if (!wasDone) addLine(`✅ Mission du jour accomplie — 🔥 ${streak} jour${streak > 1 ? 's' : ''} de suite`);
    if (newLeague) addLine(`🏟️ Tu passes en ${newLeague.emoji} ${newLeague.name} cette saison !`);
    const box = $('end-badges');
    box.replaceChildren();
    records.forEach(r => box.appendChild(el('div', 'new-badge', `🏆 Nouveau record ! ${r}`)));
    game.newBadges.forEach(b => box.appendChild(el('div', 'new-badge', `${b.tier.emoji} Nouvelle carte ${b.tier.name} : ${b.label}`)));
    game = null;
    checkPSGMilestones(previousXP, p.totalXP);
}

// ---------- Récompenses PSG ----------
function checkPSGMilestones(oldXP, newXP) {
    const milestones = [
        { points: 2000, player: 'Marquinhos', msg: 'Ici c\'est Paris ! Quel mental de capitaine, continue comme ça champion !' },
        { points: 5000, player: 'Achraf Hakimi', msg: 'Quelle vitesse de calcul ! Tu es un vrai crack sur le terrain des maths !' },
        { points: 10000, player: 'Ousmane Dembélé', msg: 'Incroyable technique ! Tu dribbles les chiffres comme personne. Bravo !' },
        { points: 15000, player: 'Warren Zaïre-Emery', msg: 'La maturité d\'un grand ! À ton âge, c\'est impressionnant. Ne t\'arrête pas !' },
        { points: 20000, player: 'Bradley Barcola', msg: 'Une précision chirurgicale ! Le talent est là, continue de progresser !' }
    ];
    const reached = milestones.find(m => oldXP < m.points && newXP >= m.points);
    if (reached) setTimeout(() => showSpecialReward(reached), 1000);
}

function showOverlay({ title, emoji, headline, text, button }) {
    const overlay = el('div', 'reward-overlay');
    const card = el('div', 'reward-card animate-pop');
    const btn = el('button', 'btn btn-primary btn-block', button || 'CONTINUER L\'AVENTURE');
    btn.onclick = () => overlay.remove();
    card.append(el('h2', null, title), el('div', 'reward-trophy', emoji), el('div', 'reward-player', headline), el('div', 'reward-msg', text), btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
}
const showSpecialReward = r => showOverlay({ title: 'RÉCOMPENSE PSG 🔴🔵', emoji: '🏆', headline: `Palier ${r.player}`, text: r.msg });

// ---------- Réglages ----------
$('setting-timer').addEventListener('change', e => S.setSettings({ ...S.getSettings(), timer: e.target.checked }));
$('setting-sound').addEventListener('change', e => S.setSettings({ ...S.getSettings(), sound: e.target.checked }));

// ---------- Sauvegarde / restauration ----------
const backupStatus = $('backup-status');
$('export-btn').addEventListener('click', () => {
    const data = JSON.stringify({ app: 'savoir-quest', version: 2, exportedAt: new Date().toISOString(), profiles: S.getProfiles() }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `savoir-quest-sauvegarde-${S.today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    backupStatus.textContent = 'Sauvegarde téléchargée.';
});
const importInput = $('import-input');
$('import-btn').addEventListener('click', () => importInput.click());
importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    importInput.value = '';
    if (!file) return;
    try {
        const data = JSON.parse(await file.text());
        if (data.app !== 'savoir-quest' || !Array.isArray(data.profiles)) throw new Error('format');
        const merged = [...S.getProfiles()];
        data.profiles.forEach(inc => {
            const i = merged.findIndex(p => p.id === inc.id);
            if (i === -1) merged.push(inc);
            else if ((inc.totalXP || 0) > (merged[i].totalXP || 0)) merged[i] = inc;
        });
        S.setProfiles(merged);
        updateHome();
        backupStatus.textContent = `Sauvegarde restaurée (${data.profiles.length} profil(s)).`;
    } catch (e) {
        backupStatus.textContent = 'Ce fichier n\'est pas une sauvegarde Savoir Quest valide.';
    }
});

// ---------- Suivi parent ----------
function updateSyncUI() {
    const n = Sync.pending();
    $('sync-pending').textContent = n ? `(${n} résultat(s) en attente d'envoi)` : '';
}
updateSyncUI();
setInterval(updateSyncUI, 5000);

// ---------- Rappel quotidien ----------
function updateReminderUI() {
    const p = S.currentProfile();
    const supported = Push.isSupported();
    const on = Push.isEnabled();
    const denied = Push.permission() === 'denied';
    $('reminder-status').textContent = !supported
        ? 'Non disponible ici : installe d\'abord l\'appli sur l\'écran d\'accueil.'
        : on ? 'Activé ✅ (tu recevras un rappel à 17 h 30 si tu n\'as pas joué).'
        : denied ? 'Bloqué : autorise les notifications dans les réglages du navigateur.' : 'Non activé.';
    $('reminder-settings-btn').classList.toggle('hidden', !supported || on || denied);
    let dismissed = false;
    try { dismissed = localStorage.getItem('sq_reminder_dismissed') === '1'; } catch (e) { /* ignoré */ }
    $('reminder-banner').classList.toggle('hidden', !p || !supported || on || denied || dismissed);
}
async function activateReminder(msgEl) {
    const p = S.currentProfile();
    msgEl.textContent = 'Activation…';
    const r = await Push.enable(p ? p.name : '');
    msgEl.textContent = r === 'ok' ? 'Rappel activé ✅' : r === 'denied' ? 'Notifications refusées.' : r === 'dismissed' ? 'Rien n\'est activé : réessaie et touche « Autoriser ».' : 'Impossible d\'activer le rappel pour le moment.';
    updateReminderUI();
}
$('reminder-yes').addEventListener('click', () => activateReminder($('reminder-msg')));
$('reminder-settings-btn').addEventListener('click', () => activateReminder($('reminder-status')));
$('reminder-later').addEventListener('click', () => { try { localStorage.setItem('sq_reminder_dismissed', '1'); } catch (e) { /* ignoré */ } updateReminderUI(); });
// le rappel mentionne le prénom du profil actif : on met l'abonnement à jour quand on change de profil
updateReminderUI();

// ---------- Sauvegarde automatique ----------
setTimeout(() => Sync.backup(S.getProfiles()), 6000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') Sync.backup(S.getProfiles()); });

// ---------- PWA : hors ligne + stockage durable ----------
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW non enregistré', e));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

show('home');
