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
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import AddEditCaseSummary, { AddEditCaseSummaryProps } from '../../../components/case/AddEditCaseSummary';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { updateCaseSectionListByIndex } from '../../../states/case/types';
import { StandaloneITask } from '../../../types/types';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';

let mockV1;

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

jest.mock('../../../services/CaseService');

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

const state1 = {
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
          temporaryCaseInfo: { screen: 'caseSummary', info: {} },
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
const store1 = mockStore(state1);
store1.dispatch = jest.fn();

const state2 = {
  ...state1,
  [namespace]: {
    ...state1[namespace],
    [connectedCaseBase]: {
      tasks: {
        task1: {
          attributes: {
            isContactlessTask: false,
          },
          taskSid: 'task1',
          temporaryCaseInfo: { screen: 'caseSummary', info: {} },
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
const store2 = mockStore(state2);
store2.dispatch = jest.fn();

const state3 = {
  [namespace]: {
    ...state1[namespace],
    [connectedCaseBase]: {
      tasks: {
        task1: {
          temporaryCaseInfo: null,
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
const store3 = mockStore(state3);
store3.dispatch = jest.fn();

const themeConf: ThemeConfigProps = {};

describe('Test EditCaseSummary', () => {
  const exitItem = jest.fn();
  let ownProps: AddEditCaseSummaryProps;
  beforeEach(
    () =>
      (ownProps = {
        task: state2[namespace][connectedCaseBase].tasks.task1 as StandaloneITask,
        counselor: 'Someone',
        exitItem,
        layout: mockV1.layoutVersion.case.caseSummaries,
        applyTemporaryInfoToCase: updateCaseSectionListByIndex('caseSummaries', 'caseSummary'),
        formDefinition: mockV1.caseForms.CaseSummaryForm,
        definitionVersion: mockV1,
        itemType: 'CaseSummary',
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
        <Provider store={store2}>
          <AddEditCaseSummary {...ownProps} />
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
        <Provider store={store2}>
          <AddEditCaseSummary {...ownProps} />
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
