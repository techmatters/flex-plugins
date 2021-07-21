/* eslint-disable no-console */
/**
 * Script used to setup Twilio resources and save Parameter Store secrets (step 2 of setup new helpline guide).
 * To run this script, you must have a .env file with the following variables:
 *  AWS_ACCESS_KEY_ID=<AWS script-user access key>
 *  AWS_SECRET_ACCESS_KEY=<AWS script-user access secret>
 *  TWILIO_ACCOUNT_SID=<Target Twilio account sid>
 *  TWILIO_AUTH_TOKEN=<Target Twilio account auth token>
 *  HELPLINE=<Helpline's friendly name (e.g. South Africa Helpline)>
 *  SHORT_HELPLINE=<Short code for this helpline (e.g. ZA)>
 *  ENVIRONMENT=<Target environment, one of Development, Staging or Production>
 */
import twilio from 'twilio';
import { saveSSMParameter } from './helpers/ssm';
import { logError, logSuccess, logWarning } from './helpers/log';

require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

type ConstantState = {
  helpline: string;
  shortHelpline: string;
  environment: string;
  shortEnvironment: string;
};

type DynamicState = {
  workspaceSid?: string;
  taskQueueSid?: string;
  workflowSid?: string;
  syncServiceSid?: string;
  apiKeySid?: string;
  apiKeySecret?: string;
  chatServiceSid?: string;
};

type State = ConstantState & DynamicState;

/**
 * SSM (AWS Parameter Store) related functions
 */
type GetSSMStringFunction = (state: State) => string;
type GetSSMStringFunctions = { [k in keyof Required<DynamicState>]: GetSSMStringFunction };

/**
 * Returns the proper name that whould be used in AWS Parameter Store for each resource
 */
const getSSMName: GetSSMStringFunctions = {
  workspaceSid: (state: State) =>
    `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_WORKSPACE_SID`,
  workflowSid: (state: State) =>
    `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_CHAT_WORKFLOW_SID`,
  syncServiceSid: (state: State) =>
    `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_SYNC_SID`,
  apiKeySid: (state: State) => `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_API_KEY`,
  apiKeySecret: (state: State) => `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_SECRET`,
  chatServiceSid: (state: State) =>
    `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_CHAT_SERVICE_SID`,
  taskQueueSid: () => {
    throw new Error('getSSMName not defined for key taskQueueSid.');
  },
};

/**
 * Returns the proper description that whould be used in AWS Parameter Store for each resource
 */
const getSSMDescription: GetSSMStringFunctions = {
  workspaceSid: (state: State) =>
    `${state.environment} - ${state.helpline} Twilio account - Workspace SID`,
  workflowSid: (state: State) =>
    `${state.environment} - ${state.helpline} Twilio account - Chat transfer workflow SID`,
  syncServiceSid: (state: State) =>
    `${state.environment} - ${state.helpline} Twilio account - Sync service SID`,
  apiKeySid: (state: State) =>
    `${state.environment} - ${state.helpline} Twilio account - Sync API key`,
  apiKeySecret: (state: State) =>
    `${state.environment} - ${state.helpline} Twilio account - Sync API secret`,
  chatServiceSid: (state: State) =>
    `${state.environment} - ${state.helpline} Twilio account - Chat service SID`,
  taskQueueSid: () => {
    throw new Error('getSSMDescription not defined for key taskQueueSid.');
  },
};

const getSSMTags = (state: State): AWS.SSM.TagList => [
  { Key: 'Helpline', Value: state.helpline },
  { Key: 'Environment', Value: state.environment },
];

const saveStateKeyToSSM = (key: keyof DynamicState) => async (state: State) => {
  const value = state[key];
  if (!value) throw new Error(`${key} key missing in state while trying to save SSM parameter.`);

  const name = getSSMName[key](state);
  const description = getSSMDescription[key](state);
  const tags = getSSMTags(state);

  await saveSSMParameter(name, value, description, tags);

  logSuccess(`AWS Parameter Store: Succesfully saved ${name}`);
  return state;
};

const saveWorkspaceToSSM = saveStateKeyToSSM('workspaceSid');
const saveWorkflowToSSM = saveStateKeyToSSM('workflowSid');
const saveSyncServiceToSSM = saveStateKeyToSSM('syncServiceSid');
const saveAPIKeyToSSM = saveStateKeyToSSM('apiKeySid');
const saveAPISecretToSSM = saveStateKeyToSSM('apiKeySecret');
const saveChatServiceToSSM = saveStateKeyToSSM('chatServiceSid');

/**
 * Twilio resources related functions
 */
const fetchFlexWorkspace = async (state: State): Promise<State> => {
  const ws = await client.taskrouter.workspaces.list();
  const workspace = ws.find((e) => e.friendlyName === 'Flex Task Assignment');

  if (!workspace)
    throw new Error(
      `Flex Task Assignment Workspace not found in account ${process.env.TWILIO_ACCOUNT_SID}`,
    );

  return { ...state, workspaceSid: workspace?.sid };
};

const createTaskQueue = async (state: State): Promise<State> => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createTaskQueue');

  const q = await client.taskrouter.workspaces(state.workspaceSid).taskQueues.create({
    friendlyName: state.helpline,
    targetWorkers: `helpline=='${state.helpline}'`,
  });

  logSuccess(`Twilio resource: Succesfully created task queue ${q.sid}`);
  return { ...state, taskQueueSid: q.sid };
};

const createWorkflow = async (state: State): Promise<State> => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createWorkflow');
  if (!state.taskQueueSid) throw new Error('state.taskQueueSid missing at createWorkflow');

  const workflow = await client.taskrouter.workspaces(state.workspaceSid).workflows.create({
    friendlyName: 'Master Workflow',
    configuration: JSON.stringify({
      task_routing: {
        filters: [
          {
            filter_friendly_name: `${state.helpline}`,
            expression: `helpline==${state.helpline}`,
            targets: [
              {
                expression:
                  "(worker.waitingOfflineContact != true AND ((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0)) AND ((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)",
                queue: `${state.taskQueueSid}`,
              },
            ],
          },
        ],
      },
    }),
  });

  logSuccess(`Twilio resource: Succesfully created workflow ${workflow.sid}`);
  return { ...state, workflowSid: workflow.sid };
};

const createSyncService = async (state: State): Promise<State> => {
  const service = await client.sync.services.create({
    friendlyName: 'Shared State Service ',
  });

  logSuccess(`Twilio resource: Succesfully created Sync service ${service.sid}`);
  return { ...state, syncServiceSid: service.sid };
};

const createAPIKey = async (state: State): Promise<State> => {
  const key = await client.newKeys.create({ friendlyName: 'Shared State Service' });

  logSuccess(`Twilio resource: Succesfully created API key ${key.sid}`);
  return { ...state, apiKeySid: key.sid, apiKeySecret: key.secret };
};

const fetchChatService = async (state: State): Promise<State> => {
  const ss = await client.chat.services.list();
  const service = ss.find((e) => e.friendlyName === 'Flex Chat Service');

  if (!service)
    throw new Error(`Flex Chat Service not found in account ${process.env.TWILIO_ACCOUNT_SID}`);

  return { ...state, chatServiceSid: service.sid };
};

/**
 * Cleanup functions
 */
const removeAPIKey = async (state: State): Promise<State> => {
  const { apiKeySid, apiKeySecret, ...rest } = state;
  if (apiKeySid) {
    await client.keys.get(apiKeySid).remove();
    logWarning(`Twilio resource: Succesfully removed API key ${apiKeySid}`);
  }

  return rest;
};

const removeSyncService = async (state: State): Promise<State> => {
  const { syncServiceSid, ...rest } = state;
  if (syncServiceSid) {
    await client.sync.services(syncServiceSid).remove();
    logWarning(`Twilio resource: Succesfully removed Sync service ${syncServiceSid}`);
  }

  return rest;
};

const removeWorkflow = async (state: State): Promise<State> => {
  const { workflowSid, ...rest } = state;
  if (!state.workspaceSid)
    throw new Error(
      'Flex Task Assignment Workspace not found while trying to remove the workflow.',
    );

  if (workflowSid) {
    await client.taskrouter.workspaces(state.workspaceSid).workflows(workflowSid).remove();
    logWarning(`Twilio resource: Succesfully removed workflow ${workflowSid}`);
  }

  return rest;
};

const removeTaskQueue = async (state: State): Promise<State> => {
  const { taskQueueSid, ...rest } = state;
  if (!state.workspaceSid)
    throw new Error(
      'Flex Task Assignment Workspace not found while trying to remove the task queue.',
    );

  if (taskQueueSid) {
    await client.taskrouter.workspaces(state.workspaceSid).taskQueues(taskQueueSid).remove();
    logWarning(`Twilio resource: Succesfully removed task queue ${taskQueueSid}`);
  }

  return rest;
};

const cleanupPartialResources = async (state: State): Promise<void> => {
  await [removeAPIKey, removeSyncService, removeWorkflow, removeTaskQueue].reduce(
    async (accumPromise, func) => {
      let partialState = state;

      try {
        const accum = await accumPromise;
        const newState = await func(accum);
        partialState = newState;
        return newState;
      } catch (err) {
        logError(
          "Couldn't complete the cleanup process after something went wrong. Manually clean the following resources:",
        );
        if (partialState.apiKeySid) console.log('apiKeySid: ', partialState.apiKeySid);
        if (partialState.syncServiceSid)
          console.log('syncServiceSid: ', partialState.syncServiceSid);
        if (partialState.workflowSid) console.log('workflowSid: ', partialState.workflowSid);
        if (partialState.taskQueueSid) console.log('taskQueueSid: ', partialState.taskQueueSid);
        return Promise.reject(err); // Stop the promise chain rejecting all subsequent ones
      }
    },
    Promise.resolve(state),
  );
};

/**
 * Naming convenyion we use for the envionments.
 */
const environments = ['Development', 'Staging', 'Production'];
const shortEnvironments = { Development: 'DEV', Staging: 'STG', Production: 'PROD' } as {
  [env: string]: string;
};

async function main() {
  if (!process.env.AWS_ACCESS_KEY_ID) throw new Error('AWS_ACCESS_KEY_ID missing, check env vars.');
  if (!process.env.AWS_SECRET_ACCESS_KEY)
    throw new Error('AWS_SECRET_ACCESS_KEY missing, check env vars.');
  if (!process.env.TWILIO_ACCOUNT_SID)
    throw new Error('TWILIO_ACCOUNT_SID missing, check env vars.');
  if (!process.env.TWILIO_AUTH_TOKEN) throw new Error('TWILIO_AUTH_TOKEN missing, check env vars.');
  if (!process.env.HELPLINE) throw new Error('HELPLINE missing, check env vars.');
  if (!process.env.SHORT_HELPLINE) throw new Error('SHORT_HELPLINE missing, check env vars.');
  if (!process.env.ENVIRONMENT) throw new Error('ENVIRONMENT missing, check env vars.');
  if (!environments.includes(process.env.ENVIRONMENT))
    throw new Error(
      `Invalid ENVIRONMENT provided, it must be one of ${environments}, check env vars.`,
    );

  const initialState: State = {
    helpline: process.env.HELPLINE,
    shortHelpline: process.env.SHORT_HELPLINE,
    environment: process.env.ENVIRONMENT,
    shortEnvironment: shortEnvironments[process.env.ENVIRONMENT],
  };

  // partialState will be used to cleanup inconsistent state of partially created resources, in case any step goes wrong
  let partialState = initialState;

  try {
    // finalState will have a valid state only if all promises are resolved succesfully
    const finalState = await [
      fetchFlexWorkspace,
      createTaskQueue,
      createWorkflow,
      createSyncService,
      createAPIKey,
      fetchChatService,
      saveWorkspaceToSSM,
      saveWorkflowToSSM,
      saveSyncServiceToSSM,
      saveAPIKeyToSSM,
      saveAPISecretToSSM,
      saveChatServiceToSSM,
    ].reduce(async (accumPromise, func) => {
      try {
        const accum = await accumPromise;
        const newState = await func(accum);
        partialState = newState;
        return newState;
      } catch (err) {
        return Promise.reject(err); // Stop the promise chain rejecting all subsequent ones
      }
    }, Promise.resolve(initialState));

    const { apiKeySecret, ...output } = finalState;

    logSuccess('Process completed succesfully, the output is: ');
    console.log(output);
  } catch (err) {
    logError(err);

    await cleanupPartialResources(partialState);
  }
}

main();
