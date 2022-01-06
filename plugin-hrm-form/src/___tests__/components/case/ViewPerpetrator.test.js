import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import ViewPerpetrator from '../../../components/case/ViewPerpetrator';
import HrmTheme from '../../../styles/HrmTheme';
import { DefinitionVersionId, loadDefinition } from '../../../formDefinitions';
import { getDefinitionVersions } from '../../../HrmFormPlugin';

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const perpetrator = {
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

const perpetratorEntry = { perpetrator, createdAt: '2020-06-29T22:26:00.208Z', twilioWorkerId: 'worker1' };

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
          temporaryCaseInfo: { screen: 'view-perpetrator', info: perpetratorEntry },
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: null,
          },
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

const task = {
  taskSid: 'task1',
};

describe('Test ViewPerpetrator', () => {
  let mockV1;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  test('Test close functionality', async () => {
    const onClickClose = jest.fn();

    const ownProps = {
      onClickClose,
      task,
      definitionVersion: mockV1,
    };

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewPerpetrator {...ownProps} />
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
      onClickClose,
      task,
      definitionVersion: mockV1,
    };

    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <ViewPerpetrator {...ownProps} />
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
