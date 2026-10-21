import { mathsSkills } from './maths.js';
import { francaisSkills } from './francais.js';
import { sciencesSkills } from './sciences.js';
import { histgeoSkills } from './histgeo.js';

export const SUBJECTS = [
    { id: 'maths', label: 'Mathématiques', emoji: '🔢' },
    { id: 'francais', label: 'Français', emoji: '📖' },
    { id: 'svt', label: 'SVT', emoji: '🌱' },
    { id: 'physique', label: 'Physique-chimie', emoji: '⚗️' },
    { id: 'histgeo', label: 'Histoire-Géo', emoji: '🏛️' }
];

export const SKILLS = [...mathsSkills, ...francaisSkills, ...sciencesSkills, ...histgeoSkills];
export const SKILL_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]));

// Toutes les questions de banque, retrouvables par leur identifiant stable
export const QUESTION_BY_ID = {};
SKILLS.forEach(s => (s.bank || []).forEach(q => {
    if (QUESTION_BY_ID[q.id]) console.warn('Identifiant de question en double :', q.id);
    QUESTION_BY_ID[q.id] = { ...q, skill: s.id, subject: s.subject, label: s.label };
}));
