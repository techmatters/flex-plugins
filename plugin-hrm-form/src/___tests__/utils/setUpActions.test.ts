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
import { ITask, ChatOrchestrator } from '@twilio/flex-ui';

import { afterCompleteTask, setUpPostSurvey } from '../../utils/setUpActions';

import { REMOVE_CONTACT_STATE } from '../../states/types';
import { FeatureFlags } from '../../types/types';

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

