// Données du joueur (localStorage). Les clés « mathQuest_* » d'origine sont conservées.
const PROFILES_KEY = 'mathQuest_profiles';
const ACTIVE_KEY = 'mathQuest_activeProfileId';
const SETTINGS_KEY = 'sq_settings';
const SESSION_KEY = 'sq_session_';

export const today = () => dateStr(new Date());
const dateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function addDays(str, n) {
    const [y, m, d] = str.split('-').map(Number);
    return dateStr(new Date(y, m - 1, d + n));
}

// Complète un profil ancien avec les champs ajoutés par les versions suivantes
export function ensureProfile(p) {
    p.totalXP = p.totalXP || 0;
    p.missed = p.missed || [];
    p.mastery = p.mastery || {};
    p.srs = p.srs || {};
    p.recent = p.recent || {};
    p.levels = p.levels || {};
    p.stats = p.stats || {};
    p.facets = p.facets || {};
    p.daily = p.daily || { streak: 0, last: null };
    p.schemaVersion = 2;
    return p;
}

let cache = null;
export function getProfiles() {
    if (!cache) {
        try { cache = (JSON.parse(localStorage.getItem(PROFILES_KEY)) || []).map(ensureProfile); }
        catch (e) { cache = []; }
    }
    return cache;
}
export function setProfiles(val) {
    cache = val.map(ensureProfile);
    saveProfiles();
}
export function saveProfiles() {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(getProfiles())); }
    catch (e) { console.error('Sauvegarde impossible', e); }
}
export function getActiveId() {
    try { return localStorage.getItem(ACTIVE_KEY) || null; } catch (e) { return null; }
}
export function setActiveId(id) {
    try { id ? localStorage.setItem(ACTIVE_KEY, id) : localStorage.removeItem(ACTIVE_KEY); } catch (e) { /* ignoré */ }
}
export const currentProfile = () => getProfiles().find(p => p.id === getActiveId());

export function getSettings() {
    try { return { timer: false, sound: true, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
    catch (e) { return { timer: false, sound: true }; }
}
export function setSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) { /* ignoré */ }
}

// Séance en cours (pour pouvoir la reprendre après fermeture de l'appli)
export function saveSession(profileId, data) {
    try { localStorage.setItem(SESSION_KEY + profileId, JSON.stringify(data)); } catch (e) { /* ignoré */ }
}
export function loadSession(profileId) {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY + profileId)); } catch (e) { return null; }
}
export function clearSession(profileId) {
    try { localStorage.removeItem(SESSION_KEY + profileId); } catch (e) { /* ignoré */ }
}
