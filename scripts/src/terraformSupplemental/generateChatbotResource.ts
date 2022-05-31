import twilio from 'twilio';
import { config } from 'dotenv';
import { writeFile } from 'fs/promises';
import type { SampleInstance } from 'twilio/lib/rest/autopilot/v1/assistant/task/sample';

import { logInfo, logSuccess, logWarning } from '../helpers/log';

config();

const getInstanceData = (instance: { data: any }) => instance.data;

type AssistantDefinition = {
  uniqueName: string;
  friendlyName: string;
  defaults: any;
  styleSheet: any;
  logQueries: boolean;
};

const getAssistantDefinition = async (assistantSid: string): Promise<AssistantDefinition> => {
  logInfo('Trying to get assistant definition');

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const assistantInstance = await client.autopilot.assistants.get(assistantSid).fetch();

  const [defaults, styleSheet] = (
    await Promise.all([
      assistantInstance.defaults().get().fetch(),
      assistantInstance.styleSheet().get().fetch(),
    ])
  ).map(getInstanceData);

  const { logQueries, friendlyName, uniqueName } = assistantInstance;

  const assistantResource = {
    uniqueName,
    friendlyName,
    defaults,
    styleSheet,
    logQueries,
  };

  logSuccess('Succes on: get assistant definition');

  return assistantResource;
};

type FieldTypeResource = {
  friendlyName: string;
  uniqueName: string;
  fieldValues: {
    language: string;
    synonymOf: string;
    value: string;
  }[];
};

const getAssistantFieldTypeDefinitions = async (
  assistantSid: string,
): Promise<FieldTypeResource[]> => {
  logInfo('Trying to get assistant field tpyes definitions');

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const assistantInstance = await client.autopilot.assistants.get(assistantSid).fetch();

  const fieldTypeInstances = await assistantInstance.fieldTypes().list();

  const fieldTypes = await Promise.all(
    fieldTypeInstances.map(async (ft) => {
      const fieldValues = (await ft.fieldValues().list()).map((fv) => {
        const { language, synonymOf, value } = fv;
        return { language, synonymOf, value };
      });

      const { friendlyName, uniqueName } = ft;

      return { friendlyName, uniqueName, fieldValues };
    }),
  );

  logSuccess('Succes on: get assistant field tpyes definitions');

  return fieldTypes;
};

type TaskDefinition = {
  friendlyName: string;
  uniqueName: string;
  actions: any;
  samples: SampleInstance[];
};

const getAssistantTaskDefinitions = async (assistantSid: string): Promise<TaskDefinition[]> => {
  logInfo('Trying to get assistant task definitions');

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const assistantInstance = await client.autopilot.assistants.get(assistantSid).fetch();

  const taskList = await assistantInstance.tasks().list();
  const tasks = await Promise.all(
    taskList.map(async (t) => {
      const { actions } = (await t.taskActions().get().fetch()).data;

      const samples = await t.samples().list();

      const { friendlyName, uniqueName } = t;

      return { friendlyName, uniqueName, actions, samples };
    }),
  );

  logSuccess('Succes on: get assistant task definitions');

  return tasks;
};

type AutopilotResourceType =
  | 'twilio_autopilot_assistants_v1'
  | 'twilio_autopilot_assistants_tasks_fields_v1'
  | 'twilio_autopilot_assistants_field_types_v1'
  | 'twilio_autopilot_assistants_field_types_field_values_v1'
  | 'twilio_autopilot_assistants_model_builds_v1'
  | 'twilio_autopilot_assistants_queries_v1'
  | 'twilio_autopilot_assistants_tasks_samples_v1'
  | 'twilio_autopilot_assistants_tasks_v1'
  | 'twilio_autopilot_assistants_webhooks_v1';

/**
 * Generates the string that represents a single resource in a .tf file
 */
const generateTFResource = (
  resourceType: AutopilotResourceType,
  referenceName: string,
  resourceProperties: string[],
) => {
  const output = [`resource "${resourceType}" "${referenceName}" {`, ...resourceProperties, '}'];

  return output.join('\n');
};

const generateAssistantTF = (resource: AssistantDefinition, referenceName: string) => {
  const assistantProperties = [
    `unique_name = "${resource.uniqueName}"`,
    `friendly_name = "${resource.friendlyName}"`,
    `style_sheet = jsonencode(${JSON.stringify(resource.styleSheet, null, '  ')})`,
    `defaults = jsonencode(${JSON.stringify(resource.defaults, null, '  ')})`,
    `log_queries = ${resource.logQueries}`,
  ];

  return generateTFResource('twilio_autopilot_assistants_v1', referenceName, assistantProperties);
};

const generateTaskSamplesTF = (taskDefinition: TaskDefinition, referenceName: string) => {
  if (!taskDefinition.samples.length) return '';

  const languageMatches = taskDefinition.samples.every(
    (s) => s.language === taskDefinition.samples[0].language,
  );
  if (!languageMatches)
    throw new Error(
      `More than one language specified for task ${taskDefinition.uniqueName}. Handle this case :)`,
    );

  const samples = taskDefinition.samples.map((s) => s.taggedText);

  const taskSamplesProperties = [
    `for_each = toset(${JSON.stringify(samples)})`,
    `assistant_sid = twilio_autopilot_assistants_v1.${referenceName}.sid`,
    `task_sid = twilio_autopilot_assistants_tasks_v1.${referenceName}_${taskDefinition.uniqueName}.sid`,
    `language = "${taskDefinition.samples[0].language}"`,
    'tagged_text = each.key',
  ];

  return generateTFResource(
    'twilio_autopilot_assistants_tasks_samples_v1',
    `${referenceName}_${taskDefinition.uniqueName}_group`,
    taskSamplesProperties,
  );
};

const generateTaskTF = (taskDefinition: TaskDefinition, referenceName: string) => {
  const taskProperties = [
    `assistant_sid = twilio_autopilot_assistants_v1.${referenceName}.sid`,
    `unique_name = "${taskDefinition.uniqueName}"`,
    ...(taskDefinition.friendlyName ? `friendly_name = "${taskDefinition.friendlyName}"` : []),
    `actions = jsonencode(${JSON.stringify({ actions: taskDefinition.actions }, null, '  ')})`,
  ];

  const taskResource = generateTFResource(
    'twilio_autopilot_assistants_tasks_v1',
    `${referenceName}_${taskDefinition.uniqueName}`,
    taskProperties,
  );

  const taskSamplesResource = generateTaskSamplesTF(taskDefinition, referenceName);

  return [taskResource, taskSamplesResource];
};

const generateFieldTypeValuesTF = (fieldType: FieldTypeResource, referenceName: string) => {
  if (!fieldType.fieldValues.length) return '';

  // Base values for this field type
  const baseValues = fieldType.fieldValues.filter((fv) => !fv.synonymOf).map((fv) => fv.value);

  // Synonyms for some of the above
  const synonyms = fieldType.fieldValues.filter((fv) => fv.synonymOf);
  const synonymsMap = synonyms.reduce<{ [baseValue: string]: string[] }>((accum, synonym) => {
    if (accum[synonym.synonymOf])
      return {
        ...accum,
        [synonym.synonymOf]: [...accum[synonym.synonymOf], synonym.value],
      };

    return {
      ...accum,
      [synonym.synonymOf]: [synonym.value],
    };
  }, {});

  // Add the base values resource
  const baseValuesProperties = [
    `for_each = toset(${JSON.stringify(baseValues)})`,
    `assistant_sid = twilio_autopilot_assistants_v1.${referenceName}.sid`,
    `field_type_sid = twilio_autopilot_assistants_field_types_v1.${referenceName}_${fieldType.uniqueName}.sid`,
    'value = each.key',
    'language = "en-US"',
  ];

  const baseValuesResource = generateTFResource(
    'twilio_autopilot_assistants_field_types_field_values_v1',
    `${referenceName}_values_${fieldType.uniqueName}_group`,
    baseValuesProperties,
  );

  // Add synonyms for above values
  const synonymsResources = Object.entries(synonymsMap).map(([baseValue, synonymsValues]) => {
    const synonymsProperties = [
      `depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.${referenceName}_values_${fieldType.uniqueName}_group]`,
      `for_each = toset(${JSON.stringify(synonymsValues)})`,
      `assistant_sid = twilio_autopilot_assistants_v1.${referenceName}.sid`,
      `field_type_sid = twilio_autopilot_assistants_field_types_v1.${referenceName}_${fieldType.uniqueName}.sid`,
      `synonym_of = "${baseValue}"`,
      'value = each.key',
      'language = "en-US"',
    ];

    return generateTFResource(
      'twilio_autopilot_assistants_field_types_field_values_v1',
      `${referenceName}_synonymsOf_${baseValue}_${fieldType.uniqueName}_group`,
      synonymsProperties,
    );
  });

  return [baseValuesResource, synonymsResources];
};

const generateFieldTypeTF = (fieldType: FieldTypeResource, referenceName: string) => {
  const fieldTypeProperties = [
    `unique_name = "${fieldType.uniqueName}"`,
    `assistant_sid = twilio_autopilot_assistants_v1.${referenceName}.sid`,
    ...(fieldType.friendlyName ? [`friendly_name = "${fieldType.friendlyName}"`] : []),
  ];

  const fieldTypeResource = generateTFResource(
    'twilio_autopilot_assistants_field_types_v1',
    `${referenceName}_${fieldType.uniqueName}`,
    fieldTypeProperties,
  );

  const fieldTypeValuesResources = generateFieldTypeValuesTF(fieldType, referenceName);

  return [fieldTypeResource, fieldTypeValuesResources];
};

const generateResourceTF =
  (referenceName: string) => (type: AutopilotResourceType, resource: any) => {
    switch (type) {
      case 'twilio_autopilot_assistants_v1':
        return generateAssistantTF(resource, referenceName);
      case 'twilio_autopilot_assistants_tasks_v1':
        return generateTaskTF(resource, referenceName);
      case 'twilio_autopilot_assistants_field_types_v1':
        return generateFieldTypeTF(resource, referenceName);
      default:
        throw new Error(`Unhandled resource type: ${type}. Resource: ${resource}`);
    }
  };

// TODO: parametrize
// const assistantSid = 'UA19ad9f719702d7b5f8e6d03c8d38d57f';
// const referenceName = 'language_bot';
// const serverlessUrl = 'https://serverless-1270-production.twil.io';

export const generateChatbotResource = async (
  assistantSid: string,
  referenceName: string,
  serverlessUrl: string | undefined = undefined,
) => {
  if (!assistantSid) throw new Error('Missing assistantSid parameter');
  if (!referenceName) throw new Error('Missing referenceName parameter');

  const [assistantDefinition, taskDefinitions, fieldTypeDefinitions] = await Promise.all([
    getAssistantDefinition(assistantSid),
    getAssistantTaskDefinitions(assistantSid),
    getAssistantFieldTypeDefinitions(assistantSid),
  ]);

  const generator = generateResourceTF(referenceName);

  const fileString = [
    generator('twilio_autopilot_assistants_v1', assistantDefinition),
    taskDefinitions.map((t) => generator('twilio_autopilot_assistants_tasks_v1', t)),
    fieldTypeDefinitions.map((ft) => generator('twilio_autopilot_assistants_field_types_v1', ft)),
  ]
    // Flattens all arrays so we have a flat array of resources
    .flat(Number.MAX_VALUE)
    // Filter potential empty strings
    .filter((s) => s)
    // Converts into a single string with an empty line between each resource
    .join('\n\n');

  // Replace all the occurrences of serverless url for the terraform representation grabed from vars
  const output = !serverlessUrl
    ? fileString
    : fileString.replace(serverlessUrl, '$'.concat('{var.serverless_url}'));

  await writeFile(`${referenceName}.tf`, output);

  logSuccess(`Success generating ${referenceName}.tf! Go check your new bot definition :)`);
  logWarning(
    `${referenceName}.tf is probably not well formatted. Try running "terraform fmt ${referenceName}.tf"`,
  );
};
