// Suivi parent : envoie les résultats vers Firestore par l'API REST (sans SDK, hors ligne géré par une file locale).
// Le jeu ne dépend jamais de ce module : toute erreur est ignorée.
const CFG = { apiKey: 'AIzaSyCUJz0lIE14w2Mdf4HfFGgsbWfSGmcXo2M', projectId: 'savoir-quest-suivi' };
const KEY = 'sq_sync';
const MAX_QUEUE = 3000;
const DOCS = `https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents`;

let state = load();
let flushing = false;
let timer = null;

function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { queue: [] }; } catch (e) { return { queue: [] }; }
}
function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignoré */ }
}

export const isLinked = () => !!(state.code && state.uid);
export const pending = () => state.queue.length;

// 12 caractères sans ambiguïté (pas de 0/O ni 1/I/L), affichés par blocs de 4
export const normalizeCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

async function token() {
    if (state.idToken && state.exp > Date.now() + 60000) return state.idToken;
    if (state.refreshToken) {
        const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${CFG.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(state.refreshToken)}`
        });
        if (res.ok) {
            const j = await res.json();
            state.idToken = j.id_token; state.refreshToken = j.refresh_token; state.uid = j.user_id;
            state.exp = Date.now() + Number(j.expires_in) * 1000;
            save();
            return state.idToken;
        }
    }
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${CFG.apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true })
    });
    if (!res.ok) throw new Error('auth');
    const j = await res.json();
    // un nouvel identifiant anonyme doit être ré-enregistré auprès du foyer
    if (state.uid && state.uid !== j.localId) state.joined = false;
    state.idToken = j.idToken; state.refreshToken = j.refreshToken; state.uid = j.localId;
    state.exp = Date.now() + Number(j.expiresIn) * 1000;
    save();
    return state.idToken;
}

async function register() {
    const idToken = await token();
    const res = await fetch(`${DOCS}/families/${state.code}/devices?documentId=${state.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ fields: { joinedAt: { integerValue: String(Date.now()) } } })
    });
    if (res.status === 409) { state.joined = true; save(); return true; } // déjà enregistré
    if (!res.ok) return false;
    state.joined = true;
    save();
    return true;
}

// Association avec le code donné par le parent. Retourne true si le code est accepté.
export async function link(rawCode) {
    const code = normalizeCode(rawCode);
    if (code.length !== 12) return false;
    const previous = { ...state };
    state = { queue: previous.queue || [], code, uid: null, joined: false };
    try {
        await token();
        if (await register()) { flushSoon(); return true; }
    } catch (e) { /* tombe dans l'échec ci-dessous */ }
    state = { queue: previous.queue || [], ...(previous.code ? { code: previous.code, uid: previous.uid, joined: previous.joined, idToken: previous.idToken, refreshToken: previous.refreshToken, exp: previous.exp } : {}) };
    save();
    return false;
}

export function unlink() {
    state = { queue: [] };
    save();
}

const str = v => ({ stringValue: String(v) });

export function logEvent(ev) {
    if (!isLinked()) return;
    state.queue.push({ ...ev, ts: Date.now() });
    if (state.queue.length > MAX_QUEUE) state.queue.splice(0, state.queue.length - MAX_QUEUE);
    save();
    flushSoon();
}

function flushSoon() {
    clearTimeout(timer);
    timer = setTimeout(flush, 3000);
}

function toWrite(ev) {
    const fields = {
        profile: str(ev.profile.slice(0, 20)), skill: str(ev.skill || 'inconnu'), subject: str(ev.subject || 'inconnu'),
        correct: { booleanValue: !!ev.correct }, ts: { integerValue: String(ev.ts) }
    };
    if (ev.qid) fields.qid = str(ev.qid);
    if (ev.facet) fields.facet = str(ev.facet);
    if (!ev.correct) {
        if (ev.given) fields.given = str(String(ev.given).slice(0, 200));
        if (ev.ans) fields.ans = str(String(ev.ans).slice(0, 200));
        if (ev.qtext) fields.qtext = str(String(ev.qtext).slice(0, 300));
    }
    const id = `${ev.ts}-${Math.random().toString(36).slice(2, 8)}`;
    return { update: { name: `projects/${CFG.projectId}/databases/(default)/documents/families/${state.code}/events/${id}`, fields }, currentDocument: { exists: false } };
}

export async function flush() {
    if (flushing || !isLinked() || !state.queue.length || !navigator.onLine) return;
    flushing = true;
    try {
        if (!state.joined && !(await register())) return;
        const idToken = await token();
        while (state.queue.length) {
            const batch = state.queue.slice(0, 100);
            const res = await fetch(`${DOCS}:commit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ writes: batch.map(toWrite) })
            });
            if (!res.ok) { if (res.status === 401) { state.idToken = null; save(); } return; }
            state.queue.splice(0, batch.length);
            save();
        }
    } catch (e) { /* hors ligne ou erreur réseau : on réessaiera */ }
    finally { flushing = false; }
}

window.addEventListener('online', flush);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
setTimeout(flush, 2000);
