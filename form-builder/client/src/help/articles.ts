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
 * The help panel's articles: one Markdown file each in content/<area>/, with a short header
 * (between --- lines) saying what it's about. How to write them: content/README.md.
 */

export type HelpArea = 'forms' | 'flows' | 'routing' | 'chatbots' | 'general';
// Who it's written for: helpline staff, Aselo staff, or both
export type HelpAudience = 'helpline' | 'aselo' | 'everyone';
// A guide walks through a process step by step; an answer answers one question; a section
// explains one part of the builder (what it's for), and is what its "Need help?" opens
export type HelpKind = 'guide' | 'answer' | 'section';

// A "Show me" step: what to point at (button:<text>, text:<text>, label:<aria-label> or
// css:<selector>, Tour.tsx), what to say, and what to say when it isn't on screen
export type TourStep = { target: string; text: string; missing?: string };

export type HelpArticle = {
  slug: string;
  title: string;
  area: HelpArea;
  audience: HelpAudience;
  kind: HelpKind;
  // The ways people ask for it: what makes questions find it
  questions: string[];
  keywords: string[];
  // Shown first in its area's list (lower first)
  order: number;
  // Its "Show me" tour, if it has one: "<target> | <text> | <when it isn't on screen>" lines
  tour?: TourStep[];
  body: string;
  // Its first paragraph, shown as the answer in search results
  summary: string;
};

const AREAS: HelpArea[] = ['forms', 'flows', 'routing', 'chatbots', 'general'];

// "key: value" lines, and lists as "key:" followed by "  - item" lines
const parseHeader = (header: string) => {
  const values: Record<string, string | string[]> = {};
  let listKey: string | undefined;
  header.split(/\r?\n/).forEach(line => {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      (values[listKey] as string[]).push(item[1].trim());
      return;
    }
    const pair = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!pair) return;
    listKey = pair[2] ? undefined : pair[1];
    values[pair[1]] = pair[2] ? pair[2].trim() : [];
  });
  return values;
};

const listOf = (value: string | string[] | undefined) =>
  Array.isArray(value)
    ? value
    : (value ?? '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

const tourStepOf = (line: string): TourStep => {
  const [target, text, missing] = line.split(' | ').map(part => part.trim());
  return { target, text: text ?? '', ...(missing ? { missing } : {}) };
};

export const parseArticle = (path: string, source: string): HelpArticle => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${path}: the article needs a header between --- lines.`);
  const header = parseHeader(match[1]);
  const body = match[2].trim();
  const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');
  const area = path.match(/content\/([a-z]+)\//)?.[1] as HelpArea;
  if (!AREAS.includes(area)) throw new Error(`${path}: articles live in content/<area>/.`);
  const audience = (header.audience as HelpAudience) ?? 'everyone';
  const kind = (header.kind as HelpKind) ?? 'answer';
  const title = typeof header.title === 'string' ? header.title : '';
  if (!title) throw new Error(`${path}: the article has no title.`);
  return {
    slug,
    title,
    area,
    audience,
    kind,
    questions: listOf(header.questions),
    keywords: listOf(header.keywords),
    order: Number(header.order ?? 100),
    ...(Array.isArray(header.tour) && header.tour.length > 0 ? { tour: header.tour.map(tourStepOf) } : {}),
    body,
    summary: body.split(/\r?\n\s*\r?\n/).find(paragraph => !paragraph.startsWith('#')) ?? '',
  };
};

// Every content/<area>/<article>.md, as text (webpack.config.cjs reads Markdown as text)
const files = require.context('./content', true, /^\.\/[a-z]+\/[^/]+\.md$/);
const textOf = (key: string) => {
  const loaded = files(key) as string | { default: string };
  return typeof loaded === 'string' ? loaded : loaded.default;
};

export const HELP_ARTICLES: HelpArticle[] = files
  .keys()
  .map(key => parseArticle(`./content/${key.slice(2)}`, textOf(key)))
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export const articleBySlug = (slug: string) => HELP_ARTICLES.find(article => article.slug === slug);

// What someone sees: helpline staff, what's written for them; Aselo staff, everything
export const visibleTo = (article: HelpArticle, isAseloStaff: boolean) => isAseloStaff || article.audience !== 'aselo';
