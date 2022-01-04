import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import HrmTheme from '../../../styles/HrmTheme';
import AddNote from '../../../components/case/AddNote';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import { DefinitionVersionId, loadDefinition } from '../../../formDefinitions';
import { getDefinitionVersions } from '../../../HrmFormPlugin';

jest.mock('../../../services/CaseService');

const flushPromises = () => new Promise(setImmediate);

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

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
          temporaryCaseInfo: { screen: 'add-note', info: 'Mocked temp value' },
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

const themeConf = {
  colorTheme: HrmTheme,
};
describe('Add Note', () => {
  let mockV1;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  test('Test close functionality', async () => {
    const onClickClose = jest.fn();

    const ownProps = {
      counselor: 'Someone',
      onClickClose,
      task: {
        taskSid: 'task1',
      },
      definitionVersion: mockV1,
    };

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <AddNote {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(onClickClose).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
    screen.getByTestId('Case-CloseCross').click();

    expect(onClickClose).toHaveBeenCalled();

    onClickClose.mockClear();

    expect(onClickClose).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseButton')).toBeInTheDocument();
    screen.getByTestId('Case-CloseButton').click();

    expect(onClickClose).toHaveBeenCalled();
  });

  test('a11y', async () => {
    const onClickClose = jest.fn();

    const ownProps = {
      counselor: 'Someone',
      onClickClose,
      task: {
        taskSid: 'task1',
      },
      definitionVersion: mockV1,
    };

    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <AddNote {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    const rules = {
      region: { enabled: false },
    };

    const axe = configureAxe({ rules });
    const results = await axe(wrapper.getDOMNode());

    expect(results).toHaveNoViolations();
  });
});
