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

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import ViewContact from '../../../components/case/ViewContact';
import { ContactDetailsSections } from '../../../components/common/ContactDetails';
import { getDefinitionVersions } from '../../../hrmConfig';
import { Case, Contact } from '../../../types/types';
import { RootState } from '../../../states';
import { DetailsContext, TOGGLE_DETAIL_EXPANDED_ACTION } from '../../../states/contacts/contactDetails';
import { connectedCaseBase, csamReportBase } from '../../../states/storeNamespaces';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';
import { newCloseModalAction } from '../../../states/routing/actions';

jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: { invokeAction: jest.fn() },
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

const themeConf = {};

const task = {
  taskSid: 'task-id',
  channelType: 'whatsapp',
  defaultFrom: '+12025550425',
};

const contact: Contact = {
  id: 'TEST_ID',
  accountSid: '',
  createdAt: '2020-03-10',
  updatedBy: 'counselor-id',
  queueName: '',
  timeOfContact: '2020-03-10',
  number: 'Anonymous',
  twilioWorkerId: 'counselor-id',
  channel: 'web',
  conversationDuration: 10,
  createdBy: 'an SID',
  helpline: '',
  taskId: '',
  csamReports: [],
  conversationMedia: [],
  channelSid: '',
  serviceSid: '',
  rawJson: {
    definitionVersion: DefinitionVersionId.v1,
    callType: 'Child calling about self',
    childInformation: {
      firstName: 'Jill',
      lastName: 'Smith',
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
      callSummary: 'J Smith Notes',
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
    contactlessTask: { ...VALID_EMPTY_CONTACT.rawJson.contactlessTask, channel: 'voice' },
    categories: { category1: ['Tag1', 'Tag2'] },
  },
};

const counselorsHash = {
  'john-doe-hash': 'John Doe',
};

beforeEach(() => {
  mockReset();
});

describe('View Contact', () => {
  let mockV1;
  let initialState: RootState;

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
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
        routing: {
          tasks: {
            'task-id': [
              { route: 'case', subroute: 'home', activeModal: [{ route: 'contact', subroute: 'view', id: 'TEST_ID' }] },
            ],
          },
          isAddingOfflineContact: false,
        },
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
              connectedCase: {} as Case,
              availableStatusTransitions: [],
              caseWorkingCopy: { sections: {} },
            },
          },
        },
        activeContacts: {
          isCallTypeCaller: false,
          existingContacts: {
            TEST_ID: {
              savedContact: contact,
              references: new Set(['task-id']),
              metadata: {
                ...VALID_EMPTY_METADATA,
                categories: { gridView: false, expanded: {} },
              },
            },
          },
          contactDetails: {
            [DetailsContext.CASE_DETAILS]: { detailsExpanded: {} },
            [DetailsContext.CONTACT_SEARCH]: { detailsExpanded: {} },
          },
        },
        [csamReportBase]: {
          contacts: {},
        },
      },
    };
  });

  test('displays counselor, date and contact details and sections are collapsed', async () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StorelessThemeProvider themeConf={themeConf}>
          <ViewContact contactId="TEST_ID" task={task as any} />
        </StorelessThemeProvider>
      </Provider>,
    );

    // TODO: Verify interpolated translations contain the expected data
    await waitFor(() => expect(screen.getByTestId('ContactDetails-Container')).toBeInTheDocument());
    expect(screen.getAllByText('#TEST_ID Jill Smith')[0]).toBeInTheDocument();
  });

  test('click on close button', async () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StorelessThemeProvider themeConf={themeConf}>
          <ViewContact contactId="TEST_ID" task={task as any} />
        </StorelessThemeProvider>
      </Provider>,
    );

    await waitFor(() => expect(screen.getByTestId('NavigableContainer-CloseCross')).toBeInTheDocument());

    screen.getByTestId('NavigableContainer-CloseCross').click();
    const actions = store.getActions();
    expect(actions[actions.length - 1]).toStrictEqual(newCloseModalAction(task.taskSid));
  });

  test('click on expand section sends toggle action', async () => {
    const store = mockStore(initialState);

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewContact contactId="TEST_ID" task={task as any} />
        </Provider>
      </StorelessThemeProvider>,
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
          <ViewContact contactId="TEST_ID" task={task as any} />
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
