/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Client, ConnectionState } from '@twilio/conversations';
import { Dispatch } from 'redux';
import { ThunkAction, ThunkActionDispatch } from 'redux-thunk';

import { initMessagesListener } from './listeners/messagesListener';
import { initParticipantsListener } from './listeners/participantsListener';
import { initConversationListener } from './listeners/conversationListener';
import { ConfigState, EngagementPhase } from '../definitions';
import { initClientListeners } from './listeners/clientListener';
import { notifications } from '../../notifications';
import {
  ACTION_START_SESSION,
  ACTION_LOAD_CONFIG_REQUEST,
  ACTION_LOAD_CONFIG_SUCCESS,
  ACTION_LOAD_CONFIG_FAILURE,
} from './actionTypes';
import { addNotification, changeEngagementPhase } from './genericActions';
import { MESSAGES_LOAD_COUNT } from '../../constants';
import { parseRegionForConversations } from '../../utils/regionUtil';
import { sessionDataHandler } from '../../sessionDataHandler';
import { createParticipantNameMap } from '../../utils/participantNameMap';
import { getDefinitionVersion } from '../../services/configService';
import type { AppState } from '../store';

export const initConfigThunk = (
  config: Omit<ConfigState, 'preEngagementForm'>,
): ThunkAction<void, AppState, unknown, any> => {
  return async dispatch => {
    dispatch({ type: ACTION_LOAD_CONFIG_REQUEST });
    try {
      const { preEngagementForm } = await getDefinitionVersion({
        environment: config.environment,
        definitionVersionId: config.definitionVersion,
      });

      dispatch({
        type: ACTION_LOAD_CONFIG_SUCCESS,
        payload: { ...config, preEngagementFormDefinition: preEngagementForm },
      });
    } catch (err) {
      dispatch({
        type: ACTION_LOAD_CONFIG_FAILURE,
        payload: err,
      });
    }
  };
};

export type InitSessionPayload = {
  token: string;
  conversationSid: string;
};

const newInitialisedConversationsClient = async (token: string): Promise<Client> => {
  const conversationsClient = new Client(token, {
    region: parseRegionForConversations(sessionDataHandler.getRegion()),
  });
  await new Promise<void>(res => {
    const handler: (cs: ConnectionState) => void = cs => {
      if (cs === 'connected') {
        res();
        conversationsClient.off('connectionStateChanged', handler);
      }
    };
    conversationsClient.onWithReplay('connectionStateChanged', handler);
  });
  return conversationsClient;
};

export function initSession({ token, conversationSid }: InitSessionPayload) {
  const logger = window.Twilio.getLogger('initSession');
  return async (dispatch: Dispatch) => {
    let conversationsClient: Client;
    let conversation;
    let participants;
    let users;
    let messages;
    let participantNameMap;

    try {
      conversationsClient = await newInitialisedConversationsClient(token);
      try {
        conversation = await conversationsClient.getConversationBySid(conversationSid);
      } catch (e) {
        dispatch(addNotification(notifications.failedToInitSessionNotification("Couldn't load conversation")));
        dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        console.error("Couldn't load conversation:", e);
        return;
      }
      participants = await conversation.getParticipants();
      users = await Promise.all(participants.map(async p => p.getUser()));
      messages = (await conversation.getMessages(MESSAGES_LOAD_COUNT)).items;

      participantNameMap = createParticipantNameMap(participants, users, conversation);
    } catch (e) {
      logger.error('Something went wrong when initializing session', e);
      throw e;
    }

    dispatch({
      type: ACTION_START_SESSION,
      payload: {
        token,
        conversationSid,
        conversationsClient,
        conversation,
        users,
        participants,
        messages,
        conversationState: conversation.state?.current,
        currentPhase: EngagementPhase.MessagingCanvas,
        participantNames: participantNameMap,
      },
    });

    initClientListeners(conversationsClient, dispatch);
    initConversationListener(conversation, dispatch);
    initMessagesListener(conversation, dispatch);
    initParticipantsListener(conversation, dispatch);
  };
}
