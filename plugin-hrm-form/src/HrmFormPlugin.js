import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import HrmFormContainer from './components/HrmForm/HrmForm.Container';
import reducers, { namespace } from './states';

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

    const onCompleteTask = (sid) => {
      flex.Actions.invokeAction("CompleteTask", { sid } );
    }

    flex.TaskCanvasHeader.Content.remove('actions', {
      if: props => props.task && props.task.status === 'wrapping'
    });

    const options = { sortOrder: -1 };
    flex.CRMContainer
      .Content
      .replace(<HrmFormContainer key="hrm-form" onCompleteTask={onCompleteTask} />, options);
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
