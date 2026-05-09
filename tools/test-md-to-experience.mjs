#!/usr/bin/env node
// Self-test for md-to-experience.mjs. Run: node tools/test-md-to-experience.mjs
import { writeFileSync, readFileSync, mkdtempSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { strict as assert } from 'node:assert';

const tmp = mkdtempSync(join(tmpdir(), 'md2exp-'));
const docs = join(tmp, 'docs');
const data = join(tmp, 'data');
const tools = join(tmp, 'tools');
mkdirSync(docs); mkdirSync(data); mkdirSync(tools);

const source = `# This is a comment, must be ignored
id: a-now
start: 2022
end: -
displayDate: Now
role: Backend Developer
company: Ecommerce platform
tags: PHP, MySQL, Go
era: developer

Working on the backend of an ecommerce system — order flows, integrations,
and the unglamorous correctness work that keeps a shop running.
===
id: b-fintech
start: 2019
end: 2022
displayDate: 2019-2022
role: Backend Developer
company: Financial systems
tags: Perl, PostgreSQL
era: developer

Numbers that have to be right.
`;

writeFileSync(join(docs, 'experience-source.md'), source);

copyFileSync(new URL('./md-to-experience.mjs', import.meta.url).pathname, join(tools, 'md-to-experience.mjs'));
execFileSync('node', [join(tools, 'md-to-experience.mjs')], { cwd: tmp, stdio: 'inherit' });

const out = JSON.parse(readFileSync(join(data, 'experience.json'), 'utf8'));
assert.equal(out.length, 2, 'should produce two entries');
assert.equal(out[0].id, 'a-now');
assert.equal(out[0].end, null, 'end "-" should become null');
assert.deepEqual(out[0].tags, ['PHP', 'MySQL', 'Go']);
assert.match(out[0].blurb, /unglamorous correctness/);
assert.equal(out[1].id, 'b-fintech');
assert.equal(out[1].end, '2022');
assert.equal(out[1].blurb, 'Numbers that have to be right.');

const badSource = `id: bad
start: 2020
displayDate: 2020

(no role)
`;
writeFileSync(join(docs, 'experience-source.md'), badSource);
let threw = false;
try {
  execFileSync('node', [join(tools, 'md-to-experience.mjs')], { cwd: tmp, stdio: 'pipe' });
} catch (e) {
  threw = true;
}
assert.equal(threw, true, 'missing required field should make the script exit non-zero');

rmSync(tmp, { recursive: true, force: true });
console.log('OK — md-to-experience tests passed');
