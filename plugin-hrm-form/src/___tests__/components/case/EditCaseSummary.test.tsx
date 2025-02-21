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
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import EditCaseSummary, { EditCaseSummaryProps } from '../../../components/case/caseDetails/EditCaseOverview';
import { getDefinitionVersions } from '../../../hrmConfig';
import { StandaloneITask } from '../../../types/types';
import { CaseRoute } from '../../../states/routing/types';
import { changeRoute } from '../../../states/routing/actions';
import { namespace } from '../../../states/storeNamespaces';
import { RecursivePartial } from '../../RecursivePartial';
import { RootState } from '../../../states';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

let mockV1: DefinitionVersion;

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const state: RecursivePartial<RootState> = {
  [namespace]: {
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: {},
      currentDefinitionVersion: {
        caseStatus: {
          open: {
            label: 'Open Label',
          },
        },
      },
    },
    activeContacts: {
      existingContacts: {
        contact1: {
          savedContact: {
            rawJson: {
              childInformation: {
                firstName: 'first',
                lastName: 'last',
              },
            },
          },
          metadata: {},
        },
      },
    },
    connectedCase: {
      cases: {
        case1: {
          caseWorkingCopy: { sections: {} },
          connectedCase: {
            createdAt: new Date().toISOString(),
            twilioWorkerId: 'worker1',
            status: 'open',
            info: {},
          },
          availableStatusTransitions: [{}],
        },
      },
    },
    routing: {
      tasks: {
        task1: [
          {
            route: 'case',
            subroute: 'home',
            caseId: 'case1',
          },
          {
            route: 'case',
            subroute: 'caseSummary',
            caseId: 'case1',
          },
        ],
      },
    },
  },
};
const store = mockStore(state);

const themeConf = {};

const task = {
  taskSid: 'task1',
};

describe('Test EditCaseSummary', () => {
  let ownProps: EditCaseSummaryProps;
  const exitRoute: CaseRoute = { route: 'case', subroute: 'home', caseId: 'case1' };

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(() => {
    mockReset();
    ownProps = {
      task: task as StandaloneITask,
      definitionVersion: mockV1,
      can: () => true,
    };
    store.dispatch = jest.fn();
  });
  test('Test close functionality', async () => {
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <EditCaseSummary {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(store.dispatch).not.toHaveBeenCalledWith(changeRoute(exitRoute, 'task1'));

    expect(screen.getByTestId('NavigableContainer-BackButton')).toBeInTheDocument();
    screen.getByTestId('NavigableContainer-BackButton').click();
    expect(store.dispatch).not.toHaveBeenCalledWith(changeRoute(exitRoute, 'task1'));
  });

  test('a11y', async () => {
    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <EditCaseSummary {...ownProps} />
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
