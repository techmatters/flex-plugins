/**
 * Copyright (C) 2021-2023 Technology Matters
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
import { ChannelInstance } from 'twilio/lib/rest/chat/v2/service/channel';
import { ConversationInstance } from 'twilio/lib/rest/conversations/v1/conversation';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import type { MemberInstance } from 'twilio/lib/rest/ipMessaging/v2/service/channel/member';
import { LexClient, LexMemory } from './lexClient';
import { PostSurveyData, buildDataObject } from './hrmDataManipulation';
import { OneToManyConfigSpec, buildSurveyInsightsData } from './insightsService';
import { isErr, newErr, newOk, Result } from '../Result';
import { Twilio } from 'twilio';
import { postToInternalHrmEndpoint } from '../hrm/internalHrmRequest';
import { getFormDefinitionUrl, loadConfigJson } from '../formDefinitionsCache';
import { ROUTE_PREFIX } from '../router';

const triggerTypes = ['withUserMessage', 'withNextMessage'] as const;
export type TriggerTypes = (typeof triggerTypes)[number];

const releaseTypes = ['triggerStudioFlow', 'postSurveyComplete'] as const;
export type ReleaseTypes = (typeof releaseTypes)[number];

export type CapturedChannelAttributes = {
  enableLexV2: boolean;
  userId: string;
  environment: string;
  helplineCode: string;
  botLanguage: string;
  botLanguageV1: string;
  botSuffix: string;
  controlTaskSid: string;
  releaseType: ReleaseTypes;
  studioFlowSid?: string;
  memoryAttribute?: string;
  releaseFlag?: string;
  chatbotCallbackWebhookSid: string;
  isConversation: boolean;
  channelType: string;
};

export const isChatCaptureControlTask = (taskAttributes: {
  isChatCaptureControl?: boolean;
}) => Boolean(taskAttributes.isChatCaptureControl);

/**
 * The following sections captures all the required logic to "handle channel capture" (starting a capture on a chat channel)
 * Capture handlers wrap the logic needed for capturing a channel: updating it's attributes, creating a control task, triggering a chatbot, etc
 */

const getServiceUserIdentityOrParticipantId = async (
  channel: ChannelInstance | ConversationInstance,
  channelAttributes: { [k: string]: string },
): Promise<MemberInstance['identity']> => {
  if (channel instanceof ConversationInstance) {
    if (!channelAttributes.participantSid) {
      const participants = await channel.participants().list();
      const sortByDateCreated = (a: any, b: any) =>
        a.dateCreated > b.dateCreated ? 1 : -1;
      const firstParticipant = participants.sort(sortByDateCreated)[0];
      return firstParticipant.sid;
    }
    return channelAttributes.participantSid;
  }

  // If there's no service user, find which is the first one and add it channel attributes (only occurs on first capture)
  if (!channelAttributes.serviceUserIdentity) {
    const members = await channel.members().list();
    const firstMember = members.sort((a, b) =>
      a.dateCreated > b.dateCreated ? 1 : -1,
    )[0];
    return firstMember.identity;
  }

  return channelAttributes.serviceUserIdentity;
};

const updateChannelWithCapture = async (
  channel: ChannelInstance | ConversationInstance,
  attributes: CapturedChannelAttributes,
) => {
  const {
    enableLexV2,
    userId,
    environment,
    helplineCode,
    botLanguage,
    botLanguageV1,
    botSuffix,
    controlTaskSid,
    chatbotCallbackWebhookSid,
    releaseType,
    studioFlowSid,
    memoryAttribute,
    releaseFlag,
    isConversation,
    channelType,
  } = attributes;

  const channelAttributes = JSON.parse(channel.attributes);

  const userIdentityOrParticipantId = await getServiceUserIdentityOrParticipantId(
    channel,
    channelAttributes,
  );

  const newAttributes = {
    attributes: JSON.stringify({
      ...channelAttributes,
      channel_type: channelType,
      serviceUserIdentity: userIdentityOrParticipantId,
      participantSid: userIdentityOrParticipantId,
      // All of this can be passed as url params to the webhook instead
      capturedChannelAttributes: {
        enableLexV2,
        userId,
        environment,
        helplineCode,
        botLanguage,
        botLanguageV1,
        botSuffix,
        controlTaskSid,
        chatbotCallbackWebhookSid,
        releaseType,
        isConversation,
        ...(studioFlowSid && { studioFlowSid }),
        ...(releaseFlag && { releaseFlag }),
        ...(memoryAttribute && { memoryAttribute }),
      },
    }),
  };

  if (isConversation) {
    return (channel as ConversationInstance).update(newAttributes);
  }

  return (channel as ChannelInstance).update(newAttributes);
};

type CaptureChannelOptions = {
  accountSid: string;
  enableLexV2: boolean;
  environment: string;
  helplineCode: string;
  botLanguage: string;
  botLanguageV1: string;
  botSuffix: string;
  inputText: string;
  userId: string;
  controlTaskSid: string;
  releaseType: ReleaseTypes;
  studioFlowSid?: string; // (in Studio Flow, flow.flow_sid) The Studio Flow sid. Needed to trigger an API type execution once the channel is released.
  memoryAttribute?: string; // where in the task attributes we want to save the bot's memory (allows compatibility for multiple bots)
  releaseFlag?: string; // the flag we want to set true when the channel is released
  isConversation: boolean;
  channelType: string;
  webhookBaseUrl: string;
};

const getChatBotCallbackURL = ({
  accountSid,
  webhookBaseUrl,
}: {
  accountSid: string;
  webhookBaseUrl: string;
}) => `${webhookBaseUrl}${ROUTE_PREFIX}${accountSid}/channelCapture/chatbotCallback`;

/**
 * Trigger a chatbot execution by redirecting a message that already exists in the channel (used to trigger executions from service user messages)
 */
const triggerWithUserMessage = async (
  channelOrConversation: ChannelInstance | ConversationInstance,
  {
    accountSid,
    enableLexV2,
    userId,
    environment,
    helplineCode,
    botSuffix,
    botLanguage,
    botLanguageV1,
    inputText,
    controlTaskSid,
    releaseType,
    studioFlowSid,
    releaseFlag,
    memoryAttribute,
    isConversation,
    channelType,
    webhookBaseUrl,
  }: CaptureChannelOptions,
) => {
  // trigger Lex first, in order to reduce the time between the creating the webhook and sending the message
  const lexResult = await LexClient.postText({
    enableLexV2,
    postTextParams: {
      botLanguage,
      botLanguageV1,
      botSuffix,
      environment,
      helplineCode,
      inputText,
      sessionId: userId,
    },
  });

  let webhook;
  if (isConversation) {
    webhook = await (channelOrConversation as ConversationInstance).webhooks().create({
      target: 'webhook',
      'configuration.filters': ['onMessageAdded'],
      'configuration.method': 'POST',
      'configuration.url': getChatBotCallbackURL({ accountSid, webhookBaseUrl }),
    });
  } else {
    webhook = await (channelOrConversation as ChannelInstance).webhooks().create({
      type: 'webhook',
      'configuration.filters': ['onMessageSent'],
      'configuration.method': 'POST',
      'configuration.url': getChatBotCallbackURL({ accountSid, webhookBaseUrl }),
    });
  }

  await updateChannelWithCapture(channelOrConversation, {
    enableLexV2,
    userId,
    environment,
    helplineCode,
    botLanguage,
    botLanguageV1,
    botSuffix,
    controlTaskSid,
    releaseType,
    studioFlowSid,
    releaseFlag,
    memoryAttribute,
    chatbotCallbackWebhookSid: webhook.sid,
    isConversation,
    channelType,
  });

  // Bubble exception after the channel is updated because capture attributes are needed for the cleanup
  if (isErr(lexResult)) {
    console.error(
      `triggerWithUserMessage - lexResult error ${lexResult.message}`,
      lexResult.error,
    );
    throw lexResult.error;
  }

  const { lexResponse, lexVersion } = lexResult.data;

  let messages: string[] = [];
  if (lexVersion === 'v1') {
    messages.push(lexResponse.message || '');
  } else if (lexVersion === 'v2') {
    if (!lexResponse.messages) {
      throw new Error('Lex response does not includes messages');
    }
    messages = messages.concat(lexResponse.messages.map(m => m.content || ''));
  }

  for (const message of messages) {
    if (isConversation) {
      // eslint-disable-next-line no-await-in-loop
      await (channelOrConversation as ConversationInstance).messages().create({
        body: message,
        author: 'Bot',
        xTwilioWebhookEnabled: 'true',
      });
    } else {
      // eslint-disable-next-line no-await-in-loop
      await (channelOrConversation as ChannelInstance).messages().create({
        body: message,
        from: 'Bot',
        xTwilioWebhookEnabled: 'true',
      });
    }
  }
};

/**
 * Send a message to the channel and add the chatbot after, so it will get triggered on the next response from the service user (used to trigger executions from system, like post surveys)
 */
const triggerWithNextMessage = async (
  channelOrConversation: ChannelInstance | ConversationInstance,
  {
    accountSid,
    enableLexV2,
    userId,
    environment,
    helplineCode,
    botLanguage,
    botLanguageV1,
    botSuffix,
    inputText,
    controlTaskSid,
    releaseType,
    studioFlowSid,
    releaseFlag,
    memoryAttribute,
    isConversation,
    channelType,
    webhookBaseUrl,
  }: CaptureChannelOptions,
) => {
  if (isConversation) {
    await (channelOrConversation as ConversationInstance).messages().create({
      body: inputText,
      xTwilioWebhookEnabled: 'true',
    });
  } else {
    await (channelOrConversation as ChannelInstance).messages().create({
      body: inputText,
      xTwilioWebhookEnabled: 'true',
    });
  }

  let webhook;
  if (isConversation) {
    webhook = await (channelOrConversation as ConversationInstance).webhooks().create({
      target: 'webhook',
      'configuration.filters': ['onMessageAdded'],
      'configuration.method': 'POST',
      'configuration.url': getChatBotCallbackURL({ accountSid, webhookBaseUrl }),
    });
  } else {
    webhook = await (channelOrConversation as ChannelInstance).webhooks().create({
      type: 'webhook',
      'configuration.filters': ['onMessageSent'],
      'configuration.method': 'POST',
      'configuration.url': getChatBotCallbackURL({ accountSid, webhookBaseUrl }),
    });
  }

  // const updated =
  await updateChannelWithCapture(channelOrConversation, {
    enableLexV2,
    userId,
    environment,
    helplineCode,
    botLanguage,
    botLanguageV1,
    botSuffix,
    controlTaskSid,
    releaseType,
    studioFlowSid,
    releaseFlag,
    memoryAttribute,
    chatbotCallbackWebhookSid: webhook.sid,
    isConversation,
    channelType,
  });
};

export type HandleChannelCaptureParams = (
  | {
      channelSid: string;
      conversationSid?: string;
    }
  | { conversationSid: string; channelSid?: string }
) & {
  accountSid: string;
  environment: string;
  message: string; // The triggering message (in Studio Flow, trigger.message.Body)
  language: string; // (in Studio Flow, {{trigger.message.ChannelAttributes.pre_engagement_data.language | default: 'en-US'}} )
  botSuffix: string;
  triggerType: TriggerTypes;
  releaseType: ReleaseTypes;
  studioFlowSid?: string; // The Studio Flow sid. Needed to trigger an API type execution once the channel is released. (in Studio Flow, flow.flow_sid)
  memoryAttribute?: string; // Where in the channel attributes we want to save the bot's memory (allows usage of multiple bots in same channel)
  releaseFlag?: string; // The flag we want to set true in the channel attributes when the channel is released
  additionControlTaskAttributes?: string; // Optional attributes to include in the control task, in the string representation of a JSON
  controlTaskTTL?: number;
  channelType: string;
  twilioWorkspaceSid: string;
  chatServiceSid: string;
  surveyWorkflowSid: string;
  helplineCode: string;
  webhookBaseUrl: string;
};

const validateHandleChannelCaptureParams = (
  params: Partial<HandleChannelCaptureParams>,
) => {
  if (!params.channelSid && !params.conversationSid) {
    const message = 'No channelSid or conversationSid provided';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.message) {
    const message = 'Missing message';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.triggerType) {
    const message = 'Missing triggerType';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!triggerTypes.includes(params.triggerType)) {
    const message = `triggerType must be one of: ${triggerTypes.join(', ')}`;
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.releaseType) {
    const message = 'Missing releaseType';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!releaseTypes.includes(params.releaseType)) {
    const message = `releaseType must be one of: ${releaseTypes.join(', ')}`;
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (params.releaseType === 'triggerStudioFlow' && !params.studioFlowSid) {
    const message = 'studioFlowSid must provided when releaseType is triggerStudioFlow';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.botSuffix) {
    const message = 'Missing botSuffix';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.language) {
    const message = 'Missing language';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.language) {
    const message = 'Missing language';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  // environment: string;
  if (!params.environment) {
    const message = 'Missing environment';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.channelType) {
    const message = 'Missing channelType';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.twilioWorkspaceSid) {
    const message = 'Missing twilioWorkspaceSid';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.chatServiceSid) {
    const message = 'Missing chatServiceSid';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.surveyWorkflowSid) {
    const message = 'Missing surveyWorkflowSid';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.helplineCode) {
    const message = 'Missing helplineCode';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }
  if (!params.webhookBaseUrl) {
    const message = 'Missing webhookBaseUrl';
    return newErr({ message, error: 'InvalidParametersError' } as const);
  }

  return newOk({});
};

export const handleChannelCapture = async (
  twilioClient: Twilio,
  params: HandleChannelCaptureParams,
): Promise<Result<string | Error, {}>> => {
  try {
    console.info('handleChannelCapture', params);
    const validationResult = validateHandleChannelCaptureParams(params);
    if (isErr(validationResult)) {
      console.error('Invalid params', validationResult.error);
      return validationResult;
    }

    const {
      accountSid,
      chatServiceSid,
      helplineCode,
      surveyWorkflowSid,
      twilioWorkspaceSid,
      environment,
      channelSid,
      conversationSid,
      message,
      language,
      botSuffix,
      triggerType,
      releaseType,
      studioFlowSid,
      memoryAttribute,
      releaseFlag,
      additionControlTaskAttributes,
      controlTaskTTL,
      channelType,
      webhookBaseUrl,
    } = params;
    const parsedAdditionalControlTaskAttributes = additionControlTaskAttributes
      ? JSON.parse(additionControlTaskAttributes)
      : {};
    let controlTask: TaskInstance;
    if (conversationSid) {
      const conversationContext = await twilioClient.conversations.v1
        .conversations(conversationSid)
        .fetch();
      // Create control task to prevent channel going stale
      controlTask = await twilioClient.taskrouter.v1
        .workspaces(twilioWorkspaceSid)
        .tasks.create({
          workflowSid: surveyWorkflowSid,
          taskChannel: 'survey',
          attributes: JSON.stringify({
            isChatCaptureControl: true,
            conversationSid,
            ...parsedAdditionalControlTaskAttributes,
          }),
          timeout: controlTaskTTL || 45600, // 720 minutes or 12 hours
        });
      const webhooks = await conversationContext.webhooks().list();
      for (const webhook of webhooks) {
        if (webhook.target === 'studio') {
          // eslint-disable-next-line no-await-in-loop
          await webhook.remove();
        }
      }
    } else {
      [, controlTask] = await Promise.all([
        // Remove the studio trigger webhooks to prevent this channel to trigger subsequent Studio flows executions
        twilioClient.chat.v2
          .services(chatServiceSid)
          .channels(channelSid!)
          .webhooks.list()
          .then(webhooks =>
            webhooks.map(async w => {
              if (w.type === 'studio') {
                await w.remove();
              }
            }),
          ),

        // Create control task to prevent channel going stale
        twilioClient.taskrouter.v1.workspaces(twilioWorkspaceSid).tasks.create({
          workflowSid: surveyWorkflowSid,
          taskChannel: 'survey',
          attributes: JSON.stringify({
            isChatCaptureControl: true,
            channelSid,
            conversationSid,
            ...parsedAdditionalControlTaskAttributes,
          }),
          timeout: controlTaskTTL || 45600, // 720 minutes or 12 hours
        }),
      ]);
    }

    let languageSanitized = language.replace('-', '_'); // Lex doesn't accept '-'

    // This is used to match all digits (0-9) and replace them with no space since Lex doesn't accept numbers
    if (/\d/.test(languageSanitized)) {
      languageSanitized = languageSanitized.replace(/\d/g, '');
    }

    const channelOrConversation: ChannelInstance | ConversationInstance = conversationSid
      ? await twilioClient.conversations.v1.conversations(conversationSid).fetch()
      : await twilioClient.chat.v2.services(chatServiceSid).channels(channelSid!).fetch();

    const serviceConfig = await twilioClient.flexApi.v1.configuration.get().fetch();
    const enableLexV2 = Boolean(serviceConfig.attributes.feature_flags.enable_lex_v2);

    const options: CaptureChannelOptions = {
      accountSid,
      enableLexV2,
      environment: environment.toLowerCase(),
      helplineCode: helplineCode.toLowerCase(),
      botSuffix,
      botLanguage: languageSanitized.toLowerCase(),
      botLanguageV1: languageSanitized,
      releaseType,
      studioFlowSid,
      memoryAttribute,
      releaseFlag,
      inputText: message,
      userId: channelOrConversation.sid,
      controlTaskSid: controlTask.sid,
      isConversation: Boolean(conversationSid),
      channelType,
      webhookBaseUrl,
    };
    console.info(
      `Triggering chatbot, triggerType: ${triggerType}, channel / conversation: ${channelOrConversation.sid}`,
    );
    if (triggerType === 'withUserMessage') {
      await triggerWithUserMessage(channelOrConversation, options);
    }

    if (triggerType === 'withNextMessage') {
      await triggerWithNextMessage(channelOrConversation, options);
    }

    return newOk({});
  } catch (error) {
    console.error('handleChannelCapture', error);
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
};

/**
 * The following sections captures all the required logic to "handle channel release" (releasing a chat channel that was captured)
 * Release handlers wrap the logic needed for releasing a channel: updating it's attributes, removing the control task, redirecting a channel into a Studio Flow, saving data gathered by the bot in HRM/insights, etc
 */

const createStudioFlowTrigger = async (
  channelOrConversation: ChannelInstance | ConversationInstance,
  capturedChannelAttributes: CapturedChannelAttributes,
  controlTask: TaskInstance,
) => {
  // Canceling tasks triggers janitor (see functions/taskrouterListeners/janitorListener.private.ts), so we remove this one since is not needed
  await controlTask.remove();
  const { isConversation } = capturedChannelAttributes;

  if (isConversation) {
    return (channelOrConversation as ConversationInstance).webhooks().create({
      target: 'studio',
      'configuration.flowSid': capturedChannelAttributes.studioFlowSid,
    });
  }

  return (channelOrConversation as ChannelInstance).webhooks().create({
    type: 'studio',
    'configuration.flowSid': capturedChannelAttributes.studioFlowSid,
  });
};

type PostSurveyBody = {
  contactTaskId: string;
  taskId: string;
  data: PostSurveyData;
};

const saveSurveyInInsights = async (
  postSurveyConfigJson: OneToManyConfigSpec[],
  memory: LexMemory,
  controlTask: TaskInstance,
  controlTaskAttributes: any,
) => {
  const finalAttributes = buildSurveyInsightsData(
    postSurveyConfigJson,
    controlTaskAttributes,
    memory,
  );

  await controlTask.update({ attributes: JSON.stringify(finalAttributes) });
};

const saveSurveyInHRM = async ({
  accountSid,
  controlTask,
  controlTaskAttributes,
  hrmApiVersion,
  memory,
  postSurveyConfigSpecs,
}: {
  postSurveyConfigSpecs: OneToManyConfigSpec[];
  memory: LexMemory;
  controlTask: TaskInstance;
  controlTaskAttributes: any;
  accountSid: string;
  hrmApiVersion: string;
}) => {
  const data = buildDataObject(postSurveyConfigSpecs, memory);

  const body: PostSurveyBody = {
    contactTaskId: controlTaskAttributes.contactTaskId,
    taskId: controlTask.sid,
    data,
  };

  await postToInternalHrmEndpoint(accountSid, hrmApiVersion, '/postSurveys', body);
};

const handlePostSurveyComplete = async ({
  accountSid,
  controlTask,
  memory,
  twilioClient,
}: {
  accountSid: string;
  twilioClient: Twilio;
  memory: LexMemory;
  controlTask: TaskInstance;
}) => {
  const serviceConfig = await twilioClient.flexApi.v1.configuration.get().fetch();

  const {
    definitionVersion,
    hrm_api_version: hrmApiVersion,
    form_definitions_version_url: configFormDefinitionsVersionUrl,
    assets_bucket_url: assetsBucketUrl,
  } = serviceConfig.attributes;
  const formDefinitionsVersionUrl =
    configFormDefinitionsVersionUrl ||
    getFormDefinitionUrl({ assetsBucketUrl, definitionVersion });
  const postSurveyConfigSpecs = await loadConfigJson(
    formDefinitionsVersionUrl,
    'PostSurvey',
  );

  if (definitionVersion && postSurveyConfigSpecs) {
    const controlTaskAttributes = JSON.parse(controlTask.attributes);

    // parallel execution to save survey collected data in insights and hrm
    await Promise.all([
      saveSurveyInInsights(
        postSurveyConfigSpecs,
        memory,
        controlTask,
        controlTaskAttributes,
      ),
      saveSurveyInHRM({
        postSurveyConfigSpecs,
        memory,
        controlTask,
        controlTaskAttributes,
        accountSid,
        hrmApiVersion,
      }),
    ]);

    // As survey tasks will never be assigned to a worker, they'll be kept in pending state. A pending can't transition to completed state, so we cancel them here to raise a task.canceled taskrouter event (see functions/taskrouterListeners/janitorListener.private.ts)
    // This needs to be the last step so the new task attributes from saveSurveyInInsights make it to insights
    await controlTask.update({ assignmentStatus: 'canceled' });
  } else {
    const errorMEssage =
      // eslint-disable-next-line no-nested-ternary
      !definitionVersion
        ? 'Current definitionVersion is missing in service configuration.'
        : !postSurveyConfigSpecs
          ? `No postSurveyConfigJson found for definitionVersion ${definitionVersion}.`
          : `postSurveyConfigJson for definitionVersion ${definitionVersion} is not a Twilio asset as expected`; // This should removed when if we move definition versions to an external source.
    console.info(`Error accessing to the post survey form definitions: ${errorMEssage}`);
  }
};

export const handleChannelRelease = async ({
  accountSid,
  capturedChannelAttributes,
  channelOrConversation,
  memory,
  twilioClient,
  twilioWorkspaceSid,
}: {
  accountSid: string;
  twilioClient: Twilio;
  channelOrConversation: ChannelInstance | ConversationInstance;
  capturedChannelAttributes: CapturedChannelAttributes;
  memory: LexMemory;
  twilioWorkspaceSid: string;
}) => {
  try {
    // get the control task
    const controlTask = await twilioClient.taskrouter.v1
      .workspaces(twilioWorkspaceSid)
      .tasks(capturedChannelAttributes.controlTaskSid)
      .fetch();

    if (capturedChannelAttributes.releaseType === 'triggerStudioFlow') {
      await createStudioFlowTrigger(
        channelOrConversation,
        capturedChannelAttributes,
        controlTask,
      );
    }

    if (capturedChannelAttributes.releaseType === 'postSurveyComplete') {
      await handlePostSurveyComplete({ memory, controlTask, accountSid, twilioClient });
    }

    return newOk({});
  } catch (error) {
    console.error('handeChannelRelease', error);
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
};
