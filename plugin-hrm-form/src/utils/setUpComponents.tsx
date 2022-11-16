/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { ITask, ReservationStatuses, TaskChannelDefinition } from '@twilio/flex-ui';

import { AcceptTransferButton, RejectTransferButton, TransferButton } from '../components/transfer';
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
import { Box, Column, HeaderContainer, TaskCanvasOverride } from '../styles/HrmStyles';
import HrmTheme from '../styles/HrmTheme';
import { TLHPaddingLeft } from '../styles/GlobalOverrides';
import { Container } from '../styles/queuesStatus';
import TwitterIcon from '../components/common/icons/TwitterIcon';
import InstagramIcon from '../components/common/icons/InstagramIcon';
import LineIcon from '../components/common/icons/LineIcon';
// eslint-disable-next-line
import { isInMyBehalfITask } from '../types/types';
import WhatsappIcon from '../components/common/icons/WhatsappIcon';
import FacebookIcon from '../components/common/icons/FacebookIcon';
import CallIcon from '../components/common/icons/CallIcon';
import SmsIcon from '../components/common/icons/SmsIcon';

const mainChannelColor = (channel: TaskChannelDefinition, status: ReservationStatuses = ReservationStatuses.Accepted, task?: ITask, component?: React.ComponentType): string => {
  switch (typeof channel.colors.main) {
    case 'string':
      return channel.colors.main;
    case 'function':
      return channel.colors.main(task, component);
    default:
      return channel.colors.main[status];
  }
}

const voiceColor = mainChannelColor(Flex.DefaultTaskChannels.Call);
const webColor =  mainChannelColor(Flex.DefaultTaskChannels.Chat);
const facebookColor = mainChannelColor(Flex.DefaultTaskChannels.ChatMessenger);
const smsColor = mainChannelColor(Flex.DefaultTaskChannels.ChatSms);
const whatsappColor = mainChannelColor(Flex.DefaultTaskChannels.ChatWhatsApp);
const twitterColor = '#1DA1F2';
const instagramColor = '#833AB4';
const lineColor = '#00C300';

/**
 * @type {import('../states/DomainConstants').ChannelColors}
 */
export const colors = {
  voice: voiceColor,
  web: webColor,
  facebook: facebookColor,
  sms: smsColor,
  whatsapp: whatsappColor,
  twitter: twitterColor,
  instagram: instagramColor,
  line: lineColor,
};

/**
 * Returns the UI for the "Contacts Waiting" section
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
 */
const queuesStatusUI = setupObject => (
  <QueuesStatus
    key="queue-status-task-list"
    colors={colors}
    contactsWaitingChannels={setupObject.contactsWaitingChannels}
    paddingRight={false}
  />
);

/**
 * Returns the UI for the "Add..." section
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
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
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
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
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
 */
export const setUpQueuesStatus = setupObject => {
  setUpRerenderOnReservation();

  Flex.TaskListContainer.Content.add(queuesStatusUI(setupObject), {
    sortOrder: -1,
    align: 'start',
  });
};

const setUpManualPulling = () => {
  const manager = Flex.Manager.getInstance();

  const [, chatChannel] = Array.from(manager.workerClient.channels).find(c => c[1].taskChannelUniqueName === 'chat');

  manager.store.dispatch(chatCapacityUpdated(chatChannel.capacity));
  (chatChannel as any).on('capacityUpdated', channel => { // Channel doesn't implement 'EventEmitter yet docs say it emits 2 types of event?
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
  Flex.ViewCollection.Content.add(<Flex.View name="empty-view" key="empty-view"><></></Flex.View>);

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
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
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
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
 */
export const setUpNoTasksUI = setupObject => {
  Flex.AgentDesktopView.Content.add(
    <Column key="no-task-agent-desktop-section" style={{ backgroundColor: HrmTheme.colors.base2, minWidth: 300 }}>
      {queuesStatusUI(setupObject)}
      <OfflineContactTask selectedTaskSid={undefined} key="offline-contact-task" />
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

  Flex.TaskCanvasHeader.Content.add(<AcceptTransferButton task={undefined} key="complete-transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferControls(props.task),
  });

  Flex.TaskCanvasHeader.Content.add(<RejectTransferButton task={undefined}  key="reject-transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferControls(props.task),
  });
};

/**
 * Add components used only by developers
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
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
      reserveSpace={false}
      showLabel={false}
    />,
    {
      align: 'end',
    },
  );
};
const allIcons = icon => ({
  active: icon,
  list: icon,
  main: icon,
});
/**
 *
 * @param {import('@twilio/flex-ui').ITask} task
 */
const isIncomingTransfer = task => TransferHelpers.hasTransferStarted(task) && task.status === 'pending';

export const customiseDefaultChatChannels = () => {
  const facebookIcon = <FacebookIcon width="24px" height="24px" color={facebookColor} />;
  Flex.DefaultTaskChannels.ChatMessenger.icons = allIcons(facebookIcon);
  const whatsappIcon = <WhatsappIcon width="24px" height="24px" color={whatsappColor} />;
  Flex.DefaultTaskChannels.ChatWhatsApp.icons = allIcons(whatsappIcon);
  const smsIcon = <SmsIcon width="24px" height="24px" color={smsColor} />;
  Flex.DefaultTaskChannels.ChatSms.icons = allIcons(smsIcon);
  const callIcon = <CallIcon width="24px" height="24px" color={voiceColor} />;
  Flex.DefaultTaskChannels.Call.icons = allIcons(callIcon);
};

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
      reserveSpace={false}
      showLabel={false}
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
      reserveSpace={false}
      showLabel={false}
    />,
  );
};

/**
 * Removes the actions buttons from TaskCanvasHeaders if the task is wrapping or if dual write is on (temporary prevents bug)
 * @param {import('../HrmFormPlugin').SetupObject} setupObject
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
  Flex.MessageInput.Content.add(<CannedResponses key="canned-responses" conversationSid={undefined} />);
};

export const setupTwitterChatChannel = maskIdentifiers => {
  const icon = <TwitterIcon width="24px" height="24px" color={twitterColor} />;

  const TwitterChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel(
    'twitter',
    task => task.channelType === 'twitter',
  );

  TwitterChatChannel.templates.CallCanvas.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.TaskListItem.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.TaskCard.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.Supervisor.TaskCanvasHeader.title = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.Supervisor.TaskOverviewCanvas.firstLine = 'TaskHeaderLineTwitter';

  if (maskIdentifiers) maskIdentifiersByChannel(TwitterChatChannel);

  TwitterChatChannel.colors.main = {
    Accepted: twitterColor,
    Assigned: twitterColor,
    Pending: twitterColor,
    Reserved: twitterColor,
    Wrapping: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  TwitterChatChannel.icons = {
    active: icon,
    list: icon,
    main: icon,
  };

  Flex.TaskChannels.register(TwitterChatChannel);
};

export const setupInstagramChatChannel = maskIdentifiers => {
  const icon = <InstagramIcon width="24px" height="24px" color="white" />;

  const InstagramChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel(
    'instagram',
    task => task.channelType === 'instagram',
  );

  if (maskIdentifiers) maskIdentifiersByChannel(InstagramChatChannel);

  InstagramChatChannel.colors.main = {
    Accepted: instagramColor,
    Assigned: instagramColor,
    Pending: instagramColor,
    Reserved: instagramColor,
    Wrapping: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  InstagramChatChannel.icons = {
    active: icon,
    list: icon,
    main: icon,
  };

  Flex.TaskChannels.register(InstagramChatChannel);
};

export const setupLineChatChannel = maskIdentifiers => {
  const icon = <LineIcon width="24px" height="24px" color={lineColor} />;

  const LineChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel('line', task => task.channelType === 'line');

  LineChatChannel.colors = Flex.DefaultTaskChannels.ChatLine.colors;
  LineChatChannel.templates = Flex.DefaultTaskChannels.ChatLine.templates;

  LineChatChannel.icons = {
    active: icon,
    list: icon,
    main: icon,
  };

  if (maskIdentifiers) maskIdentifiersByChannel(LineChatChannel);

  Flex.TaskChannels.register(LineChatChannel);
};

const maskIdentifiersByChannel = channelType => {
  // Task list and panel when a call comes in
  channelType.templates.TaskListItem.firstLine = 'MaskIdentifiers';
  /*
   * if (channelType === Flex.DefaultTaskChannels.Chat) {
   *   channelType.templates.TaskListItem.secondLine = 'TaskLineWebChatAssignedMasked';
   * } else {
   *   channelType.templates.TaskListItem.secondLine = 'TaskLineChatAssignedMasked';
   * }
   */
  channelType.templates.IncomingTaskCanvas.firstLine = 'MaskIdentifiers';
  // Task panel during an active call
  channelType.templates.TaskCanvasHeader.title = 'MaskIdentifiers';
  channelType.templates.MessageListItem = 'MaskIdentifiers';
  // Task Status in Agents page
  channelType.templates.TaskCard.firstLine = 'MaskIdentifiers';
  // Supervisor
  channelType.templates.Supervisor.TaskCanvasHeader.title = 'MaskIdentifiers';
  channelType.templates.Supervisor.TaskOverviewCanvas.title = 'MaskIdentifiers';
};

export const maskIdentifiersForDefaultChannels = () => {
  maskIdentifiersByChannel(Flex.DefaultTaskChannels.Call);
  maskIdentifiersByChannel(Flex.DefaultTaskChannels.Chat);
  maskIdentifiersByChannel(Flex.DefaultTaskChannels.ChatSms);
  maskIdentifiersByChannel(Flex.DefaultTaskChannels.Default);
  maskIdentifiersByChannel(Flex.DefaultTaskChannels.ChatMessenger);
  maskIdentifiersByChannel(Flex.DefaultTaskChannels.ChatWhatsApp);
};
