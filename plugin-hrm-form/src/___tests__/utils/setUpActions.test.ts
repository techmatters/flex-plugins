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

/* eslint-disable camelcase */
import { ITask, TaskHelper, ChatOrchestrator } from '@twilio/flex-ui';
import each from 'jest-each';

import { afterCompleteTask, afterWrapupTask, setUpPostSurvey } from '../../utils/setUpActions';
import { REMOVE_CONTACT_STATE } from '../../states/types';
import * as HrmFormPlugin from '../../HrmFormPlugin';
import * as ServerlessService from '../../services/ServerlessService';
import { FeatureFlags } from '../../types/types';
import { SetupObject } from '../../HrmFormPlugin';

const mockFlexManager = {
  store: {
    dispatch: jest.fn(),
  },
};

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: () => mockFlexManager,
  },
}));

jest.mock('../../HrmFormPlugin.tsx', () => ({}));
jest.mock('../../states', () => ({}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('afterCompleteTask', () => {
  test('Dispatches a removeContactState action with the specified taskSid', () => {
    afterCompleteTask({
      task: <ITask>{
        taskSid: 'THIS IS THE TASK SID!',
      },
    });
    expect(mockFlexManager.store.dispatch).toHaveBeenCalledWith({
      type: REMOVE_CONTACT_STATE,
      taskId: 'THIS IS THE TASK SID!',
    });
  });
});

describe('afterWrapupTask', () => {
  each(
    ['', 'default', 'web', 'voice']
      .flatMap(channelType => [
        {
          channelType,
          featureFlags: { enable_post_survey: false, post_survey_serverless_handled: false },
        },
        {
          channelType,
          featureFlags: { enable_post_survey: true, post_survey_serverless_handled: false },
        },
        {
          channelType,
          featureFlags: { enable_post_survey: false, post_survey_serverless_handled: true },
        },
        {
          channelType,
          featureFlags: { enable_post_survey: true, post_survey_serverless_handled: true },
        },
      ])
      .map(testCase => {
        const { channelType, featureFlags } = testCase;
        const isChatChannel = channelType && channelType !== 'voice' && channelType !== 'default';
        const shouldCallPostSurveyInit =
          isChatChannel && featureFlags.enable_post_survey && !featureFlags.post_survey_serverless_handled;
        const description = `featureFlags.enable_post_survey === ${
          featureFlags.enable_post_survey
        } && post_survey_serverless_handled === ${featureFlags.post_survey_serverless_handled} should ${
          shouldCallPostSurveyInit ? '' : 'not '
        } trigger post survey for ${isChatChannel ? '' : 'non-'}chat task`;

        return {
          ...testCase,
          isChatChannel,
          shouldCallPostSurveyInit,
          description,
        };
      }),
  ).test('$description', async ({ channelType, featureFlags, isChatChannel, shouldCallPostSurveyInit }) => {
    const postSurveyInitSpy = jest.spyOn(ServerlessService, 'postSurveyInit').mockImplementationOnce(async () => ({}));

    const task = ({
      attributes: { channelSid: 'CHxxxxxx' },
      taskSid: 'THIS IS THE TASK SID!',
      channelType,
      taskChannelUniqueName: isChatChannel ? 'chat' : channelType,
    } as unknown) as ITask;

    jest.spyOn(TaskHelper, 'isChatBasedTask').mockImplementation(() => isChatChannel);
    jest.spyOn(TaskHelper, 'getTaskConversationSid').mockImplementationOnce(() => task.attributes.channelSid);

    await afterWrapupTask(featureFlags, <SetupObject>{})({ task });

    if (shouldCallPostSurveyInit) {
      expect(postSurveyInitSpy).toHaveBeenCalled();
    } else {
      expect(postSurveyInitSpy).not.toHaveBeenCalled();
    }
  });
});

describe('setUpPostSurvey', () => {
  test('featureFlags.enable_post_survey === false should not change ChatOrchestrator', async () => {
    const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations');
    setUpPostSurvey(<FeatureFlags>{ enable_post_survey: false });

    expect(setOrchestrationsSpy).not.toHaveBeenCalled();
  });

  test('featureFlags.enable_post_survey === true should change ChatOrchestrator', async () => {
    const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations').mockImplementation();

    setUpPostSurvey(<FeatureFlags>{ enable_post_survey: true });

    expect(setOrchestrationsSpy).toHaveBeenCalledTimes(2);
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('wrapup', expect.any(Function));
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('completed', expect.any(Function));
  });
});
