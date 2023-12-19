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
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider, withTheme } from '@twilio/flex-ui';

import TransferButton from '../../../components/transfer/TransferButton';
import { transferStatuses } from '../../../states/DomainConstants';

jest.mock('../../../transfer/transferTaskState', () => ({
  canTransferConference: () => true,
}));

expect.extend(toHaveNoViolations);

const task = {
  attributes: {
    transferMeta: { transferStatus: transferStatuses.accepted },
  },
};

const Wrapped = withTheme(props => <TransferButton task={task} {...props} />);

test('a11y', async () => {
  const wrapper = mount(
    <StorelessThemeProvider themeConf={{}}>
      <Wrapped />
    </StorelessThemeProvider>,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
