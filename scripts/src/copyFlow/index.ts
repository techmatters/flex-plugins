import twilio from 'twilio';
import { logSuccess, logError } from '../helpers/log';
import { copyAndPostFlow } from './copyAndPostFlow';

require('dotenv').config();

type AccountCredentials = { AccountSid: string; AuthToken: string };
type TaskrouterValues = {
  Workspace_Flex_Task_Assignment: string;
  Master_Workflow: string;
  Channel_Default: string;
  Channel_Video: string;
  Channel_Voice: string;
  Channel_Chat: string;
  Channel_SMS: string;
  Channel_WhatsApp: string;
  Channel_Facebook: string;
  Channel_Web: string;
};
type AutopilotValues = { Autopilot_Chatbot: string };
type ServerlessValues = {
  Serverless_Service: string;
  Serverless_Env_Prod: string;
  Serverless_Env_Prod_checkBlocklist: string;
  Serverless_Uri_Dev: string;
  Serverless_Uri_Production: string;
};
type CopyFlowInput = AccountCredentials & TaskrouterValues & AutopilotValues & ServerlessValues;

export type SourceInput = CopyFlowInput & { Flow_To_Copy: string };
export type DestinationInput = CopyFlowInput & { Flow_To_Update?: string };

const fetchTaskrouterValues = async (client: twilio.Twilio): Promise<TaskrouterValues> => {
  const workspace = (await client.taskrouter.workspaces.list()).find(
    (e) => e.friendlyName === 'Flex Task Assignment',
  );

  if (!workspace) return Promise.reject(new Error("Couldn't fetch workspace"));

  const masterWorkflow = (await client.taskrouter.workspaces(workspace.sid).workflows.list()).find(
    (e) => e.friendlyName === 'Master Workflow',
  );

  if (!masterWorkflow) return Promise.reject(new Error("Couldn't fetch master workflow"));

  const taskChannels = await client.taskrouter.workspaces(workspace.sid).taskChannels.list();
  const defaultTaskChannel = taskChannels.find((e) => e.uniqueName === 'default');
  const voiceTaskChannel = taskChannels.find((e) => e.uniqueName === 'voice');
  const chatTaskChannel = taskChannels.find((e) => e.uniqueName === 'chat');

  if (!defaultTaskChannel) return Promise.reject(new Error("Couldn't fetch default taskchannel"));
  if (!voiceTaskChannel) return Promise.reject(new Error("Couldn't fetch voice task channel"));
  if (!chatTaskChannel) return Promise.reject(new Error("Couldn't fetch chat task channel"));

  return {
    Workspace_Flex_Task_Assignment: workspace.sid,
    Master_Workflow: masterWorkflow.sid,
    Channel_Default: defaultTaskChannel.sid,
    Channel_Video: defaultTaskChannel.sid,
    Channel_Voice: voiceTaskChannel.sid,
    Channel_Chat: chatTaskChannel.sid,
    Channel_SMS: chatTaskChannel.sid,
    Channel_WhatsApp: chatTaskChannel.sid,
    Channel_Facebook: chatTaskChannel.sid,
    Channel_Web: chatTaskChannel.sid,
  };
};

const fetchAutopilotValues = async (client: twilio.Twilio): Promise<AutopilotValues> => {
  const preSurveyAssistant = await client.autopilot.assistants('demo_chatbot').fetch();
  return { Autopilot_Chatbot: preSurveyAssistant.sid };
};

const fetchServerlessValues = async (client: twilio.Twilio): Promise<ServerlessValues> => {
  const serviceContext = client.serverless.services('serverless');
  const service = await serviceContext.fetch();

  const checkBlockList = (await serviceContext.functions.list()).find(
    (e) => e.friendlyName === '/checkBlockList',
  );

  const environments = await serviceContext.environments.list();

  const devEnv = environments.find((e) => e.domainSuffix === 'dev');
  const productionEnv = environments.find((e) => e.domainSuffix === 'production');

  if (!devEnv) return Promise.reject(new Error("Couldn't fetch dev environment"));
  if (!productionEnv) return Promise.reject(new Error("Couldn't fetch production environment"));
  if (!checkBlockList) return Promise.reject(new Error("Couldn't fetch checkBlockList function"));

  const devURL = `https://${devEnv.domainName}`;
  const productionURL = `https://${productionEnv.domainName}`;

  return {
    Serverless_Service: service.sid,
    Serverless_Env_Prod: productionEnv.sid,
    Serverless_Env_Prod_checkBlocklist: checkBlockList.sid,
    Serverless_Uri_Dev: devURL,
    Serverless_Uri_Production: productionURL,
  };
};

const fetchCopyFlowInput = async (
  accountSid: string,
  authToken: string,
): Promise<CopyFlowInput> => {
  const client = twilio(accountSid, authToken);

  const taskrouterValues = await fetchTaskrouterValues(client);
  const autopilotValues = await fetchAutopilotValues(client);
  const serverlessValues = await fetchServerlessValues(client);

  return {
    AccountSid: accountSid,
    AuthToken: authToken,
    ...taskrouterValues,
    ...autopilotValues,
    ...serverlessValues,
  };
};

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const generateSourceInput = async (
  accountSid: string,
  authToken: string,
  flowToCopy: string,
): Promise<SourceInput> => {
  const copyFlowInput = await fetchCopyFlowInput(accountSid, authToken);
  return { Flow_To_Copy: flowToCopy, ...copyFlowInput };
};

const generateDestinationInput = async (
  accountSid: string,
  authToken: string,
): Promise<DestinationInput> => fetchCopyFlowInput(accountSid, authToken);

async function main() {
  // Validate the input before calling the script
  if (!process.env.TWILIO_ACCOUNT_SID_SOURCE)
    throw new Error('TWILIO_ACCOUNT_SID_SOURCE missing, check env vars.');
  if (!process.env.TWILIO_AUTH_TOKEN_SOURCE)
    throw new Error('TWILIO_AUTH_TOKEN_SOURCE missing, check env vars.');
  if (!process.env.FLOW_TO_COPY) throw new Error('FLOW_TO_COPY missing, check env vars.');
  if (!process.env.TWILIO_ACCOUNT_SID_DESTINATION)
    throw new Error('TWILIO_ACCOUNT_SID_DESTINATION missing, check env vars.');
  if (!process.env.TWILIO_AUTH_TOKEN_DESTINATION)
    throw new Error('TWILIO_AUTH_TOKEN_DESTINATION missing, check env vars.');

  const sourceInput = await generateSourceInput(
    process.env.TWILIO_ACCOUNT_SID_SOURCE,
    process.env.TWILIO_AUTH_TOKEN_SOURCE,
    process.env.FLOW_TO_COPY,
  );

  const destinationInput = await generateDestinationInput(
    process.env.TWILIO_ACCOUNT_SID_DESTINATION,
    process.env.TWILIO_AUTH_TOKEN_DESTINATION,
  );

  await copyAndPostFlow(sourceInput, destinationInput);

  logSuccess(
    `Flow ${process.env.FLOW_TO_COPY} succesfully copied from account ${process.env.TWILIO_ACCOUNT_SID_SOURCE} to ${process.env.TWILIO_AUTH_TOKEN_DESTINATION}. Publish and test!`,
  );
}

main().catch((err) => {
  logError('Script interrupted due to error.');
  logError(err);
  process.exitCode = 1;
});
