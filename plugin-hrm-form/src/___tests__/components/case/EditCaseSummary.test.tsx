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
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';

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
          temporaryCaseInfo: { screen: 'caseSummary', info, action: CaseItemAction.Edit },
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: null,
          },
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
store.dispatch = jest.fn();

const themeConf = {};

const task = {
  taskSid: 'task1',
};

describe('Test EditCaseSummary', () => {
  const exitItem = jest.fn();
  let ownProps: EditCaseSummaryProps;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(
    () =>
      (ownProps = {
        task: task as StandaloneITask,
        counselor: 'Someone',
        exitItem,
        definitionVersion: mockV1,
        routing: {
          route: 'tabbed-forms',
          subroute: NewCaseSubroutes.CaseSummary,
          action: CaseItemAction.Edit,
        },
      }),
  );
  test('Test close functionality', async () => {
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <EditCaseSummary {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(exitItem).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
    screen.getByTestId('Case-CloseCross').click();
    expect(exitItem).toHaveBeenCalled();

    exitItem.mockClear();

    expect(exitItem).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseButton')).toBeInTheDocument();
    screen.getByTestId('Case-CloseButton').click();
    expect(exitItem).toHaveBeenCalled();
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
