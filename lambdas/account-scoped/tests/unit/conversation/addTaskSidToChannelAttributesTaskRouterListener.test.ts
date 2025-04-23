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

import twilio from 'twilio';
import { RecursivePartial } from '../RecursivePartial';
import {
  TEST_ACCOUNT_SID,
  TEST_CHANNEL_SID,
  TEST_CHAT_SERVICE_SID,
  TEST_CONVERSATION_SID,
  TEST_TASK_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';
import { TaskContext, TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { WorkspaceContext } from 'twilio/lib/rest/taskrouter/v1/workspace';
import { TaskSID } from '../../../src/twilioTypes';
import { addTaskSidToChannelAttributes } from '../../../src/conversation/addTaskSidToChannelAttributesTaskRouterListener';
import {
  ConversationContext,
  ConversationInstance,
} from 'twilio/lib/rest/conversations/v1/conversation';
import { setConfigurationAttributes } from '../mockServiceConfiguration';
import { EventFields } from '../../../src/taskrouter';
import each from 'jest-each';
import { ChannelContext, ChannelInstance } from 'twilio/lib/rest/chat/v2/service/channel';

jest.mock('../../../src/configuration/twilioConfiguration', () => ({
  getWorkspaceSid: jest.fn().mockResolvedValue(TEST_WORKSPACE_SID),
  getChatServiceSid: jest.fn().mockResolvedValue(TEST_CHAT_SERVICE_SID),
}));

let twilioClient: twilio.Twilio;

const mockFetchTask: jest.MockedFunction<TaskContext['fetch']> = jest.fn();

const setTaskReturnedByFetch = (
  taskSid: TaskSID,
  isContactlessTask: boolean,
  isConversation: boolean,
) => {
  mockFetchTask.mockClear();
  mockFetchTask.mockResolvedValue({
    attributes: JSON.stringify({
      isContactlessTask,
      [isConversation ? 'conversationSid' : 'channelSid']: isConversation
        ? TEST_CONVERSATION_SID
        : TEST_CHANNEL_SID,
    }),
    sid: taskSid,
    update: jest.fn() as TaskInstance['update'],
  } as TaskInstance);
};

const mockFetchConversation: jest.MockedFunction<ConversationContext['fetch']> =
  jest.fn();

const mockUpdateConversation: jest.MockedFunction<ConversationInstance['update']> =
  jest.fn();

const setConversationReturnedByFetch = (
  conversationSid: string,
  tasksSids?: string[],
) => {
  mockFetchConversation.mockClear();
  mockFetchConversation.mockResolvedValue({
    attributes: JSON.stringify({ ...(tasksSids ? { tasksSids } : {}) }),
    sid: conversationSid,
    update: mockUpdateConversation as ConversationInstance['update'],
  } as ConversationInstance);
};

const mockFetchChannel: jest.MockedFunction<ChannelContext['fetch']> = jest.fn();

const mockUpdateChannel: jest.MockedFunction<ChannelInstance['update']> = jest.fn();

const setChannelReturnedByFetch = (channelSid: string, tasksSids?: string[]) => {
  mockFetchChannel.mockClear();
  mockFetchChannel.mockResolvedValue({
    attributes: JSON.stringify({ ...(tasksSids ? { tasksSids } : {}) }),
    sid: channelSid,
    update: mockUpdateChannel as ChannelInstance['update'],
  } as ChannelInstance);
};

beforeEach(() => {
  jest.clearAllMocks();
  const mockTwilioClient: RecursivePartial<twilio.Twilio> = {
    taskrouter: {
      v1: {
        workspaces: {
          get: (workspaceSid: string) => {
            if (workspaceSid === TEST_WORKSPACE_SID) {
              return {
                tasks: {
                  get: (taskSid: string) => {
                    if (taskSid === TEST_TASK_SID) {
                      return {
                        fetch: mockFetchTask as TaskContext['fetch'],
                      } as TaskContext;
                    } else throw new Error(`Unexpected task SID: ${taskSid}`);
                  },
                },
              } as WorkspaceContext;
            } else throw new Error(`Unexpected workspace SID: ${workspaceSid}`);
          },
        },
      },
    },
    conversations: {
      v1: {
        conversations: {
          get: (conversationSid: string) => {
            if (conversationSid === TEST_CONVERSATION_SID) {
              return {
                fetch: mockFetchConversation as ConversationContext['fetch'],
                update: mockUpdateConversation as ConversationContext['update'],
              } as ConversationInstance;
            } else throw new Error(`Unexpected conversation SID: ${conversationSid}`);
          },
        },
      },
    },
    chat: {
      v2: {
        services: {
          get: (serviceSid: string) => {
            if (serviceSid === TEST_CHAT_SERVICE_SID) {
              return {
                channels: {
                  get: (channelSid: string) => {
                    if (channelSid === TEST_CHANNEL_SID) {
                      return {
                        fetch: mockFetchChannel as ChannelContext['fetch'],
                      } as ChannelContext;
                    } else throw new Error(`Unexpected channel SID: ${channelSid}`);
                  },
                },
              };
            } else throw new Error(`Unexpected service SID: ${serviceSid}`);
          },
        },
      },
    },
  };

  twilioClient = mockTwilioClient as twilio.Twilio;

  mockUpdateConversation.mockImplementation(
    async update =>
      ({
        ...(await mockFetchConversation()),
        ...update,
      }) as ConversationInstance,
  );

  mockUpdateChannel.mockImplementation(
    async update =>
      ({
        ...(await mockFetchChannel()),
        ...update,
      }) as ChannelInstance,
  );
});

const newEventFields = (
  taskChannelUniqueName: string,
  isContactlessTask: boolean,
  isConversation: boolean,
) =>
  ({
    TaskChannelUniqueName: taskChannelUniqueName,
    TaskAttributes: JSON.stringify({
      isContactlessTask,
      [isConversation ? 'conversationSid' : 'channelSid']: isConversation
        ? TEST_CONVERSATION_SID
        : TEST_CHANNEL_SID,
    }),
    TaskSid: TEST_TASK_SID,
  }) as EventFields;

describe('addTaskSidToChannelAttributes', () => {
  each([{ taskType: 'Conversation' }, { taskType: 'Programmable Chat' }]).describe(
    '$taskType task',
    ({ taskType }) => {
      const isConversation = taskType === 'Conversation';
      const mockUpdate = isConversation ? mockUpdateConversation : mockUpdateChannel;
      beforeEach(() => {
        setTaskReturnedByFetch(TEST_TASK_SID, false, isConversation);
        setConversationReturnedByFetch(TEST_CONVERSATION_SID);
        setChannelReturnedByFetch(TEST_CHANNEL_SID);
        twilioClient = setConfigurationAttributes(twilioClient, {
          feature_flags: { lambda_task_created_handler: true },
        });
      });
      test('Twilio task, no taskSids already set, chat task channel - adds taskSid to attributes', async () => {
        // Act
        await addTaskSidToChannelAttributes(
          newEventFields('chat', false, isConversation),
          TEST_ACCOUNT_SID,
          twilioClient,
        );

        // Assert
        expect(mockUpdate).toHaveBeenCalledWith({
          attributes: JSON.stringify({ tasksSids: [TEST_TASK_SID] }),
        });
      });
      test('Flag not set - noop', async () => {
        //Arrange
        twilioClient = setConfigurationAttributes(twilioClient, {
          feature_flags: { lambda_task_created_handler: false },
        });
        // Act
        await addTaskSidToChannelAttributes(
          newEventFields('chat', false, isConversation),
          TEST_ACCOUNT_SID,
          twilioClient,
        );

        // Assert
        expect(mockUpdate).not.toHaveBeenCalled();
      });
      test('survey task - noop', async () => {
        // Act
        await addTaskSidToChannelAttributes(
          newEventFields('survey', false, isConversation),
          TEST_ACCOUNT_SID,
          twilioClient,
        );

        // Assert
        expect(mockUpdate).not.toHaveBeenCalled();
      });
      test('Twilio task, taskSids already set, chat task channel - adds taskSid to existing array', async () => {
        // Arrange
        if (isConversation) {
          setConversationReturnedByFetch(TEST_CONVERSATION_SID, ['WTexisting']);
        } else {
          setChannelReturnedByFetch(TEST_CHANNEL_SID, ['WTexisting']);
        }

        // Act
        await addTaskSidToChannelAttributes(
          newEventFields('chat', false, isConversation),
          TEST_ACCOUNT_SID,
          twilioClient,
        );

        // Assert
        expect(mockUpdate).toHaveBeenCalledWith({
          attributes: JSON.stringify({ tasksSids: ['WTexisting', TEST_TASK_SID] }),
        });
      });
    },
  );
});
