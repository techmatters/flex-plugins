import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider, ThemeConfigProps } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace, RootState } from '../../../states';
import AddEditCaseItem, { AddEditCaseItemProps } from '../../../components/case/AddEditCaseItem';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { CustomITask } from '../../../types/types';
import { AppRoutes, CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';
import { householdSectionApi } from '../../../states/case/sections/household';
import { changeRoute } from '../../../states/routing/actions';

let mockV1;

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

jest.mock('../../../services/CaseService');

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);
const baselineDate = new Date(1593469560208);

const addingNewHouseholdCaseState: RootState[typeof namespace][typeof connectedCaseBase] = {
  tasks: {
    task1: {
      caseWorkingCopy: {
        sections: {
          households: {
            new: {
              createdAt: baselineDate.toISOString(),
              twilioWorkerId: 'worker1',
              id: '1',
              form: {
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
            },
            existing: {},
          },
        },
      },
      connectedCase: {
        helpline: '',
        accountSid: 'ACxxx',
        childName: '',
        connectedContacts: [],
        id: 1,
        createdAt: new Date(1593469560208).toISOString(),
        updatedAt: new Date(1593469560208).toISOString(),
        twilioWorkerId: 'worker1',
        status: 'open',
        info: null,
        categories: {},
      },
      prevStatus: '',
    },
  },
};

const hrmState: Partial<RootState[typeof namespace]> = {
  [configurationBase]: {
    language: '',
    currentDefinitionVersion: mockV1,
    definitionVersions: {},
    workerInfo: { chatChannelCapacity: 100 },
    counselors: {
      list: [],
      hash: { worker1: 'worker1 name' },
    },
  },
  [contactFormsBase]: {
    editingContact: false,
    isCallTypeCaller: false,
    contactDetails: { contactSearch: { detailsExpanded: {} }, caseDetails: { detailsExpanded: {} } },
    existingContacts: {},
    tasks: {
      task1: {
        childInformation: {
          firstName: 'first',
          lastName: 'last',
        },
        helpline: '',
        callType: 'Child calling about self',
        callerInformation: {},
        categories: [],
        caseInformation: {},
        metadata: { startMillis: 0, endMillis: 0, categories: { gridView: false, expanded: {} }, recreated: false },
        isCallTypeCaller: false,
        contactlessTask: {},
        csamReports: [],
      },
    },
  },
  [connectedCaseBase]: addingNewHouseholdCaseState,
  routing: {
    tasks: {
      task1: {
        route: 'new-case',
      },
    },
    isAddingOfflineContact: false,
  },
};

const state1 = {
  [namespace]: hrmState,
};

const store1 = mockStore(state1);
store1.dispatch = jest.fn();

const state2 = {
  ...state1,
  [namespace]: {
    ...state1[namespace],
    [connectedCaseBase]: addingNewHouseholdCaseState,
    routing: {
      route: 'new-case',
      tasks: {
        task1: {
          route: 'new-case',
        },
      },
    },
  },
};
const store2 = mockStore(state2);
store2.dispatch = jest.fn();

const routing3: RootState[typeof namespace]['routing'] = {
  tasks: {
    task1: {
      route: 'new-case',
    },
  },
  isAddingOfflineContact: true,
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
  const exitRoute: AppRoutes = { route: 'tabbed-forms', subroute: 'caseInformation' };
  let ownProps: AddEditCaseItemProps;
  beforeEach(
    () =>
      (ownProps = {
        task: { taskSid: 'task1' } as CustomITask,
        counselor: 'Someone',
        exitRoute,
        sectionApi: householdSectionApi,
        definitionVersion: mockV1,
        routing: {
          route: 'tabbed-forms',
          subroute: NewCaseSubroutes.Household,
          action: CaseItemAction.Add,
        },
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

    expect(store2.dispatch).not.toHaveBeenCalledWith(changeRoute(exitRoute, 'task1'));

    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
    screen.getByTestId('Case-CloseCross').click();

    expect(store2.dispatch).toHaveBeenCalledWith(changeRoute(exitRoute, 'task1'));

    store2.dispatch.mockClear();

    expect(screen.getByTestId('Case-CloseButton')).toBeInTheDocument();
    screen.getByTestId('Case-CloseButton').click();

    expect(store2.dispatch).toHaveBeenCalledWith(changeRoute(exitRoute, 'task1'));
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
