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
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider, ThemeConfigProps } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { RootState } from '../../../states';
import AddEditCaseItem, { AddEditCaseItemProps } from '../../../components/case/AddEditCaseItem';
import { getDefinitionVersions } from '../../../hrmConfig';
import { CustomITask } from '../../../types/types';
import { CaseItemAction } from '../../../states/routing/types';
import { householdSectionApi } from '../../../states/case/sections/household';
import { newGoBackAction } from '../../../states/routing/actions';
import { ReferralLookupStatus } from '../../../states/contacts/resourceReferral';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { connectedCaseBase, namespace } from '../../../states/storeNamespaces';
import { CaseState } from '../../../states/case/types';
import { RecursivePartial } from '../../RecursivePartial';
import { TaskSID, WorkerSID } from '../../../types/twilio';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

let mockV1;

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

jest.mock('../../../services/CaseService');

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);
const WORKER_SID: WorkerSID = 'WK-worker1';
const TASK_SID: TaskSID = 'WT-task1';

const addingNewHouseholdCaseState: CaseState = {
  cases: {
    case1: {
      caseWorkingCopy: {
        sections: {
          household: {
            new: {
              age: '',
              district: '',
              ethnicity: '',
              firstName: '',
              gender: '',
              language: 'Unknown',
              lastName: '',
              phone1: '',
              phone2: '',
              postalCode: '',
              province: '',
              relationshipToChild: '',
              streetAddress: '',
              village: '',
            },
            existing: {},
          },
        },
      },
      connectedCase: {
        helpline: '',
        accountSid: 'ACxxx',
        id: '1',
        createdAt: new Date(1593469560208).toISOString(),
        updatedAt: new Date(1593469560208).toISOString(),
        twilioWorkerId: WORKER_SID,
        status: 'open',
        info: null,
        categories: {},
      },
      sections: {},
      timelines: {},
      references: new Set(),
      availableStatusTransitions: [],
    },
  },
};

const hrmState: Partial<RootState[typeof namespace]> = {
  configuration: {
    language: '',
    currentDefinitionVersion: mockV1,
    definitionVersions: {},
    workerInfo: { chatChannelCapacity: 100 },
    counselors: {
      list: [],
      hash: { worker1: 'worker1 name' },
    },
  },
  activeContacts: {
    contactDetails: { contactSearch: { detailsExpanded: {} }, caseDetails: { detailsExpanded: {} } },
    existingContacts: {
      1234: {
        references: new Set(),
        savedContact: {
          ...VALID_EMPTY_CONTACT,
          id: '1234',
          taskId: TASK_SID,
          rawJson: {
            ...VALID_EMPTY_CONTACT.rawJson,
            childInformation: {
              firstName: 'first',
              lastName: 'last',
            },
            callType: 'Child calling about self',
            callerInformation: {},
            categories: {},
            caseInformation: {},
            contactlessTask: {
              ...VALID_EMPTY_CONTACT.rawJson.contactlessTask,
              channel: 'voice',
            },
          },
          helpline: '',
        },
        metadata: {
          startMillis: 0,
          endMillis: 0,
          categories: { gridView: false, expanded: {} },
          recreated: false,
          draft: {
            dialogsOpen: {},
            resourceReferralList: {
              lookupStatus: ReferralLookupStatus.NOT_STARTED,
              resourceReferralIdToAdd: undefined,
            },
          },
        },
      },
    },
  },
  connectedCase: addingNewHouseholdCaseState,
  routing: {
    tasks: {
      [TASK_SID]: [{ route: 'case', subroute: 'household', caseId: 'case1', action: CaseItemAction.Add }],
    },
  },
};

const state1: RootState = {
  [namespace]: hrmState,
};

const store1 = mockStore(state1);
store1.dispatch = jest.fn();

const state2: RecursivePartial<RootState> = {
  ...state1,
  [namespace]: {
    ...state1[namespace],
    connectedCase: addingNewHouseholdCaseState,
    routing: {
      tasks: {
        [TASK_SID]: [
          { route: 'case', caseId: 'case1', subroute: 'household', action: CaseItemAction.View },
          { route: 'case', caseId: 'case1', subroute: 'household', action: CaseItemAction.Add },
        ],
      },
    },
  },
};
const store2 = mockStore(state2);
store2.dispatch = jest.fn();

const routing3: RootState[typeof namespace]['routing'] = {
  tasks: {
    [TASK_SID]: [{ route: 'case', subroute: 'household', action: CaseItemAction.Add }],
  },
};

const state3 = {
  [namespace]: {
    ...state1[namespace],
    [connectedCaseBase]: addingNewHouseholdCaseState,
    routing: routing3,
  },
};
const store3 = mockStore(state3);
store3.dispatch = jest.fn();

const themeConf: ThemeConfigProps = {};

describe('Test AddHousehold', () => {
  let ownProps: AddEditCaseItemProps;
  beforeEach(
    () =>
      (ownProps = {
        task: { taskSid: TASK_SID } as CustomITask,
        sectionApi: householdSectionApi,
        definitionVersion: mockV1,
      }),
  );
  test('Test close functionality', async () => {
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store2}>
          <AddEditCaseItem {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(store2.dispatch).not.toHaveBeenCalledWith(newGoBackAction(TASK_SID));

    expect(screen.getByTestId('NavigableContainer-BackButton')).toBeInTheDocument();
    screen.getByTestId('NavigableContainer-BackButton').click();

    expect(store2.dispatch).toHaveBeenCalledWith(newGoBackAction(TASK_SID));
  });

  test('a11y', async () => {
    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store2}>
          <AddEditCaseItem {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    const rules = {
      region: { enabled: false },
    };

    const axe = configureAxe({ rules });
    const results = await axe(wrapper.getDOMNode());

    (expect(results) as any).toHaveNoViolations();
  });
});
