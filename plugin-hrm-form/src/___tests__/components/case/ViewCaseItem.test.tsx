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

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import ViewCaseItem, { ViewCaseItemProps } from '../../../components/case/ViewCaseItem';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { CaseItemEntry, StandaloneITask } from '../../../types/types';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';
import { householdSectionApi } from '../../../states/case/sections/household';

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
  const exitItem = jest.fn();

  let ownProps: ViewCaseItemProps;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(async () => {
    ownProps = {
      exitItem,
      definitionVersion: mockV1,
      task: task as StandaloneITask,
      sectionApi: householdSectionApi,
      routing: {
        route: 'tabbed-forms',
        subroute: NewCaseSubroutes.Household,
        action: CaseItemAction.View,
        id: 'HOUSEHOLD_2',
      },
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

    expect(exitItem).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
    expect(screen.getByTestId('Case-EditButton')).toBeInTheDocument();
    screen.getByTestId('Case-CloseCross').click();

    expect(exitItem).toHaveBeenCalled();

    exitItem.mockClear();
    expect(exitItem).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseButton')).toBeInTheDocument();
    screen.getByTestId('Case-CloseButton').click();

    expect(exitItem).toHaveBeenCalled();
  });
  test('Test no edit permissions', async () => {
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewCaseItem {...ownProps} canEdit={() => false} />
        </Provider>
      </StorelessThemeProvider>,
    );
    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
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
