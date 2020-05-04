import React from 'react';
import { View } from '@twilio/flex-ui';

import Translator from '../components/translator';
import SettingsSideLink from '../components/sideLinks/SettingsSideLink';
import { defaultLanguage } from '../states/ConfigurationState';
import { getTranslation, getMessages } from '../services/ServerlessService';

const defaultTranslation = require(`../translations/${defaultLanguage}/flexUI.json`);
const defaultMessages = require(`../translations/${defaultLanguage}/messages.json`);

const translationErrorMsg = 'Could not translate, using default';

/**
 * @returns {(language: string) => Promise<void>}
 */
const initTranslateUI = localizationConfig => async language => {
  const { twilioStrings, serverlessBaseUrl, getSsoToken, setNewStrings, afterNewStrings } = localizationConfig;
  try {
    if (language === defaultLanguage) {
      setNewStrings({ ...twilioStrings, ...defaultTranslation });
    } else {
      const body = { language };
      const translationJSON = await getTranslation({ serverlessBaseUrl, getSsoToken }, body);
      const translation = await JSON.parse(translationJSON);
      setNewStrings(translation);
    }
    afterNewStrings(language);
    console.log('Translation OK');
  } catch (err) {
    window.alert(translationErrorMsg);
    console.error(translationErrorMsg, err);
  }
};

/**
 * @returns {(language: string) => Promise<void>}
 */
const initGetGoodbyeMsg = localizationConfig => async language => {
  const { serverlessBaseUrl, getSsoToken } = localizationConfig;
  try {
    if (language && language !== defaultLanguage) {
      const body = { language };
      const messagesJSON = await getMessages({ serverlessBaseUrl, getSsoToken }, body);
      const messages = await JSON.parse(messagesJSON);
      return messages.GoodbyeMsg ? messages.GoodbyeMsg : defaultMessages.GoodbyeMsg;
    }

    return defaultMessages.GoodbyeMsg;
  } catch (err) {
    window.alert(translationErrorMsg);
    console.error(translationErrorMsg, err);
    return defaultMessages.GoodbyeMsg;
  }
};

/**
 *
 * @param {{ twilioStrings: any; serverlessBaseUrl: string; getSsoToken: () => string; setNewStrings: (newStrings: any) => void; afterNewStrings: (language: string) => void; }} localizationConfig
 * @param {string} initialLanguage
 */
export const initLocalization = (localizationConfig, initialLanguage) => {
  const translateUI = initTranslateUI(localizationConfig);
  const getGoodbyeMsg = initGetGoodbyeMsg(localizationConfig);

  const { setNewStrings } = localizationConfig;

  setNewStrings(defaultTranslation);
  if (initialLanguage && initialLanguage !== defaultLanguage) translateUI(initialLanguage);

  return {
    translateUI,
    getGoodbyeMsg,
  };
};

export const addDeveloperUtils = (flex, manager, translateUI) => {
  flex.ViewCollection.Content.add(
    <View name="settings" key="settings-view">
      <div>
        <Translator manager={manager} translateUI={translateUI} key="translator" />
      </div>
    </View>,
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
};
