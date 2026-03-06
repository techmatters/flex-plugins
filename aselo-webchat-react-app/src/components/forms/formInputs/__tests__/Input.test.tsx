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

import InputText from '../Input';
import { PreEngagementDataItem } from '../../../../store/definitions';

jest.mock('../../../../localization/LocalizedTemplate', () => ({
  __esModule: true,
  default: ({ code }: { code: string }) => <>{code}</>,
}));

describe('Input component', () => {
  const definition = {
    name: 'friendlyName',
    type: FormInputType.Input as FormInputType.Input | FormInputType.Email,
    label: 'Full Name',
    placeholder: 'Enter your name',
  };

  const noError: PreEngagementDataItem = { value: '', error: null, dirty: false };
  const withError: PreEngagementDataItem = { value: '', error: 'This field is required', dirty: true };

  const getItem = (item: PreEngagementDataItem) => (_name: string) => item;
  const handleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the correct label', () => {
    const { getByText } = render(
      <InputText definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    expect(getByText('Full Name')).toBeInTheDocument();
  });

  it('does not render an error message when error is null', () => {
    const { queryByText } = render(
      <InputText definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    expect(queryByText('This field is required')).not.toBeInTheDocument();
  });

  it('renders an error message when error is not null', () => {
    const { getByText } = render(
      <InputText definition={definition} handleChange={handleChange} getItem={getItem(withError)} />,
    );
    expect(getByText('This field is required')).toBeInTheDocument();
  });

  it('calls handleChange on blur with name and value', () => {
    const { getByPlaceholderText } = render(
      <InputText definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    const input = getByPlaceholderText('Enter your name');
    fireEvent.blur(input, { target: { value: 'John' } });
    expect(handleChange).toHaveBeenCalledWith({ name: 'friendlyName', value: 'John' });
  });
});
