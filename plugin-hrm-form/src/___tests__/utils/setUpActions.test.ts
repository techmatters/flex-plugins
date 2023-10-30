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
import { ITask, ChatOrchestrator, Manager } from '@twilio/flex-ui';

import { REMOVE_CONTACT_STATE } from '../../states/types';
import { FeatureFlags } from '../../types/types';
import { afterCompleteTask, excludeDeactivateConversationOrchestration } from '../../utils/setUpActions';
import { namespace } from '../../states/storeNamespaces';

const taskSid = 'THIS IS THE TASK SID!';

const mockFlexManager = {
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
  },
};

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: () => mockFlexManager,
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('afterCompleteTask', () => {
  test('Dispatches a removeContactState action with the specified taskSid', () => {
    (mockFlexManager.store.getState as jest.Mock).mockReturnValue({
      [namespace]: {
        activeContacts: {
          existingContacts: {
            1234: {
              savedContact: {
                id: '1234',
                taskId: taskSid,
              },
            },
          },
        },
      },
    });
    console.log('Fake state', Manager.getInstance().store.getState());
    afterCompleteTask({
      task: <ITask>{
        taskSid,
      },
    });
    expect(mockFlexManager.store.dispatch).toHaveBeenCalledWith({
      type: REMOVE_CONTACT_STATE,
      taskId: taskSid,
      contactId: '1234',
    });
  });
});

describe('excludeDeactivateConversationOrchestration', () => {
  test('backend_handled_chat_janitor === false and enable_post_survey === false should not change ChatOrchestrator', async () => {
    const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations');
    excludeDeactivateConversationOrchestration(<FeatureFlags>{
      enable_post_survey: false,
      backend_handled_chat_janitor: false,
    });

    expect(setOrchestrationsSpy).not.toHaveBeenCalled();
  });

  test('featureFlags.enable_post_survey === true should change ChatOrchestrator', async () => {
    const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations').mockImplementation();

    excludeDeactivateConversationOrchestration(<FeatureFlags>{ enable_post_survey: true });

    expect(setOrchestrationsSpy).toHaveBeenCalledTimes(2);
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('wrapup', expect.any(Function));
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('completed', expect.any(Function));
  });
  test('backend_handled_chat_janitor === true should change ChatOrchestrator', async () => {
    const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations').mockImplementation();

    excludeDeactivateConversationOrchestration(<FeatureFlags>{ backend_handled_chat_janitor: true });

    expect(setOrchestrationsSpy).toHaveBeenCalledTimes(2);
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('wrapup', expect.any(Function));
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('completed', expect.any(Function));
  });
});
