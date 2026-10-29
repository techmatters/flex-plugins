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
 * Changes to a chatbots design, as plain functions (the editor calls them; tests can too).
 */
import type {
  AnswerKind,
  AnswerType,
  Chatbot,
  ChatbotDesign,
  ChatbotIntent,
  ChatbotQuestion,
  DesignComment,
} from './model';
import { newChatbotId, PATTERN_PARENT } from './model';

export const updateBot = (design: ChatbotDesign, botId: string, change: (bot: Chatbot) => Chatbot): ChatbotDesign => ({
  ...design,
  bots: design.bots.map((bot) => (bot.id === botId ? change(bot) : bot)),
});

export const updateIntent = (bot: Chatbot, intentId: string, change: (intent: ChatbotIntent) => ChatbotIntent) => ({
  ...bot,
  intents: bot.intents.map((intent) => (intent.id === intentId ? change(intent) : intent)),
});

export const updateQuestion = (
  intent: ChatbotIntent,
  questionId: string,
  change: (question: ChatbotQuestion) => ChatbotQuestion,
) => ({
  ...intent,
  questions: intent.questions.map((question) => (question.id === questionId ? change(question) : question)),
});

export const moveQuestion = (intent: ChatbotIntent, from: number, to: number): ChatbotIntent => {
  if (to < 0 || to >= intent.questions.length) return intent;
  const questions = [...intent.questions];
  const [moved] = questions.splice(from, 1);
  questions.splice(to, 0, moved);
  return { ...intent, questions };
};

// A new question, saving its answer under a name not used yet in the intent
export const newQuestion = (intent: ChatbotIntent, answerType: string): ChatbotQuestion => {
  let index = intent.questions.length + 1;
  while (intent.questions.some((question) => question.slot === `question${index}`)) index += 1;
  return {
    id: newChatbotId('q'),
    slot: `question${index}`,
    answerType,
    question: '',
    failureMessage: 'We are having trouble understanding your response.',
    retries: 1,
    required: true,
  };
};

export const updateAnswerType = (
  design: ChatbotDesign,
  language: string,
  name: string,
  change: (type: AnswerType) => AnswerType,
): ChatbotDesign => {
  const type = design.answerTypes[language]?.[name];
  if (!type) return design;
  return {
    ...design,
    answerTypes: { ...design.answerTypes, [language]: { ...design.answerTypes[language], [name]: change(type) } },
  };
};

/**
 * A new list of answers or pattern. It has no file yet: the export writes it to the helpline's own
 * folder (<code>/configs/lex_v2/<language>/slot_types/<name>.json), never to the shared configs.
 */
export const addAnswerType = (
  design: ChatbotDesign,
  language: string,
  name: string,
  kind: Exclude<AnswerKind, 'builtin'> = 'list',
): ChatbotDesign => ({
  ...design,
  answerTypes: {
    ...design.answerTypes,
    [language]: {
      ...design.answerTypes[language],
      [name]:
        kind === 'pattern'
          ? { name, values: [], pattern: '[A-Za-z0-9 ]{1,30}', parent: PATTERN_PARENT, resolution: 'TopResolution' }
          : { name, values: [{ value: 'Unknown', synonyms: ['X', 'x', 'prefer not to answer'] }] },
    },
  },
});

// Lex's own types are listed with the language's answers once a question uses them
export const withBuiltinType = (design: ChatbotDesign, language: string, name: string): ChatbotDesign =>
  design.answerTypes[language]?.[name]
    ? design
    : {
        ...design,
        answerTypes: {
          ...design.answerTypes,
          [language]: { ...design.answerTypes[language], [name]: { name, builtin: true, values: [] } },
        },
      };

export const removeAnswerType = (design: ChatbotDesign, language: string, name: string): ChatbotDesign => {
  const { [name]: removed, ...others } = design.answerTypes[language] ?? {};
  return { ...design, answerTypes: { ...design.answerTypes, [language]: others } };
};

/**
 * Comments, on anything that has a comments list
 */
export const newComment = (text: string, author: string, at = new Date().toISOString()): DesignComment => ({
  id: newChatbotId('c'),
  text,
  author,
  at,
});

export const addComment = <T extends { comments?: DesignComment[] }>(item: T, comment: DesignComment): T => ({
  ...item,
  comments: [...(item.comments ?? []), comment],
});

export const updateComment = <T extends { comments?: DesignComment[] }>(
  item: T,
  commentId: string,
  change: (comment: DesignComment) => DesignComment | undefined,
): T => {
  const comments = (item.comments ?? [])
    .map((comment) => (comment.id === commentId ? change(comment) : comment))
    .filter((comment): comment is DesignComment => comment !== undefined);
  return { ...item, comments: comments.length > 0 ? comments : undefined };
};

export const openComments = (comments?: DesignComment[]) => (comments ?? []).filter((comment) => !comment.resolved);

/**
 * A new chatbot: empty (one conversation, no questions yet) or a copy of another. Intents and
 * slot types are found by name in each language's folder, so a copy's intents are named after the
 * new chatbot; a copy into another language takes the answers it uses with it.
 */
export type NewChatbot = { name: string; language: string; locale: string; copyFrom?: Chatbot };

export const addChatbot = (design: ChatbotDesign, { name, language, locale, copyFrom }: NewChatbot) => {
  const intentName = (old: string) =>
    copyFrom && old.startsWith(copyFrom.name) ? `${name}${old.slice(copyFrom.name.length)}` : `${name}_${old}`;
  const intents: ChatbotIntent[] = copyFrom
    ? copyFrom.intents.map((intent) => ({
        id: newChatbotId('i'),
        name: intentName(intent.name),
        utterances: [...intent.utterances],
        opening: intent.opening,
        closing: intent.closing,
        questions: intent.questions.map(({ file, shared, comments, ...question }) => ({
          ...question,
          id: newChatbotId('q'),
        })),
      }))
    : [{ id: newChatbotId('i'), name, utterances: [], questions: [] }];
  const bot: Chatbot = {
    id: newChatbotId('bot'),
    language,
    name,
    locale,
    intents,
    environments: [],
    status: 'in-progress',
  };
  let answerTypes = design.answerTypes;
  if (copyFrom && copyFrom.language !== language) {
    const used = new Set(intents.flatMap((intent) => intent.questions.map((question) => question.answerType)));
    const copied = Object.fromEntries(
      [...used]
        .map((typeName) => design.answerTypes[copyFrom.language]?.[typeName])
        .filter((type): type is AnswerType => Boolean(type))
        .map(({ file, shared, comments, ...type }) => [type.name, structuredClone(type)]),
    );
    answerTypes = { ...answerTypes, [language]: { ...copied, ...answerTypes[language] } };
  }
  return { design: { ...design, bots: [...design.bots, bot], answerTypes }, bot };
};
