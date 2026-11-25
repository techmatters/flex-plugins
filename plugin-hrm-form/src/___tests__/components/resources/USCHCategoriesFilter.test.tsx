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
import CategoriesFilter from '../../../components/resources/mappingComponents/uschMappings/CategoriesFilter';

const options = [
  { value: 'Food', label: 'Food' },
  { value: 'Food Banks', label: 'Food Banks' },
  { value: 'Housing', label: 'Housing' },
];

const renderFilter = (selectedValues: string[] = []) => {
  const onChange = jest.fn();
  render(<CategoriesFilter options={options} selectedValues={selectedValues} onChange={onChange} />);
  return onChange;
};

const toggleButton = () => screen.getByRole('button', { name: /Resources-Search-categories/ });
const searchBox = () => screen.getByRole('textbox');
const searchFor = (searchTerm: string) => {
  fireEvent.click(toggleButton());
  fireEvent.change(searchBox(), { target: { value: searchTerm } });
};

describe('USCH CategoriesFilter', () => {
  test('starts collapsed', () => {
    renderFilter();

    expect(toggleButton()).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking the header expands it, clicking again collapses it', () => {
    renderFilter();

    fireEvent.click(toggleButton());
    expect(toggleButton()).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggleButton());
    expect(toggleButton()).toHaveAttribute('aria-expanded', 'false');
  });

  test('shows every category when there is no search term', () => {
    renderFilter();

    options.forEach(({ label }) => expect(screen.getByLabelText(label)).toBeInTheDocument());
  });

  test('typing a search term only shows the categories that contain it, ignoring case', () => {
    renderFilter();

    searchFor('fOoD');

    expect(screen.getByLabelText('Food')).toBeInTheDocument();
    expect(screen.getByLabelText('Food Banks')).toBeInTheDocument();
    expect(screen.queryByLabelText('Housing')).not.toBeInTheDocument();
  });

  test('selecting a visible category keeps selections that are hidden by the search term', () => {
    const onChange = renderFilter(['Housing']);

    searchFor('food');
    fireEvent.click(screen.getByLabelText('Food'));

    expect(onChange).toHaveBeenCalledWith(['Housing', 'Food']);
  });
});
