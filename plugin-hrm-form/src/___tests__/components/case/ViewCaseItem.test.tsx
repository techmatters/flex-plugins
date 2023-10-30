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
import { DefinitionVersion, DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import ViewCaseItem, { ViewCaseItemProps } from '../../../components/case/ViewCaseItem';
import { getDefinitionVersions } from '../../../hrmConfig';
import { StandaloneITask } from '../../../types/types';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';
import { householdSectionApi } from '../../../states/case/sections/household';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states/storeNamespaces';
import { newGoBackAction } from '../../../states/routing/actions';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

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

const state = {
  [namespace]: {
    routing: {
      tasks: {
        task1: [
          { route: 'case', subroute: 'home' },
          { route: 'case', subroute: NewCaseSubroutes.Household, action: CaseItemAction.View, id: 'HOUSEHOLD_2' },
        ],
      },
    },
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
    },
    [contactFormsBase]: {
      tasks: {
        task1: {
          childInformation: {
            name: { firstName: { value: 'first' }, lastName: { value: 'last' } },
          },
          metadata: {},
        },
      },
    },
    [connectedCaseBase]: {
      tasks: {
        task1: {
          taskSid: 'task1',
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: {
              households: [
                {
                  household: {},
                  createdAt: '2020-06-29T22:26:00.208Z',
                  twilioWorkerId: 'worker1',
                  id: 'HOUSEHOLD_1',
                },
                {
                  household,
                  createdAt: '2020-06-29T22:26:00.208Z',
                  twilioWorkerId: 'worker1',
                  id: 'HOUSEHOLD_2',
                },
              ],
            },
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
  taskSid: 'task1',
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
  });

  beforeEach(async () => {
    ownProps = {
      definitionVersion: mockV1,
      task: task as StandaloneITask,
      sectionApi: householdSectionApi,
      canEdit: () => true,
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
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewCaseItem {...ownProps} canEdit={() => false} />
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
