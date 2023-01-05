import * as Flex from '@twilio/flex-ui';
import { FlexPlugin, loadCSS } from '@twilio/flex-plugin';
import SyncClient from 'twilio-sync';
import type Rollbar from 'rollbar';

import './styles/global-overrides.css';
import reducers, { namespace, configurationBase, RootState } from './states';
import HrmTheme, { overrides } from './styles/HrmTheme';
import { transferModes } from './states/DomainConstants';
import { initLocalization } from './utils/pluginHelpers';
import * as Providers from './utils/setUpProviders';
import * as ActionFunctions from './utils/setUpActions';
import * as TaskRouterListeners from './utils/setUpTaskRouterListeners';
import * as Components from './utils/setUpComponents';
import * as Channels from './channels/setUpChannels';
import setUpMonitoring from './utils/setUpMonitoring';
import { changeLanguage } from './states/configuration/actions';
import { issueSyncToken } from './services/ServerlessService';
import { getPermissionsForViewingIdentifiers, PermissionActions } from './permissions';
import type { FeatureFlags } from './types/types';
import { registerFonts } from 'components/case/casePrint/styles/index';

const PLUGIN_NAME = 'HrmFormPlugin';

export const DEFAULT_TRANSFER_MODE = transferModes.cold;

let sharedStateClient: SyncClient;

const readConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = `${process.env.REACT_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url}/${
    manager.serviceConfiguration.attributes.hrm_api_version
  }/accounts/${manager.workerClient.accountSid}`;
  const serverlessBaseUrl =
    process.env.REACT_SERVERLESS_BASE_URL || manager.serviceConfiguration.attributes.serverless_base_url;
  const logoUrl = manager.serviceConfiguration.attributes.logo_url;
  const chatServiceSid = manager.serviceConfiguration.chat_service_instance_sid;
  const workerSid = manager.workerClient.sid;
  const { helpline, counselorLanguage, full_name: counselorName, roles } = manager.workerClient.attributes as any;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const { identity, token } = manager.user;
  const isSupervisor = roles.includes('supervisor');
  const {
    helplineLanguage,
    definitionVersion,
    pdfImagesSource,
    multipleOfficeSupport,
    permissionConfig,
  } = manager.serviceConfiguration.attributes;
  const featureFlags: FeatureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
  const contactsWaitingChannels = manager.serviceConfiguration.attributes.contacts_waiting_channels || null;
  const { strings } = (manager as unknown) as { strings: { [key: string]: string } };

  return {
    hrmBaseUrl,
    serverlessBaseUrl,
    logoUrl,
    chatServiceSid,
    workerSid,
    helpline,
    currentWorkspace,
    counselorLanguage,
    helplineLanguage,
    identity,
    token,
    counselorName,
    isSupervisor,
    featureFlags,
    sharedStateClient,
    strings,
    definitionVersion,
    pdfImagesSource,
    multipleOfficeSupport,
    permissionConfig,
    contactsWaitingChannels,
  };
};

let cachedConfig: ReturnType<typeof readConfig>;

try {
  cachedConfig = readConfig();
} catch (err) {
  console.log(
    'Failed to read config on page load, leaving undefined for now (it will be populated when the flex reducer runs)',
    err,
  );
}

export const getConfig = () => cachedConfig;

registerFonts(cachedConfig.definitionVersion)

// eslint-disable-next-line import/no-unused-modules
export type SetupObject = ReturnType<typeof getConfig> & {
  translateUI: (language: string) => Promise<void>;
  getMessage: (messageKey: string) => (language: string) => Promise<string>;
};

/**
 * Helper to expose the forms definitions without the need of calling Manager
 */
export const getDefinitionVersions = () => {
  const { currentDefinitionVersion, definitionVersions } = (Flex.Manager.getInstance().store.getState() as RootState)[
    namespace
  ][configurationBase];

  return { currentDefinitionVersion, definitionVersions };
};

export const reRenderAgentDesktop = async () => {
  await Flex.Actions.invokeAction('NavigateToView', { viewName: 'empty-view' });
  await Flex.Actions.invokeAction('NavigateToView', { viewName: 'agent-desktop' });
};

const setUpSharedStateClient = () => {
  const updateSharedStateToken = async () => {
    try {
      const syncToken = await issueSyncToken();
      await sharedStateClient.updateToken(syncToken);
    } catch (err) {
      console.error('SYNC TOKEN ERROR', err);
    }
  };

  // initializes sync client for shared state
  const initSharedStateClient = async () => {
    try {
      const syncToken = await issueSyncToken();
      sharedStateClient = new SyncClient(syncToken);
      sharedStateClient.on('tokenAboutToExpire', () => updateSharedStateToken());
    } catch (err) {
      console.error('SYNC CLIENT INIT ERROR', err);
    }
  };

  initSharedStateClient();
};

const setUpTransfers = (setupObject: SetupObject) => {
  setUpSharedStateClient();
};

const setUpLocalization = (config: ReturnType<typeof getConfig>) => {
  const manager = Flex.Manager.getInstance();

  const { counselorLanguage, helplineLanguage } = config;

  const twilioStrings = { ...manager.strings }; // save the originals
  const setNewStrings = (newStrings: typeof config['strings']) =>
    (manager.strings = { ...manager.strings, ...newStrings });
  const afterNewStrings = (language: string) => {
    manager.store.dispatch(changeLanguage(language));
    Flex.Actions.invokeAction('NavigateToView', { viewName: manager.store.getState().flex.view.activeView }); // force a re-render
  };
  const localizationConfig = { twilioStrings, setNewStrings, afterNewStrings };
  const initialLanguage = counselorLanguage || helplineLanguage;

  return initLocalization(localizationConfig, initialLanguage);
};

const setUpComponents = (setupObject: SetupObject) => {
  const { helpline, featureFlags } = setupObject;
  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  // setUp (add) dynamic components
  Components.setUpQueuesStatusWriter(setupObject);
  Components.setUpQueuesStatus(setupObject);
  Components.setUpAddButtons(setupObject);
  Components.setUpNoTasksUI(setupObject);
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

  if (!Boolean(helpline)) Components.setUpDeveloperComponents(setupObject); // utilities for developers only

  // remove dynamic components
  Components.removeTaskCanvasHeaderActions(setupObject);
  Components.setLogo(setupObject.logoUrl);
  if (featureFlags.enable_transfers) {
    Components.removeDirectoryButton();
    Components.removeActionsIfTransferring();
  }

  Components.setUpStandaloneSearch();

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
    const { strings } = getConfig();
    strings.TaskInfoPanelContent = strings.TaskInfoPanelContentMasked;
    strings.CallParticipantCustomerName = strings.MaskIdentifiers;
  }
};

const setUpActions = (setupObject: SetupObject) => {
  const { featureFlags } = setupObject;

  // Is this the correct place for this call?
  ActionFunctions.loadCurrentDefinitionVersion();

  ActionFunctions.setUpPostSurvey(setupObject);

  // bind setupObject to the functions that requires some initialization
  const transferOverride = ActionFunctions.customTransferTask(setupObject);
  const wrapupOverride = ActionFunctions.wrapupTask(setupObject);
  const beforeCompleteAction = ActionFunctions.beforeCompleteTask(setupObject);
  const afterWrapupAction = ActionFunctions.afterWrapupTask(setupObject);

  Flex.Actions.addListener('beforeAcceptTask', ActionFunctions.initializeContactForm);

  Flex.Actions.addListener('afterAcceptTask', ActionFunctions.afterAcceptTask(setupObject));

  if (featureFlags.enable_transfers) Flex.Actions.replaceAction('TransferTask', transferOverride);

  if (featureFlags.enable_transfers)
    Flex.Actions.addListener('afterCancelTransfer', ActionFunctions.afterCancelTransfer);

  Flex.Actions.replaceAction('HangupCall', ActionFunctions.hangupCall);

  Flex.Actions.replaceAction('WrapupTask', wrapupOverride);

  Flex.Actions.addListener('beforeCompleteTask', beforeCompleteAction);

  Flex.Actions.addListener('afterWrapupTask', afterWrapupAction);

  Flex.Actions.addListener('afterCompleteTask', ActionFunctions.afterCompleteTask);
};

const setUpTaskRouterListeners = (setupObject: SetupObject) => {
  TaskRouterListeners.setTaskWrapupEventListeners(setupObject);
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

    const config = getConfig();

    /*
     * localization setup (translates the UI if necessary)
     * WARNING: the way this is done right now is "hacky". More info in initLocalization declaration
     */
    const { translateUI, getMessage } = setUpLocalization(config);

    const setupObject = { ...config, translateUI, getMessage };

    if (config.featureFlags.enable_transfers) setUpTransfers(setupObject);
    setUpComponents(setupObject);
    setUpActions(setupObject);
    setUpTaskRouterListeners(setupObject);

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
    manager.store.subscribe(() => {
      try {
        cachedConfig = readConfig();
      } catch (err) {
        console.warn('Failed to read configuration - leaving cached version the same', err);
      }
    });
  }
}
