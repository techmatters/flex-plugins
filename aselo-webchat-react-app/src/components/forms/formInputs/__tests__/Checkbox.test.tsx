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

import Checkbox from '../Checkbox';
import { PreEngagementDataItem } from '../../../../store/definitions';

jest.mock('../../../../localization/LocalizedTemplate', () => ({
  __esModule: true,
  default: ({ code }: { code: string }) => <>{code}</>,
}));

describe('Checkbox component', () => {
  const definition = {
    name: 'terms',
    type: FormInputType.Checkbox as FormInputType.Checkbox,
    label: 'Accept terms',
  };

  const noError: PreEngagementDataItem = { value: false, error: null, dirty: false };
  const withError: PreEngagementDataItem = { value: false, error: 'You must accept the terms', dirty: true };

  const getItem = (item: PreEngagementDataItem) => (_name: string) => item;
  const handleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the correct label', () => {
    const { getByText } = render(
      <Checkbox definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    expect(getByText('Accept terms')).toBeInTheDocument();
  });

  it('does not render an error message when error is null', () => {
    const { queryByText } = render(
      <Checkbox definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    expect(queryByText('You must accept the terms')).not.toBeInTheDocument();
  });

  it('renders an error message when error is not null', () => {
    const { getByText } = render(
      <Checkbox definition={definition} handleChange={handleChange} getItem={getItem(withError)} />,
    );
    expect(getByText('You must accept the terms')).toBeInTheDocument();
  });

  it('calls handleChange on blur with name and checked value', () => {
    const { getByRole } = render(
      <Checkbox definition={definition} handleChange={handleChange} getItem={getItem(noError)} />,
    );
    const checkbox = getByRole('checkbox');
    fireEvent.blur(checkbox, { target: { checked: true } });
    expect(handleChange).toHaveBeenCalledWith({ name: 'terms', value: true });
  });
});
