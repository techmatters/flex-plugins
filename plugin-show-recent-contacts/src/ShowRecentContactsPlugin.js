import React from 'react';
import { View } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import RecentContactsView from './components/RecentContactsView';
import RecentContactsSidebarButton from './components/RecentContactsSidebarButton';

const PLUGIN_NAME = 'ShowRecentContactsPlugin';
const PLUGIN_VERSION = '0.2.2';

export default class ShowRecentContactsPlugin extends FlexPlugin {
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
    const helpline = manager.store.getState().flex.worker.attributes.helpline;
    console.log("Helpline = " + helpline);

    const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;
    // TODO(nick): Eventually remove this log line or set to debug
    console.log("HRM URL (recent contacts): " + hrmBaseUrl);
    if (hrmBaseUrl === undefined) {
      console.error("HRM base URL not defined, you must provide this to retrieve program data");
    }

    flex.SideNav.Content.add(
      <RecentContactsSidebarButton key="recent-contacts-button" />
    );

    flex.ViewCollection.Content.add(
      <View name="recent-contacts" key="recent-contacts">
        <RecentContactsView helpline={helpline} hrmBaseUrl={hrmBaseUrl} />
      </View>
    );
  }
}
