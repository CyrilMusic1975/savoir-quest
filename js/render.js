import { shuffle } from './content/helpers.js';

const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
};

// --- Visuels (au-dessus de la question) ---
function renderVisual(q, area) {
    area.innerHTML = '';
    const v = q.visual;
    if (!v) return;
    if (v.type === 'fraction') {
        const c = el('div', 'fraction-viz');
        for (let i = 0; i < v.total; i++) c.appendChild(el('div', `bar-segment ${i < v.filled ? 'filled' : ''}`));
        area.appendChild(c);
    } else if (v.type === 'graduated') {
        const c = el('div', 'graduated-line-container');
        const axis = el('div', 'axis');
        const totalNotches = 2 * v.subdivision;
        for (let i = 0; i <= totalNotches; i++) {
            const notch = el('div', `notch ${i % v.subdivision === 0 ? 'main' : ''}`);
            notch.style.left = `${(i / totalNotches) * 100}%`;
            if (i % v.subdivision === 0) notch.appendChild(el('div', 'notch-label', String(i / v.subdivision)));
            axis.appendChild(notch);
        }
        const marker = el('div', 'marker-a');
        marker.style.left = `${((v.chosenUnit * v.subdivision + v.chosenSub) / totalNotches) * 100}%`;
        marker.innerHTML = '<div class="label">A</div><div class="arrow"></div>';
        axis.appendChild(marker);
        c.appendChild(axis);
        area.appendChild(c);
    } else if (v.type === 'conversion-table') {
        const c = el('div', 'conversion-table-container');
        const table = el('table', 'conversion-table');
        table.appendChild(el('caption', null, 'Tableau de conversion : chaque colonne vaut 10 fois la suivante'));
        const head = el('tr');
        ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'].forEach(u => head.appendChild(el('th', null, u)));
        table.appendChild(head);
        c.appendChild(table);
        area.appendChild(c);
    } else if (v.type === 'text-display') {
        area.appendChild(el('div', 'text-display', `« ${v.content} »`));
    }
}

// Normalisation des réponses saisies : virgule/point, espaces, majuscules, apostrophes
const norm = s => String(s).trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ');
const numeric = s => {
    const n = String(s).replace(/[\s  ]/g, '').replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(n) ? parseFloat(n) : null;
};
const sameAnswer = (a, b) => {
    const na = numeric(a), nb = numeric(b);
    return na !== null && nb !== null ? na === nb : norm(a) === norm(b);
};

// --- Interaction : chaque type appelle submit(correct) une seule fois ---
function renderQcm(q, box, submit) {
    q.options.forEach(opt => {
        const btn = el('button', 'btn btn-option animate-pop', opt);
        btn.onclick = () => {
            box.querySelectorAll('button').forEach(b => { b.disabled = true; });
            const ok = opt === q.answer;
            btn.classList.add(ok ? 'correct' : 'wrong');
            if (!ok) box.querySelectorAll('button').forEach(b => { if (b.textContent === q.answer) b.classList.add('correct'); });
            submit(ok);
        };
        box.appendChild(btn);
    });
}

function renderInput(q, box, submit) {
    const wrap = el('div', 'input-wrap');
    const input = el('input', 'answer-input');
    input.type = 'text';
    input.inputMode = q.numeric ? 'decimal' : 'text';
    input.enterKeyHint = 'done';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('aria-label', 'Ta réponse');
    input.placeholder = 'Ta réponse…';
    const btn = el('button', 'btn btn-primary btn-block', 'VALIDER');
    const result = el('div', 'input-result');
    let done = false;
    const check = () => {
        if (done || !input.value.trim()) return;
        done = true;
        input.disabled = true;
        btn.disabled = true;
        const ok = (q.accept || [q.answer]).some(a => sameAnswer(input.value, a));
        input.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) result.textContent = `Réponse attendue : ${q.answer}`;
        submit(ok);
    };
    btn.onclick = check;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    wrap.append(input, btn, result);
    box.appendChild(wrap);
    setTimeout(() => input.focus({ preventScroll: true }), 50);
}

function renderTap(q, box, submit) {
    const sentence = el('div', 'token-line');
    const chosen = new Set();
    const tokens = q.tokens.map((t, i) => {
        const b = el('button', 'token', t.replace(/[.,;!?]$/, ''));
        b.onclick = () => {
            chosen.has(i) ? chosen.delete(i) : chosen.add(i);
            b.classList.toggle('selected', chosen.has(i));
            validate.disabled = chosen.size === 0;
        };
        sentence.appendChild(b);
        return b;
    });
    const validate = el('button', 'btn btn-primary btn-block', 'VALIDER');
    validate.disabled = true;
    validate.onclick = () => {
        validate.disabled = true;
        tokens.forEach(b => { b.disabled = true; });
        const good = new Set(q.answerIdx);
        const ok = chosen.size === good.size && [...chosen].every(i => good.has(i));
        tokens.forEach((b, i) => {
            if (good.has(i)) b.classList.add('correct');
            else if (chosen.has(i)) b.classList.add('wrong');
        });
        submit(ok);
    };
    box.append(sentence, validate);
}

function renderOrder(q, box, submit) {
    let pool = shuffle(q.items);
    for (let t = 0; t < 10 && pool.join('|') === q.items.join('|'); t++) pool = shuffle(q.items);
    const line = el('ol', 'order-line');
    const bank = el('div', 'order-pool');
    const placed = [];
    const validate = el('button', 'btn btn-primary btn-block', 'VALIDER');
    validate.disabled = true;
    const hint = el('div', 'order-hint', 'Touche les éléments dans le bon ordre. Touche un élément placé pour le retirer.');
    let locked = false;
    const draw = () => {
        line.innerHTML = '';
        bank.innerHTML = '';
        placed.forEach((item, i) => {
            const li = el('li');
            const b = el('button', 'order-item placed', item);
            b.onclick = () => { if (!locked) { placed.splice(i, 1); draw(); } };
            li.appendChild(b);
            line.appendChild(li);
        });
        pool.filter(i => !placed.includes(i)).forEach(item => {
            const b = el('button', 'order-item', item);
            b.onclick = () => { if (!locked) { placed.push(item); draw(); } };
            bank.appendChild(b);
        });
        validate.disabled = placed.length !== q.items.length;
        hint.style.display = locked ? 'none' : '';
    };
    validate.onclick = () => {
        locked = true;
        validate.disabled = true;
        const ok = placed.every((item, i) => item === q.items[i]);
        line.querySelectorAll('.order-item').forEach((b, i) => b.classList.add(placed[i] === q.items[i] ? 'correct' : 'wrong'));
        submit(ok);
    };
    box.append(hint, line, bank, validate);
    draw();
}

function renderMatch(q, box, submit) {
    const lefts = q.pairs.map(p => p[0]);
    const rights = shuffle(q.pairs.map(p => p[1]));
    const links = new Map(); // gauche -> droite
    let selected = null;
    let locked = false;
    const colL = el('div', 'match-col');
    const colR = el('div', 'match-col');
    const validate = el('button', 'btn btn-primary btn-block', 'VALIDER');
    validate.disabled = true;
    const palette = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#f472b6', '#818cf8'];
    const btnsL = {}, btnsR = {};
    const colorOf = l => palette[lefts.indexOf(l) % palette.length];
    const refresh = () => {
        lefts.forEach(l => {
            const b = btnsL[l];
            const linked = links.has(l);
            b.classList.toggle('selected', selected === l);
            b.style.borderColor = linked ? colorOf(l) : '';
        });
        rights.forEach(r => {
            const l = [...links.entries()].find(([, rv]) => rv === r)?.[0];
            btnsR[r].style.borderColor = l ? colorOf(l) : '';
        });
        validate.disabled = links.size !== lefts.length;
    };
    lefts.forEach(l => {
        const b = el('button', 'match-item', l);
        b.onclick = () => {
            if (locked) return;
            if (links.has(l)) links.delete(l);
            selected = selected === l ? null : l;
            refresh();
        };
        btnsL[l] = b;
        colL.appendChild(b);
    });
    rights.forEach(r => {
        const b = el('button', 'match-item', r);
        b.onclick = () => {
            if (locked) return;
            const owner = [...links.entries()].find(([, rv]) => rv === r)?.[0];
            if (owner) { links.delete(owner); refresh(); return; }
            if (!selected) return;
            links.set(selected, r);
            selected = null;
            refresh();
        };
        btnsR[r] = b;
        colR.appendChild(b);
    });
    validate.onclick = () => {
        locked = true;
        validate.disabled = true;
        let ok = true;
        q.pairs.forEach(([l, r]) => {
            const good = links.get(l) === r;
            if (!good) ok = false;
            btnsL[l].classList.add(good ? 'correct' : 'wrong');
            btnsR[links.get(l)].classList.add(good ? 'correct' : 'wrong');
        });
        submit(ok);
    };
    const grid = el('div', 'match-grid');
    grid.append(colL, colR);
    box.append(el('div', 'order-hint', 'Touche un mot, puis sa réponse. Touche un lien pour le défaire.'), grid, validate);
    refresh();
}

function renderFlash(q, box, submit) {
    const card = el('div', 'flashcard');
    card.appendChild(el('div', 'flash-hint', 'Réponds dans ta tête, puis retourne la carte.'));
    const reveal = el('button', 'btn btn-primary btn-block', 'RETOURNER LA CARTE');
    reveal.onclick = () => {
        reveal.remove();
        card.appendChild(el('div', 'flash-answer', q.answer));
        const row = el('div', 'flash-actions');
        const yes = el('button', 'btn btn-option correct-ghost', '✅ Je le savais');
        const no = el('button', 'btn btn-option wrong-ghost', '🔁 À revoir');
        yes.onclick = () => { row.querySelectorAll('button').forEach(b => { b.disabled = true; }); submit(true); };
        no.onclick = () => { row.querySelectorAll('button').forEach(b => { b.disabled = true; }); submit(false); };
        row.append(yes, no);
        box.appendChild(row);
    };
    box.append(card, reveal);
}

const RENDERERS = { qcm: renderQcm, input: renderInput, tap: renderTap, order: renderOrder, match: renderMatch, flash: renderFlash };

export function renderQuestion(q, { visualArea, optionsBox }, submit) {
    renderVisual(q, visualArea);
    optionsBox.innerHTML = '';
    optionsBox.classList.toggle('options-grid', (q.kind || 'qcm') === 'qcm');
    (RENDERERS[q.kind || 'qcm'] || renderQcm)(q, optionsBox, submit);
}
