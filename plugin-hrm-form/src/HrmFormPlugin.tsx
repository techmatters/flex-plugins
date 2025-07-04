/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import * as Flex from '@twilio/flex-ui';
import { FlexPlugin, loadCSS } from '@twilio/flex-plugin';

import './styles/global-overrides.css';

import reducers from './states';
import HrmTheme, { overrides } from './styles/HrmTheme';
import { defaultLocale, initLocalization } from './translations';
import * as Providers from './utils/setUpProviders';
import * as ActionFunctions from './utils/setUpActions';
import { recordCallState } from './utils/setUpActions';
import * as TaskRouterListeners from './utils/setUpTaskRouterListeners';
import * as Components from './utils/setUpComponents';
import * as Channels from './channels/setUpChannels';
import setUpMonitoring from './utils/setUpMonitoring';
import { changeLanguage } from './states/configuration/actions';
import { getAseloFeatureFlags, getHrmConfig, initializeConfig, subscribeToConfigUpdates } from './hrmConfig';
import { setUpSyncClient } from './services/SyncService';
import { FeatureFlags } from './types/types';
import { setUpReferrableResources } from './components/resources/setUpReferrableResources';
import QueuesView from './components/queuesView';
import TeamsView from './components/teamsView';
import { setUpCounselorToolkits } from './components/toolkits/setUpCounselorToolkits';
import { setUpTransferComponents } from './components/transfer/setUpTransferComponents';
import { subscribeNewMessageAlertOnPluginInit } from './notifications/newMessage';
import { subscribeReservedTaskAlert } from './notifications/reservedTask';
import { setUpConferenceActions, setupConferenceComponents } from './conference';
import { setUpTransferActions } from './transfer/setUpTransferActions';
import { playNotification } from './notifications/playNotification';
import { namespace } from './states/storeNamespaces';
import { maskManagerStringsWithIdentifiers } from './maskIdentifiers';
import { setUpViewMaskedVoiceNumber } from './maskIdentifiers/unmaskPhoneNumber';
import { validateAndSetPermissionRules } from './permissions';
import { setupLlmNotifications } from './components/contact/GenerateSummaryButton/setUpLlmNotifications';

const PLUGIN_NAME = 'HrmFormPlugin';

// eslint-disable-next-line import/no-unused-modules
export type SetupObject = ReturnType<typeof getHrmConfig>;

const setUpLocalization = (config: ReturnType<typeof getHrmConfig>) => {
  const manager = Flex.Manager.getInstance();

  const { counselorLanguage, helplineLanguage } = config;

  const twilioStrings = { ...manager.strings }; // save the originals

  const setNewStrings = (newStrings: { [key: string]: string }) => {
    const overrideStrings = { ...manager.strings, ...newStrings };
    manager.strings = maskManagerStringsWithIdentifiers(overrideStrings);
  };

  const afterNewStrings = (language: string) => {
    manager.store.dispatch(changeLanguage(language));
    Flex.Actions.invokeAction('NavigateToView', { viewName: manager.store.getState().flex.view.activeView }); // force a re-render
  };

  const localizationConfig = { twilioStrings, setNewStrings, afterNewStrings };

  return initLocalization(
    localizationConfig,
    localStorage.getItem(`${getHrmConfig().accountSid}_ASELO_PLUGIN_USER_LOCALE`) ||
      counselorLanguage ||
      helplineLanguage ||
      defaultLocale,
  );
};

const setUpComponents = (featureFlags: FeatureFlags, setupObject: ReturnType<typeof getHrmConfig>) => {
  // setUp (add) dynamic components
  Components.setUpQueuesStatusWriter(setupObject);
  Components.setUpQueuesStatus(setupObject);
  Components.setUpAddButtons(featureFlags);
  Components.setUpNoTasksUI(featureFlags, setupObject);
  Components.setUpCustomCRMContainer();

  // set up default and custom channels
  Channels.setupDefaultChannels();
  Channels.setupTelegramChatChannel();
  Channels.setupInstagramChatChannel();
  Channels.setupLineChatChannel();

  setUpViewMaskedVoiceNumber();

  setUpTransferComponents();
  Channels.setUpIncomingTransferMessage();

  Components.setUpCaseList();
  if (featureFlags.enable_client_profiles) Components.setUpClientProfileList();

  // remove dynamic components
  Components.removeTaskCanvasHeaderActions(featureFlags);
  Components.setLogo(setupObject.logoUrl);
  Components.removeDirectoryButton();
  Components.removeActionsIfTransferring();

  Components.setUpStandaloneSearch();
  setUpReferrableResources();
  setUpCounselorToolkits();
  if (featureFlags.enable_aselo_messaging_ui) {
    Components.replaceTwilioMessageInput();
  } else {
    if (featureFlags.enable_emoji_picker) Components.setupEmojiPicker();
    if (featureFlags.enable_canned_responses) Components.setupCannedResponses();
  }

  TeamsView.setUpAgentColumn();
  TeamsView.setUpStatusColumn();
  TeamsView.setUpSkillsColumn();
  TeamsView.setUpTeamsViewSorting();
  TeamsView.setUpTeamsViewFilters();
  TeamsView.setUpWorkerDirectoryFilters();

  if (featureFlags.enable_switchboarding) {
    QueuesView.setUpSwitchboard();
  }

  if (featureFlags.enable_conferencing) setupConferenceComponents();

  if (featureFlags.enable_language_selector) Components.setupWorkerLanguageSelect();
};

const setUpActions = (
  featureFlags: FeatureFlags,
  setupObject: ReturnType<typeof getHrmConfig>,
  getMessage: (key: string) => (language: string) => Promise<string>,
) => {
  ActionFunctions.excludeDeactivateConversationOrchestration();

  // bind setupObject to the functions that requires some initialization
  const wrapupOverride = ActionFunctions.wrapupTask(setupObject, getMessage);
  const beforeCompleteAction = ActionFunctions.beforeCompleteTask(featureFlags);

  Flex.Actions.addListener('afterAcceptTask', ActionFunctions.afterAcceptTask(featureFlags, setupObject, getMessage));

  setUpTransferActions(setupObject);

  Flex.Actions.replaceAction('HangupCall', ActionFunctions.hangupCall);
  Flex.Manager.getInstance().workerClient.addListener('reservationCreated', reservation => {
    reservation.addListener('wrapup', recordCallState);
    reservation.addListener('completed', recordCallState);
  });

  Flex.Actions.replaceAction('WrapupTask', wrapupOverride);

  Flex.Actions.replaceAction('CompleteTask', ActionFunctions.completeTaskOverride);

  Flex.Actions.addListener('beforeCompleteTask', beforeCompleteAction);

  Flex.Actions.addListener('afterCompleteTask', ActionFunctions.afterCompleteTask);

  if (featureFlags.enable_conferencing) setUpConferenceActions();
  if (featureFlags.enable_llm_summary) setupLlmNotifications();
};

export default class HrmFormPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   */
  async init(flex: typeof Flex, manager: Flex.Manager) {
    loadCSS('https://use.fontawesome.com/releases/v5.15.4/css/solid.css');

    setUpMonitoring(manager.workerClient, manager.serviceConfiguration);

    console.log(`Welcome to ${PLUGIN_NAME}`);
    this.registerReducers(manager);

    Providers.setMUIProvider();

    const config = getHrmConfig();
    const featureFlags = getAseloFeatureFlags();
    // eslint-disable-next-line camelcase
    featureFlags.enable_permissions_from_backend = true;

    await validateAndSetPermissionRules();
    await ActionFunctions.loadCurrentDefinitionVersion();

    setUpSyncClient();

    /*
     * localization setup (translates the UI if necessary)
     */
    const { getMessage } = setUpLocalization(config);
    setUpComponents(featureFlags, config);
    setUpActions(featureFlags, config, getMessage);

    TaskRouterListeners.setTaskWrapupEventListeners(featureFlags);

    subscribeReservedTaskAlert();
    subscribeNewMessageAlertOnPluginInit();
    // Force one notification on init so AudioPlayer is eagerly loaded
    playNotification('silence');

    const managerConfiguration: Flex.Config = {
      // colorTheme: HrmTheme,
      theme: {
        componentThemeOverrides: overrides,
        tokens: {
          backgroundColors: {
            colorBackground: HrmTheme.colors.base2,
          },
        },
      },
    };
    manager.updateConfig(managerConfiguration);

    // TODO(nick): Eventually remove this log line or set to debug.  Should we fail hard here?
    const { hrmBaseUrl } = config;
    console.log(`HRM URL: ${hrmBaseUrl}`);
    if (hrmBaseUrl === undefined) {
      console.error('HRM base URL not defined, you must provide this to save program data');
    }
  }

  /**
   * Registers the plugin reducers
   */
  registerReducers(manager: Flex.Manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${Flex.VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
    /*
     * Direct use of 'subscribe' is generally discouraged.
     * This is a workaround until we deprecate 'getConfig' in it's current form after we migrate to Flex 2.0
     */
    subscribeToConfigUpdates(manager);
  }
}

initializeConfig();
