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
import { render, screen } from '@testing-library/react';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import '@testing-library/jest-dom/extend-expect';
import each from 'jest-each';

import { Popover } from '../../design-system/popovers/Popover';
import { Pill } from '../../design-system/pills/Pill';

// jsdom does not implement ResizeObserver
global.ResizeObserver = class {
  observe = jest.fn();

  disconnect = jest.fn();
} as any;

const renderWithTheme = (element: React.ReactElement) =>
  render(<StorelessThemeProvider themeConf={{}}>{element}</StorelessThemeProvider>);

describe('Popover', () => {
  const anchorElement = document.createElement('div');
  document.body.appendChild(anchorElement);

  test('shows its title and content when open, and calls onClose when closed', () => {
    const onClose = jest.fn();
    renderWithTheme(
      <Popover open={true} anchorElement={anchorElement} title="A title" onClose={onClose}>
        Some content
      </Popover>,
    );

    expect(screen.getByText('A title')).toBeInTheDocument();
    expect(screen.getByText('Some content')).toBeInTheDocument();

    screen.getByTestId('Popover-CloseButton').click();
    expect(onClose).toHaveBeenCalled();
  });

  test('renders nothing when not open', () => {
    renderWithTheme(
      <Popover open={false} anchorElement={anchorElement} title="A title" onClose={jest.fn()}>
        Some content
      </Popover>,
    );

    expect(screen.queryByText('A title')).not.toBeInTheDocument();
  });

  each([
    { variant: undefined, background: 'rgb(255, 255, 255)' },
    { variant: 'guidance', background: 'rgb(255, 254, 239)' },
  ]).test('the $variant variant has a $background background', ({ variant, background }) => {
    renderWithTheme(
      <Popover open={true} anchorElement={anchorElement} title="A title" onClose={jest.fn()} variant={variant}>
        Some content
      </Popover>,
    );

    expect(screen.getByLabelText('A title')).toHaveStyle(`background-color: ${background}`);
  });
});

describe('Pill', () => {
  each([
    { variant: undefined, background: 'rgb(255, 255, 255)' },
    { variant: 'guidance', background: 'rgb(255, 254, 239)' },
  ]).test('the $variant variant has a $background background', ({ variant, background }) => {
    renderWithTheme(<Pill variant={variant}>A pill</Pill>);

    expect(screen.getByText('A pill')).toHaveStyle(`background-color: ${background}`);
  });
});
