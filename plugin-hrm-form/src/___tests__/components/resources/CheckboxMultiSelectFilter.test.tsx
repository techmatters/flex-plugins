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
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import '../../mockGetConfig';
import CheckboxMultiSelectFilter from '../../../components/resources/mappingComponents/CheckboxMultiSelectFilter';

const options = [{ value: 'Free' }, { value: 'Sliding Scale' }, { value: 'Membership Fee' }];

const renderFilter = (selectedValues: string[]) => {
  const onChange = jest.fn();
  render(
    <CheckboxMultiSelectFilter
      headerCode="Resources-Search-feeStructure"
      options={options}
      selectedValues={selectedValues}
      onChange={onChange}
    />,
  );
  return onChange;
};

describe('CheckboxMultiSelectFilter', () => {
  test('renders a checkbox per option, checked when selected', () => {
    renderFilter(['Sliding Scale']);

    expect(screen.getByLabelText('Free')).not.toBeChecked();
    expect(screen.getByLabelText('Sliding Scale')).toBeChecked();
    expect(screen.getByLabelText('Membership Fee')).not.toBeChecked();
  });

  test('each label has its full text as a tooltip, so labels cut at two lines can still be read', () => {
    renderFilter([]);

    options.forEach(({ value }) => expect(screen.getByTitle(value)).toHaveTextContent(value));
  });

  test('checking an option adds it to the selection', () => {
    const onChange = renderFilter(['Free']);

    fireEvent.click(screen.getByLabelText('Membership Fee'));

    expect(onChange).toHaveBeenCalledWith(['Free', 'Membership Fee']);
  });

  test('unchecking an option removes it from the selection', () => {
    const onChange = renderFilter(['Free', 'Sliding Scale']);

    fireEvent.click(screen.getByLabelText('Free'));

    expect(onChange).toHaveBeenCalledWith(['Sliding Scale']);
  });

  test('unchecking the last selected option clears the selection', () => {
    const onChange = renderFilter(['Free']);

    fireEvent.click(screen.getByLabelText('Free'));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
