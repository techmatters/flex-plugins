import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomCRMContainer from './components/CustomCRMContainer';
import reducers, { namespace } from './states';
import { Actions } from './states/ContactState';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.3.3';

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

    const onCompleteTask = (sid, task) => {
      if (task.channelType === 'voice' && task.status !== 'wrapping') {
        flex.Actions.invokeAction('HangupCall', { sid, task });
      }
      flex.Actions.invokeAction('CompleteTask', { sid, task });
    };

    const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;

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

    flex.Actions.addListener('beforeWrapupTask', payload => {
      const chatClient = manager.chatClient;
      const channelSid = payload.task.attributes.channelSid;
      console.log(`Channel SID = ${channelSid}`);
      // chatClient.getUserChannelDescriptors().then(function(paginator) {
      //   for (let i=0; i<paginator.items.length; i++) {
      //     var channel = paginator.items[i];
      //     if (channel.sid === channelSid) {
      //       console.log(`Found channel with sid ${channel.sid}`);
      //       console.log(`Type is ${Object.prototype.toString.call(channel)}`);
      //       channel.sendMessage('All done here. Thanks!');
      //     }
      //   }
      // });
      chatClient.getChannelBySid(channelSid).then(channel => channel.sendMessage('All done here. Thanks!'));
    });

    flex.Actions.addListener('beforeCompleteTask', (payload, abortFunction) => {
      manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl));
    });

    flex.Actions.addListener('afterCompleteTask', payload => {
      manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
    });
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
