import twilio from 'twilio';
import { logDebug, logSuccess, logWarning } from '../../helpers/log';
import { FieldValueParser, Ids } from '../resourceParsers';

type AssistantRegexCaptures = {
  resourceName: string;
  uniqueName: string;
};

type ResourceLocator = FieldValueParser['findResourceSids'];

export const findAssistantSids: ResourceLocator = async (
  client: twilio.Twilio,
  knownSids: Record<string, string>,
  rawCaptures: Record<string, string>,
): Promise<Ids[]> => {
  const captures: AssistantRegexCaptures = <AssistantRegexCaptures>rawCaptures;
  const assistant = await client.autopilot.assistants(captures.uniqueName).fetch();
  return [{ sid: assistant.sid, terraformId: assistant.sid }];
};

type FieldTypeRegexCaptures = {
  resourceName: string;
  assistantResource: string;
  uniqueName: string;
};

export const findFieldTypeSids: ResourceLocator = async (
  client: twilio.Twilio,
  knownSids: Record<string, string>,
  rawCaptures: Record<string, string>,
): Promise<Ids[]> => {
  const captures: FieldTypeRegexCaptures = <FieldTypeRegexCaptures>rawCaptures;
  const assistantSid = knownSids[captures.assistantResource];
  logDebug(`Found assistantSid: ${captures.assistantResource} = ${assistantSid}`);

  const assistant = await client.autopilot.assistants(assistantSid).fetch();
  const fieldTypeListInstance = await assistant.fieldTypes().list();

  return fieldTypeListInstance
    .filter((ft) => ft.uniqueName === captures.uniqueName)
    .map((ft) => ({ terraformId: `${assistantSid}/${ft.sid}`, sid: ft.sid }));
};

type FieldValueRegexCaptures = {
  resourceName: string;
  assistantResource: string;
  fieldTypeResource: string;
  fieldValues: string;
};

export const findFieldValueSids: ResourceLocator = async (
  client: twilio.Twilio,
  knownSids: Record<string, string>,
  rawCaptures: Record<string, string>,
): Promise<Ids[]> => {
  const captures: FieldValueRegexCaptures = <FieldValueRegexCaptures>rawCaptures;
  const assistantSid = knownSids[captures.assistantResource];
  const fieldTypeSid = knownSids[captures.fieldTypeResource];
  // eslint-disable-next-line no-await-in-loop
  const fieldTypeInstance = await client.autopilot
    .assistants(assistantSid)
    .fieldTypes(fieldTypeSid)
    .fetch();
  const values: string[] = JSON.parse(captures.fieldValues);

  // eslint-disable-next-line no-await-in-loop
  const fieldValueList = await fieldTypeInstance.fieldValues().list();
  return values
    .map((val) => {
      const valueInstance = fieldValueList.find((fv) => fv.value === val);
      if (valueInstance) {
        return {
          sid: valueInstance.sid,
          terraformId: `${assistantSid}/${fieldTypeSid}/${valueInstance.sid}`,
          knownSidKey: val,
        };
      }
      logWarning(
        `Field value '${val}' not currently present in field type '${captures.fieldTypeResource}' for assistant '${captures.assistantResource}', skipping import`,
      );
      return null;
    })
    .filter((v) => v) as Ids[];
};

type TaskRegexCaptures = {
  resourceName: string;
  uniqueName: string;
  assistantResource: string;
};

export const findTaskSids: ResourceLocator = async (
  client: twilio.Twilio,
  knownSids: Record<string, string>,
  rawCaptures: Record<string, string>,
): Promise<Ids[]> => {
  const captures: TaskRegexCaptures = <TaskRegexCaptures>rawCaptures;
  const assistantSid = knownSids[captures.assistantResource];
  logDebug(`Found assistantSid: ${captures.assistantResource} = ${assistantSid}`);

  const assistant = await client.autopilot.assistants(assistantSid).fetch();
  const taskListInstance = await assistant.tasks().list();

  return taskListInstance
    .filter((t) => t.uniqueName === captures.uniqueName)
    .map((t) => ({ terraformId: `${assistantSid}/${t.sid}`, sid: t.sid }));
};

type TaskSampleRegexCaptures = {
  resourceName: string;
  assistantResource: string;
  samples: string;
  taskResource: string;
};

export const findTaskSampleSids: ResourceLocator = async (
  client: twilio.Twilio,
  knownSids: Record<string, string>,
  rawCaptures: Record<string, string>,
): Promise<Ids[]> => {
  const captures: TaskSampleRegexCaptures = <TaskSampleRegexCaptures>rawCaptures;
  const assistantSid = knownSids[captures.assistantResource];
  const taskSid = knownSids[captures.taskResource];

  const taskInstance = await client.autopilot.assistants(assistantSid).tasks(taskSid).fetch();

  const samples: string[] = JSON.parse(captures.samples);

  // eslint-disable-next-line no-await-in-loop
  const sampleList = await taskInstance.samples().list();
  return samples
    .map((val) => {
      const sampleInstance = sampleList.find((s) => s.taggedText === val);
      if (sampleInstance) {
        return {
          sid: sampleInstance.sid,
          terraformId: `${assistantSid}/${taskSid}/${sampleInstance.sid}`,
          knownSidKey: val,
        };
      }
      logWarning(
        `Sample '${val}' not currently present in task '${captures.taskResource}' for assistant '${captures.assistantResource}', skipping import`,
      );
      return null;
    })
    .filter((v) => v) as Ids[];
};
