import * as Flex from '@twilio/flex-ui';
import { FlexPlugin, loadCSS } from '@twilio/flex-plugin';
import SyncClient from 'twilio-sync';

import './styles/global-overrides.css';
import reducers, { namespace, configurationBase, RootState } from './states';
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

export const DEFAULT_TRANSFER_MODE = transferModes.cold;

let sharedStateClient: SyncClient;

const readConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = `${manager.serviceConfiguration.attributes.hrm_base_url}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${manager.workerClient.accountSid}`;
  const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
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
  const featureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
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

let cachedConfig;

try {
  cachedConfig = readConfig();
} catch (err) {
  console.log(
    'Failed to read config on page load, leaving undefined for now (it will be populated when the flex reducer runs)',
    err,
  );
}

export const getConfig = () => cachedConfig;

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

const setUpTransferredTaskJanitor = async (setupObject: SetupObject) => {
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

const setUpTransfers = (setupObject: SetupObject) => {
  setUpSharedStateClient();
  setUpTransferredTaskJanitor(setupObject);
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

  // setUp (add) dynamic components
  Components.setUpQueuesStatusWriter(setupObject);
  Components.setUpQueuesStatus(setupObject);
  Components.setUpAddButtons(setupObject);
  Components.setUpNoTasksUI(setupObject);
  Components.setUpCustomCRMContainer();
  Components.setupTwitterChatChannel();
  Components.setupInstagramChatChannel();
  if (featureFlags.enable_transfers) {
    Components.setUpTransferComponents();
    Components.setUpIncomingTransferMessage();
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
};

const setUpActions = (setupObject: SetupObject) => {
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
   */
  init(flex: typeof Flex, manager: Flex.Manager) {
    loadCSS('https://use.fontawesome.com/releases/v5.15.1/css/solid.css');

    setUpMonitoring(this, manager.workerClient, manager.serviceConfiguration);

    console.log(`Welcome to ${PLUGIN_NAME}`);
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

    const managerConfiguration: any = {
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
