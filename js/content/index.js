import { mathsSkills } from './maths.js';
import { maths6eSkills } from './maths6e.js';
import { francaisSkills } from './francais.js';
import { conjugaisonSkills } from './conjugaison.js';
import { sciencesSkills } from './sciences.js';
import { histgeoSkills } from './histgeo.js';
import { sciences6eSkills } from './sciences6e.js';
import { histgeo6eSkills } from './histgeo6e.js';
import { anglaisSkills } from './anglais.js';

export const SUBJECTS = [
    { id: 'maths', label: 'Mathématiques', emoji: '🔢' },
    { id: 'francais', label: 'Français', emoji: '📖' },
    { id: 'svt', label: 'SVT', emoji: '🌱' },
    { id: 'physique', label: 'Physique-chimie', emoji: '⚗️' },
    { id: 'histgeo', label: 'Histoire-Géo', emoji: '🏛️' },
    { id: 'anglais', label: 'Anglais', emoji: '🇬🇧' }
];

// Contenus déjà vus en classe (cours déposés) en premier ; le reste est du contenu général de 6e, proposé moins souvent
const EXTRA = new Set(['svt_vivant', 'svt_alimentation', 'svt_plantes', 'pc_etats', 'pc_melanges', 'pc_lumiere', 'hg_prehistoire', 'hg_antiquite1', 'hg_grecerome', 'hg_geo', 'hg_mots',
    'math_priorites', 'math_division', 'math_geometrie', 'math_pourcentages', 'math_durees', 'math_multiples', 'math_divisibilite']);
export const SKILLS = [...mathsSkills, ...maths6eSkills, ...francaisSkills, ...conjugaisonSkills, ...sciencesSkills, ...sciences6eSkills, ...histgeoSkills, ...histgeo6eSkills, ...anglaisSkills]
    .map(s => (EXTRA.has(s.id) ? { ...s, extra: true } : s));
export const SKILL_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]));

// Toutes les questions de banque, retrouvables par leur identifiant stable
export const QUESTION_BY_ID = {};
SKILLS.forEach(s => (s.bank || []).forEach(q => {
    if (QUESTION_BY_ID[q.id]) console.warn('Identifiant de question en double :', q.id);
    QUESTION_BY_ID[q.id] = { ...q, skill: s.id, subject: s.subject, label: s.label };
}));
