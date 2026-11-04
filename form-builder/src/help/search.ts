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
 * Finding the article that answers a question typed in plain words, in the browser (no AI, no
 * cost): MiniSearch over each article's title, the ways people ask for it, its keywords and its
 * text, forgiving typos and word endings, with the builder's words and their synonyms treated as
 * the same, and the area the person is in counting most.
 */
import MiniSearch from 'minisearch';
import type { Query } from 'minisearch';
import type { HelpArea, HelpArticle } from './articles';
import { HELP_ARTICLES, visibleTo } from './articles';

// Words that mean the same here: a question with one finds articles with any of them
const SYNONYMS: string[][] = [
  ['submit', 'send', 'finish', 'done', 'hand'],
  ['review', 'check', 'approve', 'approval', 'validate'],
  ['required', 'mandatory', 'compulsory', 'must', 'obligatory'],
  ['comment', 'flag', 'note', 'question', 'ask', 'feedback'],
  ['field', 'question', 'item', 'box'],
  ['answer', 'option', 'choice', 'value'],
  ['dropdown', 'select', 'list', 'menu'],
  ['remove', 'delete', 'erase', 'drop'],
  ['add', 'create', 'new', 'insert'],
  ['change', 'edit', 'modify', 'update', 'fix'],
  ['rename', 'name', 'label', 'title'],
  ['publish', 'apply', 'live', 'deploy', 'release'],
  ['draft', 'changes', 'work'],
  ['undo', 'mistake', 'revert', 'discard', 'reset'],
  ['counselor', 'counsellor', 'agent', 'volunteer'],
  ['tab', 'form', 'section', 'page'],
  ['category', 'categories', 'issue', 'topic'],
  ['save', 'saved', 'saving', 'lost'],
  ['preview', 'try', 'test', 'see'],
  ['access', 'login', 'sign', 'permission', 'account', 'okta'],
  ['resolve', 'close', 'answered'],
];

const synonymsOf = new Map<string, string[]>();
SYNONYMS.forEach((group) =>
  group.forEach((word) => synonymsOf.set(word, [...new Set([...(synonymsOf.get(word) ?? []), ...group])])),
);

// Words that say nothing about what's asked
const STOP_WORDS = new Set(
  'a an the i we you my our your me us it its is are was were be been do does did can could should would will how what which to of in on for with at by from and or not no this that these those there here have has had get got so if as about into than then them they he she his her just please'.split(
    ' ',
  ),
);

// Words, without the bits left by apostrophes (can't, I'm)
const tokenize = (text: string) =>
  (
    text
      .toLowerCase()
      .replace(/['’]\w+/g, '')
      .match(/[a-z0-9áéíóúñü]+/g) ?? []
  ).filter((word) => word.length > 1);

type Indexed = HelpArticle & { questionsText: string; keywordsText: string };

const buildIndex = (articles: HelpArticle[]) => {
  const index = new MiniSearch<Indexed>({
    idField: 'slug',
    fields: ['title', 'questionsText', 'keywordsText', 'body'],
    storeFields: ['slug'],
    processTerm: (term) => (STOP_WORDS.has(term) ? null : term.toLowerCase()),
    searchOptions: {
      boost: { title: 3, questionsText: 3, keywordsText: 2, body: 1 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'OR',
    },
  });
  index.addAll(
    articles.map((article) => ({
      ...article,
      questionsText: article.questions.join(' . '),
      keywordsText: article.keywords.join(' '),
    })),
  );
  return index;
};

let defaultIndex: MiniSearch<Indexed> | undefined;

export type HelpResult = { article: HelpArticle; score: number };

/**
 * The articles answering a question, best first: those of the area the person is in count double,
 * and helpline staff only get what's written for them. Confident when the best has every word
 * asked (or a synonym), or most of them in a longer question; otherwise they're those sharing some
 * words, which may not answer it.
 */
export const searchHelp = (
  query: string,
  { area, isAseloStaff, articles }: { area: HelpArea; isAseloStaff: boolean; articles?: HelpArticle[] },
): { results: HelpResult[]; confident: boolean } => {
  const words = tokenize(query).filter((word) => !STOP_WORDS.has(word));
  if (words.length === 0) return { results: [], confident: false };
  const pool = articles ?? HELP_ARTICLES;
  const index = articles ? buildIndex(articles) : (defaultIndex ??= buildIndex(pool));
  const bySlug = new Map(pool.map((article) => [article.slug, article]));
  // Each word, or any of its synonyms (the word itself counts most)
  const asked = new Set(words);
  const perWord: Query[] = words.map((word) => ({
    combineWith: 'OR',
    queries: [word, ...(synonymsOf.get(word) ?? []).filter((synonym) => synonym !== word)],
  }));
  const run = (combineWith: 'AND' | 'OR') =>
    index.search(
      { combineWith, queries: perWord },
      {
        // The area the person is in counts double; sections (what a screen is for) a bit less than how-tos
        boostDocument: (slug) => {
          const article = bySlug.get(String(slug));
          return (article?.area === area ? 2 : 1) * (article?.kind === 'section' ? 0.7 : 1);
        },
        // The words asked count more than their synonyms
        boostTerm: (term) => (asked.has(term) ? 1 : 0.4),
      },
    );
  // Every word matching first; otherwise the best partial matches
  const strict = run('AND');
  const results = (strict.length > 0 ? strict : run('OR')).filter((result) => {
    const article = bySlug.get(String(result.id));
    return article && visibleTo(article, isAseloStaff);
  });
  const best = results[0];
  // How many of the words asked (or their synonyms) the best one has: in a longer question, most is enough
  const matched = best
    ? words.filter((word, index) =>
        (perWord[index] as { queries: string[] }).queries.some((term) => best.queryTerms.includes(term)),
      ).length
    : 0;
  return {
    results: results
      .filter((result) => result.score >= best.score * 0.25)
      .slice(0, 5)
      .map((result) => ({ article: bySlug.get(String(result.id))!, score: result.score })),
    confident: Boolean(best) && (strict.length > 0 || (words.length >= 3 && matched / words.length >= 0.75)),
  };
};
