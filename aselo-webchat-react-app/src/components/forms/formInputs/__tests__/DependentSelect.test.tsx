/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormInputType } from 'hrm-form-definitions';

import DependentSelect from '../DependentSelect';
import { PreEngagementDataItem } from '../../../../store/definitions';

jest.mock('../../../../localization/LocalizedTemplate', () => ({
  __esModule: true,
  default: ({ code }: { code: string }) => <>{code}</>,
}));

describe('DependentSelect component', () => {
  const definition = {
    name: 'state',
    type: FormInputType.DependentSelect as FormInputType.DependentSelect,
    label: 'State',
    dependsOn: 'country',
    options: {
      US: [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
      ],
      UK: [{ value: 'ENG', label: 'England' }],
    },
  };

  const noError: PreEngagementDataItem = { value: 'CA', error: null, dirty: false };
  const withError: PreEngagementDataItem = { value: '', error: 'Please select a state', dirty: true };

  const makeGetItem =
    (stateItem: PreEngagementDataItem, countryValue: string) =>
    (name: string): PreEngagementDataItem => {
      if (name === 'country') return { value: countryValue, error: null, dirty: false };
      return stateItem;
    };

  const handleChange = jest.fn();
  const setItemValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the correct label', () => {
    const { getByText } = render(
      <DependentSelect
        definition={definition}
        handleChange={handleChange}
        getItem={makeGetItem(noError, 'US')}
        setItemValue={setItemValue}
      />,
    );
    expect(getByText('State')).toBeInTheDocument();
  });

  it('does not render an error message when error is null', () => {
    const { queryByText } = render(
      <DependentSelect
        definition={definition}
        handleChange={handleChange}
        getItem={makeGetItem(noError, 'US')}
        setItemValue={setItemValue}
      />,
    );
    expect(queryByText('Please select a state')).not.toBeInTheDocument();
  });

  it('renders an error message when error is not null', () => {
    const { getByText } = render(
      <DependentSelect
        definition={definition}
        handleChange={handleChange}
        getItem={makeGetItem(withError, 'US')}
        setItemValue={setItemValue}
      />,
    );
    expect(getByText('Please select a state')).toBeInTheDocument();
  });

  it('calls handleChange on blur with name and selected value', () => {
    const { getByRole } = render(
      <DependentSelect
        definition={definition}
        handleChange={handleChange}
        getItem={makeGetItem(noError, 'US')}
        setItemValue={setItemValue}
      />,
    );
    const select = getByRole('combobox');
    fireEvent.blur(select, { target: { value: 'NY' } });
    expect(handleChange).toHaveBeenCalledWith({ name: 'state', value: 'NY' });
  });

  it('calls setItemValue to blank the dependent select when the dependee value changes', () => {
    const getItemWithUS = makeGetItem({ value: 'CA', error: null, dirty: false }, 'US');
    const getItemWithUK = makeGetItem({ value: 'CA', error: null, dirty: false }, 'UK');

    const { rerender } = render(
      <DependentSelect
        definition={definition}
        handleChange={handleChange}
        getItem={getItemWithUS}
        setItemValue={setItemValue}
      />,
    );

    rerender(
      <DependentSelect
        definition={definition}
        handleChange={handleChange}
        getItem={getItemWithUK}
        setItemValue={setItemValue}
      />,
    );

    expect(setItemValue).toHaveBeenCalledWith({ name: 'state', value: 'ENG' });
  });
});
