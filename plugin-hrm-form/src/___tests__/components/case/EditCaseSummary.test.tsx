import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import EditCaseSummary, { EditCaseSummaryProps } from '../../../components/case/EditCaseSummary';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { StandaloneITask } from '../../../types/types';
import { AppRoutes } from '../../../states/routing/types';
import { changeRoute } from '../../../states/routing/actions';

let mockV1: DefinitionVersion;

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const info = {
  createdAt: '22-08-2022',
  updatedAt: '22-08-2022',
  updatedBy: 'worker1',
  form: {
    caseStatus: 'open',
    date: '22-08-2022',
    inImminentPhysicalDanger: false,
    caseSummary: 'This is a summary',
  },
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
          caseWorkingCopy: { sections: {} },
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: {},
          },
          availableStatusTransitions: [{}],
        },
      },
    },
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
const store = mockStore(state);

const themeConf = {};

const task = {
  taskSid: 'task1',
};

describe('Test EditCaseSummary', () => {
  let ownProps: EditCaseSummaryProps;
  const exitRoute: AppRoutes = { route: 'new-case' };

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(() => {
    ownProps = {
      task: task as StandaloneITask,
      exitRoute,
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

    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
    screen.getByTestId('Case-CloseCross').click();
    expect(store.dispatch).not.toHaveBeenCalledWith(changeRoute(exitRoute, 'task1'));

    store.dispatch.mockClear();

    expect(screen.getByTestId('Case-CloseButton')).toBeInTheDocument();
    screen.getByTestId('Case-CloseButton').click();
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
