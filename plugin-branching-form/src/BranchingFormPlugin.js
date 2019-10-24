import React from 'react';
import {
  FlexPlugin
} from 'flex-plugin';

import CustomCRMContainer from './components/CRMContainer/CustomCRMContainer';

const PLUGIN_NAME = 'BranchingFormPlugin';

export default class BranchingFormPlugin extends FlexPlugin {
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
    const options = { sortOrder: -1 };
    flex.CRMContainer
      .Content
      .replace(<CustomCRMContainer key="custom-crm-container" />, options);
  }
}