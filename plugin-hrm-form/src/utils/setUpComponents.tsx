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

/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { Notifications, NotificationType, Template } from '@twilio/flex-ui';

import * as TransferHelpers from '../transfer/transferTaskState';
import EmojiPicker from '../components/emojiPicker';
import CannedResponses from '../components/cannedResponses';
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
import ProfileList from '../components/profileList';
import ProfileListSideLink from '../components/sideLinks/ProfileListSideLink';
import { AddOfflineContactButton, OfflineContactTask } from '../components/OfflineContact';
import { chatCapacityUpdated } from '../states/configuration/actions';
import { Box, Column, HeaderContainer, TaskCanvasOverride } from '../styles';
import HrmTheme from '../styles/HrmTheme';
import { TLHPaddingLeft } from '../styles/GlobalOverrides';
import { Container } from '../components/queuesStatus/styles';
import { FeatureFlags, standaloneTaskSid } from '../types/types';
import { colors } from '../channels/colors';
import { getHrmConfig } from '../hrmConfig';
import { AseloMessageInput, AseloMessageList } from '../components/AseloMessaging';
import { changeRoute } from '../states/routing/actions';
import { AppRoutes, ChangeRouteMode } from '../states/routing/types';
import { selectCurrentBaseRoute } from '../states/routing/getRoute';
import { RootState } from '../states';
import selectCurrentOfflineContact from '../states/contacts/selectCurrentOfflineContact';
import { REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID } from '../states/configuration/changeLanguage';

type SetupObject = ReturnType<typeof getHrmConfig>;
/**
 * Returns the UI for the "Contacts Waiting" section
 */
const queuesStatusUI = (setupObject: SetupObject) => {
  console.log('setupObject', setupObject);

  return (
    <QueuesStatus
      key="queue-status-task-list"
      colors={colors}
      contactsWaitingChannels={setupObject.contactsWaitingChannels}
      paddingRight={false}
    />
  );
};

const addButtonsUI = (featureFlags: FeatureFlags) => {
  const manager = Flex.Manager.getInstance();

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

export const setUpQueuesStatusWriter = (setupObject: SetupObject) => {
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
    const { attributes } = reservation.task;
    if (tasks.size === 1 && !(attributes?.isContactlessTask && !attributes?.isInMyBehalf))
      Flex.Actions.invokeAction('SelectTask', { sid: reservation.sid });
  });
};

/**
 * Add a widget at the beginnig of the TaskListContainer, which shows the pending tasks in each channel (consumes from QueuesStatusWriter)
 */
export const setUpQueuesStatus = (setupObject: SetupObject) => {
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
  (chatChannel as any).on('capacityUpdated', channel => {
    // Channel doesn't implement 'EventEmitter yet docs say it emits 2 types of event?
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
  Flex.ViewCollection.Content.add(
    <Flex.View name="empty-view" key="empty-view">
      <></>
    </Flex.View>,
  );

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
      Boolean(selectCurrentOfflineContact(manager.store.getState() as RootState)), // while this is inefficient because of calling getState several times in a short period of time (re-renders), the impact is minimized by the short-circuit evaluation of the AND operator
  });
};

/**
 * Dispatch an action to route to the side link
 * Will reset standalone route to a starting target route if the standalone base route doesn't already match it
 * @param targetAppRoute
 */
const routeToSideLink = (targetAppRoute: AppRoutes) => {
  const { store } = Flex.Manager.getInstance();
  const { route } = selectCurrentBaseRoute(store.getState() as RootState, standaloneTaskSid) ?? {};
  if (route === targetAppRoute.route) return;
  store.dispatch(changeRoute(targetAppRoute, standaloneTaskSid, ChangeRouteMode.ResetRoute));
};

/**
 * Add buttons to pull / create tasks
 */
export const setUpAddButtons = (featureFlags: FeatureFlags) => {
  // setup for manual pulling
  if (featureFlags.enable_manual_pulling) setUpManualPulling();
  // setup for offline contact tasks
  if (featureFlags.enable_offline_contact) setUpOfflineContact();

  // add UI
  if (featureFlags.enable_manual_pulling || featureFlags.enable_offline_contact)
    Flex.TaskList.Content.add(addButtonsUI(featureFlags), {
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
 */
export const setUpNoTasksUI = (featureFlags: FeatureFlags, setupObject: SetupObject) => {
  Flex.AgentDesktopView.Content.add(
    <Column key="no-task-agent-desktop-section" style={{ backgroundColor: HrmTheme.colors.base2, minWidth: 300 }}>
      {queuesStatusUI(setupObject)}
      <OfflineContactTask key="offline-contact-task" />
      {addButtonsUI(featureFlags)}
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
 * Add components for case list
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
      onClick={() => {
        Flex.Actions.invokeAction('NavigateToView', { viewName: 'case-list' });
        routeToSideLink({ route: 'case-list', subroute: 'case-list' });
      }}
      reserveSpace={false}
      showLabel={true}
    />,
  );
};

/**
 * Add components for Client Profiles page
 */

export const setUpClientProfileList = () => {
  Flex.ViewCollection.Content.add(
    <Flex.View name="profile-list" key="profile-list-view">
      <ProfileList />
    </Flex.View>,
  );

  Flex.SideNav.Content.add(
    <ProfileListSideLink
      key="ProfileListSideLink"
      onClick={() => {
        Flex.Actions.invokeAction('NavigateToView', { viewName: 'profile-list' });
        routeToSideLink({ route: 'profile-list', subroute: 'profile-list' });
        Flex.Manager.getInstance().store.dispatch(
          changeRoute(
            { route: 'profile-list', subroute: 'profile-list' },
            standaloneTaskSid,
            ChangeRouteMode.ResetRoute,
          ),
        );
      }}
      reserveSpace={false}
      showLabel={true}
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
      onClick={() => {
        Flex.Actions.invokeAction('NavigateToView', { viewName: 'search' });
        routeToSideLink({ route: 'search', subroute: 'form' });
      }}
      reserveSpace={false}
      showLabel={true}
    />,
  );
};

/**
 * Removes the actions buttons from TaskCanvasHeaders if the task is wrapping or if dual write is on (temporary prevents bug)
 */
export const removeTaskCanvasHeaderActions = (featureFlags: FeatureFlags) => {
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
 *
 */
export const replaceTwilioMessageInput = () => {
  Flex.MessageInputV2.Content.replace(<AseloMessageInput key="textarea" />, { sortOrder: -1 });
  Flex.MessageList.Content.replace(<AseloMessageList key="list" />);
};

/**
 * Canned responses
 */
export const setupCannedResponses = () => {
  Flex.MessageInput.Content.add(<CannedResponses key="canned-responses" />);
  Flex.MessageInputV2.Content.add(<CannedResponses key="canned-responses" />);
};

/**
 * Emoji Picker
 */
export const setupEmojiPicker = () => {
  Flex.MessageInputActions.Content.add(<EmojiPicker key="emoji-picker" />);
};

export const setupWorkerLanguageSelect = () => {
  Flex.MainHeader.Content.add(<Translator key="locale-selector" />, { align: 'end', sortOrder: 0 });
  const LanguageSelectedNotification: React.FC<{ notificationContext?: { localeSelection: string } }> = ({
    notificationContext: { localeSelection },
  }) => (
    <span>
      <Template code="MainHeader-Translator-SelectionNotification" localeSelection={localeSelection} />{' '}
      <a href=".">
        <Template code="MainHeader-Translator-RefreshRequiredNotification" />
      </a>{' '}
      <Template code="MainHeader-Translator-RefreshWarningNotification" />
    </span>
  );

  Notifications.registerNotification({
    id: REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID,
    type: NotificationType.information,
    timeout: 0,
    content: <LanguageSelectedNotification />,
  });
};
