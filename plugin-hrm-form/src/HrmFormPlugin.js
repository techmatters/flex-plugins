import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomCRMContainer from './components/CustomCRMContainer';
import QueuesStatus from './components/queuesStatus';
import TransferButton from './components/transfer/TransferButton';
import QueuesStatusWriter from './components/queuesStatus/QueuesStatusWriter';
import reducers, { namespace } from './states';
import { Actions } from './states/ContactState';
import ConfigurationContext from './contexts/ConfigurationContext';
import LocalizationContext from './contexts/LocalizationContext';
import HrmTheme from './styles/HrmTheme';
import './styles/GlobalOverrides';
import { channelTypes, transferStatuses } from './states/DomainConstants';
import { addDeveloperUtils, initLocalization } from './utils/pluginHelpers';
import { changeLanguage } from './states/ConfigurationState';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.4.1';
const DEFAULT_TRANSFER_MODE = 'COLD';

const setUpComponents = () => {
  Flex.TaskCanvasHeader.Content.add(<TransferButton key="chat-transfer-button" />, {
    sortOrder: 1,
    if: props => props.task.taskStatus === 'assigned',
  });
};

// eslint-disable-next-line consistent-return
const transferOverride = async (payload, original) => {
  console.log('TRANSFER PAYLOAD', payload);

  const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

  // Set transfer metadata
  const updatedAttributes = {
    ...payload.task.attributes,
    transferMeta: {
      mode,
      originalTask: payload.task.taskSid,
      originalCounselor: payload.task.workerSid,
      transferStatus: transferStatuses.transferring,
      formDocument: null, // the name of the Sync document where the form is stored (save it before this)
    },
  };
  await payload.task.setAttributes(updatedAttributes);

  if (!Flex.TaskHelper.isChatBasedTask(payload.task)) {
    return original(payload);
  }

  const manager = Flex.Manager.getInstance();
  // const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
  const serverlessBaseUrl = 'http://localhost:3000';

  const body = {
    Token: manager.user.token,
    mode,
    taskSid: payload.task.taskSid,
    targetSid: payload.targetSid,
    workerName: manager.user.identity,
  };

  await fetch(`${serverlessBaseUrl}/transferChat`, {
    method: 'POST',
    body: new URLSearchParams(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });
};

const setUpActions = () => {
  Flex.Actions.replaceAction('TransferTask', (payload, original) => transferOverride(payload, original));

  /*
   * Flex.Actions.replaceAction('WrapupTask', async (payload, original) => {
   *   if (payload.task.attributes.warmTransfer) {
   *     // Set the channelSid and ProxySessionSID to a dummy value. This keeps the session alive
   *     const updatedAttributes = {
   *       ...payload.task.attributes,
   *       channelSid: 'CH00000000000000000000000000000000',
   *       proxySessionSID: 'KC00000000000000000000000000000000',
   *     };
   *
   *     await payload.task.setAttributes(updatedAttributes);
   *   }
   *
   *   original(payload);
   * });
   */

  Flex.Actions.addListener('beforeWrapupTask', (payload, abortFunction) => {
    console.log('ACCEPT TASK EVENT', payload);
  });

  Flex.Actions.addListener('beforeAcceptTask', (payload, abortFunction) => {
    console.log('ACCEPT TASK EVENT', payload);
  });
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
      manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl, workerSid, helpline));
    });

    flex.Actions.addListener('afterCompleteTask', payload => {
      manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
    });

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
