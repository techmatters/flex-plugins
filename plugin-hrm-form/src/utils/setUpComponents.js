import React from 'react';
import * as Flex from '@twilio/flex-ui';

import { TransferButton, AcceptTransferButton, RejectTransferButton } from '../components/transfer';
import * as TransferHelpers from './transfer';
import QueuesStatusWriter from '../components/queuesStatus/QueuesStatusWriter';
import QueuesStatus from '../components/queuesStatus';
import CustomCRMContainer from '../components/CustomCRMContainer';
import LocalizationContext from '../contexts/LocalizationContext';
import { channelTypes } from '../states/DomainConstants';
import Translator from '../components/translator';
import SettingsSideLink from '../components/sideLinks/SettingsSideLink';
// eslint-disable-next-line no-unused-vars
import { getConfig } from '../HrmFormPlugin';
/**
 * Add an "invisible" component that tracks the state of the queues, updating the pending tasks in each channel
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getGoodbyeMsg: (language: string) => Promise<string>; }} setupObject
 */
export const setUpQueuesStatusWriter = setupObject => {
  const { helpline } = setupObject;

  Flex.MainContainer.Content.add(
    <QueuesStatusWriter
      insightsClient={Flex.Manager.getInstance().insightsClient}
      key="queue-status-writer"
      helpline={helpline}
    />,
    {
      sortOrder: -1,
      align: 'start',
    },
  );
};

/**
 * Add a widget at the begginig of the TaskListContainer, which shows the pending tasks in each channel (consumes from QueuesStatusWriter)
 */
export const setUpQueuesStatus = () => {
  // @ts-ignore this is comming as a function so we need to disable TS, as it won't type otherwise
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
};

/**
 * Function used to manually complete a task (making sure it transitions to wrapping state first).
 * @param {string} sid
 * @param {import('@twilio/flex-ui').ITask} task
 */
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

/**
 * Add the custom CRM to the agent panel
 */
export const setUpCustomCRMContainer = () => {
  const manager = Flex.Manager.getInstance();

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
};

/**
 * Add the buttons used to initiate, accept and reject transfers (when it should), and removes the actions button if task is being transferred
 */
export const setUpTransferComponents = () => {
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

/**
 * Add components used only by developers
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getGoodbyeMsg: (language: string) => Promise<string>; }} setupObject
 */
export const setUpDeveloperComponents = setupObject => {
  const manager = Flex.Manager.getInstance();

  const { translateUI } = setupObject;

  Flex.ViewCollection.Content.add(
    <Flex.View name="settings" key="settings-view">
      <div>
        <Translator manager={manager} translateUI={translateUI} key="translator" />
      </div>
    </Flex.View>,
  );

  Flex.SideNav.Content.add(
    <SettingsSideLink
      key="SettingsSideLink"
      onClick={() => Flex.Actions.invokeAction('NavigateToView', { viewName: 'settings' })}
    />,
    {
      align: 'end',
    },
  );
};

/**
 * Removes the actions buttons from TaskCanvasHeaders if the task is wrapping
 */
export const removeActionsIfWrapping = () => {
  // Must use submit buttons in CRM container to complete task
  Flex.TaskCanvasHeader.Content.remove('actions', {
    if: props => props.task && props.task.status === 'wrapping',
  });
};

/**
 * Removes the Flex logo from the top left of the MainHeader
 */
export const removeLogo = () => {
  Flex.MainHeader.Content.remove('logo');
};

/**
 * Removes open directory button from Call Canvas Actions (bottom buttons)
 */
export const removeDirectoryButton = () => {
  Flex.CallCanvasActions.Content.remove('directory');
};

/**
 * Removes hangup/kick participant in task that is being transferred
 */
export const removeActionsIfTransferring = () => {
  const hasNoControlAndIsWarm = task => !TransferHelpers.hasTaskControl(task) && TransferHelpers.isWarmTransfer(task);

  Flex.TaskListButtons.Content.remove('hangup', {
    if: props => hasNoControlAndIsWarm(props.task),
  });

  Flex.CallCanvasActions.Content.remove('hangup', {
    if: props => hasNoControlAndIsWarm(props.task),
  });

  Flex.ParticipantCanvas.Content.remove('actions', {
    if: props => hasNoControlAndIsWarm(props.task) && props.participant.participantType === 'worker',
  });
};
