/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import * as Flex from '@twilio/flex-ui';
import AssignmentInd from '@material-ui/icons/AssignmentInd';

import { TransferButton, AcceptTransferButton, RejectTransferButton } from '../components/transfer';
import * as TransferHelpers from './transfer';
import QueuesStatusWriter from '../components/queuesStatus/QueuesStatusWriter';
import QueuesStatus from '../components/queuesStatus';
import CustomCRMContainer from '../components/CustomCRMContainer';
import LocalizationContext from '../contexts/LocalizationContext';
import { channelTypes } from '../states/DomainConstants';
import Translator from '../components/translator';
import CaseList from '../components/caseList';
import StandaloneSearch from '../components/StandaloneSearch';
import SettingsSideLink from '../components/sideLinks/SettingsSideLink';
import CaseListSideLink from '../components/sideLinks/CaseListSideLink';
import StandaloneSearchSideLink from '../components/sideLinks/StandaloneSearchSideLink';
import ManualPullButton from '../components/ManualPullButton';
import OfflineContactButton from '../components/OfflineContactButton';
import { chatCapacityUpdated } from '../states/configuration/actions';
import { Column, TaskCanvasOverride, Box, HeaderContainer } from '../styles/HrmStyles';
import HrmTheme from '../styles/HrmTheme';
import { TLHPaddingLeft } from '../styles/GlobalOverrides';
import { Container } from '../styles/queuesStatus';
// eslint-disable-next-line
import { getConfig } from '../HrmFormPlugin';

const voiceColor = { Accepted: Flex.DefaultTaskChannels.Call.colors.main() };
const webColor = Flex.DefaultTaskChannels.Chat.colors.main;
const facebookColor = Flex.DefaultTaskChannels.ChatMessenger.colors.main;
const smsColor = Flex.DefaultTaskChannels.ChatSms.colors.main;
const whatsappColor = Flex.DefaultTaskChannels.ChatWhatsApp.colors.main;

/**
 * Returns the UI for the "Contacts Waiting" section
 */
const queuesStatusUI = () => (
  <QueuesStatus
    key="queue-status-task-list"
    colors={{
      voiceColor,
      webColor,
      facebookColor,
      smsColor,
      whatsappColor,
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
      {featureFlags.enable_offline_contact && <OfflineContactButton />}
    </Container>
  );
};

/**
 * Add an "invisible" component that tracks the state of the queues, updating the pending tasks in each channel
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
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

// Re-renders UI if there is a new reservation created and no active tasks (avoid a visual bug with QueuesStatus when there are no tasks)
const setUpRerenderOnReservation = () => {
  const manager = Flex.Manager.getInstance();

  manager.workerClient.on('reservationCreated', reservation => {
    const { tasks } = manager.store.getState().flex.worker;
    if (tasks.size === 1) Flex.Actions.invokeAction('SelectTask', { sid: reservation.sid });
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

const setUpOfflineContact = () => {
  const manager = Flex.Manager.getInstance();
  const defaultStrings = Flex.DefaultTaskChannels.Default.templates.TaskListItem.secondLine;
  const defaultColors = Flex.DefaultTaskChannels.Default.colors;
  const defaultIcons = Flex.DefaultTaskChannels.Default.icons;

  // set icon, color, first and second lines if task isContactlessTask (offline contacts)
  const getDefaultChannelIcon = task => {
    if (task.attributes.isContactlessTask) return <AssignmentInd className="Twilio-Icon-Content" />;

    return defaultIcons;
  };
  Flex.DefaultTaskChannels.Default.icons = {
    active: getDefaultChannelIcon,
    list: getDefaultChannelIcon,
    main: getDefaultChannelIcon,
  };

  Flex.DefaultTaskChannels.Default.colors.main = (task, componentType) => {
    if (task.attributes.isContactlessTask) return '#159AF8';

    return Flex.TaskChannelHelper.getColor(task, defaultColors, componentType);
  };
  Flex.DefaultTaskChannels.Default.templates.TaskListItem.firstLine = (task, componentType) => {
    if (task.attributes.isContactlessTask) return manager.strings.OfflineContactFirstLine;

    return Flex.TaskChannelHelper.getTemplateForStatus(task, defaultStrings, componentType);
  };
  Flex.DefaultTaskChannels.Default.templates.TaskListItem.secondLine = (task, componentType) => {
    if (task.attributes.isContactlessTask) return manager.strings.OfflineContactSecondLine;

    return Flex.TaskChannelHelper.getTemplateForStatus(task, defaultStrings, componentType);
  };

  Flex.Notifications.registerNotification({
    id: 'YouMustBeAvailableToPerformThisOp',
    content: <Flex.Template code="YouMustBeAvailableToPerformThisOp" />,
    timeout: 5000,
    type: Flex.NotificationType.warning,
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

// UNDO, this is only for demo
// eslint-disable-next-line global-require
const { FormProvider, useForm } = require('react-hook-form');

const { createFormFromDefinition, buildTwoColumnFormLayout } = require('../components/common/forms/formGenerators');
const { ColumnarBlock } = require('../styles/HrmStyles');

const Form = () => {
  const methods = useForm();

  const form = React.useMemo(() => {
    return buildTwoColumnFormLayout(
      // eslint-disable-next-line no-use-before-define
      createFormFromDefinition(definition)([])(() => console.log('>>> form data', methods.getValues())),
    );
  }, [methods]);

  const anotherForm = React.useMemo(() => {
    return buildTwoColumnFormLayout(
      // eslint-disable-next-line no-use-before-define
      createFormFromDefinition(anotherDefinition)([])(() => console.log('>>> form data', methods.getValues())),
    );
  }, [methods]);

  return (
    <FormProvider {...methods}>
      <div style={{ height: '100%', overflow: 'scroll' }}>{form}</div>
      <div style={{ height: '100%', overflow: 'scroll' }}>
        <ColumnarBlock>{anotherForm}</ColumnarBlock>
      </div>
      <button type="button" onClick={() => methods.trigger()}>
        trigger
      </button>
    </FormProvider>
  );
};

export const gianTestingStuff = () => {
  Flex.ViewCollection.Content.add(
    <Flex.View name="gianTestingStuff" key="gianTestingStuff">
      <Form />
    </Flex.View>,
  );

  Flex.SideNav.Content.add(
    <SettingsSideLink
      key="gianTestingStuffSideLink"
      onClick={() => Flex.Actions.invokeAction('NavigateToView', { viewName: 'gianTestingStuff' })}
    />,
    {
      align: 'end',
    },
  );
};

/**
 * @type {import('../components/common/forms/types').FormDefinition}
 */
const anotherDefinition = [
  {
    name: 'input',
    label: 'An input',
    type: 'input',
  },
  {
    name: 'numeric-input',
    label: 'A numeric input',
    type: 'numeric-input',
  },
  {
    name: 'checkbox',
    label: 'A checkbox',
    type: 'checkbox',
    required: { value: true, message: 'This field is required.' },
  },
  {
    name: 'mixed-checkbox',
    label: 'A mixed checkbox',
    type: 'mixed-checkbox',
  },
  {
    name: 'select',
    label: 'A select',
    type: 'select',
    options: [
      { value: '', label: '--Please choose an option--' },
      { value: 'One', label: 'One' },
      { value: 'Two', label: 'Two' },
    ],
  },
  {
    name: 'dependent-select',
    label: 'A dependent select',
    type: 'dependent-select',
    defaultOption: {
      value: '',
      label: '--Please choose an option--',
    },
    dependsOn: 'select',
    options: {
      One: [
        { value: '1-a', label: '1-a' },
        { value: '1-b', label: '1-b' },
      ],
      Two: [
        { value: '2-a', label: '2-a' },
        { value: '2-b', label: '2-b' },
      ],
    },
  },
  {
    name: 'textarea',
    label: 'A textarea',
    type: 'textarea',
  },
  {
    name: 'date-input',
    label: 'A date input',
    type: 'date-input',
  },
  {
    name: 'time-input',
    label: 'A time input',
    type: 'time-input',
  },
];

/**
 * @type {import('../components/common/forms/types').FormDefinition}
 */
const definition = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'input',
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'input',
  },
  {
    name: 'streetAddress',
    label: 'Address',
    type: 'input',
  },
  {
    name: 'province',
    label: 'Location',
    type: 'select',
    options: [
      {
        value: '',
        label: '--Please choose an option--',
      },
      {
        value: 'Free State',
        label: 'Free State',
      },
      {
        value: 'Gauteng',
        label: 'Gauteng',
      },
      {
        value: 'KwaZulu Natal',
        label: 'KwaZulu Natal',
      },
      {
        value: 'Limpopo',
        label: 'Limpopo',
      },
    ],
    required: {
      value: true,
      message: 'RequiredFieldError',
    },
  },
  {
    name: 'municipality',
    label: 'Municipality',
    type: 'dependent-select',
    dependsOn: 'province',
    defaultOption: {
      value: '',
      label: '--Please choose an option--',
    },
    options: {
      'Free State': [
        {
          value: 'Fezile Dabi-Metsimaholo Municipality',
          label: 'Fezile Dabi-Metsimaholo Municipality',
        },
        {
          value: 'Fezile Dabi-Moqhaka Municipality',
          label: 'Fezile Dabi-Moqhaka Municipality',
        },
        {
          value: 'Thabo Mofutsanyana-Maluti a-Phofung',
          label: 'Thabo Mofutsanyana-Maluti a-Phofung',
        },
      ],
      Gauteng: [
        {
          value: 'Johannesburg Metropolitan',
          label: 'Johannesburg Metropolitan',
        },
        {
          value: 'Metsueding - East of Tshwane',
          label: 'Metsueding - East of Tshwane',
        },
        {
          value: 'Sedibeng - South East Gauteng',
          label: 'Sedibeng - South East Gauteng',
        },
      ],
      'KwaZulu Natal': [
        {
          value: 'Amajuba District Municipality',
          label: 'Amajuba District Municipality',
        },
        {
          value: 'Ethekwini District Municipality',
          label: 'Ethekwini District Municipality',
        },
        {
          value: 'iLembe District Municipality',
          label: 'iLembe District Municipality',
        },
      ],
    },
    required: {
      value: true,
      message: 'RequiredFieldError',
    },
  },
  {
    name: 'district',
    label: 'District',
    type: 'dependent-select',
    dependsOn: 'municipality',
    defaultOption: {
      value: '',
      label: '--Please choose an option--',
    },
    options: {
      'Fezile Dabi-Metsimaholo Municipality': [
        {
          value: 'Deneysville',
          label: 'Deneysville',
        },
        {
          value: 'Sasolburg',
          label: 'Sasolburg',
        },
      ],
      'Fezile Dabi-Moqhaka Municipality': [
        {
          value: 'Kroonstad',
          label: 'Kroonstad',
        },
        {
          value: 'Viljoenskroon',
          label: 'Viljoenskroon',
        },
      ],
      'Thabo Mofutsanyana-Maluti a-Phofung': [
        {
          value: 'Harrismith',
          label: 'Harrismith',
        },
        {
          value: 'Ladybrand',
          label: 'Ladybrand',
        },
        {
          value: 'Phuthaditjhaba',
          label: 'Phuthaditjhaba',
        },
      ],
      'Amajuba District Municipality': [
        {
          value: 'Charlestown',
          label: 'Charlestown',
        },
        {
          value: 'Dannhauser',
          label: 'Dannhauser',
        },
        {
          value: 'Newcastle',
          label: 'Newcastle',
        },
      ],
      'Ethekwini District Municipality': [
        {
          value: 'Bluff',
          label: 'Bluff',
        },
        {
          value: 'Cato Crest',
          label: 'Cato Crest',
        },
        {
          value: 'Cato Manor',
          label: 'Cato Manor',
        },
      ],
      'iLembe District Municipality': [
        {
          value: 'Dolphin Coast',
          label: 'Dolphin Coast',
        },
        {
          value: 'iLembe',
          label: 'iLembe',
        },
        {
          value: 'iNdlovu',
          label: 'iNdlovu',
        },
      ],
    },
    required: {
      value: true,
      message: 'RequiredFieldError',
    },
  },
  {
    name: 'phone1',
    label: 'Contact Number',
    type: 'numeric-input',
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      {
        value: '',
        label: '--Please choose an option--',
      },
      {
        value: 'Boy',
        label: 'Boy',
      },
      {
        value: 'Girl',
        label: 'Girl',
      },
      {
        value: 'Non-Binary',
        label: 'Non-Binary',
      },
      {
        value: 'Unknown',
        label: 'Unknown',
      },
    ],
    required: {
      value: true,
      message: 'RequiredFieldError',
    },
  },
  {
    name: 'age',
    label: 'Age',
    type: 'select',
    options: [
      {
        value: '',
        label: '--Please choose an option--',
      },
      {
        value: '0-03',
        label: '0-03',
      },
      {
        value: '04-06',
        label: '04-06',
      },
      {
        value: '07-09',
        label: '07-09',
      },
      {
        value: '10-12',
        label: '10-12',
      },
      {
        value: '13-15',
        label: '13-15',
      },
      {
        value: '16-17',
        label: '16-17',
      },
      {
        value: '18-25',
        label: '18-25',
      },
      {
        value: '>25',
        label: '>25',
      },
      {
        value: 'Unknown',
        label: 'Unknown',
      },
    ],
    required: {
      value: true,
      message: 'RequiredFieldError',
    },
  },
  {
    name: 'language',
    label: 'Language',
    type: 'select',
    options: [
      {
        value: '',
        label: '--Please choose an option--',
      },
      {
        value: 'Unknown',
        label: 'Unknown',
      },
      {
        value: 'Afrikaans',
        label: 'Afrikaans',
      },
      {
        value: 'English',
        label: 'English',
      },
      {
        value: 'Ndebele',
        label: 'Ndebele',
      },
      {
        value: 'Other',
        label: 'Other',
      },
      {
        value: 'Sepedi',
        label: 'Sepedi',
      },
      {
        value: 'Sign Language',
        label: 'Sign Language',
      },
      {
        value: 'Sotho',
        label: 'Sotho',
      },
      {
        value: 'Swazi',
        label: 'Swazi',
      },
      {
        value: 'Tshivenda',
        label: 'Tshivenda',
      },
      {
        value: 'Tsonga',
        label: 'Tsonga',
      },
      {
        value: 'Tswana',
        label: 'Tswana',
      },
      {
        value: 'Xhosa',
        label: 'Xhosa',
      },
      {
        value: 'Zulu',
        label: 'Zulu',
      },
    ],
  },
  {
    name: 'race',
    label: 'Race',
    type: 'select',
    options: [
      {
        value: '',
        label: '--Please choose an option--',
      },
      {
        value: 'Unknown',
        label: 'Unknown',
      },
      {
        value: 'Asian',
        label: 'Asian',
      },
      {
        value: 'Black',
        label: 'Black',
      },
      {
        value: 'Coloured',
        label: 'Coloured',
      },
      {
        value: 'Indian',
        label: 'Indian',
      },
      {
        value: 'White',
        label: 'White',
      },
    ],
  },
  {
    name: 'schoolName',
    label: 'School Name',
    type: 'input',
  },
  {
    name: 'gradeLevel',
    label: 'Grade Level',
    type: 'select',
    options: [
      {
        value: '',
        label: '--Please choose an option--',
      },
      {
        value: 'Unknown',
        label: 'Unknown',
      },
      {
        value: 'Grade 0 (Preschool)',
        label: 'Grade 0 (Preschool)',
      },
      {
        value: 'Grade 1-3 (Junior Primary)',
        label: 'Grade 1-3 (Junior Primary)',
      },
      {
        value: 'Grade 4-7 (Senior Primary)',
        label: 'Grade 4-7 (Senior Primary)',
      },
      {
        value: 'Grade 8-9 (Junior High)',
        label: 'Grade 8-9 (Junior High)',
      },
      {
        value: 'Grade 10-11 (Senior High)',
        label: 'Grade 10-11 (Senior High)',
      },
      {
        value: 'Grade 12 (Matric)',
        label: 'Grade 12 (Matric)',
      },
    ],
  },
  {
    name: 'livingSituation',
    label: 'Living Situation',
    type: 'select',
    options: [
      {
        value: '',
        label: '--Please choose an option--',
      },
      {
        value: 'Unknown',
        label: 'Unknown',
      },
      {
        value: 'Foster care',
        label: 'Foster care',
      },
      {
        value: 'Group facility',
        label: 'Group facility',
      },
      {
        value: 'On their own',
        label: 'On their own',
      },
      {
        value: 'With parent(s) or guardian(s)',
        label: 'With parent(s) or guardian(s)',
      },
      {
        value: 'With relatives',
        label: 'With relatives',
      },
      {
        value: 'Street child',
        label: 'Street child',
      },
      {
        value: 'HIV/AIDS-Child-headed household',
        label: 'HIV/AIDS-Child-headed household',
      },
      {
        value: 'Family without shelter',
        label: 'Family without shelter',
      },
    ],
  },
  {
    name: 'hivPositive',
    label: 'Child HIV Positive?',
    type: 'mixed-checkbox',
  },
  {
    name: 'inConflictWithTheLaw',
    label: 'Child in conflict with the law',
    type: 'checkbox',
  },
  {
    name: 'inDetention',
    label: 'Child in detention',
    type: 'checkbox',
  },
  {
    name: 'memberOfAnEthnic',
    label: 'Child member of an ethnic / racial minority',
    type: 'checkbox',
  },
  {
    name: 'LGBTQI+',
    label: 'LGBTQI+ / SOGIESC child',
    type: 'checkbox',
  },
  {
    name: 'region',
    label: 'Region',
    type: 'select',
    options: [
      {
        value: 'Unknown',
        label: 'Unknown',
      },
      {
        value: 'Rural',
        label: 'Rural',
      },
      {
        value: 'Urban',
        label: 'Urban',
      },
    ],
  },
];
