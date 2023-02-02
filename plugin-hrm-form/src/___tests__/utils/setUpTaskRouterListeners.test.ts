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
import { ITask, TaskHelper, StateHelper } from '@twilio/flex-ui';
import each from 'jest-each';

import { setTaskWrapupEventListeners } from '../../utils/setUpTaskRouterListeners';

const mockEventEmitter = {
  events: {},
  addListener: (eventName: string, cb: () => {}) => {
    if (mockEventEmitter.events[eventName] && Array.isArray(mockEventEmitter.events[eventName])) {
      mockEventEmitter.events[eventName].push(cb);
    } else {
      mockEventEmitter.events[eventName] = [cb];
    }
  },
  emmit: (eventName: string) => {
    if (mockEventEmitter.events[eventName] && Array.isArray(mockEventEmitter.events[eventName])) {
      mockEventEmitter.events[eventName].forEach((cb: () => void) => cb());
    }
  },
  clearEvents: () => {
    mockEventEmitter.events = {};
  },
};

const mockFlexManager = {
  events: mockEventEmitter,
};

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: () => mockFlexManager,
  },
}));

jest.mock('../../HrmFormPlugin.tsx', () => ({}));

afterEach(() => {
  jest.clearAllMocks();
  mockEventEmitter.clearEvents();
});

describe('setTaskWrapupEventListeners', () => {
  each(
    [true, false]
      .map(isChatTask => ({
        isChatTask,
      }))
      .flatMap(testCase => {
        return [
          {
            ...testCase,
            featureFlags: { enable_post_survey: true },
          },
          {
            ...testCase,
            featureFlags: { enable_post_survey: false },
          },
        ];
      })
      .map(testCase => {
        const expectToRemoveListeners = testCase.featureFlags.enable_post_survey && testCase.isChatTask;

        return {
          ...testCase,
          description: `enable_post_survey === ${testCase.featureFlags.enable_post_survey} should ${
            expectToRemoveListeners ? '' : 'not '
          }unsubscribe for ${testCase.isChatTask ? '' : 'non-'}chat tasks`,
          expectToRemoveListeners,
        };
      }),
  ).test('$description', async ({ featureFlags, isChatTask, expectToRemoveListeners }) => {
    const task = ({
      attributes: { ...(isChatTask && { channelSid: 'CHxxxxxx' }) },
      taskSid: 'THIS IS THE TASK SID!',
    } as unknown) as ITask;
    jest.spyOn(TaskHelper, 'isChatBasedTask').mockImplementation(() => isChatTask);
    jest.spyOn(TaskHelper, 'getTaskConversationSid').mockImplementationOnce(() => task.attributes.channelSid);
    const removeAllListenersMock = jest.fn();
    const getConversationStateForTaskSpy = jest
      .spyOn(StateHelper, 'getConversationStateForTask')
      .mockImplementationOnce(
        () =>
          ({
            source: {
              listenerCount: jest.fn(() => true),
              eventNames: jest.fn(() => ['event1', 'event2']),
              removeAllListeners: removeAllListenersMock,
            },
          } as any),
      );

    setTaskWrapupEventListeners(featureFlags);

    expect(removeAllListenersMock).not.toHaveBeenCalled();
    expect(getConversationStateForTaskSpy).not.toHaveBeenCalled();

    /** Emmit event to trigger the callback (if added) */
    mockEventEmitter.emmit('taskWrapup');

    if (expectToRemoveListeners) {
      expect(getConversationStateForTaskSpy).toHaveBeenCalled();
      expect(removeAllListenersMock).toHaveBeenCalledWith('event1');
      expect(removeAllListenersMock).toHaveBeenCalledWith('event2');
    } else {
      expect(removeAllListenersMock).not.toHaveBeenCalled();
      expect(getConversationStateForTaskSpy).not.toHaveBeenCalled();
    }
  });
});
