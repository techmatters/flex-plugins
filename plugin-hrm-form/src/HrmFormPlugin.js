import React from 'react';
import { VERSION, TaskHelper } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomCRMContainer from './components/CustomCRMContainer';
import QueuesStatus from './components/queuesStatus';
import reducers, { namespace } from './states';
import { Actions } from './states/ContactState';
import ConfigurationContext from './contexts/ConfigurationContext';
import LocalizationContext from './contexts/LocalizationContext';
import HrmTheme from './styles/HrmTheme';
import { channelTypes } from './states/DomainConstants';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.4.0';

export default class HrmFormPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    console.log(`Welcome to ${PLUGIN_NAME} Version ${PLUGIN_VERSION}`);
    this.registerReducers(manager);

    const configuration = {
      colorTheme: HrmTheme,
    };
    manager.updateConfig(configuration);

    const onCompleteTask = async (sid, task) => {
      if (task.status !== 'wrapping') {
        if (task.channelType === channelTypes.voice) {
          await flex.Actions.invokeAction('HangupCall', { sid, task });
        } else {
          await flex.Actions.invokeAction('WrapupTask', { sid, task });
        }
      }
      flex.Actions.invokeAction('CompleteTask', { sid, task });
    };

    const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;
    const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
    const workerSid = manager.workerClient.sid;
    const { helpline } = manager.workerClient.attributes;
    const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
    const getSsoToken = () => manager.store.getState().flex.session.ssoTokenPayload.token;
    const { strings } = manager;
    const { isCallTask } = TaskHelper;

    // TODO(nick): Eventually remove this log line or set to debug
    console.log(`HRM URL: ${hrmBaseUrl}`);
    if (hrmBaseUrl === undefined) {
      console.error('HRM base URL not defined, you must provide this to save program data');
    }

    // voice color right now is same as web color. Should this change?
    const voiceColor = flex.DefaultTaskChannels.Chat.colors.main;
    const webColor = flex.DefaultTaskChannels.Chat.colors.main;
    const facebookColor = flex.DefaultTaskChannels.ChatMessenger.colors.main;
    const smsColor = flex.DefaultTaskChannels.ChatSms.colors.main;
    const whatsappColor = flex.DefaultTaskChannels.ChatWhatsApp.colors.main;

    flex.TaskListContainer.Content.add(
      <QueuesStatus
        key="queue-status"
        insightsClient={manager.insightsClient}
        colors={{
          voiceColor,
          webColor,
          facebookColor,
          smsColor,
          whatsappColor,
        }}
      />,
      {
        sortOrder: -1,
        align: 'start',
      },
    );

    // TODO(nick): Can we avoid passing down the task prop, maybe using context?
    const options = { sortOrder: -1 };
    flex.CRMContainer.Content.replace(
      <ConfigurationContext.Provider
        value={{ hrmBaseUrl, serverlessBaseUrl, workerSid, helpline, currentWorkspace, getSsoToken }}
        key="custom-crm-container"
      >
        <LocalizationContext.Provider value={{ strings, isCallTask }}>
          <CustomCRMContainer handleCompleteTask={onCompleteTask} />
        </LocalizationContext.Provider>
      </ConfigurationContext.Provider>,
      options,
    );

    // Must use submit buttons in CRM container to complete task
    flex.TaskCanvasHeader.Content.remove('actions', {
      if: props => props.task && props.task.status === 'wrapping',
    });

    flex.Actions.addListener('beforeAcceptTask', payload => {
      manager.store.dispatch(Actions.initializeContactState(payload.task.taskSid));
    });

    flex.Actions.addListener('beforeCompleteTask', (payload, abortFunction) => {
      manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl, workerSid, helpline));
    });

    flex.Actions.addListener('afterCompleteTask', payload => {
      manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
    });

    const goodbyeMsg =
      'The counselor has left the chat. Thank you for reaching out. Please contact us again if you need more help.';

    const shouldSayGoodbye = channel =>
      channel === channelTypes.facebook || channel === channelTypes.sms || channel === channelTypes.whatsapp;

    const sendGoodbyeMessage = async payload => {
      await flex.Actions.invokeAction('SendMessage', {
        body: goodbyeMsg,
        channelSid: payload.task.attributes.channelSid,
      });
    };

    const saveEndMillis = async payload => {
      manager.store.dispatch(Actions.saveEndMillis(payload.task.taskSid));
    };

    /**
     * @param {import('@twilio/flex-ui').ActionFunction} fun
     * @returns {import('@twilio/flex-ui').ReplacedActionFunction}
     * A function that calls fun with the payload of the replaced action
     * and continues with the Twilio execution
     */
    const fromActionFunction = fun => async (payload, original) => {
      await fun(payload);
      original(payload);
    };

    const hangupCall = fromActionFunction(saveEndMillis);

    // This action is causing a rage condition. Link to issue https://github.com/twilio/flex-plugin-builder/issues/243
    const wrapupTask = fromActionFunction(async payload => {
      if (shouldSayGoodbye(payload.task.channelType)) {
        await sendGoodbyeMessage(payload);
      }
      await saveEndMillis(payload);
    });

    flex.Actions.replaceAction('HangupCall', hangupCall);
    flex.Actions.replaceAction('WrapupTask', wrapupTask);
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
