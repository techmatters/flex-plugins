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
 *  DATADOG_APP_ID=<Datadog Application Id>
 *  DATADOG_ACCESS_TOKEN=<Datadog Access Token>
 */
import twilio from 'twilio';
import { KeyInstance } from 'twilio/lib/rest/api/v2010/account/key';
import { ServiceInstance } from 'twilio/lib/rest/sync/v1/service';
import { WorkflowInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/workflow';
import { TaskQueueInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/taskQueue';
import { TaskChannelInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/taskChannel';
import { saveSSMParameter } from '../helpers/ssm';
import { createS3Bucket } from '../helpers/s3';
import { logError, logSuccess, logWarning } from '../helpers/log';
import { ScriptsInput } from './types';
import { removeResource, removeWorkspaceResource } from './removeTwilioResource';

const PRE_CHATBOT_UNIQUE_NAME = 'demo_chatbot';
const POST_CHATBOT_UNIQUE_NAME = 'post_survey_bot';

const WORKFLOW_FRIENDLY_NAME = 'Master Workflow';
const SYNC_SERVICE_FRIENDLY_NAME = 'Shared State Service';
const HRM_API_KEY_FRIENDLY_NAME = 'hrm-static-key';

const SURVEY_RESOURCE_FRIENDLY_NAME = 'Survey';

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
  dataDogAppId?: string;
  dataDogAccessToken?: string;
  preSurveyBotSid?: string;
  postSurveyBotSid?: string;
};

type State = ScriptsInput & DynamicState;

/**
 * SSM (AWS Parameter Store) related functions
 */
type GetSSMStringFunction = (state: State) => string;
type GetSSMStringFunctions = { [k in keyof Required<DynamicState>]: GetSSMStringFunction };

const getSSMName = (key: string) => (state: State) =>
  `${state.shortEnvironment}_TWILIO_${state.shortHelpline}_${key}`;

const getSSMNameForDataDogKey = (key: string) => (state: State) =>
  `${state.shortEnvironment}_DATADOG_${state.shortHelpline}_${key}`;

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
  dataDogAppId: getSSMNameForDataDogKey('APP_ID'),
  dataDogAccessToken: getSSMNameForDataDogKey('ACCESS_TOKEN'),
  taskQueueSid: throwWithKey('taskQueueSid'),
  surveyTaskChannelSid: throwWithKey('surveyTaskChannelSid'),
  hrmStaticApiKeySid: throwWithKey('hrmStaticApiKeySid'),
  surveyTaskQueueSid: throwWithKey('surveyTaskQueueSid'),
  preSurveyBotSid: throwWithKey('preSurveyBotSid'),
  postSurveyBotSid: throwWithKey('postSurveyBotSid'),
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
  dataDogAppId: getSSMDescription('Datadog - Application ID'),
  dataDogAccessToken: getSSMDescription('Datadog - Access Token'),
  taskQueueSid: throwWithKey('taskQueueSid'),
  surveyTaskChannelSid: throwWithKey('surveyTaskChannelSid'),
  hrmStaticApiKeySid: throwWithKey('hrmStaticApiKeySid'),
  surveyTaskQueueSid: throwWithKey('surveyTaskQueueSid'),
  preSurveyBotSid: throwWithKey('preSurveyBotSid'),
  postSurveyBotSid: throwWithKey('postSurveyBotSid'),
};

const getSSMTags = (state: State): AWS.SSM.TagList => [
  { Key: 'Helpline', Value: state.helpline },
  { Key: 'Environment', Value: state.environment },
];

const saveStateKeyToSSM = (key: keyof DynamicState) => async (state: State) => {
  const value = state[key];
  if (!value) throw new Error(`${key} key missing in state while trying to save SSM parameter.`);

  const name = getSSMNameFunction[key](state);
  const description = getSSMDescriptionFunction[key](state);
  const tags = getSSMTags(state);

  try {
    await saveSSMParameter(name, value, description, tags);

    logSuccess(`AWS Parameter Store: Successfully saved ${name}`);
  } catch (error) {
    if ((<any>error).code === 'ParameterAlreadyExists') {
      logWarning(`Parameter ${key} already exists, moving on.`);
    } else throw error;
  }
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
const saveDataDogAppIdToSSM = saveStateKeyToSSM('dataDogAppId');
const saveDataDogAccessTokenToSSM = saveStateKeyToSSM('dataDogAccessToken');

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

  logSuccess(`Twilio resource: Successfully created task queue ${q.sid}`);
  return { ...state, taskQueueSid: q.sid };
};

const createWorkflow = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createWorkflow');
  if (!state.taskQueueSid) throw new Error('state.taskQueueSid missing at createWorkflow');

  const workflow = await client.taskrouter.workspaces(state.workspaceSid).workflows.create({
    friendlyName: WORKFLOW_FRIENDLY_NAME,
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

  logSuccess(`Twilio resource: Successfully created workflow ${workflow.sid}`);
  return { ...state, workflowSid: workflow.sid };
};

const createSyncService = async (state: State) => {
  const service = await client.sync.services.create({
    friendlyName: SYNC_SERVICE_FRIENDLY_NAME,
  });

  logSuccess(`Twilio resource: Successfully created Sync service ${service.sid}`);
  return { ...state, syncServiceSid: service.sid };
};

const createAPIKey = async (state: State) => {
  const key = await client.newKeys.create({ friendlyName: SYNC_SERVICE_FRIENDLY_NAME });

  logSuccess(`Twilio resource: Successfully created API key ${key.sid}`);
  return { ...state, apiKeySid: key.sid, apiKeySecret: key.secret };
};

const createHrmStaticAPIKey = async (state: State) => {
  const key = await client.newKeys.create({ friendlyName: 'hrm-static-key' });

  logSuccess(`Twilio resource: Successfully created HRM static API key ${key.sid}`);
  return { ...state, hrmStaticApiKeySid: key.sid, hrmStaticApiKeySecret: key.secret };
};

const fetchChatService = async (state: State) => {
  const ss = await client.chat.services.list();
  const service = ss.find((e) => e.friendlyName === 'Flex Chat Service');

  if (!service)
    throw new Error(`Flex Chat Service not found in account ${process.env.TWILIO_ACCOUNT_SID}`);
  logSuccess('Found chat service');
  return { ...state, chatServiceSid: service.sid };
};

const createSurveyTaskQueue = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createSurveyTaskQueue');

  const q = await client.taskrouter.workspaces(state.workspaceSid).taskQueues.create({
    friendlyName: SURVEY_RESOURCE_FRIENDLY_NAME,
    targetWorkers: '1==0',
  });

  logSuccess(`Twilio resource: Successfully created survey task queue ${q.sid}`);
  return { ...state, surveyTaskQueueSid: q.sid };
};

const createSurveyWorkflow = async (state: State) => {
  if (!state.workspaceSid) throw new Error('state.workspaceSid missing at createSurveyWorkflow');
  if (!state.surveyTaskQueueSid)
    throw new Error('state.surveyTaskQueueSid missing at createSurveyWorkflow');

  const workflow = await client.taskrouter.workspaces(state.workspaceSid).workflows.create({
    friendlyName: SURVEY_RESOURCE_FRIENDLY_NAME,
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
    friendlyName: SURVEY_RESOURCE_FRIENDLY_NAME,
  });

  logSuccess(`Twilio resource: Succesfully created survey task channel ${taskChannel.sid}`);
  return { ...state, surveyTaskChannelSid: taskChannel.sid };
};

const createPreSurveyBot = async (state: State): Promise<State> => {
  try {
    const preSurveyBot = await client.autopilot.assistants.create({
      uniqueName: PRE_CHATBOT_UNIQUE_NAME,
      friendlyName: 'A bot that collects a pre-survey',
    });

    logSuccess(`Twilio resource: Succesfully created pre survey chatbot ${preSurveyBot.sid}`);
    return { ...state, preSurveyBotSid: preSurveyBot.sid };
  } catch (error) {
    if ((<Error>error).message?.includes(`UniqueName ${PRE_CHATBOT_UNIQUE_NAME} already exists`)) {
      logWarning(`${PRE_CHATBOT_UNIQUE_NAME} already created, attempting to fetch details`);
      const existingSid = (await client.autopilot.assistants(PRE_CHATBOT_UNIQUE_NAME).fetch())?.sid;
      if (!existingSid) {
        throw new Error(
          `${PRE_CHATBOT_UNIQUE_NAME} not found despite create api claiming it already exists. Check the Twilio GUI to see if a bot with this name is scheduled for deletion.`,
        );
      }
      return {
        ...state,
        preSurveyBotSid: existingSid,
      };
    }
    throw error;
  }
};

const createPostSurveyBot = async (state: State): Promise<State> => {
  let sid: string;
  try {
    const postSurveyBot = await client.autopilot.assistants.create({
      uniqueName: POST_CHATBOT_UNIQUE_NAME,
      friendlyName: 'A bot that collects a post-survey',
    });
    sid = postSurveyBot.sid;

    logSuccess(`Twilio resource: Successfully created post survey chatbot ${postSurveyBot.sid}`);
  } catch (error) {
    if ((<Error>error).message?.includes(`UniqueName ${POST_CHATBOT_UNIQUE_NAME} already exists`)) {
      logWarning(`${POST_CHATBOT_UNIQUE_NAME} already created`);
      sid = (await client.autopilot.assistants(POST_CHATBOT_UNIQUE_NAME).fetch())?.sid;
      if (!sid) {
        throw new Error(
          `${POST_CHATBOT_UNIQUE_NAME} not found despite create api claiming it already exists. Check the Twilio GUI to see if a bot with this name is scheduled for deletion.`,
        );
      }
      logSuccess(`Twilio resource: Successfully located existing post survey chatbot ${sid}`);
    } else {
      throw error;
    }
  }
  const postSurveyBotChatUrl = `https://channels.autopilot.twilio.com/v1/${process.env.TWILIO_ACCOUNT_SID}/${sid}/twilio-chat`;
  return { ...state, postSurveyBotSid: sid, postSurveyBotChatUrl };
};

export const getDocsBucketName = (shortHelpline: string, environment: string): string =>
  `tl-aselo-docs-${shortHelpline.toLowerCase()}-${environment.toLowerCase()}`;

const createDocsBucket = async (state: State): Promise<State> => {
  const bucketName = getDocsBucketName(state.shortHelpline, state.environment);
  await createS3Bucket(bucketName);

  logSuccess(`AWS S3 Bucket: Succesfully created ${bucketName}`);
  return { ...state, docsBucket: bucketName };
};
/**
 * Cleanup functions
 */
const removeAPIKey = async (state: State) => {
  const { apiKeySid, apiKeySecret, ...rest } = state;
  await removeResource<KeyInstance>('API key', SYNC_SERVICE_FRIENDLY_NAME, () => client.keys);
  return rest;
};

const removeHrmStaticAPIKey = async (state: State) => {
  const { hrmStaticApiKeySid, hrmStaticApiKeySecret, ...rest } = state;
  await removeResource<KeyInstance>(
    'HRM static API key',
    HRM_API_KEY_FRIENDLY_NAME,
    () => client.keys,
  );
  return rest;
};

const removeSyncService = async (state: State) => {
  const { syncServiceSid, ...rest } = state;
  await removeResource<ServiceInstance>(
    'Sync service',
    SYNC_SERVICE_FRIENDLY_NAME,
    () => client.sync.services,
  );
  return rest;
};

const removeWorkflow = async (state: State) => {
  const { workflowSid, ...rest } = state;
  await removeWorkspaceResource<WorkflowInstance>(
    client,
    state.workspaceSid,
    'workflow',
    WORKFLOW_FRIENDLY_NAME,
    (workspace) => workspace.workflows,
  );
  return rest;
};

const removeTaskQueue = async (state: State) => {
  const { taskQueueSid, ...rest } = state;

  await removeWorkspaceResource<TaskQueueInstance>(
    client,
    state.workspaceSid,
    'task queue',
    state.helpline,
    (workspace) => workspace.taskQueues,
  );

  return rest;
};

const removeSurveyTaskChannel = async (state: State) => {
  const { surveyTaskChannelSid, ...rest } = state;

  await removeWorkspaceResource<TaskChannelInstance>(
    client,
    state.workspaceSid,
    'survey task channel',
    SURVEY_RESOURCE_FRIENDLY_NAME,
    (workspace) => workspace.taskChannels,
  );

  return rest;
};

const removeSurveyWorkflow = async (state: State) => {
  const { surveyWorkflowSid, ...rest } = state;

  await removeWorkspaceResource<WorkflowInstance>(
    client,
    state.workspaceSid,
    'survey workflow',
    SURVEY_RESOURCE_FRIENDLY_NAME,
    (workspace) => workspace.workflows,
  );

  return rest;
};

const removeSurveyTaskQueue = async (state: State) => {
  const { surveyTaskQueueSid, ...rest } = state;

  await removeWorkspaceResource<TaskQueueInstance>(
    client,
    state.workspaceSid,
    'survey task queue',
    SURVEY_RESOURCE_FRIENDLY_NAME,
    (workspace) => workspace.taskQueues,
  );

  return rest;
};

const removePreSurveyBot = async (state: State) => {
  const { preSurveyBotSid, ...rest } = state;

  logWarning(
    `NOT deleting ${PRE_CHATBOT_UNIQUE_NAME}, as this takes 30 days to take effect. If you wish to remove the bot, use the twilio command line or GUI (${
      preSurveyBotSid
        ? `bot was created with sid:${preSurveyBotSid}`
        : 'no bot was created this run anyway'
    }).`,
  );

  return rest;
};

const removePostSurveyBot = async (state: State) => {
  const { postSurveyBotSid, ...rest } = state;
  logWarning(
    `NOT deleting ${POST_CHATBOT_UNIQUE_NAME}, as this takes 30 days to take effect. If you wish to remove the bot, use the twilio command line or GUI (${
      postSurveyBotSid
        ? `bot was created with sid:${postSurveyBotSid}`
        : 'no bot was created this run anyway'
    }).`,
  );
  return rest;
};

const cleanupPartialResources = async (state: State): Promise<void> => {
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
    removePreSurveyBot,
    removePostSurveyBot,
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
  createPreSurveyBot,
  createPostSurveyBot,
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
  saveDataDogAppIdToSSM,
  saveDataDogAccessTokenToSSM,
];

export const createTwilioResources = async (input: ScriptsInput) => {
  const initialState: State = {
    ...input,
    // Placeholder variables. Maybe move them somewhere else, Gian?
    operatingInfoKey: 'aselo-dev',
    dataDogAppId: process.env.DATADOG_APP_ID as string,
    dataDogAccessToken: process.env.DATADOG_ACCESS_TOKEN as string,
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
