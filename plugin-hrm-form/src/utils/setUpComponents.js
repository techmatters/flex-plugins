/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import * as Flex from '@twilio/flex-ui';

import { TransferButton, AcceptTransferButton, RejectTransferButton } from '../components/transfer';
import * as TransferHelpers from './transfer';
import CannedResponses from '../components/CannedResponses';
import QueuesStatusWriter from '../components/queuesStatus/QueuesStatusWriter';
import QueuesStatus from '../components/queuesStatus';
import CustomCRMContainer from '../components/CustomCRMContainer';
import LocalizationContext from '../contexts/LocalizationContext';
import Translator from '../components/translator';
import CaseList from '../components/caseList';
import StandaloneSearch from '../components/StandaloneSearch';
import SettingsSideLink from '../components/sideLinks/SettingsSideLink';
import CaseListSideLink from '../components/sideLinks/CaseListSideLink';
import StandaloneSearchSideLink from '../components/sideLinks/StandaloneSearchSideLink';
import ManualPullButton from '../components/ManualPullButton';
import { AddOfflineContactButton, OfflineContactTask } from '../components/OfflineContact';
import { chatCapacityUpdated } from '../states/configuration/actions';
import { namespace, routingBase } from '../states';
import { Column, TaskCanvasOverride, Box, HeaderContainer } from '../styles/HrmStyles';
import HrmTheme from '../styles/HrmTheme';
import { TLHPaddingLeft } from '../styles/GlobalOverrides';
import { Container } from '../styles/queuesStatus';
import TwitterIcon from '../components/common/icons/TwitterIcon';
// eslint-disable-next-line
import { getConfig } from '../HrmFormPlugin';
import { isInMyBehalfITask } from '../types/types';

const voiceColor = { Accepted: Flex.DefaultTaskChannels.Call.colors.main() };
const webColor = Flex.DefaultTaskChannels.Chat.colors.main;
const facebookColor = Flex.DefaultTaskChannels.ChatMessenger.colors.main;
const smsColor = Flex.DefaultTaskChannels.ChatSms.colors.main;
const whatsappColor = Flex.DefaultTaskChannels.ChatWhatsApp.colors.main;
const twitterColor = '#1DA1F2';
const instagramColor = '#E70970';

/**
 * Returns the UI for the "Contacts Waiting" section
 */
const queuesStatusUI = () => (
  <QueuesStatus
    key="queue-status-task-list"
    colors={{
      voiceColor: voiceColor.Accepted,
      webColor: webColor.Accepted,
      facebookColor: facebookColor.Accepted,
      smsColor: smsColor.Accepted,
      whatsappColor: whatsappColor.Accepted,
      twitterColor,
      instagramColor
    }}
  />
);

/**
 * Returns the UI for the "Add..." section
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const addButtonsUI = setupObject => {
  const manager = Flex.Manager.getInstance();
  const { featureFlags } = setupObject;

  return (
    <Container key="add-buttons-section" backgroundColor={HrmTheme.colors.base2}>
      <HeaderContainer>
        <Box marginTop="12px" marginRight="5px" marginBottom="12px" marginLeft={TLHPaddingLeft}>
          <Flex.Template code="AddButtons-Header" />
        </Box>
      </HeaderContainer>
      {featureFlags.enable_manual_pulling && <ManualPullButton workerClient={manager.workerClient} />}
      {featureFlags.enable_offline_contact && <AddOfflineContactButton />}
    </Container>
  );
};

/**
 * Add an "invisible" component that tracks the state of the queues, updating the pending tasks in each channel
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
export const setUpQueuesStatusWriter = setupObject => {
  const { workerSid } = setupObject;

  Flex.MainContainer.Content.add(
    <QueuesStatusWriter
      insightsClient={Flex.Manager.getInstance().insightsClient}
      key="queue-status-writer"
      workerSid={workerSid}
    />,
    {
      sortOrder: -1,
      align: 'start',
    },
  );
};

// Re-renders UI if there is a new reservation created and no active tasks (avoid a visual bug with QueuesStatus when there are no tasks)
const setUpRerenderOnReservation = () => {
  const manager = Flex.Manager.getInstance();

  manager.workerClient.on('reservationCreated', reservation => {
    const { tasks } = manager.store.getState().flex.worker;
    if (tasks.size === 1 && !isInMyBehalfITask(reservation.task))
      Flex.Actions.invokeAction('SelectTask', { sid: reservation.sid });
  });
};

/**
 * Add a widget at the beginnig of the TaskListContainer, which shows the pending tasks in each channel (consumes from QueuesStatusWriter)
 */
export const setUpQueuesStatus = () => {
  setUpRerenderOnReservation();

  Flex.TaskListContainer.Content.add(queuesStatusUI(), {
    sortOrder: -1,
    align: 'start',
  });
};

const setUpManualPulling = () => {
  const manager = Flex.Manager.getInstance();

  const [, chatChannel] = Array.from(manager.workerClient.channels).find(c => c[1].taskChannelUniqueName === 'chat');

  manager.store.dispatch(chatCapacityUpdated(chatChannel.capacity));

  chatChannel.on('capacityUpdated', channel => {
    if (channel.taskChannelUniqueName === 'chat') manager.store.dispatch(chatCapacityUpdated(channel.capacity));
  });

  Flex.Notifications.registerNotification({
    id: 'NoTaskAssignableNotification',
    content: <Flex.Template code="NoTaskAssignableNotification" />,
    timeout: 5000,
    type: Flex.NotificationType.warning,
  });
};

const isIncomingOfflineContact = task =>
  task.channelType === 'default' && task.attributes && task.attributes.transferTargetType === 'worker';

const setUpOfflineContact = () => {
  const manager = Flex.Manager.getInstance();

  Flex.ViewCollection.Content.add(<Flex.View name="empty-view" key="empty-view" />);

  Flex.TaskList.Content.add(<OfflineContactTask key="offline-contact-task" />, {
    sortOrder: 100,
    align: 'start',
  });

  Flex.TaskListItem.Content.replace(<div key="Empty-Replacement-For-IncomingOfflineContact" />, {
    if: props => isIncomingOfflineContact(props.task),
  });

  // This is causing some bad scenarios, cause AgentDesktopView.Panel1 not re-rendering. Current solution: a) force a "change view". Other options: b) allways remove the no tasks view c) replace it with our own view that is connected to the store and conditionally appears when appropiate
  Flex.AgentDesktopView.Panel1.Content.remove('no-tasks', {
    if: props =>
      props.route.location.pathname === '/agent-desktop/' &&
      !props.selectedTaskSid &&
      manager.store.getState()[namespace][routingBase].isAddingOfflineContact, // while this is inefficient because of calling getState several times in a short period of time (re-renders), the impact is minimized by the short-circuit evaluation of the AND operator
  });
};

/**
 * Add buttons to pull / create tasks
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
export const setUpAddButtons = setupObject => {
  const { featureFlags } = setupObject;

  // setup for manual pulling
  if (featureFlags.enable_manual_pulling) setUpManualPulling();
  // setup for offline contact tasks
  if (featureFlags.enable_offline_contact) setUpOfflineContact();

  // add UI
  if (featureFlags.enable_manual_pulling || featureFlags.enable_offline_contact)
    Flex.TaskList.Content.add(addButtonsUI(setupObject), {
      sortOrder: Infinity,
      align: 'start',
    });

  // replace UI for task information
  if (featureFlags.enable_offline_contact)
    Flex.TaskCanvas.Content.replace(<TaskCanvasOverride key="TaskCanvas-empty" />, {
      if: props => props.task.channelType === 'default',
    });
};

/**
 * Adds the corresponding UI when there are no active tasks
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
export const setUpNoTasksUI = setupObject => {
  Flex.AgentDesktopView.Content.add(
    <Column key="no-task-agent-desktop-section" style={{ backgroundColor: HrmTheme.colors.base2, minWidth: 300 }}>
      {queuesStatusUI()}
      {<OfflineContactTask key="offline-contact-task" />}
      {addButtonsUI(setupObject)}
    </Column>,
    {
      sortOrder: -1,
      align: 'start',
      if: props => !props.tasks || !props.tasks.size,
    },
  );
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
      <CustomCRMContainer />
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
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
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
 *
 * @param {import('@twilio/flex-ui').ITask} task
 */
const isIncomingTransfer = task => TransferHelpers.hasTransferStarted(task) && task.status === 'pending';

/**
 * @param {{ channel: string; string: string; }} chatChannel
 */
const setSecondLine = chatChannel => {
  // here we use manager instead of setupObject, so manager.strings will always have the latest version of strings
  const manager = Flex.Manager.getInstance();

  const { channel, string } = chatChannel;
  const defaultStrings = Flex.DefaultTaskChannels[channel].templates.TaskListItem.secondLine;

  Flex.DefaultTaskChannels[channel].templates.TaskListItem.secondLine = (task, componentType) => {
    if (isIncomingTransfer(task)) {
      const { originalCounselorName } = task.attributes.transferMeta;
      const mode = TransferHelpers.isWarmTransfer(task)
        ? manager.strings['Transfer-Warm']
        : manager.strings['Transfer-Cold'];

      const baseMessage = `${mode} ${manager.strings[string]} ${originalCounselorName}`;

      if (task.attributes.transferTargetType === 'queue') return `${baseMessage} (${task.queueName})`;

      if (task.attributes.transferTargetType === 'worker') return `${baseMessage} (direct)`;

      return baseMessage;
    }

    return Flex.TaskChannelHelper.getTemplateForStatus(task, defaultStrings, componentType);
  };
};

export const setUpIncomingTransferMessage = () => {
  const chatChannels = [
    { channel: 'Call', string: 'Transfer-TaskLineCallReserved' },
    { channel: 'Chat', string: 'Transfer-TaskLineChatReserved' },
    { channel: 'ChatLine', string: 'Transfer-TaskLineChatLineReserved' },
    { channel: 'ChatMessenger', string: 'Transfer-TaskLineChatMessengerReserved' },
    { channel: 'ChatSms', string: 'Transfer-TaskLineChatSmsReserved' },
    { channel: 'ChatWhatsApp', string: 'Transfer-TaskLineChatWhatsAppReserved' },
  ];

  chatChannels.forEach(el => setSecondLine(el));
};

/**
 * Add components used only by developers
 */
export const setUpCaseList = () => {
  Flex.ViewCollection.Content.add(
    <Flex.View name="case-list" key="case-list-view">
      <CaseList />
    </Flex.View>,
  );

  Flex.SideNav.Content.add(
    <CaseListSideLink
      key="CaseListSideLink"
      onClick={() => Flex.Actions.invokeAction('NavigateToView', { viewName: 'case-list' })}
    />,
  );
};

export const setUpStandaloneSearch = () => {
  Flex.ViewCollection.Content.add(
    <Flex.View name="search" key="standalone-search-view">
      <StandaloneSearch />
    </Flex.View>,
  );

  Flex.SideNav.Content.add(
    <StandaloneSearchSideLink
      key="StandaloneSearchSideLink"
      onClick={() => Flex.Actions.invokeAction('NavigateToView', { viewName: 'search' })}
    />,
  );
};

/**
 * Removes the actions buttons from TaskCanvasHeaders if the task is wrapping or if dual write is on (temporary prevents bug)
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
export const removeTaskCanvasHeaderActions = setupObject => {
  const { featureFlags } = setupObject;
  // Must use submit buttons in CRM container to complete task
  Flex.TaskCanvasHeader.Content.remove('actions', {
    if: props => (props.task && props.task.status === 'wrapping') || featureFlags.enable_dual_write,
  });
};

/**
 * Sets logo URL, or if URL is empty, removes the Flex logo from the top left of the MainHeader
 */
export const setLogo = url => {
  if (url) {
    Flex.MainHeader.defaultProps.logoUrl = url;
  } else {
    Flex.MainHeader.Content.remove('logo');
  }
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

/**
 * Canned respònses
 */
export const setupCannedResponses = () => {
  Flex.MessageInput.Content.add(<CannedResponses key="canned-responses" />);
};

export const setupTwitterChatChannel = () => {
  const icon = <TwitterIcon width="24px" height="24px" color="white" />;

  const TwitterChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel(
    'twitter',
    task => task.channelType === 'twitter',
  );

  // modify TwitterChatChannel here
  TwitterChatChannel.templates.IncomingTaskCanvas.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.CallCanvas.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.TaskListItem.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.TaskCard.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.TaskCanvasHeader.title = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.Supervisor.TaskCanvasHeader.title = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.Supervisor.TaskOverviewCanvas.title = 'TaskHeaderLineTwitter';

  TwitterChatChannel.colors.main = {
    Accepted: twitterColor,
    Assigned: twitterColor,
    Pending: twitterColor,
    Reserved: twitterColor,
    Wrapping: Flex.DefaultTaskChannels.Chat.colors.main.Wrapping,
    Completed: Flex.DefaultTaskChannels.Chat.colors.main.Completed,
    Canceled: Flex.DefaultTaskChannels.Chat.colors.main.Canceled,
  };

  TwitterChatChannel.icons = {
    active: icon,
    list: icon,
    main: icon,
  };

  Flex.TaskChannels.register(TwitterChatChannel);
};

export const setupInstagramChatChannel = () => {
  const icon = <InstagramIcon width="1em" height="1em" color="#fff" />;

  const InstagramChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel(
    'instagram',
    task => task.channelType === 'instagram',
  );

  InstagramChatChannel.colors.main = {
    Accepted: instagramColor,
    Assigned: instagramColor,
    Pending: instagramColor,
    Reserved: instagramColor,
    Wrapping: Flex.DefaultTaskChannels.Chat.colors.main.Wrapping,
    Completed: Flex.DefaultTaskChannels.Chat.colors.main.Completed,
    Canceled: Flex.DefaultTaskChannels.Chat.colors.main.Canceled,
  };

  InstagramChatChannel.icons = {
    active: icon,
    list: icon,
    main: icon,
  };

  Flex.TaskChannels.register(InstagramChatChannel);
}; 