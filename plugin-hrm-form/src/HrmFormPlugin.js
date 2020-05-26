import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import SyncClient from 'twilio-sync';

import CustomCRMContainer from './components/CustomCRMContainer';
import QueuesStatus from './components/queuesStatus';
import { TransferButton, CompleteTransferButton, RejectTransferButton } from './components/transfer';
import {
  isTransferring,
  isColdTransfer,
  showTransferButton,
  showTransferControls,
  shouldSubmitForm,
  saveFormSharedState,
  loadFormSharedState,
  setTransferMeta,
} from './components/transfer/helpers';
import QueuesStatusWriter from './components/queuesStatus/QueuesStatusWriter';
import reducers, { namespace, contactFormsBase } from './states';
import { Actions } from './states/ContactState';
import ConfigurationContext from './contexts/ConfigurationContext';
import LocalizationContext from './contexts/LocalizationContext';
import HrmTheme from './styles/HrmTheme';
import './styles/GlobalOverrides';
import { channelTypes, transferModes } from './states/DomainConstants';
import { addDeveloperUtils, initLocalization } from './utils/pluginHelpers';
import { changeLanguage } from './states/ConfigurationState';
import { transferChatStart, issueSyncToken } from './services/ServerlessService';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.4.1';
const DEFAULT_TRANSFER_MODE = transferModes.cold;

export const getConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;
  const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
  const workerSid = manager.workerClient.sid;
  const { helpline } = manager.workerClient.attributes;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const { identity, token } = manager.user;

  return { hrmBaseUrl, serverlessBaseUrl, workerSid, helpline, currentWorkspace, identity, token };
};

/**
 * Sync Client to store shared documents. TODO: This will be much safer if stored in state (maybe Redux? but how acces to it from handlers?)
 * @type {SyncClient}
 */
let sharedStateClient;
export const getSharedStateClient = () => sharedStateClient;

const setUpSharedStateClient = () => {
  const updateSharedStateToken = async () => {
    try {
      const syncToken = await issueSyncToken({});
      await sharedStateClient.updateToken(syncToken);
    } catch (err) {
      console.log('SYNC TOKEN ERROR', err);
    }
  };

  // initializes sync client for shared state
  const initSharedStateClient = async () => {
    try {
      const syncToken = await issueSyncToken({});
      sharedStateClient = new SyncClient(syncToken);
      sharedStateClient.on('tokenAboutToExpire', () => updateSharedStateToken());
    } catch (err) {
      console.log('SYNC CLIENT INIT ERROR', err);
    }
  };

  initSharedStateClient();
};

const setUpComponents = () => {
  Flex.TaskCanvasHeader.Content.add(<TransferButton key="transfer-button" />, {
    sortOrder: 1,
    if: props => showTransferButton(props.task),
  });

  Flex.TaskCanvasHeader.Content.remove('actions', {
    if: props => isTransferring(props.task),
  });

  Flex.TaskCanvasHeader.Content.add(<CompleteTransferButton key="complete-transfer-button" />, {
    sortOrder: 1,
    if: props => showTransferControls(props.task),
  });

  Flex.TaskCanvasHeader.Content.add(<RejectTransferButton key="reject-transfer-button" />, {
    sortOrder: 1,
    if: props => showTransferControls(props.task),
  });
};

// eslint-disable-next-line consistent-return
const transferOverride = async (payload, original) => {
  console.log('TRANSFER PAYLOAD', payload);

  const manager = Flex.Manager.getInstance();

  // save current form state as sync document (if there is a form)
  const form = manager.store.getState()[namespace][contactFormsBase].tasks[payload.task.taskSid];
  const documentName = await saveFormSharedState(form, payload.task.taskSid);

  const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

  // set metadata for the transfer
  await setTransferMeta(payload.task, mode, documentName);

  if (!Flex.TaskHelper.isChatBasedTask(payload.task)) {
    return original(payload);
  }

  const body = {
    mode,
    taskSid: payload.task.taskSid,
    targetSid: payload.targetSid,
    workerName: manager.user.identity,
  };

  await transferChatStart(body);
};

const restoreFormIfCold = async payload => {
  if (isColdTransfer(payload.task)) {
    const manager = Flex.Manager.getInstance();
    const form = await loadFormSharedState(payload.task);
    if (form) manager.store.dispatch(Actions.restoreEntireForm(form, payload.task.taskSid));
  }
};

const setUpActions = () => {
  Flex.Actions.replaceAction('TransferTask', (payload, original) => transferOverride(payload, original));

  Flex.Actions.addListener('afterAcceptTask', payload => restoreFormIfCold(payload));
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

    const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;
    const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
    const { configuredLanguage } = manager.serviceConfiguration.attributes;
    const workerSid = manager.workerClient.sid;
    const { helpline, counselorLanguage, helplineLanguage } = manager.workerClient.attributes;
    const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
    const getSsoToken = () => manager.store.getState().flex.session.ssoTokenPayload.token;
    const { isCallTask } = Flex.TaskHelper;

    /*
     * localization setup (translates the UI if necessary)
     * WARNING: the way this is done right now is "hacky". More info in initLocalization declaration
     */
    const twilioStrings = { ...manager.strings }; // save the originals
    const setNewStrings = newStrings => (manager.strings = { ...manager.strings, ...newStrings });
    const afterNewStrings = language => {
      manager.store.dispatch(changeLanguage(language));
      flex.Actions.invokeAction('NavigateToView', { viewName: manager.store.getState().flex.view.activeView }); // force a re-render
    };
    const localizationConfig = { twilioStrings, serverlessBaseUrl, getSsoToken, setNewStrings, afterNewStrings };
    const initialLanguage = counselorLanguage || helplineLanguage || configuredLanguage;
    const { translateUI, getGoodbyeMsg } = initLocalization(localizationConfig, initialLanguage);

    const configuration = {
      colorTheme: HrmTheme,
    };
    manager.updateConfig(configuration);

    const onCompleteTask = async (sid, task) => {
      if (task.status !== 'wrapping') {
        if (task.channelType === channelTypes.voice) {
          await flex.Actions.invokeAction('HangupCall', { sid, task });
        } else {
          await flex.Actions.invokeAction('WrapupTask', { sid, task });
        }
      }
      flex.Actions.invokeAction('CompleteTask', { sid, task });
    };

    // TODO(nick): Eventually remove this log line or set to debug
    console.log(`HRM URL: ${hrmBaseUrl}`);
    if (hrmBaseUrl === undefined) {
      console.error('HRM base URL not defined, you must provide this to save program data');
    }

    // utilities for developers only
    if (!Boolean(helpline)) addDeveloperUtils(flex, manager, translateUI);

    flex.MainContainer.Content.add(
      <QueuesStatusWriter insightsClient={manager.insightsClient} key="queue-status-writer" helpline={helpline} />,
      {
        sortOrder: -1,
        align: 'start',
      },
    );

    const voiceColor = { Accepted: flex.DefaultTaskChannels.Call.colors.main() };
    const webColor = flex.DefaultTaskChannels.Chat.colors.main;
    const facebookColor = flex.DefaultTaskChannels.ChatMessenger.colors.main;
    const smsColor = flex.DefaultTaskChannels.ChatSms.colors.main;
    const whatsappColor = flex.DefaultTaskChannels.ChatWhatsApp.colors.main;
    flex.TaskListContainer.Content.add(
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

    // TODO(nick): Can we avoid passing down the task prop, maybe using context?
    const options = { sortOrder: -1 };
    flex.CRMContainer.Content.replace(
      <ConfigurationContext.Provider
        value={{ hrmBaseUrl, serverlessBaseUrl, workerSid, helpline, currentWorkspace, getSsoToken }}
        key="custom-crm-container"
      >
        <LocalizationContext.Provider value={{ manager, isCallTask }}>
          <CustomCRMContainer handleCompleteTask={onCompleteTask} />
        </LocalizationContext.Provider>
      </ConfigurationContext.Provider>,
      options,
    );

    // Must use submit buttons in CRM container to complete task
    flex.TaskCanvasHeader.Content.remove('actions', {
      if: props => props.task && props.task.status === 'wrapping',
    });

    flex.Actions.addListener('beforeAcceptTask', payload => {
      manager.store.dispatch(Actions.initializeContactState(payload.task.taskSid));
    });

    flex.Actions.addListener('beforeCompleteTask', (payload, abortFunction) => {
      console.log('BEFORE COMPLETE', payload);
      console.log('WILL SUBMIT FORM?', shouldSubmitForm(payload.task));
      if (shouldSubmitForm(payload.task)) {
        manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl, workerSid, helpline));
      }
    });

    flex.Actions.addListener('afterCompleteTask', payload => {
      manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
    });

    const shouldSayGoodbye = channel =>
      channel === channelTypes.facebook || channel === channelTypes.sms || channel === channelTypes.whatsapp;

    const getTaskLanguage = task => task.attributes.language || helplineLanguage || configuredLanguage;

    const sendGoodbyeMessage = async payload => {
      const taskLanguage = getTaskLanguage(payload.task);
      const goodbyeMsg = await getGoodbyeMsg(taskLanguage);
      await flex.Actions.invokeAction('SendMessage', {
        body: goodbyeMsg,
        channelSid: payload.task.attributes.channelSid,
      });
    };

    const saveEndMillis = async payload => {
      manager.store.dispatch(Actions.saveEndMillis(payload.task.taskSid));
    };

    /**
     * @param {import('@twilio/flex-ui').ActionFunction} fun
     * @returns {import('@twilio/flex-ui').ReplacedActionFunction}
     * A function that calls fun with the payload of the replaced action
     * and continues with the Twilio execution
     */
    const fromActionFunction = fun => async (payload, original) => {
      await fun(payload);
      original(payload);
    };

    const hangupCall = fromActionFunction(saveEndMillis);

    const wrapupTask = fromActionFunction(async payload => {
      if (shouldSayGoodbye(payload.task.channelType)) {
        await sendGoodbyeMessage(payload);
      }
      await saveEndMillis(payload);
    });

    flex.Actions.replaceAction('HangupCall', hangupCall);
    flex.Actions.replaceAction('WrapupTask', wrapupTask);

    setUpSharedStateClient();
    setUpComponents();
    setUpActions();
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
