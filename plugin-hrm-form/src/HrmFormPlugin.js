import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import './styles/GlobalOverrides';
import CustomCRMContainer from './components/CustomCRMContainer';
import QueuesStatus from './components/queuesStatus';
import QueuesStatusWriter from './components/queuesStatus/QueuesStatusWriter';
import reducers, { namespace, contactFormsBase } from './states';
import { Actions } from './states/ContactState';
import LocalizationContext from './contexts/LocalizationContext';
import HrmTheme from './styles/HrmTheme';
import { channelTypes } from './states/DomainConstants';
import { addDeveloperUtils, initLocalization } from './utils/pluginHelpers';
import * as TransferHelpers from './utils/transfer';
import { changeLanguage } from './states/ConfigurationState';
import { saveInsightsData } from './services/ServerlessService';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.4.2';

export const getConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = manager.serviceConfiguration.attributes.hrm_base_url;
  const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
  const workerSid = manager.workerClient.sid;
  const { helpline, counselorLanguage, helplineLanguage } = manager.workerClient.attributes;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const { identity, token } = manager.user;
  const { configuredLanguage } = manager.serviceConfiguration.attributes;

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
  };
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

const setUpComponents = setupObject => {
  const manager = Flex.Manager.getInstance();

  const { helpline, translateUI } = setupObject;

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
};

const setUpActions = setupObject => {
  const manager = Flex.Manager.getInstance();

  const { hrmBaseUrl, workerSid, helpline, helplineLanguage, configuredLanguage, getGoodbyeMsg } = setupObject;

  Flex.Actions.addListener('beforeAcceptTask', payload => {
    manager.store.dispatch(Actions.initializeContactState(payload.task.taskSid));
  });

  const saveInsights = async payload => {
    const { taskSid } = payload.task;
    const task = manager.store.getState()[namespace][contactFormsBase].tasks[taskSid];

    await saveInsightsData(task, taskSid);
  };

  Flex.Actions.addListener('beforeCompleteTask', async (payload, abortFunction) => {
    manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl, workerSid, helpline));
    await saveInsights(payload);
  });

  Flex.Actions.addListener('afterCompleteTask', payload => {
    manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
  });

  const shouldSayGoodbye = channel =>
    channel === channelTypes.facebook || channel === channelTypes.sms || channel === channelTypes.whatsapp;

  const getTaskLanguage = task => task.attributes.language || helplineLanguage || configuredLanguage;

  const sendGoodbyeMessage = async payload => {
    const taskLanguage = getTaskLanguage(payload.task);
    const goodbyeMsg = await getGoodbyeMsg(taskLanguage);
    await Flex.Actions.invokeAction('SendMessage', {
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
    await original(payload);
  };

  const hangupCall = fromActionFunction(saveEndMillis);

  const wrapupTask = fromActionFunction(async payload => {
    if (shouldSayGoodbye(payload.task.channelType)) {
      await sendGoodbyeMessage(payload);
    }
    await saveEndMillis(payload);
  });

  Flex.Actions.replaceAction('HangupCall', hangupCall);
  Flex.Actions.replaceAction('WrapupTask', wrapupTask);
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
    setUpComponents(setupObject);
    setUpActions(setupObject);

    const managerConfiguration = {
      colorTheme: HrmTheme,
    };
    manager.updateConfig(managerConfiguration);

    // TODO(nick): Eventually remove this log line or set to debug
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
