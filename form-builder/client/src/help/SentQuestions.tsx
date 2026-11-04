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
 * Aselo staff: the questions people sent from the help panel, the same ones together and those
 * asked most first, each with the closest article: add the question to it as another way of asking
 * (its header's `questions:`), or write a new one when nothing is close.
 */
import { Copy } from 'lucide-react';
import type { HelpArea } from './articles';
import { articleBySlug } from './articles';
import type { HelpQuestion } from './helpClient';
import { searchHelp } from './search';
import { useAppDispatch, useAppSelector } from '../app/store';
import { articleOpened, copyPhrasing, selectHelp } from './helpSlice';

export type QuestionGroup = {
  question: string;
  count: number;
  people: number;
  areas: string[];
  // The articles people read that didn't help
  notHelpful: string[];
  latest: string;
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// The same question (ignoring case and punctuation) once, asked most first, then the latest
export const groupQuestions = (questions: HelpQuestion[]): QuestionGroup[] => {
  const groups = new Map<string, QuestionGroup & { askers: Set<string> }>();
  [...questions]
    .sort((a, b) => b.at.localeCompare(a.at))
    .forEach((question) => {
      const key = normalize(question.question);
      const group = groups.get(key) ?? {
        question: question.question,
        count: 0,
        people: 0,
        areas: [],
        notHelpful: [],
        latest: question.at,
        askers: new Set<string>(),
      };
      group.count += 1;
      group.askers.add(question.askedBy);
      group.people = group.askers.size;
      if (!group.areas.includes(question.area)) group.areas.push(question.area);
      if (question.reason === 'notHelpful' && question.article && !group.notHelpful.includes(question.article)) {
        group.notHelpful.push(question.article);
      }
      groups.set(key, group);
    });
  return [...groups.values()]
    .map(({ askers, ...group }) => group)
    .sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest));
};

// The questions sent, once loaded (helpSlice.ts)
export const SentQuestions = ({ areaLabels }: { areaLabels: Record<string, string> }) => {
  const dispatch = useAppDispatch();
  const { questions = [], copied } = useAppSelector(selectHelp);
  const onOpenArticle = (slug: string) => dispatch(articleOpened(slug));
  const copy = (group: QuestionGroup, slug: string) => dispatch(copyPhrasing(group.question, slug));
  if (questions.length === 0) return <p>None yet.</p>;
  return (
    <ul className="help-sent-questions">
      {groupQuestions(questions).map((group) => {
        const closest = searchHelp(group.question, {
          area: (group.areas[0] as HelpArea) ?? 'general',
          isAseloStaff: true,
        }).results[0]?.article;
        return (
          <li key={group.question}>
            <div className="help-sent-question">
              <q>{group.question}</q>
              {group.count > 1 && (
                <span className="help-count" title={`Sent ${group.count} times, by ${group.people}`}>
                  ×{group.count}
                </span>
              )}
            </div>
            <span className="field-hint">
              {group.areas.map((area) => areaLabels[area] ?? area).join(', ')} ·{' '}
              {group.people === 1 ? '1 person' : `${group.people} people`} · last{' '}
              {new Date(group.latest).toLocaleDateString()}
              {group.notHelpful.length > 0 &&
                ` · didn’t help: ${group.notHelpful.map((slug) => articleBySlug(slug)?.title ?? slug).join(', ')}`}
            </span>
            {closest ? (
              <span className="help-sent-closest">
                Closest:{' '}
                <button type="button" className="help-link" onClick={() => onOpenArticle(closest.slug)}>
                  {closest.title}
                </button>{' '}
                <button
                  type="button"
                  className="link-button help-copy"
                  title="Copies it as a line for the article's questions: list"
                  onClick={() => copy(group, closest.slug)}
                >
                  <Copy size={12} aria-hidden /> Copy this phrasing
                </button>
                {copied === `${group.question}→${closest.slug}` && (
                  <span className="field-hint">
                    {' '}
                    Copied: paste it under <code>questions:</code> in{' '}
                    <code>
                      src/help/content/{closest.area}/{closest.slug}.md
                    </code>
                  </span>
                )}
              </span>
            ) : (
              <span className="field-hint">No article is close: it needs a new one.</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};
