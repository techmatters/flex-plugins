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
 * What changed in a chatbots design since it was imported, as changes to the twilio-iac files
 * (the export lists them for the chatbot-from-design skill). A change to a shared file (under
 * configs/lex_v2, used by other helplines) goes to a copy of the helpline's own:
 * <code>/configs/lex_v2/<language>/<kind>/<name>.json, which the lex stage finds first. New
 * answers (slot types) always go to the helpline's own folder too. The contact form fields answers
 * fill in are a change to the form definitions' PrepopulateMappings.json ("survey").
 *
 * Comments, notes and statuses aren't changes to the config: the export carries them separately.
 */
import type { AnswerOption, AnswerType, Chatbot, ChatbotDesign, ChatbotIntent, ChatbotQuestion } from './model';
import { formDefinitionsPath, mappingJson } from './formMappings';

export type ChatbotChange = {
  bot: string;
  // What changed, e.g. "question text", "new question", "answers"
  what: string;
  // The file Lex reads it from today (absent when it's new) and the helpline's own path to write
  file?: string;
  writeTo: string;
  // The bots file repeats the texts and the questions' order: keep it the same
  alsoInBotsFile?: string;
  from?: unknown;
  to?: unknown;
};

const ownPath = (code: string, language: string, kind: string, name: string) =>
  `${code}/configs/lex_v2/${language}/${kind}/${name}.json`;

const writeTo = (code: string, language: string, kind: string, name: string, file?: string, shared?: boolean) =>
  file && !shared ? file : ownPath(code, language, kind, name);

const questionFields = (question: ChatbotQuestion) => ({
  question: question.question,
  failureMessage: question.failureMessage ?? '',
  retries: question.retries,
  required: question.required,
  answerType: question.answerType,
});

const plainAnswers = (values: AnswerOption[]) => values.map(({ value, synonyms }) => ({ value, synonyms }));
const sameAnswers = (a: AnswerOption[], b: AnswerOption[]) =>
  JSON.stringify(plainAnswers(a)) === JSON.stringify(plainAnswers(b));
// What the slot type file holds besides its answers
const typeSettings = (type: AnswerType) => ({
  pattern: type.pattern,
  parent: type.parent,
  resolution: type.resolution,
});

export const chatbotChanges = (design: ChatbotDesign): ChatbotChange[] => {
  const code = design.helpline;
  const changes: ChatbotChange[] = [];
  const importedBots = new Map((design.imported?.bots ?? []).map((bot) => [bot.id, bot]));

  design.bots.forEach((bot: Chatbot) => {
    const label = `${bot.language}/${bot.name}`;
    const before = importedBots.get(bot.id);
    const botsFile = bot.file && !bot.shared ? bot.file : ownPath(code, bot.language, 'bots', bot.name);
    if (!before) {
      changes.push({ bot: label, what: 'new chatbot', writeTo: botsFile, to: bot });
      return;
    }
    const importedIntents = new Map(before.intents.map((intent) => [intent.id, intent]));
    bot.intents.forEach((intent: ChatbotIntent) => {
      const old = importedIntents.get(intent.id);
      const intentFile = writeTo(code, bot.language, 'intents', intent.name, intent.file, intent.shared);
      const base = { bot: label, file: intent.file, writeTo: intentFile, alsoInBotsFile: botsFile };
      if (!old) {
        changes.push({ ...base, what: 'new intent', to: intent });
        return;
      }
      if ((old.opening ?? '') !== (intent.opening ?? ''))
        changes.push({ ...base, what: 'opening message', from: old.opening, to: intent.opening });
      if ((old.closing ?? '') !== (intent.closing ?? ''))
        changes.push({ ...base, what: 'closing message', from: old.closing, to: intent.closing });
      if (JSON.stringify(old.utterances) !== JSON.stringify(intent.utterances))
        changes.push({ ...base, what: 'starts when (utterances)', from: old.utterances, to: intent.utterances });

      const oldQuestions = new Map(old.questions.map((question) => [question.id, question]));
      const order = intent.questions.map((question) => question.slot);
      const oldOrder = old.questions.map((question) => question.slot);
      if (JSON.stringify(order) !== JSON.stringify(oldOrder)) {
        // Order lives in the intent's slotPriorities and each slot's captureNextStep (slotToElicit)
        changes.push({ ...base, what: 'questions and their order', from: oldOrder, to: order });
      }
      intent.questions.forEach((question) => {
        const previous = oldQuestions.get(question.id);
        const slotFile = writeTo(code, bot.language, 'slots', question.slot, question.file, question.shared);
        if (!previous) {
          changes.push({ ...base, what: 'new question', file: undefined, writeTo: slotFile, to: question });
          return;
        }
        const now = questionFields(question);
        const then = questionFields(previous);
        (Object.keys(now) as (keyof typeof now)[]).forEach((field) => {
          if (now[field] !== then[field]) {
            changes.push({
              ...base,
              what: `question “${question.slot}”: ${field}`,
              file: question.file,
              writeTo: slotFile,
              from: then[field],
              to: now[field],
            });
          }
        });
        if (previous.slot !== question.slot) {
          changes.push({
            ...base,
            what: 'question renamed (its answer is saved under the new name)',
            file: question.file,
            writeTo: ownPath(code, bot.language, 'slots', question.slot),
            from: previous.slot,
            to: question.slot,
          });
        }
      });
      old.questions
        .filter((question) => !intent.questions.some((candidate) => candidate.id === question.id))
        .forEach((question) => changes.push({ ...base, what: 'question removed', from: question.slot }));
    });
  });

  const importedTypes = design.imported?.answerTypes ?? {};
  Object.entries(design.answerTypes).forEach(([language, types]) =>
    Object.values(types).forEach((type: AnswerType) => {
      if (type.builtin) return;
      const old = importedTypes[language]?.[type.name];
      const file = writeTo(code, language, 'slot_types', type.name, type.file, type.shared);
      if (!old) {
        changes.push({ bot: language, what: `new answers “${type.name}”`, writeTo: file, to: type });
      } else if (
        !sameAnswers(old.values, type.values) ||
        JSON.stringify(typeSettings(old)) !== JSON.stringify(typeSettings(type))
      ) {
        changes.push({
          bot: language,
          what: `answers “${type.name}”`,
          file: type.file,
          writeTo: file,
          from: { values: plainAnswers(old.values), ...typeSettings(old) },
          to: { values: plainAnswers(type.values), ...typeSettings(type) },
        });
      }
    }),
  );

  // The contact form fields answers fill in: PrepopulateMappings.json's "survey", by answer name
  if (design.formMappings && design.formsVersion) {
    const before = design.imported?.formMappings ?? {};
    const file = formDefinitionsPath(code, design.formsVersion);
    const names = [...new Set([...Object.keys(before), ...Object.keys(design.formMappings)])].sort();
    names.forEach((name) => {
      const then = before[name];
      const now = design.formMappings![name];
      if (JSON.stringify(then ?? []) === JSON.stringify(now ?? [])) return;
      changes.push({
        bot: 'contact form',
        what: `contact form fields filled in by “${name}”`,
        file,
        writeTo: file,
        from: then && mappingJson(then),
        to: now && mappingJson(now),
      });
    });
  }

  return changes;
};
