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
import { saveSSMParameter } from '../helpers/ssm';
import { createS3Bucket } from '../helpers/s3';
import { logError, logSuccess, logWarning } from '../helpers/log';
import { ScriptsInput } from './types';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

type DynamicState = {
  workspaceSid?: string;
  taskQueueSid?: string;
  workflowSid?: string;
  syncServiceSid?: string;
  apiKeySid?: string;
  apiKeySecret?: string;
  chatServiceSid?: string;
  flexProxyServiceSid?: string;
  surveyTaskQueueSid?: string;
  surveyWorkflowSid?: string;
  surveyTaskChannelSid?: string;
  hrmStaticApiKeySid?: string;
  hrmStaticApiKeySecret?: string;
  docsBucket?: string;
  postSurveyBotChatUrl?: string;
  operatingInfoKey?: string;
};

type State = ScriptsInput & DynamicState;

/**
 * SSM (AWS Parameter Store) related functions
 */
type GetSSMStringFunction = (state: State) => string;
type GetSSMStringFunctions = { [k in keyof Required<DynamicState>]: GetSSMStringFunction };

const getSSMName = (key: string) => (state: State) =>
  `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_${key}`;

const getSSMDescription = (description: string) => (state: State) =>
  `${state.environment} - ${state.helpline} ${description}`;

const throwWithKey = (key: string) => () => {
  throw new Error(`getSSMStringFunction not defined for key ${key}.`);
};

/**
 * Returns the proper name that whould be used in AWS Parameter Store for each resource
 */
const getSSMNameFunction: GetSSMStringFunctions = {
  workspaceSid: getSSMName('WORKSPACE_SID'),
  workflowSid: getSSMName('CHAT_WORKFLOW_SID'),
  syncServiceSid: getSSMName('SYNC_SID'),
  apiKeySid: getSSMName('API_KEY'),
  apiKeySecret: getSSMName('SECRET'),
  chatServiceSid: getSSMName('CHAT_SERVICE_SID'),
  flexProxyServiceSid: getSSMName('FLEX_PROXY_SERVICE_SID'),
  surveyWorkflowSid: getSSMName('SURVEY_WORKFLOW_SID'),
  hrmStaticApiKeySecret: getSSMName('HRM_STATIC_KEY'),
  docsBucket: getSSMName('S3_BUCKET_DOCS'),
  postSurveyBotChatUrl: getSSMName('POST_SURVEY_BOT_CHAT_URL'),
  operatingInfoKey: getSSMName('OPERATING_INFO_KEY'),
  taskQueueSid: throwWithKey('taskQueueSid'),
  surveyTaskChannelSid: throwWithKey('surveyTaskChannelSid'),
  hrmStaticApiKeySid: throwWithKey('hrmStaticApiKeySid'),
  surveyTaskQueueSid: throwWithKey('surveyTaskQueueSid'),
};

/**
 * Returns the proper description that whould be used in AWS Parameter Store for each resource
 */
const getSSMDescriptionFunction: GetSSMStringFunctions = {
  workspaceSid: getSSMDescription('Twilio account - Workspace SID'),
  workflowSid: getSSMDescription('Twilio account - Chat transfer workflow SID'),
  syncServiceSid: getSSMDescription('Twilio account - Sync service SID'),
  apiKeySid: getSSMDescription('Twilio account - Sync API key'),
  apiKeySecret: getSSMDescription('Twilio account - Sync API secret'),
  chatServiceSid: getSSMDescription('Twilio account - Chat service SID'),
  flexProxyServiceSid: getSSMDescription('Twilio account - Flex Proxy servivice SID'),
  surveyWorkflowSid: getSSMDescription('Twilio account - Survey Workflow SID'),
  hrmStaticApiKeySecret: getSSMDescription(
    'Twilio account - HRM static secret to perform backend calls',
  ),
  docsBucket: getSSMDescription('Twilio account - S3 Bucket for storing documents'),
  postSurveyBotChatUrl: getSSMDescription('Twilio account - Post Survey bot chat url'),
  operatingInfoKey: getSSMDescription('Twilio account - Operating Key info'),
  taskQueueSid: throwWithKey('taskQueueSid'),
  surveyTaskChannelSid: throwWithKey('surveyTaskChannelSid'),
  hrmStaticApiKeySid: throwWithKey('hrmStaticApiKeySid'),
  surveyTaskQueueSid: throwWithKey('surveyTaskQueueSid'),
};

const getSSMTags = (state: State): AWS.SSM.TagList => [
  { Key: 'Helpline', Value: state.helpline },
  { Key: 'Environment', Value: state.environment },
];

const saveStateKeyToSSM = (key: keyof DynamicState) => async (state: State) => {
  const value = state[key];
  if (value === null || value === undefined) {
    throw new Error(`${key} key missing in state while trying to save SSM parameter.`);
  }

  const name = getSSMNameFunction[key](state);
  const description = getSSMDescriptionFunction[key](state);
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
const saveFlexProxyToSSM = saveStateKeyToSSM('flexProxyServiceSid');
const saveSurveyWorkflowToSSM = saveStateKeyToSSM('surveyWorkflowSid');
const saveHrmStaticKeyToSSM = saveStateKeyToSSM('hrmStaticApiKeySecret');
const saveDocsBucketToSSM = saveStateKeyToSSM('docsBucket');
const savePostSurveyBotChatUrlToSSM = saveStateKeyToSSM('postSurveyBotChatUrl');
const saveOperatingInfoKeyToSSM = saveStateKeyToSSM('operatingInfoKey');

/**
 * Twilio resources related functions
 */
const fetchFlexWorkspace = async (state: State) => {
  const ws = await client.taskrouter.workspaces.list();
  const workspace = ws.find((e) => e.friendlyName === 'Flex Task Assignment');

  if (!workspace)
    throw new Error(
      `Flex Task Assignment Workspace not found in account ${process.env.TWILIO_ACCOUNT_SID}`,
    );

  return { ...state, workspaceSid: workspace?.sid };
};

const fetchFlexProxyService = async (state: State) => {
  const ps = await client.proxy.services.list();
  const proxy = ps.find((e) => e.uniqueName === 'Flex Proxy Service');

  if (!proxy)
    throw new Error(`Flex Proxy Service not found in account ${process.env.TWILIO_ACCOUNT_SID}`);

  return { ...state, flexProxyServiceSid: proxy.sid };
};

const createTaskQueue = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createTaskQueue');

  const q = await client.taskrouter.workspaces(state.workspaceSid).taskQueues.create({
    friendlyName: state.helpline,
    targetWorkers: `helpline=='${state.helpline}'`,
  });

  logSuccess(`Twilio resource: Succesfully created task queue ${q.sid}`);
  return { ...state, taskQueueSid: q.sid };
};

const createWorkflow = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createWorkflow');
  if (!state.taskQueueSid) throw new Error('state.taskQueueSid missing at createWorkflow');

  const workflow = await client.taskrouter.workspaces(state.workspaceSid).workflows.create({
    friendlyName: 'Master Workflow',
    configuration: JSON.stringify({
      task_routing: {
        filters: [
          {
            filter_friendly_name: `${state.helpline}`,
            expression: `helpline=='${state.helpline}'`,
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

const createSyncService = async (state: State) => {
  const service = await client.sync.services.create({
    friendlyName: 'Shared State Service ',
  });

  logSuccess(`Twilio resource: Succesfully created Sync service ${service.sid}`);
  return { ...state, syncServiceSid: service.sid };
};

const createAPIKey = async (state: State) => {
  const key = await client.newKeys.create({ friendlyName: 'Shared State Service' });

  logSuccess(`Twilio resource: Succesfully created API key ${key.sid}`);
  return { ...state, apiKeySid: key.sid, apiKeySecret: key.secret };
};

const createHrmStaticAPIKey = async (state: State) => {
  const key = await client.newKeys.create({ friendlyName: 'hrm-static-key' });

  logSuccess(`Twilio resource: Succesfully created HRM static API key ${key.sid}`);
  return { ...state, hrmStaticApiKeySid: key.sid, hrmStaticApiKeySecret: key.secret };
};

const fetchChatService = async (state: State) => {
  const ss = await client.chat.services.list();
  const service = ss.find((e) => e.friendlyName === 'Flex Chat Service');

  if (!service)
    throw new Error(`Flex Chat Service not found in account ${process.env.TWILIO_ACCOUNT_SID}`);

  return { ...state, chatServiceSid: service.sid };
};

const createSurveyTaskQueue = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createSurveyTaskQueue');

  const q = await client.taskrouter.workspaces(state.workspaceSid).taskQueues.create({
    friendlyName: 'Survey',
    targetWorkers: '1==0',
  });

  logSuccess(`Twilio resource: Succesfully created survey task queue ${q.sid}`);
  return { ...state, surveyTaskQueueSid: q.sid };
};

const createSurveyWorkflow = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createSurveyWorkflow');
  if (!state.surveyTaskQueueSid)
    throw new Error('state.surveyTaskQueueSid missing at createSurveyWorkflow');

  const workflow = await client.taskrouter.workspaces(state.workspaceSid).workflows.create({
    friendlyName: 'Survey',
    configuration: JSON.stringify({
      task_routing: {
        filters: [
          {
            filter_friendly_name: 'Survey Filter',
            expression: 'isSurveyTask==true',
            targets: [
              {
                queue: `${state.surveyTaskQueueSid}`,
              },
            ],
          },
        ],
      },
    }),
  });

  logSuccess(`Twilio resource: Succesfully created survey workflow ${workflow.sid}`);
  return { ...state, surveyWorkflowSid: workflow.sid };
};

const createSurveyTaskChannel = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createSurveyTaskChannel');

  const taskChannel = await client.taskrouter.workspaces(state.workspaceSid).taskChannels.create({
    uniqueName: 'survey',
    friendlyName: 'Survey',
  });

  logSuccess(`Twilio resource: Succesfully created survey task channel ${taskChannel.sid}`);
  return { ...state, surveyTaskChannelSid: taskChannel.sid };
};

export const getDocsBucketName = (): string =>
  `tl-aselo-docs-${process.env.SHORT_HELPLINE?.toLowerCase()}-${process.env.ENVIRONMENT?.toLowerCase()}`;

const createDocsBucket = async (state: State): Promise<State> => {
  const bucketName = getDocsBucketName();
  await createS3Bucket(bucketName);

  logSuccess(`AWS S3 Bucket: Succesfully created ${bucketName}`);
  return state;
};

/**
 * Cleanup functions
 */
const removeAPIKey = async (state: State) => {
  const { apiKeySid, apiKeySecret, ...rest } = state;
  if (apiKeySid) {
    await client.keys.get(apiKeySid).remove();
    logWarning(`Twilio resource: Succesfully removed API key ${apiKeySid}`);
  }

  return rest;
};

const removeHrmStaticAPIKey = async (state: State) => {
  const { hrmStaticApiKeySid, hrmStaticApiKeySecret, ...rest } = state;
  if (hrmStaticApiKeySid) {
    await client.keys.get(hrmStaticApiKeySid).remove();
    logWarning(`Twilio resource: Succesfully removed HRM static API key ${hrmStaticApiKeySid}`);
  }

  return rest;
};

const removeSyncService = async (state: State) => {
  const { syncServiceSid, ...rest } = state;
  if (syncServiceSid) {
    await client.sync.services(syncServiceSid).remove();
    logWarning(`Twilio resource: Succesfully removed Sync service ${syncServiceSid}`);
  }

  return rest;
};

const removeWorkflow = async (state: State) => {
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

const removeTaskQueue = async (state: State) => {
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

const removeSurveyTaskChannel = async (state: State) => {
  const { surveyTaskChannelSid, ...rest } = state;
  if (!state.workspaceSid)
    throw new Error(
      'Flex Task Assignment Workspace not found while trying to remove the survey task channel.',
    );

  if (surveyTaskChannelSid) {
    await client.taskrouter
      .workspaces(state.workspaceSid)
      .taskChannels(surveyTaskChannelSid)
      .remove();
    logWarning(`Twilio resource: Succesfully removed survey task channel ${surveyTaskChannelSid}`);
  }

  return rest;
};

const removeSurveyWorkflow = async (state: State) => {
  const { surveyWorkflowSid, ...rest } = state;
  if (!state.workspaceSid)
    throw new Error(
      'Flex Task Assignment Workspace not found while trying to remove the survey workflow.',
    );

  if (surveyWorkflowSid) {
    await client.taskrouter.workspaces(state.workspaceSid).workflows(surveyWorkflowSid).remove();
    logWarning(`Twilio resource: Succesfully removed survey workflow ${surveyWorkflowSid}`);
  }

  return rest;
};

const removeSurveyTaskQueue = async (state: State) => {
  const { surveyTaskQueueSid, ...rest } = state;
  if (!state.workspaceSid)
    throw new Error(
      'Flex Task Assignment Workspace not found while trying to remove the survey task queue.',
    );

  if (surveyTaskQueueSid) {
    await client.taskrouter.workspaces(state.workspaceSid).taskQueues(surveyTaskQueueSid).remove();
    logWarning(`Twilio resource: Succesfully removed survey task queue ${surveyTaskQueueSid}`);
  }

  return rest;
};

const cleanupPartialResources = async (state: State & DynamicState): Promise<void> => {
  let partialState = state;

  await [
    removeAPIKey,
    removeHrmStaticAPIKey,
    removeSyncService,
    removeWorkflow,
    removeTaskQueue,
    removeSurveyTaskChannel,
    removeSurveyWorkflow,
    removeSurveyTaskQueue,
  ].reduce(async (accumPromise, func) => {
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
      if (partialState.syncServiceSid) console.log('syncServiceSid: ', partialState.syncServiceSid);
      if (partialState.workflowSid) console.log('workflowSid: ', partialState.workflowSid);
      if (partialState.taskQueueSid) console.log('taskQueueSid: ', partialState.taskQueueSid);
      return Promise.reject(err); // Stop the promise chain rejecting all subsequent ones
    }
  }, Promise.resolve(state));
};

/**
 * Sequence of functions to fetch/create Twilio resources and save the required AWS Parameter Store values.
 */
const createResourcesFunctions = [
  fetchFlexWorkspace,
  fetchFlexProxyService,
  createTaskQueue,
  createWorkflow,
  createSyncService,
  createAPIKey,
  createHrmStaticAPIKey,
  createSurveyTaskQueue,
  createSurveyWorkflow,
  createSurveyTaskChannel,
  createDocsBucket,
  fetchChatService,
  saveWorkspaceToSSM,
  saveWorkflowToSSM,
  saveSyncServiceToSSM,
  saveAPIKeyToSSM,
  saveAPISecretToSSM,
  saveChatServiceToSSM,
  saveFlexProxyToSSM,
  saveSurveyWorkflowToSSM,
  saveHrmStaticKeyToSSM,
  saveDocsBucketToSSM,
  savePostSurveyBotChatUrlToSSM,
  saveOperatingInfoKeyToSSM,
];

export const createTwilioResources = async (input: ScriptsInput) => {
  const initialState: State & DynamicState = {
    ...input,
    docsBucket: getDocsBucketName(),
    postSurveyBotChatUrl: '""',
    operatingInfoKey: 'aselo-dev',
  };
  // partialState will be used to cleanup inconsistent state of partially created resources, in case any step goes wrong
  let partialState = initialState;

  try {
    // finalState will have a valid state only if all promises are resolved succesfully
    const finalState = await createResourcesFunctions.reduce<Promise<State>>(
      async (accumPromise, func) => {
        try {
          const accum = await accumPromise;
          const newState = await func(accum);
          partialState = newState;
          return newState;
        } catch (err) {
          return Promise.reject(err); // Stop the promise chain rejecting all subsequent ones
        }
      },
      Promise.resolve(initialState),
    );

    // Exclude secrets from the final output
    const { apiKeySecret, hrmStaticApiKeySecret, ...output } = finalState;

    logSuccess('Process completed succesfully, the output is: ');
    console.log(output);

    return output;
  } catch (err) {
    logError(err);

    await cleanupPartialResources(partialState);

    // Propagate the error
    throw err;
  }
};
