import yargs from 'yargs';
import twilio from 'twilio';
import { AssistantInstance } from 'twilio/lib/rest/autopilot/v1/assistant';
import * as fs from 'fs/promises';
import {
  Environment,
  runAgainstAllAccountsForEnvironment,
  Strategy,
} from '../terraformSupplemental/runAgainstAllAccountsForEnvironment';
import { newAutopilotReader } from './autopilotReader';
import { logDebug, logError, logInfo } from '../helpers/log';
import {
  fieldTypesToSlotTypes,
  LexChatbotConfig,
  tasksToIntents,
} from './autopilotToLexConverters';

const EMPTY_LEX_CONFIG: LexChatbotConfig = {
  description: 'Survey bot',
  locale: 'en-US',
  process_behavior: 'BUILD',
  child_directed: true,
  idle_session_ttl_in_seconds: '600',
  abort_statement: {
    content: 'Sorry, I am not able to assist at this time.',
    content_type: 'PlainText',
  },
  clarification_prompt: {
    max_attempts: 2,
    content: "Sorry, I didn't understand that. Please try again.",
    content_type: 'PlainText',
  },
  slot_types: {},
  intents: {},
};

async function generateLexTerraformConfig(
  autopilotReader: ReturnType<typeof newAutopilotReader>,
  autopilotAssistant: AssistantInstance,
): Promise<LexChatbotConfig> {
  const tasks = await autopilotReader.getAssistantTaskDefinitions(autopilotAssistant);
  const fieldTypes = await autopilotReader.getAssistantFieldTypeDefinitions(autopilotAssistant);
  const intents = await tasksToIntents(tasks);
  const slotTypes = fieldTypesToSlotTypes(fieldTypes);
  return {
    ...EMPTY_LEX_CONFIG,
    description: autopilotAssistant.friendlyName,
    slot_types: slotTypes,
    intents,
  };
}

async function main() {
  logDebug(`convertAutopilotToLexTerraformConfigJson: ${process.argv.slice(2).join(' ')}`);
  const { e: environment } = yargs(process.argv.slice(2))
    .options({
      e: {
        alias: 'environment',
        type: 'string',
        choices: ['development', 'production', 'staging'],
        demandOption: true,
      },
    })
    .parseSync();

  logInfo(`Generating starter lex terraform configs for ${environment}`);
  await runAgainstAllAccountsForEnvironment(
    environment as Environment,
    async (accountSid, authToken, shortCode) => {
      try {
        logInfo(`Generating lex terraform configs for ${shortCode.toUpperCase()}`);
        const autopilotReader = newAutopilotReader(twilio(accountSid, authToken));
        const assistants = await autopilotReader.getAssistants();
        const fullLexConfig = Object.fromEntries(
          await Promise.all(
            assistants.map(async (assistant) => {
              logDebug(`Generating lex terraform config for ${assistant.uniqueName}`);
              const lexTerraformConfig = await generateLexTerraformConfig(
                autopilotReader,
                assistant,
              );
              logInfo(`Generated lex terraform config for ${assistant.uniqueName}`);
              return [assistant.uniqueName, lexTerraformConfig];
            }),
          ),
        );
        await fs.writeFile(
          `./src/autopilot-migration/json/lexTerraformConfig-${environment}-${shortCode.toUpperCase()}.json`,
          JSON.stringify(fullLexConfig, null, 2),
        );
      } catch (e) {
        logError(`Failed to generate lex terraform configs for ${shortCode.toUpperCase()}`, e);
      }
    },
    Strategy.SEQUENTIAL,
  );
}

main().catch((e) => {
  logError(e);
  process.exit(1);
});
