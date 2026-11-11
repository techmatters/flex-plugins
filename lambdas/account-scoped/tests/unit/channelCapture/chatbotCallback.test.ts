/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { newErr, newOk } from '@tech-matters/result-type';
import { handleChatbotCallback } from '../../../src/channelCapture/chatbotCallback';
import { chatbotCallbackCleanup } from '../../../src/channelCapture/chatbotCallbackCleanup';
import { LexClient } from '../../../src/channelCapture/lexClient';
import { recordPostSurveyAnswers } from '../../../src/postSurvey/recordPostSurveyAnswers';
import { TEST_ACCOUNT_SID, TEST_CONVERSATION_SID } from '../../testTwilioValues';

const PARTICIPANT_SID = 'MBhelpseeker';
const CONTROL_TASK_SID = 'WTcontrol';

const mockMessagesCreate = jest.fn();
let conversationAttributes: Record<string, any>;

jest.mock('twilio', () => () => ({
  conversations: {
    v1: {
      conversations: () => ({
        fetch: async () => ({
          attributes: JSON.stringify(conversationAttributes),
          messages: () => ({ create: mockMessagesCreate }),
        }),
      }),
    },
  },
}));
jest.mock('@tech-matters/twilio-configuration', () => ({
  getAccountAuthToken: jest.fn().mockResolvedValue('token'),
  getChatServiceSid: jest.fn().mockResolvedValue('ISut'),
  getWorkspaceSid: jest.fn().mockResolvedValue('WSut'),
}));
jest.mock('../../../src/channelCapture/lexClient', () => ({
  LexClient: {
    postText: jest.fn(),
    isEndOfDialog: jest.fn(),
    getBotMemory: jest.fn(),
  },
}));
jest.mock('../../../src/channelCapture/chatbotCallbackCleanup', () => ({
  chatbotCallbackCleanup: jest.fn(),
}));
jest.mock('../../../src/postSurvey/recordPostSurveyAnswers', () => ({
  recordPostSurveyAnswers: jest.fn(),
}));

const mockLexClient = LexClient as jest.Mocked<typeof LexClient>;
const mockRecordPostSurveyAnswers = recordPostSurveyAnswers as jest.Mock;
const mockChatbotCallbackCleanup = chatbotCallbackCleanup as jest.Mock;

const helpseekerMessage = (body: string) =>
  handleChatbotCallback(
    {
      body: {
        Body: body,
        EventType: 'onMessageAdded',
        ConversationSid: TEST_CONVERSATION_SID,
        ParticipantSid: PARTICIPANT_SID,
      },
    } as any,
    TEST_ACCOUNT_SID,
  );

const captureWithBot = (releaseType: string) => {
  conversationAttributes = {
    participantSid: PARTICIPANT_SID,
    capturedChannelAttributes: {
      releaseType,
      controlTaskSid: CONTROL_TASK_SID,
      botLanguage: 'en_us',
      botSuffix: 'post_survey',
      environment: 'staging',
      helplineCode: 'ut',
      userId: TEST_CONVERSATION_SID,
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLexClient.postText.mockResolvedValue(
    newOk({
      lexVersion: 'v2',
      lexResponse: { messages: [{ content: 'Next question?' }] },
    }) as any,
  );
  mockLexClient.isEndOfDialog.mockReturnValue(false);
  mockLexClient.getBotMemory.mockReturnValue({ was_helpful: 'Yes', would_recommend: '' });
  mockRecordPostSurveyAnswers.mockResolvedValue(newOk({ recorded: true }));
});

describe('post survey chatbot', () => {
  beforeEach(() => captureWithBot('postSurveyComplete'));

  test('records the answers given so far on every turn', async () => {
    await helpseekerMessage('yes');

    expect(mockRecordPostSurveyAnswers).toHaveBeenCalledWith({
      accountSid: TEST_ACCOUNT_SID,
      controlTaskSid: CONTROL_TASK_SID,
      answers: { was_helpful: 'Yes', would_recommend: '' },
    });
    expect(mockChatbotCallbackCleanup).not.toHaveBeenCalled();
    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Next question?' }),
    );
  });

  test('last answer - records it before releasing the conversation', async () => {
    mockLexClient.isEndOfDialog.mockReturnValue(true);
    const callOrder: string[] = [];
    mockRecordPostSurveyAnswers.mockImplementation(async () => {
      callOrder.push('record');
      return newOk({ recorded: true });
    });
    mockChatbotCallbackCleanup.mockImplementation(async () => {
      callOrder.push('cleanup');
    });

    await helpseekerMessage('no');

    expect(callOrder).toStrictEqual(['record', 'cleanup']);
  });

  test('recording fails - the helpseeker still gets the next question', async () => {
    mockRecordPostSurveyAnswers.mockResolvedValue(
      newErr({ message: 'boom', error: { statusCode: 500 } }),
    );

    await helpseekerMessage('yes');

    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Next question?' }),
    );
  });
});

describe('other chatbots', () => {
  test('does not record post survey answers', async () => {
    captureWithBot('triggerStudioFlow');

    await helpseekerMessage('hi');

    expect(mockRecordPostSurveyAnswers).not.toHaveBeenCalled();
  });
});
