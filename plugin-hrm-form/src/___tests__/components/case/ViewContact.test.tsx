import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import ViewContact from '../../../components/case/ViewContact';
import { ContactDetailsSections } from '../../../components/common/ContactDetails';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { SearchContact } from '../../../types/types';
import { connectedCaseBase, contactFormsBase, RootState } from '../../../states';
import { DetailsContext, TOGGLE_DETAIL_EXPANDED_ACTION } from '../../../states/contacts/contactDetails';

jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: { invokeAction: jest.fn() },
}));

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

const themeConf = {};

const task = {
  taskSid: 'task-id',
  channelType: 'whatsapp',
  defaultFrom: '+12025550425',
};

const contact: SearchContact = {
  contactId: 'TEST ID',
  details: {
    definitionVersion: DefinitionVersionId.v1,
    contactlessTask: {},
    callType: '',
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
      city: '',
      stateOrCounty: '',
      postalCode: '',
      phone1: '',
      phone2: '',
      refugee: false,
      disabledOrSpecialNeeds: false,
      hiv: false,
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
      categories: {},
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
      phone1: '',
      phone2: '',
      postalCode: '',
      stateOrCounty: '',
      streetAddress: '',
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
    createdBy: 'an SID',
  },
  csamReports: [],
};

const counselorsHash = {
  'john-doe-hash': 'John Doe',
};

describe('View Contact', () => {
  let mockV1;
  let initialState: RootState;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
    initialState = {
      flex: {
        worker: {
          attributes: {
            roles: [],
          },
        },
      } as any,
      'plugin-hrm-form': {
        configuration: {
          language: '',
          workerInfo: { chatChannelCapacity: 1 },
          counselors: { hash: counselorsHash, list: [] },
          definitionVersions: { v1: mockV1 },
          currentDefinitionVersion: mockV1,
        },
        [connectedCaseBase]: {
          tasks: {
            'task-id': {
              connectedCase: {},
              caseHasBeenEdited: false,
            },
          },
        },
        [contactFormsBase]: {
          tasks: {},
          existingContacts: {
            'TEST ID': {
              savedContact: contact,
              references: new Set(['task-id']),
              categories: { gridView: false, expanded: {} },
            },
          },
          contactDetails: {
            [DetailsContext.CASE_DETAILS]: { detailsExpanded: {} },
            [DetailsContext.CONTACT_SEARCH]: { detailsExpanded: {} },
          },
        },
      },
    };
  });

  test('displays counselor, date and contact details and sections are collapsed', async () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StorelessThemeProvider themeConf={themeConf}>
          <ViewContact contactId="TEST ID" task={task as any} onClickClose={jest.fn()} />
        </StorelessThemeProvider>
      </Provider>,
    );

    // TODO: Verify interpolated translations contain the expected data
    await waitFor(() => expect(screen.getByTestId('ContactDetails-Container')).toBeInTheDocument());
    expect(screen.getByText('Jill Smith')).toBeInTheDocument();
  });

  test('click on close button', async () => {
    const onClickClose = jest.fn();
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StorelessThemeProvider themeConf={themeConf}>
          <ViewContact contactId="TEST ID" task={task as any} onClickClose={onClickClose} />
        </StorelessThemeProvider>
      </Provider>,
    );

    await waitFor(() => expect(screen.getByTestId('Case-ViewContactScreen-CloseButton')).toBeInTheDocument());

    screen.getByTestId('Case-ViewContactScreen-CloseButton').click();

    expect(onClickClose).toHaveBeenCalled();
  });

  test('click on expand section sends toggle action', async () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StorelessThemeProvider themeConf={themeConf}>
          <ViewContact contactId="TEST ID" task={task as any} onClickClose={jest.fn()} />
        </StorelessThemeProvider>
      </Provider>,
    );

    await waitFor(() => expect(screen.getByTestId('ContactDetails-Section-ChildInformation')).toBeInTheDocument());

    screen.getByTestId('ContactDetails-Section-ChildInformation').click();
    const actions = store.getActions();
    expect(actions[actions.length - 1]).toStrictEqual({
      type: TOGGLE_DETAIL_EXPANDED_ACTION,
      context: DetailsContext.CASE_DETAILS,
      section: ContactDetailsSections.CHILD_INFORMATION,
    });
  });

  test('a11y', async () => {
    const store = mockStore(initialState);
    const wrapper = mount(
      <Provider store={store}>
        <StorelessThemeProvider themeConf={themeConf}>
          <ViewContact contactId="TEST ID" task={task as any} onClickClose={jest.fn()} />
        </StorelessThemeProvider>
      </Provider>,
    );

    const rules = {
      region: { enabled: false },
    };

    const axe = configureAxe({ rules });
    const results = await axe(wrapper.getDOMNode());
    (expect(results) as any).toHaveNoViolations();
  });
});
