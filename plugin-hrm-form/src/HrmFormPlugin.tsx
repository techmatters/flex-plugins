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
import type Rollbar from 'rollbar';

import './styles/global-overrides.css';
import reducers, { namespace } from './states';
import HrmTheme, { overrides } from './styles/HrmTheme';
import { initLocalization } from './utils/pluginHelpers';
import * as Providers from './utils/setUpProviders';
import * as ActionFunctions from './utils/setUpActions';
import * as TaskRouterListeners from './utils/setUpTaskRouterListeners';
import * as Components from './utils/setUpComponents';
import * as Channels from './channels/setUpChannels';
import setUpMonitoring from './utils/setUpMonitoring';
import { changeLanguage } from './states/configuration/actions';
import { getPermissionsForViewingIdentifiers, PermissionActions } from './permissions';
import {
  getAseloFeatureFlags,
  getHrmConfig,
  getTemplateStrings,
  initializeConfig,
  subscribeToConfigUpdates,
} from './hrmConfig';
import { setUpSharedStateClient } from './utils/sharedState';
import { FeatureFlags } from './types/types';
import { setUpReferrableResources } from './components/resources/setUpReferrableResources';
import { subscribeNewMessageAlertOnPluginInit } from './notifications/newMessage';
import { subscribeReservedTaskAlert } from './notifications/reservedTask';
import { setUpCounselorToolkits } from './components/toolkits/setUpCounselorToolkits';

const PLUGIN_NAME = 'HrmFormPlugin';

// eslint-disable-next-line import/no-unused-modules
export type SetupObject = ReturnType<typeof getHrmConfig>;

const setUpTransfers = () => {
  setUpSharedStateClient();
};

const setUpLocalization = (config: ReturnType<typeof getHrmConfig>) => {
  const manager = Flex.Manager.getInstance();

  const { counselorLanguage, helplineLanguage } = config;

  const twilioStrings = { ...manager.strings }; // save the originals
  const setNewStrings = (newStrings: typeof getTemplateStrings) =>
    (manager.strings = { ...manager.strings, ...newStrings });
  const afterNewStrings = (language: string) => {
    manager.store.dispatch(changeLanguage(language));
    Flex.Actions.invokeAction('NavigateToView', { viewName: manager.store.getState().flex.view.activeView }); // force a re-render
  };
  const localizationConfig = { twilioStrings, setNewStrings, afterNewStrings };
  const initialLanguage = counselorLanguage || helplineLanguage;

  return initLocalization(localizationConfig, initialLanguage);
};

const setUpComponents = (
  featureFlags: FeatureFlags,
  setupObject: ReturnType<typeof getHrmConfig>,
  translateUI: (language: string) => Promise<void>,
) => {
  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  // setUp (add) dynamic components
  Components.setUpQueuesStatusWriter(setupObject);
  Components.setUpQueuesStatus(setupObject);
  Components.setUpAddButtons(featureFlags);
  Components.setUpNoTasksUI(featureFlags, setupObject);
  Components.setUpCustomCRMContainer();
  Channels.customiseDefaultChatChannels();
  Channels.setupTwitterChatChannel(maskIdentifiers);
  Channels.setupInstagramChatChannel(maskIdentifiers);
  Channels.setupLineChatChannel(maskIdentifiers);
  if (featureFlags.enable_transfers) {
    Components.setUpTransferComponents();
    Channels.setUpIncomingTransferMessage();
  }

  if (featureFlags.enable_case_management) Components.setUpCaseList();

  if (!Boolean(setupObject.helpline)) Components.setUpDeveloperComponents(translateUI); // utilities for developers only

  // remove dynamic components
  Components.removeTaskCanvasHeaderActions(featureFlags);
  Components.setLogo(setupObject.logoUrl);
  if (featureFlags.enable_transfers) {
    Components.removeDirectoryButton();
    Components.removeActionsIfTransferring();
  }

  Components.setUpStandaloneSearch();
  setUpReferrableResources();
  setUpCounselorToolkits();

  if (featureFlags.enable_emoji_picker) Components.setupEmojiPicker();
  if (featureFlags.enable_canned_responses) Components.setupCannedResponses();

  if (maskIdentifiers) {
    // Mask the identifiers in all default channels
    Channels.maskIdentifiersForDefaultChannels();

    // Mask the username within the messable bubbles in an conversation
    Flex.MessagingCanvas.defaultProps.memberDisplayOptions = {
      theirDefaultName: 'XXXXXX',
      theirFriendlyNameOverride: false,
      yourFriendlyNameOverride: true,
    };
    Flex.MessageList.Content.remove('0');
    // Masks TaskInfoPanelContent - TODO: refactor to use a react component
    const strings = getTemplateStrings();
    strings.TaskInfoPanelContent = strings.TaskInfoPanelContentMasked;
    strings.CallParticipantCustomerName = strings.MaskIdentifiers;
  }

  Components.setupTeamViewFilters();
  Components.setupWorkerDirectoryFilters();
};

const setUpActions = (
  featureFlags: FeatureFlags,
  setupObject: ReturnType<typeof getHrmConfig>,
  getMessage: (key: string) => (language: string) => Promise<string>,
) => {
  ActionFunctions.setUpPostSurvey(featureFlags);

  // bind setupObject to the functions that requires some initialization
  const transferOverride = ActionFunctions.customTransferTask(setupObject);
  const wrapupOverride = ActionFunctions.wrapupTask(setupObject, getMessage);
  const beforeCompleteAction = ActionFunctions.beforeCompleteTask(featureFlags);
  const afterWrapupAction = ActionFunctions.afterWrapupTask(featureFlags, setupObject);

  Flex.Actions.addListener('beforeAcceptTask', ActionFunctions.initializeContactForm);

  Flex.Actions.addListener('afterAcceptTask', ActionFunctions.afterAcceptTask(featureFlags, setupObject, getMessage));

  if (featureFlags.enable_transfers) Flex.Actions.replaceAction('TransferTask', transferOverride);

  if (featureFlags.enable_transfers)
    Flex.Actions.addListener('afterCancelTransfer', ActionFunctions.afterCancelTransfer);

  Flex.Actions.replaceAction('HangupCall', ActionFunctions.hangupCall);

  Flex.Actions.replaceAction('WrapupTask', wrapupOverride);

  Flex.Actions.addListener('beforeCompleteTask', beforeCompleteAction);

  Flex.Actions.addListener('afterWrapupTask', afterWrapupAction);

  Flex.Actions.addListener('afterCompleteTask', ActionFunctions.afterCompleteTask);
};

export default class HrmFormPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  public Rollbar?: Rollbar;

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   */
  init(flex: typeof Flex, manager: Flex.Manager) {
    loadCSS('https://use.fontawesome.com/releases/v5.15.4/css/solid.css');

    setUpMonitoring(this, manager.workerClient, manager.serviceConfiguration);

    console.log(`Welcome to ${PLUGIN_NAME}`);
    this.registerReducers(manager);

    Providers.setMUIProvider();

    const config = getHrmConfig();
    const featureFlags = getAseloFeatureFlags();

    /*
     * localization setup (translates the UI if necessary)
     * WARNING: the way this is done right now is "hacky". More info in initLocalization declaration
     */
    const { translateUI, getMessage } = setUpLocalization(config);
    ActionFunctions.loadCurrentDefinitionVersion();

    if (featureFlags.enable_transfers) setUpTransfers();
    setUpComponents(featureFlags, config, translateUI);
    setUpActions(featureFlags, config, getMessage);
    TaskRouterListeners.setTaskWrapupEventListeners(featureFlags);

    subscribeReservedTaskAlert();
    subscribeNewMessageAlertOnPluginInit();

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
