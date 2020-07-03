import React from 'react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider, withTheme } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import HrmTheme from '../../../styles/HrmTheme';
import AcceptTransferButton from '../../../components/transfer/AcceptTransferButton';
import { transferStatuses } from '../../../states/DomainConstants';

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);
const store = mockStore({});

const task = {
  attributes: {
    transferMeta: { transferStatus: transferStatuses.accepted },
  },
};

const Wrapped = withTheme(props => <AcceptTransferButton task={task} {...props} />);

test('a11y', async () => {
  const themeConf = {
    colorTheme: HrmTheme,
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <Wrapped />
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
