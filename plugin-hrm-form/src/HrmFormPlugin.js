import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomCRMContainer from './components/CustomCRMContainer';
import reducers, { namespace } from './states';
import { Actions } from './states/ContactState';
import hrmBaseUrl from './HrmBaseUrl';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.3.6';

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

    const workerSid = manager.workerClient.sid;
    const { helpline } = manager.workerClient.attributes;

    // TODO(nick): Eventually remove this log line or set to debug
    console.log(`HRM URL: ${hrmBaseUrl}`);
    if (hrmBaseUrl === undefined) {
      console.error('HRM base URL not defined, you must provide this to save program data');
    }

    // TODO(nick): Can we avoid passing down the task prop, maybe using context?
    const options = { sortOrder: -1 };
    flex.CRMContainer.Content.replace(
      <CustomCRMContainer key="custom-crm-container" handleCompleteTask={onCompleteTask} />,
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

    const saveEndMillis = (payload, original) => {
      manager.store.dispatch(Actions.saveEndMillis(payload.task.taskSid));
      original(payload);
    };

    flex.Actions.replaceAction('HangupCall', saveEndMillis);
    flex.Actions.replaceAction('WrapupTask', saveEndMillis);
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
