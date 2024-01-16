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
import * as Flex from '@twilio/flex-ui';
import {
  ActionFunction,
  ITask,
  Manager,
  Notifications,
  NotificationType,
  ReplacedActionFunction,
  StateHelper,
  TaskHelper,
  Template,
} from '@twilio/flex-ui';

import * as TransferHelpers from './transferTaskState';
import { transferModes } from '../states/DomainConstants';
import { recordEvent } from '../fullStory';
import { transferChatStart } from '../services/ServerlessService';
import { getHrmConfig } from '../hrmConfig';
import { RootState } from '../states';
import { reactivateAseloListeners } from '../conversationListeners';
import selectContactByTaskSid from '../states/contacts/selectContactByTaskSid';
import { ContactState } from '../states/contacts/existingContacts';
import { saveFormSharedState } from './formDataTransfer';

type SetupObject = ReturnType<typeof getHrmConfig>;
type ActionPayload = { task: ITask };
type ActionPayloadWithOptions = ActionPayload & { options: { mode: string }; targetSid: string };
const DEFAULT_TRANSFER_MODE = transferModes.cold;

export const TransfersNotifications = {
  CantHangTransferInProgressNotification: 'TransfersNotifications_CantHangTransferInProgressNotification',
};

const setUpTransfersNotifications = () => {
  Notifications.registerNotification({
    id: TransfersNotifications.CantHangTransferInProgressNotification,
    type: NotificationType.error,
    content: <Template code="Can't leave the call until the transfer is accepted or rejected." />,
  });
};

const safeTransfer = async (transferFunction: () => Promise<any>, task: ITask): Promise<void> => {
  try {
    await transferFunction();
  } catch (err) {
    await TransferHelpers.clearTransferMeta(task);
  }
};

/**
 * Given a taskSid, retrieves the state of the form (stored in redux) for that task
 */
const getStateContactForms = (taskSid: string): ContactState => {
  return selectContactByTaskSid(Manager.getInstance().store.getState() as RootState, taskSid);
};

/**
 * Custom override for TransferTask action. Saves the form to share with another counselor (if possible) and then starts the transfer
 */
const customTransferTask = (setupObject: SetupObject): ReplacedActionFunction => async (
  payload: ActionPayloadWithOptions,
  original: ActionFunction,
) => {
  const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

  /*
   * Currently (as of 2 Dec 2020) warm text transfers are not supported.
   * We shortcut the rest of the function to save extra time and unnecessary visual changes.
   */
  if (!TaskHelper.isCallTask(payload.task) && mode === transferModes.warm) {
    recordEvent('Transfer Warm Chat Blocked', {});
    window.alert(Manager.getInstance().strings['Transfer-ChatWarmNotAllowed']);
    return () => undefined; // Not calling original(payload) prevents the additional "Task cannot be transferred" notification
  }

  const { workerSid, counselorName } = setupObject;

  // save current form state (if there is a form)
  const contact = getStateContactForms(payload.task.taskSid);
  if (!contact) return original(payload);

  await saveFormSharedState(contact, payload.task);

  // set metadata for the transfer
  await TransferHelpers.setTransferMeta(payload, counselorName);

  if (TaskHelper.isCallTask(payload.task)) {
    const disableTransfer = !TransferHelpers.canTransferConference(payload.task);

    if (disableTransfer) {
      window.alert(Manager.getInstance().strings['Transfer-CannotTransferTooManyParticipants']);
    } else {
      return safeTransfer(() => original(payload), payload.task);
    }
  }

  const body = {
    mode,
    taskSid: payload.task.taskSid,
    targetSid: payload.targetSid,
    ignoreAgent: workerSid,
  };

  return safeTransfer(() => transferChatStart(body), payload.task);
};

const afterCancelTransfer = (payload: ActionPayload) => TransferHelpers.clearTransferMeta(payload.task);

export const handleTransferredTask = async (task: ITask) => {
  const { source: convo, participants, isLoadingParticipants } = StateHelper.getConversationStateForTask(task) ?? {};
  if (convo) {
    reactivateAseloListeners(convo);
    if (participants.size === 0 && !isLoadingParticipants) {
      // Force a refresh of the conversation state when accepting a transfer if the current state has no participants
      // This works around an issue where pre-existing state for the conversation being loaded prior to accepting the transfer borks the state once the transfer is accepted for some reason.
      // Reverse engineering an internal Flex action is one level of grevious hackery below deleting the conversation state from the redux store directly =-/
      Manager.getInstance().store.dispatch({
        type: 'CONVERSATION_UNLOAD',
        meta: { channelSid: convo.sid, conversationSid: convo.sid },
      });
    }
  }
};

export const setUpTransferActions = (transfersEnabled: boolean, setupObject: SetupObject) => {
  setUpTransfersNotifications();
  if (transfersEnabled) Flex.Actions.replaceAction('TransferTask', customTransferTask(setupObject));
  Flex.Actions.addListener('afterCancelTransfer', afterCancelTransfer);
};
