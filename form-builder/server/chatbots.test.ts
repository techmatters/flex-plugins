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

import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import { chatbotChanges } from '../src/chatbots/changes';
import { chatbotChecks } from '../src/chatbots/chatbotChecks';
import {
  addAnswerType,
  addChatbot,
  addComment,
  newComment,
  updateAnswerType,
  updateBot,
  updateIntent,
  updateQuestion,
  moveQuestion,
} from '../src/chatbots/edit';
import { contactFormsOf, setFormTargets } from '../src/chatbots/formMappings';
import { matchesPattern, patternProblem } from '../src/chatbots/model';
import { botStatusOf, isNewBot, setBotStatus, withStatusUpdates } from '../src/chatbots/status';
import { loadDefinitionFiles } from './definitionsApi';
import type { ApiContext, ApiUser } from './api';
import { handleApiRequest } from './api';
import { MemoryChatbotStore } from './chatbotApi';
import { importChatbots } from './chatbotImport';
import { MemoryDraftStore } from './drafts';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');
const formsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../lambdas/packages/hrm-form-definitions/form-definitions',
);
const formsOf = async (code: string) => {
  const definitions = await loadDefinitionFiles(formsDir, code, 'v1');
  return contactFormsOf('v1', definitions.files, { use_prepopulate_mappings: true });
};

describe('chatbots from a live helpline', () => {
  test('USCH: the pre-survey as Lex runs it, with answers found the lex stage way', async () => {
    const { design, report } = await importChatbots(helplinesDir, 'usch');
    expect(report.bots.map((bot) => `${bot.language}/${bot.name}`)).toEqual([
      'en_USCH/pre_survey',
      'en_USCH/post_survey',
    ]);
    const preSurvey = design.bots[0];
    expect(preSurvey.environments).toEqual(['production', 'staging']);
    const [intent] = preSurvey.intents;
    expect(intent.utterances).toContain('Incoming webchat contact');
    expect(intent.opening).toMatch(/^If this is a life-threatening emergency/);
    expect(intent.closing).toBe('Thank you, a counselor will be with you shortly.');
    expect(intent.questions.map((question) => [question.slot, question.answerType])).toEqual([
      ['aboutSelf', 'yes_no'],
      ['genderInput', 'genderInput'],
      ['ageRange', 'ageRange'],
      ['stateInput', 'AMAZON.State'],
      ['howTheHelpseekerHeardAboutUs', 'howTheHelpseekerHeardAboutUs'],
    ]);
    expect(intent.questions[2]).toMatchObject({
      question: 'How old are you?',
      file: 'usch/configs/lex_v2/en_USCH/slots/ageRange.json',
      shared: false,
    });
    // yes_no isn't in USCH's folder: the shared English one is used
    expect(design.answerTypes.en_USCH.yes_no).toMatchObject({
      file: 'configs/lex_v2/en/slot_types/yes_no.json',
      shared: true,
    });
    expect(design.answerTypes.en_USCH['AMAZON.State']).toEqual({ name: 'AMAZON.State', builtin: true, values: [] });
    expect(design.answerTypes.en_USCH.ageRange.values[0]).toMatchObject({ value: 'Unknown' });
    // The post-survey's two paths
    expect(design.bots[1].intents.map((candidate) => candidate.name)).toEqual(['post_survey_yes', 'post_survey_no']);
    // Nothing changed yet
    expect(chatbotChanges(design)).toEqual([]);
  });

  test('every helpline with chatbots imports, and its design can be checked', async () => {
    const codes = readdirSync(helplinesDir).filter(
      (code) =>
        /^[a-z0-9]+$/.test(code) &&
        (existsSync(path.join(helplinesDir, code, 'staging.hcl')) ||
          existsSync(path.join(helplinesDir, code, 'production.hcl'))),
    );
    let bots = 0;
    for (const code of codes) {
      const { design } = await importChatbots(helplinesDir, code);
      bots += design.bots.length;
      expect(() => chatbotChecks(design), code).not.toThrow();
      expect(chatbotChanges(design), code).toEqual([]);
      // Every question takes answers the design knows
      design.bots.forEach((bot) =>
        bot.intents.forEach((intent) =>
          intent.questions.forEach((question) =>
            expect(design.answerTypes[bot.language]?.[question.answerType], `${code} ${question.slot}`).toBeDefined(),
          ),
        ),
      );
    }
    expect(bots).toBeGreaterThan(20);
  }, 60_000);

  test('changes are listed file by file; shared files go to a copy of the helpline’s own', async () => {
    const { design } = await importChatbots(helplinesDir, 'usch');
    const bot = design.bots[0];
    const [intent] = bot.intents;
    let changed = updateBot(design, bot.id, (current) =>
      updateIntent(current, intent.id, (old) =>
        moveQuestion(
          updateQuestion(old, old.questions[2].id, (question) => ({ ...question, question: 'What is your age?' })),
          0,
          1,
        ),
      ),
    );
    changed = updateAnswerType(changed, 'en_USCH', 'yes_no', (type) => ({
      ...type,
      values: type.values.map((option, index) =>
        index === 0 ? { ...option, synonyms: [...option.synonyms, 'yep'] } : option,
      ),
    }));
    const changes = chatbotChanges(changed);
    expect(changes.map((change) => [change.what, change.writeTo])).toEqual([
      ['questions and their order', 'usch/configs/lex_v2/en_USCH/intents/pre_survey.json'],
      ['question “ageRange”: question', 'usch/configs/lex_v2/en_USCH/slots/ageRange.json'],
      ['answers “yes_no”', 'usch/configs/lex_v2/en_USCH/slot_types/yes_no.json'],
    ]);
    expect(changes[1]).toMatchObject({ from: 'How old are you?', to: 'What is your age?' });
  });

  test('patterns: USNM’s zip code, and what Lex won’t take', async () => {
    const { design } = await importChatbots(helplinesDir, 'usch');
    expect(design.answerTypes.en_USCH.genderInput).toMatchObject({
      pattern: '[A-Za-z ]{1,30}',
      parent: 'AMAZON.AlphaNumeric',
      values: [],
    });
    expect(patternProblem('[0-9]{5}')).toBeUndefined();
    expect(patternProblem('[0-9]+')).toMatch(/unlimited/);
    expect(patternProblem('[0-9]{2,}')).toMatch(/unlimited/);
    expect(patternProblem('a.b')).toMatch(/“\.”/);
    expect(patternProblem('[0-9')).toMatch(/valid/);
    expect(matchesPattern('[0-9]{5}', '87501')).toBe(true);
    expect(matchesPattern('[0-9]{5}', '875011')).toBe(false);

    const withPattern = addAnswerType(design, 'en_USCH', 'zipCode', 'pattern');
    expect(withPattern.answerTypes.en_USCH.zipCode).toMatchObject({ parent: 'AMAZON.AlphaNumeric', values: [] });
    const broken = updateAnswerType(withPattern, 'en_USCH', 'zipCode', (type) => ({ ...type, pattern: '.*' }));
    expect(chatbotChecks(broken).some((issue) => /zipCode.*unlimited|zipCode.*“\.”/.test(issue.message))).toBe(true);
    // New answers go to the helpline's own folder
    expect(chatbotChanges(withPattern).find((change) => change.what === 'new answers “zipCode”')?.writeTo).toBe(
      'usch/configs/lex_v2/en_USCH/slot_types/zipCode.json',
    );
  });

  test('contact form fields: imported from PrepopulateMappings.json, checked and listed as a change', async () => {
    const { design } = await importChatbots(helplinesDir, 'usch', formsDir);
    expect(design.formsVersion).toBe('v1');
    expect(design.formMappings?.ageRange).toEqual([['CallerInformationTab.ageRange', 'ChildInformationTab.ageRange']]);
    const forms = await formsOf('usch');
    expect(chatbotChecks(design, forms).filter((issue) => /Contact form/.test(issue.message))).toEqual([]);

    const mapped = setFormTargets(design, 'aboutSelf', [['CaseInformationTab.nowhere']]);
    expect(chatbotChecks(mapped, forms).some((issue) => /isn't a field of the contact form/.test(issue.message))).toBe(
      true,
    );
    expect(chatbotChanges(mapped)).toEqual([
      expect.objectContaining({
        what: 'contact form fields filled in by “aboutSelf”',
        writeTo: 'lambdas/packages/hrm-form-definitions/form-definitions/usch/v1/PrepopulateMappings.json',
        to: 'CaseInformationTab.nowhere',
      }),
    ]);

    // USNM's survey mappings point at fields its form doesn't have, and it has no pre-survey
    const usnm = await importChatbots(helplinesDir, 'usnm', formsDir);
    const usnmMessages = chatbotChecks(usnm.design, await formsOf('usnm')).map((issue) => issue.message);
    expect(usnmMessages).toContain(
      "Contact form: “age” fills in ChildInformationTab.age, which isn't a field of the contact form (v1).",
    );
  });

  test('statuses: imported until changed; comments and notes don’t count', async () => {
    const { design } = await importChatbots(helplinesDir, 'usch');
    const [bot] = design.bots;
    expect(botStatusOf(design, bot)).toBe('imported');
    expect(isNewBot(design, bot)).toBe(false);

    const ready = setBotStatus(design, bot.id, 'ready');
    const commented = withStatusUpdates(
      ready,
      updateBot(ready, bot.id, (current) => ({
        ...addComment(current, newComment('Check with the helpline', 'Alex')),
        notes: 'The webchat pre-survey',
      })),
    );
    expect(botStatusOf(commented, commented.bots[0])).toBe('ready');
    expect(chatbotChanges(commented)).toEqual([]);

    const edited = withStatusUpdates(
      commented,
      updateBot(commented, bot.id, (current) =>
        updateIntent(current, current.intents[0].id, (intent) => ({ ...intent, closing: 'Bye' })),
      ),
    );
    expect(botStatusOf(edited, edited.bots[0])).toBe('in-progress');
    // Changing answers the chatbot uses counts too
    const answers = withStatusUpdates(
      ready,
      updateAnswerType(ready, 'en_USCH', 'ageRange', (type) => ({ ...type, values: type.values.slice(1) })),
    );
    expect(botStatusOf(answers, answers.bots[0])).toBe('in-progress');
    expect(botStatusOf(answers, answers.bots[1])).toBe('imported');
  });

  test('a new chatbot: empty, or a copy into another language with its answers', async () => {
    const { design } = await importChatbots(helplinesDir, 'usch');
    const empty = addChatbot(design, { name: 'language_selector', language: 'en_USCH', locale: 'en_US' });
    expect(empty.bot).toMatchObject({ status: 'in-progress', environments: [] });
    expect(isNewBot(empty.design, empty.bot)).toBe(true);
    expect(chatbotChanges(empty.design)[0]).toMatchObject({
      what: 'new chatbot',
      writeTo: 'usch/configs/lex_v2/en_USCH/bots/language_selector.json',
    });

    const copy = addChatbot(design, {
      name: 'pre_survey',
      language: 'es_USCH',
      locale: 'es_US',
      copyFrom: design.bots[0],
    });
    expect(copy.bot.intents[0].name).toBe('pre_survey');
    expect(copy.design.answerTypes.es_USCH.ageRange.values.length).toBeGreaterThan(0);
    expect(copy.design.answerTypes.es_USCH.ageRange.file).toBeUndefined();
    // A copy in the same language can't share the intent files
    const sameLanguage = addChatbot(design, {
      name: 'pre_survey_sms',
      language: 'en_USCH',
      locale: 'en_US',
      copyFrom: design.bots[0],
    });
    expect(sameLanguage.bot.intents[0].name).toBe('pre_survey_sms');
    const changed = updateBot(sameLanguage.design, sameLanguage.bot.id, (current) =>
      updateIntent(current, current.intents[0].id, (intent) =>
        updateQuestion(intent, intent.questions[0].id, (question) => ({ ...question, question: 'Different' })),
      ),
    );
    expect(chatbotChecks(changed).some((issue) => /share the file slots\/aboutSelf\.json/.test(issue.message))).toBe(
      true,
    );
  });

  test('the check: the same words for two answers, a question without text', async () => {
    const { design } = await importChatbots(helplinesDir, 'usch');
    const bot = design.bots[0];
    const [intent] = bot.intents;
    let changed = updateBot(design, bot.id, (current) =>
      updateIntent(current, intent.id, (old) =>
        updateQuestion(old, old.questions[0].id, (question) => ({ ...question, question: ' ' })),
      ),
    );
    changed = updateAnswerType(changed, 'en_USCH', 'yes_no', (type) => ({
      ...type,
      values: type.values.map((option, index) =>
        index === 1 ? { ...option, synonyms: [...option.synonyms, '1'] } : option,
      ),
    }));
    const messages = chatbotChecks(changed).map((issue) => issue.message);
    expect(messages.some((message) => /question 1 has no text/.test(message))).toBe(true);
    expect(messages.some((message) => /“1” means both/.test(message))).toBe(true);
  });
});

describe('the chatbot routes', () => {
  const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
  const uschStaff: ApiUser = { name: 'Childhelp person', role: 'helpline-staff', helplines: ['usch'] };
  const context: ApiContext = {
    formDefinitionsDir: '/nowhere',
    drafts: new MemoryDraftStore(),
    chatbots: new MemoryChatbotStore(),
    helplinesConfigDir: helplinesDir,
    notifier: { draftSubmitted: async () => {} },
  };
  const call = (user: ApiUser, method: string, apiPath: string, body?: unknown) =>
    handleApiRequest(context, { method, path: apiPath, body, user });

  test('Aselo staff import and save; helpline staff only see their own', async () => {
    expect((await call(uschStaff, 'POST', '/api/chatbots/usch/import')).status).toBe(403);
    const imported = await call(staff, 'POST', '/api/chatbots/usch/import');
    expect(imported.status).toBe(200);
    const { design } = imported.body as { design: unknown };
    expect((await call(uschStaff, 'PUT', '/api/chatbots/usch', { expectedRevision: 0, design })).status).toBe(403);
    expect((await call(staff, 'PUT', '/api/chatbots/usch', { expectedRevision: 0, design })).status).toBe(200);
    expect((await call(staff, 'PUT', '/api/chatbots/usch', { expectedRevision: 0, design })).status).toBe(409);
    expect((await call(uschStaff, 'GET', '/api/chatbots/usch')).status).toBe(200);
    expect((await call(uschStaff, 'GET', '/api/chatbots')).body).toEqual([
      expect.objectContaining({
        code: 'usch',
        bots: [
          expect.objectContaining({ name: 'pre_survey', status: 'imported', isNew: false, questions: 5 }),
          expect.objectContaining({ name: 'post_survey', status: 'imported' }),
        ],
      }),
    ]);
    expect((await call(uschStaff, 'GET', '/api/chatbots/usnm')).status).toBe(403);
  });
});
