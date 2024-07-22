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

import { ChatOrchestrator } from '@twilio/flex-ui';

import { FeatureFlags } from '../../types/types';
import { REMOVE_CONTACT_STATE } from '../../states/types';
import { afterCompleteTask, excludeDeactivateConversationOrchestration } from '../../utils/setUpActions';
import { namespace } from '../../states/storeNamespaces';
import { FINALIZE_CONTACT as mockFINALIZE_CONTACT } from '../../states/contacts/types';
import { newFinalizeContactAsyncAction } from '../../states/contacts/saveContact';

const taskSid = 'WT-THIS IS THE TASK SID!';

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

jest.mock('../../states/contacts/saveContact', () => ({
  newFinalizeContactAsyncAction: jest.fn(async () => ({ type: mockFINALIZE_CONTACT })),
  createContactAsyncAction: jest.fn(),
}));

const mockNewFinalizeContactAsyncAction = newFinalizeContactAsyncAction as jest.MockedFunction<
  typeof newFinalizeContactAsyncAction
>;

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

    afterCompleteTask({
      task: <any>{
        taskSid,
      },
    });
    expect(mockFlexManager.store.dispatch).toHaveBeenCalledWith(expect.any(Promise));
    expect(mockNewFinalizeContactAsyncAction).toHaveBeenCalledWith(
      { taskSid },
      {
        id: '1234',
        taskId: taskSid,
      },
    );
    expect(mockFlexManager.store.dispatch).toHaveBeenCalledWith({
      type: REMOVE_CONTACT_STATE,
      taskId: taskSid,
      contactId: '1234',
    });
  });
});

test('excludeDeactivateConversationOrchestration - should remove DeactivateConversation orchestration from task complete and wrapup transitions via ChatOrchestrator', () => {
  const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations').mockImplementation();

  excludeDeactivateConversationOrchestration(<FeatureFlags>{ enable_post_survey: true });

  expect(setOrchestrationsSpy).toHaveBeenCalledTimes(2);
  expect(setOrchestrationsSpy).toHaveBeenCalledWith('wrapup', expect.any(Function));
  expect(setOrchestrationsSpy).toHaveBeenCalledWith('completed', expect.any(Function));
});
