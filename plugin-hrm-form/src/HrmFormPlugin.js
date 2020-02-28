import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomCRMContainer from './components/CustomCRMContainer';
import reducers, { namespace } from './states';
import { Actions } from './states/ContactState';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.3.4';

export default class HrmFormPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when the plugin is being started
   * It is ordered into three sections:
   *  1. Initial startup
   *  2. Setting up task lifecycle-related items
   *  3. Replacing the CRM Container with our application
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    // 1. Initial startup
    console.log(`Welcome to ${PLUGIN_NAME} Version ${PLUGIN_VERSION}`);
    this.registerReducers(manager);

    // 2. Setting up task lifecycle-related items
    flex.Actions.addListener('beforeAcceptTask', payload => {
      manager.store.dispatch(Actions.initializeContactState(payload.task.taskSid));
    });

    const exitMsg =
      'Thank you for contacting the helpline. The counselor has left the chat but ' +
      "don't hesitate to reach out again if you need help.";
    const sendGoodbyeMessage = async (payload, original) => {
      if (payload.task.taskChannelUniqueName === 'chat') {
        await flex.Actions.invokeAction('SendMessage', {
          body: exitMsg,
          channelSid: payload.task.attributes.channelSid,
        });
        original(payload);
      } else {
        original(payload);
      }
    };
    flex.Actions.replaceAction('WrapupTask', sendGoodbyeMessage);

    // values we will need when saving contacts
    const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;
    const workerSid = manager.workerClient.sid;

    // TODO(nick): Eventually remove this log line or set to debug
    console.log(`HRM URL: ${hrmBaseUrl}`);
    if (hrmBaseUrl === undefined) {
      console.error('HRM base URL not defined, you must provide this to save program data');
    }

    flex.Actions.addListener('beforeCompleteTask', (payload, abortFunction) => {
      manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl, workerSid));
    });

    flex.Actions.addListener('afterCompleteTask', payload => {
      manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
    });

    // 3. Replacing standard Flex containers with our application

    // Must use submit buttons in CRM container to complete task
    flex.TaskCanvasHeader.Content.remove('actions', {
      if: props => props.task && props.task.status === 'wrapping',
    });

    const onCompleteTask = async (sid, task) => {
      if (task.status !== 'wrapping') {
        if (task.channelType === 'voice') {
          await flex.Actions.invokeAction('HangupCall', { sid, task });
        } else {
          await flex.Actions.invokeAction('WrapupTask', { sid, task });
        }
      }
      flex.Actions.invokeAction('CompleteTask', { sid, task });
    };

    const options = { sortOrder: -1 };
    flex.CRMContainer.Content.replace(
      <CustomCRMContainer key="custom-crm-container" handleCompleteTask={onCompleteTask} />,
      options,
    );
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
