import * as Flex from '@twilio/flex-ui';
import { FlexPlugin, loadCSS } from 'flex-plugin';
import SyncClient from 'twilio-sync';

import './styles/GlobalOverrides';
import reducers, { namespace, configurationBase } from './states';
import HrmTheme from './styles/HrmTheme';
import { transferModes } from './states/DomainConstants';
import { initLocalization } from './utils/pluginHelpers';
import * as ActionFunctions from './utils/setUpActions';
import * as Components from './utils/setUpComponents';
import setUpMonitoring from './utils/setUpMonitoring';
import * as TransferHelpers from './utils/transfer';
import { changeLanguage } from './states/configuration/actions';
import { issueSyncToken } from './services/ServerlessService';

const PLUGIN_NAME = 'HrmFormPlugin';
export const PLUGIN_VERSION = '0.10.0';

export const DEFAULT_TRANSFER_MODE = transferModes.cold;

/**
 * Sync Client used to store and share documents across counselors
 * @type {SyncClient}
 */
let sharedStateClient;

export const getConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = `${manager.serviceConfiguration.attributes.hrm_base_url}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${manager.workerClient.accountSid}`;
  const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
  const logoUrl = manager.serviceConfiguration.attributes.logo_url;
  const chatServiceSid = manager.serviceConfiguration.chat_service_instance_sid;
  const workerSid = manager.workerClient.sid;
  const { helpline, counselorLanguage, helplineLanguage } = manager.workerClient.attributes;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const { identity, token } = manager.user;
  const counselorName = manager.workerClient.attributes.full_name;
  const isSupervisor = manager.workerClient.attributes.roles.includes('supervisor');
  const {
    configuredLanguage,
    definitionVersion,
    pdfImagesSource,
    multipleOfficeSupport,
    permissionConfig,
  } = manager.serviceConfiguration.attributes;
  const featureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
  /**
   *  @type {{ strings: { [key: string]: string } }}
   */
  const { strings } = manager;

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
    configuredLanguage,
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
  };
};

/**
 * Helper to expose the forms definitions without the need of calling Manager
 * @returns {{currentDefinitionVersion: import('./states/configuration/reducer').ConfigurationState['currentDefinitionVersion'], definitionVersions: import('./states/configuration/reducer').ConfigurationState['definitionVersions']}}
 */
export const getDefinitionVersions = () => {
  const { currentDefinitionVersion, definitionVersions } = Flex.Manager.getInstance().store.getState()[namespace][
    configurationBase
  ];

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

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpTransferredTaskJanitor = async setupObject => {
  const { workerSid } = setupObject;
  const query = 'data.attributes.transferStarted == "true"';
  const reservationQuery = await Flex.Manager.getInstance().insightsClient.liveQuery('tr-reservation', query);
  reservationQuery.on('itemUpdated', args => {
    if (TransferHelpers.shouldInvokeCompleteTask(args.value, workerSid)) {
      Flex.Actions.invokeAction('CompleteTask', { sid: args.value.reservation_sid });
      return;
    }

    if (TransferHelpers.shouldTakeControlBack(args.value, workerSid)) {
      const task = Flex.TaskHelper.getTaskByTaskSid(args.value.attributes.transferMeta.originalReservation);
      TransferHelpers.takeTaskControl(task).then(async () => {
        await TransferHelpers.clearTransferMeta(task);
      });
    }
  });
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpTransfers = setupObject => {
  setUpSharedStateClient();
  setUpTransferredTaskJanitor(setupObject);
};

/**
 * @param {ReturnType<typeof getConfig>} config
 */
const setUpLocalization = config => {
  const manager = Flex.Manager.getInstance();

  const { counselorLanguage, helplineLanguage, configuredLanguage } = config;

  const twilioStrings = { ...manager.strings }; // save the originals
  const setNewStrings = newStrings => (manager.strings = { ...manager.strings, ...newStrings });
  const afterNewStrings = language => {
    manager.store.dispatch(changeLanguage(language));
    Flex.Actions.invokeAction('NavigateToView', { viewName: manager.store.getState().flex.view.activeView }); // force a re-render
  };
  const localizationConfig = { twilioStrings, setNewStrings, afterNewStrings };
  const initialLanguage = counselorLanguage || helplineLanguage || configuredLanguage;

  return initLocalization(localizationConfig, initialLanguage);
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpComponents = setupObject => {
  const { helpline, featureFlags } = setupObject;

  // setUp (add) dynamic components
  Components.setUpQueuesStatusWriter(setupObject);
  Components.setUpQueuesStatus();
  Components.setUpAddButtons(setupObject);
  Components.setUpNoTasksUI(setupObject);
  Components.setUpCustomCRMContainer();
  Components.setupTwitterChatChannel();
  if (featureFlags.enable_transfers) {
    Components.setUpTransferComponents();
    Components.setUpIncomingTransferMessage();
  }

  if (featureFlags.enable_case_management) Components.setUpCaseList();

  if (!Boolean(helpline)) Components.setUpDeveloperComponents(setupObject); // utilities for developers only

  // remove dynamic components
  Components.removeActionsIfWrapping();
  Components.setLogo(setupObject.logoUrl);
  if (featureFlags.enable_transfers) {
    Components.removeDirectoryButton();
    Components.removeActionsIfTransferring();
  }

  Components.setUpStandaloneSearch();

  if (featureFlags.enable_canned_responses) Components.setupCannedResponses();
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpActions = setupObject => {
  const { featureFlags } = setupObject;

  // Is this the correct place for this call?
  ActionFunctions.loadCurrentDefinitionVersion();

  ActionFunctions.setUpPostSurvey(setupObject);

  // bind setupObject to the functions that requires some initializaton
  const transferOverride = ActionFunctions.customTransferTask(setupObject);
  const wrapupOverride = ActionFunctions.wrapupTask(setupObject);
  const beforeCompleteAction = ActionFunctions.beforeCompleteTask(setupObject);
  const afterCompleteAction = ActionFunctions.afterCompleteTask(setupObject);

  Flex.Actions.addListener('beforeAcceptTask', ActionFunctions.initializeContactForm);

  Flex.Actions.addListener('afterAcceptTask', ActionFunctions.afterAcceptTask(setupObject));

  if (featureFlags.enable_transfers) Flex.Actions.replaceAction('TransferTask', transferOverride);

  if (featureFlags.enable_transfers)
    Flex.Actions.addListener('afterCancelTransfer', ActionFunctions.afterCancelTransfer);

  Flex.Actions.replaceAction('HangupCall', ActionFunctions.hangupCall);

  Flex.Actions.replaceAction('WrapupTask', wrapupOverride);

  Flex.Actions.addListener('beforeCompleteTask', beforeCompleteAction);

  Flex.Actions.addListener('afterCompleteTask', afterCompleteAction);
};

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
    loadCSS('https://use.fontawesome.com/releases/v5.15.1/css/solid.css');

    if (process.env.NODE_ENV !== 'development')
      setUpMonitoring(this, manager.workerClient, manager.serviceConfiguration);

    console.log(`Welcome to ${PLUGIN_NAME} Version ${PLUGIN_VERSION}`);
    this.registerReducers(manager);

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

    const managerConfiguration = {
      colorTheme: HrmTheme,
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
   *
   * @param {import('@twilio/flex-ui').Manager} manager
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${Flex.VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
