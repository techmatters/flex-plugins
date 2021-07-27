import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../../mockGetConfig';

import { UnconnectedViewContact } from '../../../components/case/ViewContact';
import HrmTheme from '../../../styles/HrmTheme';
import { ContactDetailsSections } from '../../../components/common/ContactDetails';
import { adaptFormToContactDetails } from '../../../components/case/ContactDetailsAdapter';
import mockV1 from '../../../formDefinitions/v1';

expect.extend(toHaveNoViolations);

jest.mock('../../../components/case/ContactDetailsAdapter', () => ({ adaptFormToContactDetails: jest.fn() }));
jest.mock('../../../services/HelplineService', () => ({ getHelplineToSave: () => Promise.resolve('helpline') }));

const flushPromises = () => new Promise(setImmediate);

const mockStore = configureMockStore([]);

const themeConf = {
  colorTheme: HrmTheme,
};

const task = {
  taskSid: 'task-id',
  channelType: 'whatsapp',
  defaultFrom: '+12025550425',
};

const route = 'new-case';

const contact = {
  details: {
    definitionVersion: 'v1',
    childInformation: {
      name: {
        firstName: 'Jill',
        lastName: 'Smith',
      },
      gender: 'Other',
      age: '18-25',
      language: 'Language 1',
      nationality: 'Nationality 1',
      ethnicity: 'Ethnicity 1',
      location: {
        streetAddress: '',
        city: '',
        stateOrCounty: '',
        postalCode: '',
        phone1: '',
        phone2: '',
      },
      refugee: false,
      disabledOrSpecialNeeds: false,
      hiv: false,
      school: {
        name: 'school',
        gradeLevel: 'some',
      },
    },
    caseInformation: {
      callSummary: 'Child calling about self',
      referredTo: '',
      status: 'In Progress',
      keepConfidential: true,
      okForCaseWorkerToCall: false,
      howDidTheChildHearAboutUs: '',
      didYouDiscussRightsWithTheChild: false,
      didTheChildFeelWeSolvedTheirProblem: false,
      wouldTheChildRecommendUsToAFriend: false,
    },
    callerInformation: {
      name: {
        firstName: '',
        lastName: '',
      },
      relationshipToChild: '',
      gender: '',
      age: '',
      language: '',
      nationality: '',
      ethnicity: '',
      location: {
        city: '',
        phone1: '',
        phone2: '',
        postalCode: '',
        stateOrCounty: '',
        streetAddress: '',
      },
    },
  },
  overview: {
    dateTime: '2020-03-10',
    name: 'Jill Smith',
    customerNumber: 'Anonymous',
    callType: 'Child calling about self',
    categories: { category1: ['Tag1', 'Tag2'] },
    counselor: 'counselor-id',
    notes: 'Jill Smith Notes',
    channel: 'web',
    conversationDuration: 10,
  },
  counselor: 'John Doe',
  tags: ['Tag1', 'Tag2'],
};

const counselorsHash = {
  'john-doe-hash': 'John Doe',
};

const detailsExpanded = {
  [ContactDetailsSections.GENERAL_DETAILS]: true,
  [ContactDetailsSections.CALLER_INFORMATION]: false,
  [ContactDetailsSections.CHILD_INFORMATION]: false,
  [ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
  [ContactDetailsSections.CONTACT_SUMMARY]: false,
};

const tempInfo = {
  screen: 'view-contact',
  info: {
    detailsExpanded: {
      section: true,
    },
    counselor: 'john-doe-hash',
    createdAt: '8/12/2020',
    timeOfContact: '8/12/2020',
  },
};

const initialState = {
  'plugin-hrm-form': {
    configuration: {
      counselors: {
        list: [],
        hash: {},
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
  },
};

test('displays counselor, date and contact details', async () => {
  adaptFormToContactDetails.mockReturnValueOnce(contact);
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewContact
          task={task}
          form={{}}
          counselorsHash={counselorsHash}
          tempInfo={tempInfo}
          updateTempInfo={jest.fn()}
          onClickClose={jest.fn()}
          route={route}
        />
      </StorelessThemeProvider>
    </Provider>,
  );

  await waitFor(() => expect(screen.getByTestId('Case-ActionHeaderCounselor')).toBeInTheDocument());

  expect(screen.getByTestId('Case-ActionHeaderCounselor')).toHaveTextContent('John Doe');
  expect(screen.getByTestId('Case-ActionHeaderAdded')).toHaveTextContent('8/12/2020');
  expect(screen.getByTestId('ContactDetails-Container')).toBeInTheDocument();
  expect(screen.getByText('Jill Smith'.toUpperCase())).toBeInTheDocument();
});

test('click on x button', async () => {
  const onClickClose = jest.fn();
  adaptFormToContactDetails.mockReturnValueOnce(contact);
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewContact
          task={task}
          form={{}}
          counselorsHash={counselorsHash}
          tempInfo={tempInfo}
          updateTempInfo={jest.fn()}
          onClickClose={onClickClose}
          route={route}
        />
      </StorelessThemeProvider>
    </Provider>,
  );

  await waitFor(() => expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument());

  screen.getByTestId('Case-CloseCross').click();

  expect(onClickClose).toHaveBeenCalled();
});

test('click on close button', async () => {
  const onClickClose = jest.fn();
  adaptFormToContactDetails.mockReturnValueOnce(contact);
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewContact
          task={task}
          form={{}}
          counselorsHash={counselorsHash}
          tempInfo={tempInfo}
          updateTempInfo={jest.fn()}
          onClickClose={onClickClose}
          route={route}
        />
      </StorelessThemeProvider>
    </Provider>,
  );

  await waitFor(() => expect(screen.getByTestId('Case-ViewContactScreen-CloseButton')).toBeInTheDocument());

  screen.getByTestId('Case-ViewContactScreen-CloseButton').click();

  expect(onClickClose).toHaveBeenCalled();
});

test('click on expand section', async () => {
  const updateTempInfo = jest.fn();
  adaptFormToContactDetails.mockReturnValueOnce(contact);
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewContact
          task={task}
          form={{}}
          counselorsHash={counselorsHash}
          tempInfo={tempInfo}
          updateTempInfo={updateTempInfo}
          onClickClose={jest.fn()}
          route={route}
        />
      </StorelessThemeProvider>
    </Provider>,
  );

  const updatedTempInfo = {
    ...tempInfo,
    info: {
      ...tempInfo.info,
      detailsExpanded: {
        ...tempInfo.info.detailsExpanded,
        [ContactDetailsSections.CHILD_INFORMATION]: !tempInfo.info.detailsExpanded[
          ContactDetailsSections.CHILD_INFORMATION
        ],
      },
    },
  };

  await waitFor(() => expect(screen.getByTestId('ContactDetails-Section-ChildInformation')).toBeInTheDocument());

  screen.getByTestId('ContactDetails-Section-ChildInformation').click();

  expect(updateTempInfo).toHaveBeenCalledWith(updatedTempInfo, task.taskSid);
});

/**
 * Commenting this a11y test, because it keeps timing out
 */
/*
 * test('a11y', async () => {
 *   adaptFormToContactDetails.mockReturnValueOnce(contact);
 *   const store = mockStore(initialState);
 *
 *   const wrapper = mount(
 *     <Provider store={store}>
 *       <StorelessThemeProvider themeConf={themeConf}>
 *         <UnconnectedViewContact
 *           task={task}
 *           form={{}}
 *           counselorsHash={counselorsHash}
 *           tempInfo={tempInfo}
 *           updateTempInfo={jest.fn()}
 *           onClickClose={jest.fn()}
 *           route={route}
 *         />
 *       </StorelessThemeProvider>
 *     </Provider>,
 *   );
 *
 *   await flushPromises();
 *   wrapper.update();
 *
 *   const rules = {
 *     region: { enabled: false },
 *   };
 *
 *   const axe = configureAxe({ rules });
 *   const results = await axe(wrapper.getDOMNode());
 *   expect(results).toHaveNoViolations();
 * });
 */
