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
 * Each chatbot's status (designStatus.ts). Changing what a chatbot says or asks, the answers its
 * questions take, or the form fields they fill in makes it "In progress"; notes, comments and the
 * status itself don't.
 */
import type { DesignStatus } from '../designStatus';
import { STATUS_AFTER_CHANGE } from '../designStatus';
import type { AnswerType, Chatbot, ChatbotDesign } from './model';

const withoutComments = <T extends object>(value: T): T =>
  JSON.parse(
    JSON.stringify(value, (key, item) =>
      key === 'comments' || key === 'notes' || key === 'status' ? undefined : item,
    ),
  );

// What the chatbot does, with everything it depends on
const fingerprint = (design: ChatbotDesign, bot: Chatbot) => {
  const questions = bot.intents.flatMap((intent) => intent.questions);
  const types: Record<string, AnswerType | undefined> = {};
  questions.forEach((question) => {
    types[question.answerType] = design.answerTypes[bot.language]?.[question.answerType];
  });
  const mappings = Object.fromEntries(
    questions.map((question) => [question.slot, design.formMappings?.[question.slot] ?? null]),
  );
  return JSON.stringify(withoutComments({ bot, types, mappings }));
};

export const isNewBot = (design: ChatbotDesign, bot: Chatbot) =>
  !(design.imported?.bots ?? []).some((candidate) => candidate.id === bot.id);

// As set, else worked out: unchanged since the import is Imported; anything else In progress
export const botStatusOf = (design: ChatbotDesign, bot: Chatbot): DesignStatus => {
  if (bot.status) return bot.status;
  const imported = design.imported?.bots.find((candidate) => candidate.id === bot.id);
  if (!imported) return STATUS_AFTER_CHANGE;
  const importedDesign = { ...design, ...design.imported } as ChatbotDesign;
  return fingerprint(importedDesign, imported) === fingerprint(design, bot) ? 'imported' : STATUS_AFTER_CHANGE;
};

/**
 * The design after a change, with the chatbots it changed set back to In progress (a chatbot that
 * was Ready for Claude has to be marked ready again)
 */
export const withStatusUpdates = (before: ChatbotDesign, after: ChatbotDesign): ChatbotDesign => {
  let changed = false;
  const bots = after.bots.map((bot) => {
    const previous = before.bots.find((candidate) => candidate.id === bot.id);
    if (!previous || botStatusOf(after, bot) === STATUS_AFTER_CHANGE) return bot;
    if (fingerprint(before, previous) === fingerprint(after, bot)) return bot;
    changed = true;
    return { ...bot, status: STATUS_AFTER_CHANGE };
  });
  return changed ? { ...after, bots } : after;
};

export const setBotStatus = (design: ChatbotDesign, botId: string, status: DesignStatus): ChatbotDesign => ({
  ...design,
  bots: design.bots.map((bot) => (bot.id === botId ? { ...bot, status } : bot)),
});
