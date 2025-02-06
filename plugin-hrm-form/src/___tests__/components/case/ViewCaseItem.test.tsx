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

// @ts-ignore
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import ViewCaseItem, { ViewCaseItemProps } from '../../../components/case/ViewCaseItem';
import { getDefinitionVersions } from '../../../hrmConfig';
import { StandaloneITask } from '../../../types/types';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';
import { householdSectionApi } from '../../../states/case/sections/household';
import { namespace } from '../../../states/storeNamespaces';
import { newGoBackAction } from '../../../states/routing/actions';
import { RecursivePartial } from '../../RecursivePartial';
import { RootState } from '../../../states';
import { VALID_EMPTY_CASE } from '../../testCases';
import { getInitializedCan } from '../../../permissions';

jest.mock('../../../permissions', () => ({
  getInitializedCan: jest.fn(),
  PermissionActions: {},
}));

const mockGetInitializedCan = getInitializedCan as jest.MockedFunction<typeof getInitializedCan>;

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const household = {
  age: '>25',
  gender: 'Unknown',
  phone1: '111222333',
  phone2: '44455566',
  village: 'some village',
  district: 'some district',
  language: 'Unknown',
  lastName: 'LastName',
  province: 'some province',
  ethnicity: 'some ethnicity',
  firstName: 'FirstName',
  postalCode: '1111',
  streetAddress: '123 Fake st',
  relationshipToChild: 'Friend',
};

const WORKER_SID = 'WK-worker1';
const TASK_SID = 'WT-task1';
const BASELINE_DATE = parseISO('2020-06-29T22:26:00.208Z');

const state: RecursivePartial<RootState> = {
  [namespace]: {
    routing: {
      tasks: {
        [TASK_SID]: [
          { route: 'case', subroute: 'home', caseId: 'case1' },
          {
            route: 'case',
            subroute: NewCaseSubroutes.Household,
            caseId: 'case1',
            action: CaseItemAction.View,
            id: 'HOUSEHOLD_2',
          },
        ],
      },
    },
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
    },
    connectedCase: {
      cases: {
        case1: {
          sections: {
            household: {
              HOUSEHOLD_1: {
                sectionTypeSpecificData: {},
                createdAt: BASELINE_DATE,
                createdBy: WORKER_SID,
                sectionId: 'HOUSEHOLD_1',
              },
              HOUSEHOLD_2: {
                sectionTypeSpecificData: household as any,
                createdAt: BASELINE_DATE,
                createdBy: WORKER_SID,
                sectionId: 'HOUSEHOLD_2',
              },
            },
          },
          connectedCase: {
            ...VALID_EMPTY_CASE,
            id: 'case1',
            createdAt: new Date(1593469560208).toISOString(),
            twilioWorkerId: WORKER_SID,
            status: 'open',
          },
        },
      },
    },
  },
};
const store = mockStore(state);
store.dispatch = jest.fn();

const themeConf = {};

const task = {
  taskSid: TASK_SID,
};

describe('Test ViewHousehold', () => {
  let mockV1: DefinitionVersion;

  let ownProps: ViewCaseItemProps;

  beforeAll(async () => {
    mockReset();
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
    mockGetInitializedCan.mockReturnValue(() => true);
  });

  beforeEach(async () => {
    ownProps = {
      definitionVersion: mockV1,
      task: task as StandaloneITask,
      sectionApi: householdSectionApi,
    };
  });

  test('Test close functionality', async () => {
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewCaseItem {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('NavigableContainer-BackButton')).toBeInTheDocument();
    expect(screen.getByTestId('Case-EditButton')).toBeInTheDocument();
    screen.getByTestId('NavigableContainer-BackButton').click();

    expect(store.dispatch).toHaveBeenCalledWith(newGoBackAction(task.taskSid));
  });
  test('Test no edit permissions', async () => {
    mockGetInitializedCan.mockReturnValue(() => false);
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewCaseItem {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );
    expect(screen.getByTestId('NavigableContainer-BackButton')).toBeInTheDocument();
    expect(screen.queryByTestId('Case-EditButton')).toBeNull();
  });

  test('a11y', async () => {
    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewCaseItem {...ownProps} />
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
