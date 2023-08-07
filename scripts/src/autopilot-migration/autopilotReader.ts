import type { Twilio } from 'twilio';
import { SampleInstance } from 'twilio/lib/rest/autopilot/v1/assistant/task/sample';
import { AssistantInstance } from 'twilio/lib/rest/autopilot/v1/assistant';
import { logInfo, logSuccess } from '../helpers/log';

const getInstanceData = (instance: { data: any }) => instance.data;

export type AssistantDefinition = {
  uniqueName: string;
  friendlyName: string;
  defaults: any;
  styleSheet: any;
  logQueries: boolean;
};

export type FieldTypeResource = {
  friendlyName: string;
  uniqueName: string;
  fieldValues: {
    language: string;
    synonymOf: string;
    value: string;
  }[];
};

export type CollectActionDefinition = {
  collect: {
    name: string;
    questions: { type: string; question: string; name: string }[];
  };
};

export type TaskDefinition = {
  friendlyName: string;
  uniqueName: string;
  actions: any[];
  samples: SampleInstance[];
};

export const isCollectActionDefinition = (action: any): action is CollectActionDefinition =>
  Boolean(action.collect);

const assistantInstanceToAssistantDefinition = async (
  assistantInstance: AssistantInstance,
): Promise<AssistantDefinition> => {
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

  logSuccess('Success on: get assistant definition');

  return assistantResource;
};

export const newAutopilotReader = (client: Twilio) => ({
  getAssistants: async () => {
    return client.autopilot.v1.assistants.list();
  },
  getAssistantDefinition: async (assistantSid: string): Promise<AssistantDefinition> => {
    logInfo('Trying to get assistant definition');

    const assistantInstance = await client.autopilot.assistants.get(assistantSid).fetch();

    return assistantInstanceToAssistantDefinition(assistantInstance);
  },

  getAssistantFieldTypeDefinitions: async (
    assistantInstance: AssistantInstance,
  ): Promise<FieldTypeResource[]> => {
    logInfo('Trying to get assistant field types definitions');

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

    logSuccess('Success on: get assistant field types definitions');

    return fieldTypes;
  },
  getAssistantTaskDefinitions: async (
    assistantInstance: AssistantInstance,
  ): Promise<TaskDefinition[]> => {
    logInfo('Trying to get assistant task definitions');
    const taskList = await assistantInstance.tasks().list();
    const tasks = await Promise.all(
      taskList.map(async (t) => {
        const { actions } = (await t.taskActions().get().fetch()).data;

        const samples = await t.samples().list();

        const { friendlyName, uniqueName } = t;

        return { friendlyName, uniqueName, actions, samples };
      }),
    );

    logSuccess('Success on: get assistant task definitions');

    return tasks;
  },
});
