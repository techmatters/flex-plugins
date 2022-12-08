/* eslint-disable camelcase */
import { ITask, StateHelper, TaskHelper, ChatOrchestrator } from '@twilio/flex-ui';

import { afterCompleteTask, afterWrapupTask, setUpPostSurvey } from '../../utils/setUpActions';
import { REMOVE_CONTACT_STATE } from '../../states/types';
import * as HrmFormPlugin from '../../HrmFormPlugin';
import * as ServerlessService from '../../services/ServerlessService';

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
  test('featureFlags.enable_post_survey === false should not trigger post survey', async () => {
    const getConversationStateForTaskSpy = jest.spyOn(StateHelper, 'getConversationStateForTask');
    const postSurveyInitSpy = jest.spyOn(ServerlessService, 'postSurveyInit').mockImplementationOnce(async () => ({}));

    const task = <ITask>{
      taskSid: 'THIS IS THE TASK SID!',
      channelType: '',
    };

    afterWrapupTask(<HrmFormPlugin.SetupObject>{ featureFlags: { enable_post_survey: false } })({ task });

    expect(getConversationStateForTaskSpy).not.toHaveBeenCalled();
    expect(postSurveyInitSpy).not.toHaveBeenCalled();
  });

  test('featureFlags.enable_post_survey === true should not trigger post survey for non-chat task', async () => {
    const task = ({
      attributes: { channelSid: undefined },
      taskSid: 'THIS IS THE TASK SID!',
      channelType: 'voice',
      taskChannelUniqueName: 'voice',
    } as unknown) as ITask;

    jest.spyOn(TaskHelper, 'isChatBasedTask').mockImplementation(() => false);
    const getConversationStateForTaskSpy = jest.spyOn(StateHelper, 'getConversationStateForTask');
    const postSurveyInitSpy = jest.spyOn(ServerlessService, 'postSurveyInit').mockImplementation(async () => ({}));

    afterWrapupTask(<HrmFormPlugin.SetupObject>{ featureFlags: { enable_post_survey: true } })({ task });

    expect(getConversationStateForTaskSpy).not.toHaveBeenCalled();
    expect(postSurveyInitSpy).not.toHaveBeenCalled();
  });

  test('featureFlags.enable_post_survey === true should trigger post survey for chat task', async () => {
    const task = ({
      attributes: { channelSid: 'CHxxxxxx' },
      taskSid: 'THIS IS THE TASK SID!',
      channelType: 'web',
      taskChannelUniqueName: 'chat',
    } as unknown) as ITask;

    jest.spyOn(TaskHelper, 'isChatBasedTask').mockImplementation(() => true);
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
    const postSurveyInitSpy = jest.spyOn(ServerlessService, 'postSurveyInit').mockImplementation(async () => ({}));

    afterWrapupTask(<HrmFormPlugin.SetupObject>{ featureFlags: { enable_post_survey: true } })({ task });

    expect(removeAllListenersMock).toHaveBeenCalledWith('event1');
    expect(removeAllListenersMock).toHaveBeenCalledWith('event2');
    expect(getConversationStateForTaskSpy).toHaveBeenCalled();
    expect(postSurveyInitSpy).toHaveBeenCalled();
  });
});

describe('setUpPostSurvey', () => {
  test('featureFlags.enable_post_survey === false should not change ChatOrchestrator', async () => {
    const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations');
    setUpPostSurvey(<HrmFormPlugin.SetupObject>{ featureFlags: { enable_post_survey: false } });

    expect(setOrchestrationsSpy).not.toHaveBeenCalled();
  });

  test('featureFlags.enable_post_survey === true should change ChatOrchestrator', async () => {
    const setOrchestrationsSpy = jest.spyOn(ChatOrchestrator, 'setOrchestrations').mockImplementation();

    setUpPostSurvey(<HrmFormPlugin.SetupObject>{ featureFlags: { enable_post_survey: true } });

    expect(setOrchestrationsSpy).toHaveBeenCalledTimes(2);
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('wrapup', expect.any(Function));
    expect(setOrchestrationsSpy).toHaveBeenCalledWith('completed', expect.any(Function));
  });
});
