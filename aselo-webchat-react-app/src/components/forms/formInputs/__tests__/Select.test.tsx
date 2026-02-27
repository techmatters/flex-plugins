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

import Select from '../Select';
import { PreEngagementDataItem } from '../../../../store/definitions';

jest.mock('../../../../localization/LocalizedTemplate', () => ({
  __esModule: true,
  default: ({ code }: { code: string }) => <>{code}</>,
}));

describe('Select component', () => {
  const definition = {
    name: 'category',
    type: FormInputType.Select as FormInputType.Select,
    label: 'Category',
    options: [
      { value: '', label: 'Select...' },
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2' },
    ],
  };

  const noError: PreEngagementDataItem = { value: '', error: null, dirty: false };
  const withError: PreEngagementDataItem = { value: '', error: 'Please select a category', dirty: true };

  const getItem = (item: PreEngagementDataItem) => (_name: string) => item;
  const handleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the correct label', () => {
    const { getByText } = render(
      <Select definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    expect(getByText('Category')).toBeInTheDocument();
  });

  it('does not render an error message when error is null', () => {
    const { queryByText } = render(
      <Select definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    expect(queryByText('Please select a category')).not.toBeInTheDocument();
  });

  it('renders an error message when error is not null', () => {
    const { getByText } = render(
      <Select definition={definition} handleChange={handleChange} getItem={getItem(withError)} />,
    );
    expect(getByText('Please select a category')).toBeInTheDocument();
  });

  it('calls handleChange on blur with name and selected value', () => {
    const { getByRole } = render(
      <Select definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    const select = getByRole('combobox');
    fireEvent.blur(select, { target: { value: 'opt1' } });
    expect(handleChange).toHaveBeenCalledWith({ name: 'category', value: 'opt1' });
  });
});
