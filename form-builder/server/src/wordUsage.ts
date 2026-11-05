/**
 * Copyright (C) 2021-2026 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/**
 * Where words still appear in a helpline's twilio-iac config (twilio-iac/helplines/<code>): its
 * Studio flow templates (.tftpl), its .hcl files (flow_vars and other texts) and its chatbots
 * (configs/lex_v2). When a helpline changes its terms, Aselo staff see what's left to change
 * there by hand. The service configuration is left out (settings, not texts).
 */
import { promises as fs } from 'fs';
import path from 'path';

import type { WordUsage, WordUsageKind } from '@tech-matters/form-builder-shared';

const TEXT_FILE = /\.(hcl|tftpl|json)$/;
const SKIPPED_FOLDERS = new Set(['service-configuration', 'node_modules', '.terraform']);
// Long lines (a chatbot's JSON on one line) are cut down to this much around the words
const SNIPPET_LENGTH = 180;
// Enough to say where the work is without a wall of text
const MAX_USAGES = 500;

const filesUnder = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return SKIPPED_FOLDERS.has(entry.name) ? [] : filesUnder(full);
      return TEXT_FILE.test(entry.name) ? [full] : [];
    }),
  );
  return nested.flat();
};

const kindOf = (file: string): WordUsageKind => {
  if (/(^|\/)(lex|lex_v2)(\/|$)/.test(file) || /chatbot/i.test(file)) return 'chatbot';
  if (file.endsWith('.tftpl')) return 'studio';
  return 'config';
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const snippetOf = (line: string, index: number) => {
  const text = line.trim();
  if (text.length <= SNIPPET_LENGTH) return text;
  const offset = line.length - line.trimStart().length;
  const start = Math.max(0, index - offset - SNIPPET_LENGTH / 3);
  const cut = text.slice(start, start + SNIPPET_LENGTH);
  return `${start > 0 ? '…' : ''}${cut}${start + SNIPPET_LENGTH < text.length ? '…' : ''}`;
};

/** Each line of the helpline's twilio-iac config with one of the words (whole words, any capitals). */
export const findWordUsage = async (helplinesDir: string, code: string, words: string[]): Promise<WordUsage[]> => {
  const wanted = words.map(word => word.trim()).filter(Boolean);
  if (wanted.length === 0) return [];
  const pattern = new RegExp(`\\b(${wanted.map(escapeRegExp).join('|')})\\b`, 'gi');
  const root = path.join(helplinesDir, code);
  const usages: WordUsage[] = [];
  for (const file of (await filesUnder(root)).sort()) {
    const relative = path.relative(helplinesDir, file).split(path.sep).join('/');
    const lines = (await fs.readFile(file, 'utf8')).split(/\r?\n/);
    lines.forEach((line, index) => {
      const found = [...line.matchAll(pattern)];
      if (found.length === 0 || usages.length >= MAX_USAGES) return;
      usages.push({
        file: relative,
        kind: kindOf(relative),
        line: index + 1,
        text: snippetOf(line, found[0].index ?? 0),
        words: [...new Set(found.map(match => match[0]))],
      });
    });
  }
  return usages;
};
