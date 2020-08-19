import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';

import '../../mockGetConfig';

import { UnconnectedViewContact } from '../../../components/case/ViewContact';
import HrmTheme from '../../../styles/HrmTheme';
import { ContactDetailsSections } from '../../../states/SearchContact';
import { adaptFormToContactDetails } from '../../../components/case/ContactDetailsAdapter';

expect.extend(toHaveNoViolations);

jest.mock('../../../components/case/ContactDetailsAdapter', () => ({ adaptFormToContactDetails: jest.fn() }));

const themeConf = {
  colorTheme: HrmTheme,
};

const task = {
  taskSid: 'task-id',
  channelType: 'whatsapp',
  defaultFrom: '+12025550425',
};

const contact = {
  details: {
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
  detailsExpanded,
  counselor: 'john-doe-hash',
  date: '8/12/2020',
};

test('displays counselor, date and contact details', () => {
  adaptFormToContactDetails.mockReturnValueOnce(contact);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewContact
        task={task}
        form={{}}
        counselorsHash={counselorsHash}
        tempInfo={tempInfo}
        updateTempInfo={jest.fn()}
        changeRoute={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('Case-ActionHeaderCounselor')).toHaveTextContent('John Doe');
  expect(screen.getByTestId('Case-ActionHeaderAdded')).toHaveTextContent('8/12/2020');
  expect(screen.getByTestId('ContactDetails-Container')).toBeInTheDocument();
  expect(screen.getByText('Jill Smith'.toUpperCase())).toBeInTheDocument();
});

test('click on x button', () => {
  const changeRoute = jest.fn();
  adaptFormToContactDetails.mockReturnValueOnce(contact);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewContact
        task={task}
        form={{}}
        counselorsHash={counselorsHash}
        tempInfo={tempInfo}
        updateTempInfo={jest.fn()}
        changeRoute={changeRoute}
      />
    </StorelessThemeProvider>,
  );

  screen.getByTestId('Case-CloseCross').click();

  expect(changeRoute).toHaveBeenCalledWith({ route: 'new-case' }, task.taskSid);
});

test('click on close button', () => {
  const changeRoute = jest.fn();
  adaptFormToContactDetails.mockReturnValueOnce(contact);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewContact
        task={task}
        form={{}}
        counselorsHash={counselorsHash}
        tempInfo={tempInfo}
        updateTempInfo={jest.fn()}
        changeRoute={changeRoute}
      />
    </StorelessThemeProvider>,
  );

  screen.getByTestId('Case-ViewContactScreen-CloseButton').click();

  expect(changeRoute).toHaveBeenCalledWith({ route: 'new-case' }, task.taskSid);
});

test('click on expand section', async () => {
  const updateTempInfo = jest.fn();
  adaptFormToContactDetails.mockReturnValueOnce(contact);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewContact
        task={task}
        form={{}}
        counselorsHash={counselorsHash}
        tempInfo={tempInfo}
        updateTempInfo={updateTempInfo}
        changeRoute={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  const updatedTempInfo = {
    ...tempInfo,
    detailsExpanded: {
      ...tempInfo.detailsExpanded,
      [ContactDetailsSections.CHILD_INFORMATION]: !tempInfo.detailsExpanded[ContactDetailsSections.CHILD_INFORMATION],
    },
  };

  screen.getByTestId('ContactDetails-Section-ChildInformation').click();

  expect(updateTempInfo).toHaveBeenCalledWith(updatedTempInfo, task.taskSid);
});

test('a11y', async () => {
  adaptFormToContactDetails.mockReturnValueOnce(contact);

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewContact
        task={task}
        form={{}}
        counselorsHash={counselorsHash}
        tempInfo={tempInfo}
        updateTempInfo={jest.fn()}
        changeRoute={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  const rules = {
    region: { enabled: false },
  };

  console.log(wrapper);

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
