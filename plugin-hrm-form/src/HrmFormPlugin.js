import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import SyncClient from 'twilio-sync';

import './styles/GlobalOverrides';
import CustomCRMContainer from './components/CustomCRMContainer';
import QueuesStatus from './components/queuesStatus';
import QueuesStatusWriter from './components/queuesStatus/QueuesStatusWriter';
import { TransferButton, AcceptTransferButton, RejectTransferButton } from './components/transfer';
import reducers, { namespace } from './states';
import LocalizationContext from './contexts/LocalizationContext';
import HrmTheme from './styles/HrmTheme';
import { channelTypes, transferModes } from './states/DomainConstants';
import { addDeveloperUtils, initLocalization } from './utils/pluginHelpers';
import * as ActionFunctions from './utils/setUpActions';
import * as TransferHelpers from './utils/transfer';
import { changeLanguage } from './states/ConfigurationState';
import { issueSyncToken } from './services/ServerlessService';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.5.0';
export const DEFAULT_TRANSFER_MODE = transferModes.cold;

/**
 * Sync Client used to store and share documents across counselors
 * @type {SyncClient}
 */
let sharedStateClient;

export const getConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;
  const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
  const workerSid = manager.workerClient.sid;
  const { helpline, counselorLanguage, helplineLanguage } = manager.workerClient.attributes;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const { identity, token } = manager.user;
  const { configuredLanguage } = manager.serviceConfiguration.attributes;
  const featureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
  const { strings } = manager;

  return {
    hrmBaseUrl,
    serverlessBaseUrl,
    workerSid,
    helpline,
    currentWorkspace,
    counselorLanguage,
    helplineLanguage,
    configuredLanguage,
    identity,
    token,
    featureFlags,
    sharedStateClient,
    strings,
  };
};

const setUpSharedStateClient = () => {
  const updateSharedStateToken = async () => {
    try {
      const syncToken = await issueSyncToken();
      await sharedStateClient.updateToken(syncToken);
    } catch (err) {
      console.log('SYNC TOKEN ERROR', err);
    }
  };

  // initializes sync client for shared state
  const initSharedStateClient = async () => {
    try {
      const syncToken = await issueSyncToken();
      sharedStateClient = new SyncClient(syncToken);
      sharedStateClient.on('tokenAboutToExpire', () => updateSharedStateToken());
    } catch (err) {
      console.log('SYNC CLIENT INIT ERROR', err);
    }
  };

  initSharedStateClient();
};

const setUpTransferredTaskJanitor = async setupObject => {
  const { workerSid } = setupObject;
  const query = 'data.attributes.channelSid == "CH00000000000000000000000000000000"';
  const reservationQuery = await Flex.Manager.getInstance().insightsClient.liveQuery('tr-reservation', query);
  reservationQuery.on('itemUpdated', args => {
    if (TransferHelpers.shouldInvokeCompleteTask(args.value, workerSid)) {
      Flex.Actions.invokeAction('CompleteTask', { sid: args.value.reservation_sid });
    }
  });
};

const setUpTransfers = setupObject => {
  setUpSharedStateClient();
  setUpTransferredTaskJanitor(setupObject);
};

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

const setUpTransferComponents = () => {
  Flex.TaskCanvasHeader.Content.add(<TransferButton key="transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferButton(props.task),
  });

  Flex.TaskCanvasHeader.Content.remove('actions', {
    if: props => TransferHelpers.isTransferring(props.task),
  });

  Flex.TaskCanvasHeader.Content.add(<AcceptTransferButton key="complete-transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferControls(props.task),
  });

  Flex.TaskCanvasHeader.Content.add(<RejectTransferButton key="reject-transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferControls(props.task),
  });
};

const setUpComponents = setupObject => {
  const manager = Flex.Manager.getInstance();

  const { helpline, translateUI, featureFlags } = setupObject;

  // utilities for developers only
  if (!Boolean(helpline)) addDeveloperUtils(manager, translateUI);

  Flex.MainContainer.Content.add(
    <QueuesStatusWriter insightsClient={manager.insightsClient} key="queue-status-writer" helpline={helpline} />,
    {
      sortOrder: -1,
      align: 'start',
    },
  );

  const voiceColor = { Accepted: Flex.DefaultTaskChannels.Call.colors.main() };
  const webColor = Flex.DefaultTaskChannels.Chat.colors.main;
  const facebookColor = Flex.DefaultTaskChannels.ChatMessenger.colors.main;
  const smsColor = Flex.DefaultTaskChannels.ChatSms.colors.main;
  const whatsappColor = Flex.DefaultTaskChannels.ChatWhatsApp.colors.main;
  Flex.TaskListContainer.Content.add(
    <QueuesStatus
      key="queue-status"
      colors={{
        voiceColor,
        webColor,
        facebookColor,
        smsColor,
        whatsappColor,
      }}
    />,
    {
      sortOrder: -1,
      align: 'start',
    },
  );

  const onCompleteTask = async (sid, task) => {
    if (task.status !== 'wrapping') {
      if (task.channelType === channelTypes.voice) {
        await Flex.Actions.invokeAction('HangupCall', { sid, task });
      } else {
        await Flex.Actions.invokeAction('WrapupTask', { sid, task });
      }
    }

    Flex.Actions.invokeAction('CompleteTask', { sid, task });
  };

  const options = { sortOrder: -1 };
  Flex.CRMContainer.Content.replace(
    <LocalizationContext.Provider
      value={{ manager, isCallTask: Flex.TaskHelper.isCallTask }}
      key="custom-crm-container"
    >
      <CustomCRMContainer handleCompleteTask={onCompleteTask} />
    </LocalizationContext.Provider>,
    options,
  );

  // Must use submit buttons in CRM container to complete task
  Flex.TaskCanvasHeader.Content.remove('actions', {
    if: props => props.task && props.task.status === 'wrapping',
  });

  Flex.MainHeader.Content.remove('logo');

  if (featureFlags.enable_transfers) setUpTransferComponents();
};

const setUpActions = setupObject => {
  const { featureFlags } = setupObject;

  // bind setupObject to the functions that requires some initializaton
  const transferOverride = ActionFunctions.customTransferTask(setupObject);
  const wrapupOverride = ActionFunctions.wrapupTask(setupObject);
  const beforeCompleteAction = ActionFunctions.sendFormToBackend(setupObject);

  Flex.Actions.addListener('beforeAcceptTask', ActionFunctions.initializeContactForm);

  if (featureFlags.enable_transfers) Flex.Actions.addListener('afterAcceptTask', ActionFunctions.restoreFormIfTransfer);

  if (featureFlags.enable_transfers) Flex.Actions.replaceAction('TransferTask', transferOverride);

  Flex.Actions.replaceAction('HangupCall', ActionFunctions.hangupCall);

  Flex.Actions.replaceAction('WrapupTask', wrapupOverride);

  Flex.Actions.addListener('beforeCompleteTask', beforeCompleteAction);

  Flex.Actions.addListener('afterCompleteTask', ActionFunctions.removeContactForm);
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
    console.log(`Welcome to ${PLUGIN_NAME} Version ${PLUGIN_VERSION}`);
    this.registerReducers(manager);

    const config = getConfig();

    /*
     * localization setup (translates the UI if necessary)
     * WARNING: the way this is done right now is "hacky". More info in initLocalization declaration
     */
    const { translateUI, getGoodbyeMsg } = setUpLocalization(config);

    const setupObject = { ...config, translateUI, getGoodbyeMsg };

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
