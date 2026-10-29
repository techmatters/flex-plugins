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
 * A helpline's chatbots from its twilio-iac config (docs/chatbot-designer.md): the bots in
 * lex_v2_bot_languages (each environment's), read from configs/lex_v2 the way the lex stage
 * (stages/lex/terragrunt.hcl) finds them: the helpline's <language> folder, its common folder,
 * then the shared configs/lex_v2/<language> and configs/lex_v2/<first two letters>.
 *
 * What Lex says comes from the intents/ and slots/ files; bots/<bot>.json repeats the texts
 * (slot_question...) but Terraform only takes the bot's settings and intents from it: where the
 * two differ, the report says so.
 */
import { promises as fs } from 'fs';
import path from 'path';
import type { AnswerType, Chatbot, ChatbotDesign, ChatbotIntent, ChatbotQuestion } from '../src/chatbots/model';
import { CHATBOT_SCHEMA_VERSION } from '../src/chatbots/model';
import { PREPOPULATE_FILE, readSurveyMappings } from '../src/chatbots/formMappings';
import { readHelplineConfigs } from './flowImport';

type Json = Record<string, unknown>;

export type ChatbotImportReport = {
  helpline: string;
  bots: { language: string; name: string; environments: string[]; questions: number; file?: string }[];
  notes: string[];
};

export type ChatbotImport = { design: ChatbotDesign; report: ChatbotImportReport };

type Kind = 'bots' | 'intents' | 'slots' | 'slot_types';

const objectOf = (value: unknown): Json =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {};
const textOf = (value: unknown) => (typeof value === 'string' ? value : undefined);

// The first message of a Lex message group list, as plain text
const messageOf = (groups: unknown): string | undefined => {
  if (!Array.isArray(groups)) return undefined;
  const first = objectOf(groups[0]);
  return textOf(objectOf(objectOf(first.message).plainTextMessage).value);
};

/**
 * The form definitions version the helpline uses: its service configuration's definitionVersion
 * ("usch-v1" -> v1, the plugin's rule: the last two characters), else the newest folder
 */
export const formsVersionOf = async (helplinesDir: string, formDefinitionsDir: string, code: string) => {
  for (const file of ['production.json', 'common.json', 'staging.json']) {
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(helplinesDir, code, 'configs/service-configuration', file), 'utf8'),
      ) as { attributes?: { definitionVersion?: unknown } };
      const version = config.attributes?.definitionVersion;
      if (typeof version === 'string' && version.length >= 2) return version.slice(-2);
    } catch {
      // not there: try the next one
    }
  }
  const folders = await fs.readdir(path.join(formDefinitionsDir, code)).catch(() => [] as string[]);
  return folders
    .filter((folder) => /^v\d+$/.test(folder))
    .sort()
    .pop();
};

const same = (a?: string, b?: string) =>
  (a ?? '').replace(/\s+/g, ' ').trim() === (b ?? '').replace(/\s+/g, ' ').trim();

export const importChatbots = async (
  helplinesDir: string,
  code: string,
  // The form definitions, for the contact form fields the answers fill in
  formDefinitionsDir?: string,
): Promise<ChatbotImport> => {
  const { configs, environments } = await readHelplineConfigs(helplinesDir, code);
  const notes: string[] = [];

  // Where each file is found, the lex stage's way
  const found = new Map<string, Json | undefined>();
  const locate = async (language: string, kind: Kind, name: string) => {
    const candidates = [
      `${code}/configs/lex_v2/${language}/${kind}/${name}.json`,
      `${code}/configs/lex_v2/common/${kind}/${name}.json`,
      `configs/lex_v2/${language}/${kind}/${name}.json`,
      `configs/lex_v2/${language.slice(0, 2)}/${kind}/${name}.json`,
    ];
    for (const file of candidates) {
      if (!found.has(file)) {
        try {
          found.set(file, JSON.parse(await fs.readFile(path.join(helplinesDir, file), 'utf8')) as Json);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            notes.push(`Couldn't read ${file}: ${(err as Error).message}`);
          }
          found.set(file, undefined);
        }
      }
      const json = found.get(file);
      if (json) return { file, json, shared: !file.startsWith(`${code}/`) };
    }
    return undefined;
  };

  // Which bots, in which languages and environments
  const wanted = new Map<string, { language: string; name: string; environments: string[] }>();
  environments.forEach((environment) => {
    Object.entries(objectOf(configs[environment]!.lex_v2_bot_languages)).forEach(([language, bots]) => {
      (Array.isArray(bots) ? bots : []).forEach((name) => {
        if (typeof name !== 'string') return;
        const key = `${language}/${name}`;
        const entry = wanted.get(key) ?? { language, name, environments: [] };
        entry.environments.push(environment);
        wanted.set(key, entry);
      });
    });
  });

  const design: ChatbotDesign = {
    schemaVersion: CHATBOT_SCHEMA_VERSION,
    helpline: code,
    bots: [],
    answerTypes: {},
  };
  let ids = 0;
  const id = (prefix: string) => {
    ids += 1;
    return `${prefix}-${ids}`;
  };

  for (const { language, name, environments: botEnvironments } of wanted.values()) {
    const botFile = await locate(language, 'bots', name);
    if (!botFile) {
      notes.push(`${language} ${name}: no bots/${name}.json found.`);
      continue;
    }
    const settings = objectOf(botFile.json[name] ?? Object.values(botFile.json)[0]);
    const bot: Chatbot = {
      id: id('bot'),
      language,
      name,
      locale: textOf(settings.locale) ?? language,
      ...(textOf(settings.description) ? { description: textOf(settings.description) } : {}),
      intents: [],
      environments: botEnvironments,
      file: botFile.file,
      shared: botFile.shared,
    };

    for (const [intentName, intentValue] of Object.entries(objectOf(settings.intents))) {
      const intentSettings = objectOf(intentValue);
      const intentFile = await locate(language, 'intents', intentName);
      const intentJson = intentFile?.json ?? {};
      if (!intentFile) notes.push(`${language} ${name}: no intents/${intentName}.json found.`);
      const utterances = (
        Array.isArray(intentJson.sampleUtterances) ? intentJson.sampleUtterances : intentSettings.utterances
      ) as unknown[] | undefined;
      const opening = messageOf(objectOf(objectOf(intentJson.initialResponseSetting).initialResponse).messageGroups);
      const closing = messageOf(objectOf(objectOf(intentJson.intentClosingSetting).closingResponse).messageGroups);
      const botOpening = textOf(objectOf(intentSettings.initial_response).message);
      const botClosing = textOf(objectOf(intentSettings.closing_response).message);
      if (intentFile && botOpening && !same(botOpening, opening)) {
        notes.push(
          `${language} ${name} › ${intentName}: the opening message in ${botFile.file} isn't the one Lex says (from ${intentFile.file}); the designer shows Lex's.`,
        );
      }
      if (intentFile && botClosing && !same(botClosing, closing)) {
        notes.push(
          `${language} ${name} › ${intentName}: the closing message in ${botFile.file} isn't the one Lex says (from ${intentFile.file}); the designer shows Lex's.`,
        );
      }

      // The questions in order: the intent's slotPriorities (what Lex uses), else the bots file's
      const botSlots = Object.entries(objectOf(intentSettings.slot_priorities))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, slot]) => objectOf(slot));
      const order = Array.isArray(intentJson.slotPriorities)
        ? (intentJson.slotPriorities as Json[])
            .slice()
            .sort((a, b) => Number(a.priority) - Number(b.priority))
            .map((slot) => textOf(slot.slotName))
            .filter((slot): slot is string => Boolean(slot))
        : botSlots.map((slot) => textOf(slot.slot_name)).filter((slot): slot is string => Boolean(slot));

      const questions: ChatbotQuestion[] = [];
      for (const slotName of order) {
        const botSlot = botSlots.find((slot) => slot.slot_name === slotName) ?? {};
        const slotFile = await locate(language, 'slots', slotName);
        if (!slotFile) notes.push(`${language} ${name} › ${intentName}: no slots/${slotName}.json found.`);
        const slot = slotFile?.json ?? {};
        const elicitation = objectOf(slot.valueElicitationSetting);
        const prompt = objectOf(elicitation.promptSpecification);
        const capture = objectOf(elicitation.slotCaptureSetting);
        const question = messageOf(prompt.messageGroups) ?? textOf(botSlot.slot_question) ?? '';
        const failureMessage =
          messageOf(objectOf(capture.failureResponse).messageGroups) ?? textOf(botSlot.failure_response);
        if (slotFile && textOf(botSlot.slot_question) && !same(textOf(botSlot.slot_question), question)) {
          notes.push(
            `${language} ${name} › “${slotName}”: the question in ${botFile.file} isn't the one Lex asks (from ${slotFile.file}); the designer shows Lex's.`,
          );
        }
        questions.push({
          id: id('q'),
          slot: slotName,
          answerType: textOf(slot.slotTypeName) ?? textOf(botSlot.slot_type_name) ?? '',
          question,
          ...(failureMessage ? { failureMessage } : {}),
          retries: typeof prompt.maxRetries === 'number' ? prompt.maxRetries : 1,
          required: elicitation.slotConstraint !== 'Optional',
          ...(slotFile ? { file: slotFile.file, shared: slotFile.shared } : {}),
        });
      }

      const intent: ChatbotIntent = {
        id: id('i'),
        name: intentName,
        utterances: (utterances ?? [])
          .map((utterance) => textOf(objectOf(utterance).utterance))
          .filter((utterance): utterance is string => Boolean(utterance)),
        ...((opening ?? botOpening) ? { opening: opening ?? botOpening } : {}),
        ...((closing ?? botClosing) ? { closing: closing ?? botClosing } : {}),
        questions,
        ...(intentFile ? { file: intentFile.file, shared: intentFile.shared } : {}),
      };
      bot.intents.push(intent);

      // The answers each question takes
      for (const question of questions) {
        const types = (design.answerTypes[language] ??= {});
        if (!question.answerType || types[question.answerType]) continue;
        if (question.answerType.startsWith('AMAZON.')) {
          types[question.answerType] = { name: question.answerType, builtin: true, values: [] };
          continue;
        }
        const typeFile = await locate(language, 'slot_types', question.answerType);
        if (!typeFile) {
          notes.push(`${language}: no slot_types/${question.answerType}.json found.`);
          continue;
        }
        const selection = objectOf(typeFile.json.valueSelectionSetting);
        const answerType: AnswerType = {
          name: question.answerType,
          values: (Array.isArray(typeFile.json.slotTypeValues) ? typeFile.json.slotTypeValues : []).map((entry) => {
            const value = objectOf(entry);
            return {
              value: textOf(objectOf(value.sampleValue).value) ?? '',
              synonyms: (Array.isArray(value.synonyms) ? value.synonyms : [])
                .map((synonym) => textOf(objectOf(synonym).value))
                .filter((synonym): synonym is string => synonym !== undefined),
            };
          }),
          ...(textOf(objectOf(selection.regexFilter).pattern)
            ? { pattern: textOf(objectOf(selection.regexFilter).pattern) }
            : {}),
          ...(textOf(typeFile.json.parentSlotTypeSignature)
            ? { parent: textOf(typeFile.json.parentSlotTypeSignature) }
            : {}),
          ...(textOf(selection.resolutionStrategy) ? { resolution: textOf(selection.resolutionStrategy) } : {}),
          file: typeFile.file,
          shared: typeFile.shared,
        };
        types[question.answerType] = answerType;
      }
    }
    design.bots.push(bot);
  }

  if (wanted.size === 0) notes.push('No chatbots: lex_v2_bot_languages is empty in every environment.');

  // The contact form fields the answers fill in (PrepopulateMappings.json, survey)
  if (formDefinitionsDir) {
    const version = await formsVersionOf(helplinesDir, formDefinitionsDir, code);
    if (version) {
      design.formsVersion = version;
      try {
        design.formMappings = readSurveyMappings(
          JSON.parse(await fs.readFile(path.join(formDefinitionsDir, code, version, PREPOPULATE_FILE), 'utf8')),
        );
      } catch (err) {
        design.formMappings = {};
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          notes.push(`Couldn't read ${code}/${version}/${PREPOPULATE_FILE}: ${(err as Error).message}`);
        }
      }
    }
  }
  design.imported = structuredClone({
    bots: design.bots,
    answerTypes: design.answerTypes,
    ...(design.formMappings ? { formMappings: design.formMappings } : {}),
  });

  return {
    design,
    report: {
      helpline: code,
      bots: design.bots.map((bot) => ({
        language: bot.language,
        name: bot.name,
        environments: bot.environments,
        questions: bot.intents.reduce((total, intent) => total + intent.questions.length, 0),
        file: bot.file,
      })),
      notes: [...new Set(notes)],
    },
  };
};
