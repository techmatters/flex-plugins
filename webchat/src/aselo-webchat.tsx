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

import React from 'react';
import * as FlexWebChat from '@twilio/flex-webchat-ui';
import { Channel } from 'twilio-chat/lib/channel';
import { Provider } from 'react-redux';
import { FlexState } from '@twilio/flex-webchat-ui/src/Store';
import { Reducer } from 'redux';

import { getUserIp } from './ip-tracker';
import { displayOperatingHours } from './operating-hours';
import { updateZIndex, getWebChatAttributeValues } from './dom-utils';
import blockedIps from './blockedIps.json';
import CloseChatButtons from './end-chat/CloseChatButtons';
import { getChangeLanguageWebChat } from './language';
import { applyMobileOptimization } from './mobile-optimization';
import { aseloReducer } from './aselo-webchat-state';
import { subscribeToChannel } from './task';
import { addContactIdentifierToContext } from './contact-identifier';
import type { Configuration } from '../types';
// eslint-disable-next-line import/no-unresolved
import { config } from './config';
import { renderEmojis } from './emoji-picker/renderEmojis';
import { renderCustomMessageBubble } from './messagebubble-component/renderCustomMessageBubble';
import PreEngagementForm, { PLACEHOLDER_PRE_ENGAGEMENT_CONFIG } from './pre-engagement-form';
import { setFormDefinition } from './pre-engagement-form/state';
import { applyWidgetBranding } from './branding-overrides';

updateZIndex();

const e2eTestModeConfigOverride = {
  enableRecaptcha: false,
  checkOpenHours: false,
};

const { externalWebChatLanguage, color, backgroundColor, e2eTestMode } = getWebChatAttributeValues();
// eslint-disable-next-line import/no-unused-modules
export const getCurrentConfig = (): Configuration => {
  if (!config) {
    throw new Error(`Failed trying to load config file ${webpack.env.CONFIG}`);
  }

  if (e2eTestMode) {
    return {
      ...config,
      ...e2eTestModeConfigOverride,
    };
  }

  return config;
};

const currentConfig = getCurrentConfig();

const { defaultLanguage, translations } = currentConfig;
const initialLanguage = defaultLanguage;

const chatChannel = async (manager: FlexWebChat.Manager): Promise<Channel> => {
  const { channelSid } = manager.store.getState().flex.session;
  return manager.chatClient.getChannelBySid(channelSid);
};

const unlockInput = (manager: FlexWebChat.Manager) => {
  const { user } = manager.chatClient;
  const { lockInput, ...attributes } = user.attributes as any;
  user.updateAttributes(attributes);
};

const setListenerToUnlockInput = async (channel: Channel, manager: FlexWebChat.Manager) => {
  if (!channel) return;

  const cb = () => {
    // Re-enable input
    unlockInput(manager);
  };

  // User is not alone in the channel (possible cause to enter this case is page reload)
  const membersCount = await channel.getMembersCount();
  if (membersCount > 1) {
    cb();
    return;
  }

  // Adds an event listener that will run only once
  channel.once('memberJoined', () => {
    cb();
  });
};

const setChannelOnCreateWebChat = async (channel: Channel, manager: FlexWebChat.Manager) => {
  setListenerToUnlockInput(channel, manager);
};

const setChannelAfterStartEngagement = async (channel: Channel, manager: FlexWebChat.Manager) => {
  setListenerToUnlockInput(channel, manager);

  const { contactIdentifier } = manager.configuration.context;

  // Generate task by sending empty message (hidden from the UI above)
  const message = `${translations[initialLanguage].AutoFirstMessage} ${contactIdentifier}`;
  channel.sendMessage(message);
};
// eslint-disable-next-line sonarjs/cognitive-complexity
export const initWebchat = async () => {
  let ip: string | undefined;
  if (currentConfig.captureIp) {
    ip = await getUserIp();
  }

  if (Array.isArray(blockedIps) && ip && (blockedIps as string[]).includes(ip)) {
    // Do not initialize plugin for this ip
    return;
  }

  const appConfig = {
    accountSid: currentConfig.accountSid,
    flexFlowSid: currentConfig.flexFlowSid,
    startEngagementOnInit: false,
    preEngagementConfig: PLACEHOLDER_PRE_ENGAGEMENT_CONFIG,
    context: {
      ip,
      e2eTestMode,
    },
    colorTheme: {
      overrides: {
        PreEngagementCanvas: {
          Container: {
            ':first-child': {
              'white-space': 'break-spaces',
            },
          },
          Form: {
            Label: { display: 'block' },
          },
        },
      },
    },
  };

  const webchat = await FlexWebChat.createWebChat(appConfig);
  const { manager } = webchat;
  manager.store.replaceReducer(aseloReducer as Reducer<FlexState>);
  manager.store.dispatch(setFormDefinition(currentConfig.preEngagementConfig));

  const changeLanguageWebChat = getChangeLanguageWebChat(manager, currentConfig);
  changeLanguageWebChat(externalWebChatLanguage || initialLanguage);

  await displayOperatingHours(currentConfig, manager, externalWebChatLanguage);

  // If caller is waiting for a counselor to connect, disable input (default language)
  if (manager.chatClient) {
    const channel = await chatChannel(manager);
    await setChannelOnCreateWebChat(channel, manager);
    await subscribeToChannel(manager, channel);
  }

  // Disable greeting message as chatbot already includes one
  FlexWebChat.MessagingCanvas.defaultProps.predefinedMessage = undefined;

  // Set caller name to be 'You'
  FlexWebChat.MessagingCanvas.defaultProps.memberDisplayOptions = currentConfig.memberDisplayOptions
    ? currentConfig.memberDisplayOptions
    : {
        yourDefaultName: 'You',
        yourFriendlyNameOverride: false,
        theirFriendlyNameOverride: true,
      };

  renderCustomMessageBubble();

  // Hide message input and send button if disabledReason is not undefined
  FlexWebChat.MessageInput.Content.remove('textarea', {
    if: () => (manager.chatClient.user.attributes as any).lockInput,
  });

  // Hide first message ("AutoFirstMessage", sent to create a new task)
  FlexWebChat.MessageList.Content.remove('0');

  addContactIdentifierToContext(manager);

  // Posting question from preengagement form as users first chat message
  FlexWebChat.Actions.addListener('afterStartEngagement', async (payload) => {
    const { language } = payload.formData;

    // Here we collect caller language (from preEngagement select) and change UI language
    changeLanguageWebChat(language || externalWebChatLanguage);

    const channel = await chatChannel(manager);

    await setChannelAfterStartEngagement(channel, manager);
    await subscribeToChannel(manager, channel);
  });

  FlexWebChat.Actions.addListener('afterRestartEngagement', (payload) => {
    if (payload.exit) {
      setTimeout(() => window.location.replace('https://google.com'), 1000);
    }
  });

  // eslint-disable-next-line no-unused-expressions
  currentConfig.showEmojiPicker !== false && renderEmojis(manager, currentConfig.blockedEmojis);

  // Add CloseButtons
  FlexWebChat.MessagingCanvas.Content.add(
    <Provider store={manager.store as any} key="closechatprovider">
      <CloseChatButtons />
    </Provider>,
    {
      sortOrder: -2,
    },
  );

  // Replace pre engagement form
  FlexWebChat.PreEngagementCanvas.Content.replace(
    <PreEngagementForm key="pre-engagement" manager={manager} enableRecaptcha={currentConfig.enableRecaptcha} />,
  );

  // Render WebChat
  webchat.init();

  applyMobileOptimization(manager);

  // This adds the custom colors to webchat and revert to the default colors if backgroundColor or color is null/undefined
  applyWidgetBranding(backgroundColor as string, color as string);
};
