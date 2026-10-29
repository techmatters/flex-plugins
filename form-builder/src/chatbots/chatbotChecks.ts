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
 * What's missing or confusing in a chatbots design, in plain words. Errors are what Lex would
 * refuse or can't work; warnings are what a contact would likely trip over.
 */
import type { ChatbotDesign, ChatbotQuestion } from './model';
import { answerTypeOf, botLabel, builtinInfo, fillsInContact, patternProblem } from './model';
import type { ContactForms } from './formMappings';
import { findFormField, unmatchedAnswers } from './formMappings';

export type ChatbotIssue = {
  key: string;
  severity: 'error' | 'warning';
  message: string;
  botId?: string;
  questionId?: string;
  // An answer type, by language and name
  answerType?: { language: string; name: string };
};

// Lex's rule for slot and slot type names
const LEX_NAME = /^([0-9a-zA-Z][_-]?){1,100}$/;

// What a slot file holds: questions saved under the same name in a language share one file
const slotFile = (question: ChatbotQuestion) =>
  JSON.stringify([
    question.answerType,
    question.question,
    question.failureMessage ?? '',
    question.retries,
    question.required,
  ]);

export const chatbotChecks = (design: ChatbotDesign, forms?: ContactForms): ChatbotIssue[] => {
  const issues: ChatbotIssue[] = [];
  const usedTypes = new Set<string>();
  // By language: chatbot names, intent names and slot files (each is one file in a language folder)
  const botNames = new Set<string>();
  const intentNames = new Map<string, string>();
  const slotFiles = new Map<string, string>();
  // Answers asked before the counselor, for the contact form check
  const askedSlots = new Map<string, { botId: string; questionId: string; type?: ReturnType<typeof answerTypeOf> }>();

  design.bots.forEach((bot) => {
    const botName = `${botLabel(bot.name)} (${bot.language})`;
    if (botNames.has(`${bot.language}/${bot.name}`)) {
      issues.push({
        key: `${bot.id}-name`,
        severity: 'error',
        message: `${botName}: there's another chatbot with this name in ${bot.language}.`,
        botId: bot.id,
      });
    }
    botNames.add(`${bot.language}/${bot.name}`);
    if (!LEX_NAME.test(bot.name)) {
      issues.push({
        key: `${bot.id}-lexname`,
        severity: 'error',
        message: `${botName}: its name can only have letters, numbers, and single _ or - between them.`,
        botId: bot.id,
      });
    }
    bot.intents.forEach((intent) => {
      const otherBot = intentNames.get(`${bot.language}/${intent.name}`);
      if (otherBot && otherBot !== bot.id) {
        issues.push({
          key: `${intent.id}-intent`,
          severity: 'error',
          message: `${botName}: another chatbot in ${bot.language} has a conversation called “${intent.name}” (they'd share the file intents/${intent.name}.json).`,
          botId: bot.id,
        });
      }
      intentNames.set(`${bot.language}/${intent.name}`, bot.id);
      const where = intent.name === bot.name ? botName : `${botName} › ${intent.name}`;
      if (intent.utterances.length === 0) {
        issues.push({
          key: `${intent.id}-utterances`,
          severity: 'error',
          message: `${where}: nothing starts it (no “starts when” phrases).`,
          botId: bot.id,
        });
      }
      if (intent.questions.length > 0 && !intent.closing?.trim()) {
        issues.push({
          key: `${intent.id}-closing`,
          severity: 'warning',
          message: `${where} ends without a goodbye message.`,
          botId: bot.id,
        });
      }
      const slots = new Set<string>();
      intent.questions.forEach((question, index) => {
        const label = `${where}, question ${index + 1}`;
        const at = { botId: bot.id, questionId: question.id };
        if (!question.question.trim()) {
          issues.push({ key: `${question.id}-text`, severity: 'error', message: `${label} has no text.`, ...at });
        }
        if (!LEX_NAME.test(question.slot)) {
          issues.push({
            key: `${question.id}-slot`,
            severity: 'error',
            message: `${label}: its answer's name “${question.slot}” can only have letters, numbers, and single _ or - between them.`,
            ...at,
          });
        } else if (slots.has(question.slot)) {
          issues.push({
            key: `${question.id}-dup`,
            severity: 'error',
            message: `${label}: another question already saves its answer as “${question.slot}”.`,
            ...at,
          });
        }
        slots.add(question.slot);
        const sameName = slotFiles.get(`${bot.language}/${question.slot}`);
        if (sameName !== undefined && sameName !== slotFile(question)) {
          issues.push({
            key: `${question.id}-slotfile`,
            severity: 'error',
            message: `${label}: another question in ${bot.language} saves its answer as “${question.slot}” but asks it differently. They share the file slots/${question.slot}.json: make them the same or rename one.`,
            ...at,
          });
        }
        slotFiles.set(`${bot.language}/${question.slot}`, sameName ?? slotFile(question));
        usedTypes.add(`${bot.language}/${question.answerType}`);
        const builtin = builtinInfo(question.answerType);
        if (builtin?.locales && !builtin.locales.split(',').includes(bot.locale)) {
          issues.push({
            key: `${question.id}-locale`,
            severity: 'error',
            message: `${label}: Lex only understands ${builtin.label} in ${builtin.locales}, and this chatbot is ${bot.locale}.`,
            ...at,
          });
        }
        if (fillsInContact(bot) && !askedSlots.has(question.slot)) {
          askedSlots.set(question.slot, { ...at, type: answerTypeOf(design, bot, question.answerType) });
        }
        if (!answerTypeOf(design, bot, question.answerType)) {
          issues.push({
            key: `${question.id}-type`,
            severity: 'error',
            message: `${label} takes “${question.answerType || '(none)'}” answers, which aren't defined.`,
            ...at,
          });
        }
        if (!question.failureMessage?.trim()) {
          issues.push({
            key: `${question.id}-failure`,
            severity: 'warning',
            message: `${label}: nothing is said if the answer isn't understood (the chatbot just stops).`,
            ...at,
          });
        }
      });
    });
  });

  Object.entries(design.answerTypes).forEach(([language, types]) =>
    Object.values(types).forEach((type) => {
      if (type.builtin) return;
      const at = { answerType: { language, name: type.name } };
      if (!LEX_NAME.test(type.name)) {
        issues.push({
          key: `${language}-${type.name}-name`,
          severity: 'error',
          message: `Answers “${type.name}” (${language}): the name can only have letters, numbers, and single _ or - between them.`,
          ...at,
        });
      }
      if (type.pattern !== undefined) {
        const problem = patternProblem(type.pattern);
        if (problem) {
          issues.push({
            key: `${language}-${type.name}-pattern`,
            severity: 'error',
            message: `Answers “${type.name}” (${language}): ${problem}`,
            ...at,
          });
        }
        if (type.parent && type.parent !== 'AMAZON.AlphaNumeric') {
          issues.push({
            key: `${language}-${type.name}-parent`,
            severity: 'warning',
            message: `Answers “${type.name}” (${language}): Lex only checks patterns on AMAZON.AlphaNumeric answers, not ${type.parent}.`,
            ...at,
          });
        }
      }
      if (type.values.length === 0 && type.pattern === undefined) {
        issues.push({
          key: `${language}-${type.name}-empty`,
          severity: 'error',
          message: `Answers “${type.name}” (${language}) has no answers.`,
          ...at,
        });
      }
      // The same words for two answers: Lex can't tell which one was meant
      const meaning = new Map<string, string>();
      type.values.forEach((option) => {
        [option.value, ...option.synonyms].forEach((said) => {
          const key = said.trim().toLowerCase();
          if (!key) return;
          const other = meaning.get(key);
          if (other !== undefined && other !== option.value) {
            issues.push({
              key: `${language}-${type.name}-${key}-${option.value}`,
              severity: 'warning',
              message: `Answers “${type.name}” (${language}): “${said}” means both “${other}” and “${option.value}”.`,
              ...at,
            });
          }
          meaning.set(key, option.value);
        });
      });
      if (!usedTypes.has(`${language}/${type.name}`)) {
        issues.push({
          key: `${language}-${type.name}-unused`,
          severity: 'warning',
          message: `Answers “${type.name}” (${language}) isn't used by any question.`,
          ...at,
        });
      }
    }),
  );

  // The contact form fields answers fill in (PrepopulateMappings.json, survey)
  if (forms && design.formMappings) {
    Object.entries(design.formMappings).forEach(([slot, groups]) => {
      const asked = askedSlots.get(slot);
      const where = asked ? { botId: asked.botId, questionId: asked.questionId } : {};
      if (!asked) {
        issues.push({
          key: `mapping-${slot}-unused`,
          severity: 'warning',
          message: `Contact form: “${slot}” fills in ${groups.flat().join(', ')}, but no chatbot asks it before the counselor.`,
        });
      }
      groups.flat().forEach((target) => {
        if (!findFormField(forms, target)) {
          issues.push({
            key: `mapping-${slot}-${target}-missing`,
            severity: 'error',
            message: `Contact form: “${slot}” fills in ${target}, which isn't a field of the contact form (${forms.version}).`,
            ...where,
          });
          return;
        }
        const unmatched = asked ? unmatchedAnswers(slot, asked.type, forms, target) : [];
        if (unmatched === 'any') {
          issues.push({
            key: `mapping-${slot}-${target}-any`,
            severity: 'warning',
            message: `Contact form: “${slot}” can be any answer, but ${target} is a dropdown: answers that aren't one of its options are saved as Unknown.`,
            ...where,
          });
        } else if (unmatched.length > 0) {
          issues.push({
            key: `mapping-${slot}-${target}-unmatched`,
            severity: 'warning',
            message: `Contact form: ${target} has no option for ${unmatched.map((value) => `“${value}”`).join(', ')} (answers to “${slot}”), so they're saved as Unknown.`,
            ...where,
          });
        }
      });
    });
    if (forms.inUse === false && Object.keys(design.formMappings).length > 0) {
      issues.push({
        key: 'mapping-not-in-use',
        severity: 'warning',
        message:
          'Contact form: this helpline still fills in contacts the old way (PrepopulateKeys.json); these fields take effect once Aselo staff turn on use_prepopulate_mappings.',
      });
    }
  }

  return [
    ...issues.filter((issue) => issue.severity === 'error'),
    ...issues.filter((issue) => issue.severity === 'warning'),
  ];
};
