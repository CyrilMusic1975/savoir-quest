// Rappel quotidien : abonnement « web push » standard (aucun service payant).
// La tâche planifiée du dépôt privé envoie la notification à 17 h 30 si le profil n'a pas encore joué.
import { putDoc } from './sync.js';

const VAPID_PUBLIC_KEY = 'BKNRKu-9uYP51hhiPwlfBG-Pp3Pk1CmcsMtCVaH-XXmngXnvEeaMNYsTydpk20DK7QlN7X3FY0XJ_ZKqZdvv_No';

export const isSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && location.protocol.startsWith('http');
export const permission = () => (isSupported() ? Notification.permission : 'unsupported');

const toBytes = b64 => {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
};
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const str = v => ({ stringValue: String(v) });

// Doit être appelé après un geste de l'utilisateur (clic). Retourne 'ok', 'denied' ou 'error'.
export async function enable(profileName) {
    try {
        if (!isSupported()) return 'error';
        const perm = await Notification.requestPermission();
        if (perm === 'default') return 'dismissed';
        if (perm !== 'granted') return 'denied';
        const reg = await navigator.serviceWorker.ready;
        const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(VAPID_PUBLIC_KEY) });
        localStorage.setItem('sq_push_sub', JSON.stringify(sub.toJSON()));
        return (await register(profileName)) ? 'ok' : 'error';
    } catch (e) { return 'error'; }
}

// Enregistre (ou met à jour) l'abonnement et le prénom du profil actif
export async function register(profileName) {
    try {
        const sub = JSON.parse(localStorage.getItem('sq_push_sub'));
        if (!sub || !sub.endpoint) return false;
        return await putDoc(`push/${(await sha(sub.endpoint)).slice(0, 40)}`, {
            endpoint: str(sub.endpoint), p256dh: str(sub.keys.p256dh), auth: str(sub.keys.auth),
            profile: str((profileName || '').slice(0, 20)), ts: { integerValue: String(Date.now()) }
        });
    } catch (e) { return false; }
}
export const isEnabled = () => permission() === 'granted' && !!localStorage.getItem('sq_push_sub');
