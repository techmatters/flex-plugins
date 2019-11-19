import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomCRMContainer from './components/CustomCRMContainer';
import reducers, { namespace } from './states';
import { Actions } from './states/ContactState';

const PLUGIN_NAME = 'HrmFormPlugin';

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
    this.registerReducers(manager);

    const onCompleteTask = (sid, task) => {
      flex.Actions.invokeAction("CompleteTask", { sid, task } );
    }

    const options = { sortOrder: -1 };
    flex.CRMContainer
      .Content
      .replace(<CustomCRMContainer key="custom-crm-container" handleCompleteTask={onCompleteTask} />, options);

    flex.Actions.addListener("beforeAcceptTask", (payload) => {
      manager.store.dispatch(Actions.initializeContactState(payload.task.taskSid));
    });

    flex.Actions.addListener("beforeCompleteTask", (payload, abortFunction) => {
      manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction));
    });

    flex.Actions.addListener("afterCompleteTask", (payload) => {
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
