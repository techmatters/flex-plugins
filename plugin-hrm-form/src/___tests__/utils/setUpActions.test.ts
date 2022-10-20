import { ITask } from '@twilio/flex-ui';

import { afterCompleteTask } from '../../utils/setUpActions';
import { REMOVE_CONTACT_STATE } from '../../states/types';

const mockFlexManager = {
  store: {
    dispatch: jest.fn(),
  },
};

jest.mock('@twilio/flex-ui', () => ({
  Manager: {
    getInstance: () => mockFlexManager,
  },
}));

jest.mock('../../HrmFormPlugin.tsx', () => ({}));
jest.mock('../../states', () => ({}));

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
