import { run as content } from './content.test.mjs';
import { run as generators } from './generators.test.mjs';
import { run as engine } from './engine.test.mjs';
import { run as progress } from './progress.test.mjs';

let failures = 0;
const MAX_SHOWN = 10;
for (const [name, fn] of [['contenu', content], ['générateurs', generators], ['moteur', engine], ['compétition', progress]]) {
    const errs = [];
    const info = fn(msg => errs.push(msg));
    if (errs.length) {
        failures += errs.length;
        console.log(`✘ ${name} : ${errs.length} problème(s)`);
        errs.slice(0, MAX_SHOWN).forEach(e => console.log('   - ' + e));
    } else console.log(`✔ ${name} : ${info}`);
}
if (failures) { console.log(`\n${failures} problème(s) au total`); process.exit(1); }
console.log('\nTous les contrôles sont passés.');
