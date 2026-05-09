#!/usr/bin/env node
// Convert docs/experience-source.md to data/experience.json.
//
// Format: blocks separated by '===' on its own line.
// Each block has a head of "key: value" lines, a blank line,
// then a free-text blurb (the rest of the block).
//
// Lines starting with '#' are comments and are ignored (in the head section).
//
// Required keys: id, start, displayDate, role
// Optional keys: end ("-" or empty means current/null), company, tags (comma-separated), era
//
// Writes JSON to data/experience.json relative to the script's grandparent dir.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcPath = resolve(root, 'docs', 'experience-source.md');
const outPath = resolve(root, 'data', 'experience.json');

const raw = readFileSync(srcPath, 'utf8');

const blocks = raw.split(/^===\s*$/m).map(b => b.trim()).filter(Boolean);

const required = ['id', 'start', 'displayDate', 'role'];

const entries = blocks.map((block, i) => {
  const blank = block.indexOf('\n\n');
  const head = blank === -1 ? block : block.slice(0, blank);
  const body = blank === -1 ? '' : block.slice(blank + 2).trim();

  const fields = {};
  for (const line of head.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) throw new Error(`block ${i + 1}: cannot parse "${line}"`);
    fields[m[1]] = m[2].trim();
  }

  for (const k of required) {
    if (!fields[k]) throw new Error(`block ${i + 1}: missing required field "${k}"`);
  }

  const entry = {
    id: fields.id,
    start: fields.start,
    end: fields.end && fields.end !== '-' ? fields.end : null,
    displayDate: fields.displayDate,
    role: fields.role,
    company: fields.company || '',
    blurb: body,
    tags: fields.tags
      ? fields.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [],
  };
  if (fields.era) entry.era = fields.era;
  return entry;
});

writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n');
console.log(`Wrote ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} to ${outPath}`);
