import React from 'react';
import { VERSION, TaskHelper } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomCRMContainer from './components/CustomCRMContainer';
import reducers, { namespace } from './states';
import { Actions } from './states/ContactState';
import ConfigurationContext from './contexts/ConfigurationContext';
import LocalizationContext from './contexts/LocalizationContext';
import Translator from './components/translator';
import SettingsSideLink from './components/sideLinks/SettingsSideLink';
import HrmTheme from './styles/HrmTheme';
import { channelTypes } from './states/DomainConstants';
import { defaultLanguage, changeLanguage } from './states/ConfigurationState';
import { configuredLanguage } from './private/secret';

const PLUGIN_NAME = 'HrmFormPlugin';
const PLUGIN_VERSION = '0.4.1';
const defaultTranslation = require(`./translations/${defaultLanguage}/flexUI.json`);
const defaultMessages = require(`./translations/${defaultLanguage}/messages.json`);

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
    const workerSid = manager.workerClient.sid;
    const { helpline, counselorLanguage, helplineLanguage } = manager.workerClient.attributes;
    const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
    const getSsoToken = () => manager.store.getState().flex.session.ssoTokenPayload.token;
    const { isCallTask } = TaskHelper;

    const twilioStrings = { ...manager.strings }; // save the originals
    const setNewStrings = newStrings => (manager.strings = { ...manager.strings, ...newStrings });
    const translationErrorMsg = 'Could not translate, using default';

    const changeLanguageUI = async language => {
      try {
        if (language === defaultLanguage) {
          setNewStrings({ ...twilioStrings, ...defaultTranslation });
        } else {
          const response = await fetch(`${serverlessBaseUrl}/translations/${language}/flexUI.json`);
          const translation = await response.json();
          setNewStrings(translation);
        }
        manager.store.dispatch(changeLanguage(language));
        flex.Actions.invokeAction('NavigateToView', { viewName: manager.store.getState().flex.view.activeView }); // force a re-render
        console.log('Translation OK');
      } catch (err) {
        window.alert(translationErrorMsg);
        console.error(translationErrorMsg, err);
      }
    };

    const fetchGoodbyeMsg = async language => {
      try {
        if (language && language !== defaultLanguage) {
          const response = await fetch(`${serverlessBaseUrl}/translations/${language}/messages.json`);
          const messages = await response.json();
          return messages.GoodbyeMsg ? messages.GoodbyeMsg : defaultMessages.GoodbyeMsg;
        }

        return defaultMessages.GoodbyeMsg;
      } catch (err) {
        window.alert(translationErrorMsg);
        console.error(translationErrorMsg, err);
        return defaultMessages.GoodbyeMsg;
      }
    };

    // configure UI language
    setNewStrings(defaultTranslation);
    const language = counselorLanguage || helplineLanguage || configuredLanguage;
    if (language && language !== defaultLanguage) changeLanguageUI(language);

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

    flex.ViewCollection.Content.add(
      <flex.View name="settings" key="settings-view">
        <div>
          <Translator manager={manager} changeLanguageUI={changeLanguageUI} key="translator" />
        </div>
      </flex.View>,
    );

    flex.SideNav.Content.add(
      <SettingsSideLink
        key="SettingsSideLink"
        onClick={() => flex.Actions.invokeAction('NavigateToView', { viewName: 'settings' })}
      />,
      {
        align: 'end',
      },
    );

    // TODO(nick): Can we avoid passing down the task prop, maybe using context?
    const options = { sortOrder: -1 };
    flex.CRMContainer.Content.replace(
      <ConfigurationContext.Provider
        value={{ hrmBaseUrl, serverlessBaseUrl, workerSid, helpline, currentWorkspace, getSsoToken }}
        key="custom-crm-container"
      >
        <LocalizationContext.Provider value={{ strings: manager.strings, isCallTask }}>
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

    const shouldSayGoodbye = channel =>
      channel === channelTypes.facebook || channel === channelTypes.sms || channel === channelTypes.whatsapp;

    const getTaskLanguage = task =>
      task.attributes.language ||
      manager.store.getState().flex.worker.attributes.helplineLanguage ||
      configuredLanguage;

    const sendGoodbyeMessage = async payload => {
      const taskLanguage = getTaskLanguage(payload.task);
      const GoodbyeMsg = await fetchGoodbyeMsg(taskLanguage);
      await flex.Actions.invokeAction('SendMessage', {
        body: GoodbyeMsg,
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

    // This action is causing a rage condition. Link to issue https://github.com/twilio/flex-plugin-builder/issues/243
    const wrapupTask = fromActionFunction(async payload => {
      if (shouldSayGoodbye(payload.task.channelType)) {
        await sendGoodbyeMessage(payload);
      }
      await saveEndMillis(payload);
    });

    flex.Actions.replaceAction('HangupCall', hangupCall);
    flex.Actions.replaceAction('WrapupTask', wrapupTask);
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
