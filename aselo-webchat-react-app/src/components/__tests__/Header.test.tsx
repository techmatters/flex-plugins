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

import { resetMockRedux } from '../../__mocks__/redux/mockRedux';
import { Header } from '../Header';
import * as useMobileOptimizationsModule from '../../hooks/useMobileOptimizations';
import * as genericActions from '../../store/actions/genericActions';

jest.mock('../../hooks/useMobileOptimizations', () => ({
  useMobileOptimizations: jest.fn(() => ({ isMobileFullscreen: false })),
}));

describe('Header', () => {
  beforeEach(() => {
    resetMockRedux();
    (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({ isMobileFullscreen: false });
  });

  it('renders the header', () => {
    const { container } = render(<Header />);

    expect(container).toBeInTheDocument();
  });

  it('renders header with custom title', () => {
    const customTitle = 'Chat Title';
    const { queryByText } = render(<Header customTitle={customTitle} />);

    expect(queryByText(customTitle)).toBeInTheDocument();
  });

  it('renders header with default text when no custom title provided', () => {
    const { queryByText } = render(<Header />);

    expect(queryByText('Header-TitleBar-Title')).toBeInTheDocument();
  });

  describe('mobile minimize button', () => {
    it('does not render minimize button when not in mobile full-screen mode', () => {
      (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({ isMobileFullscreen: false });

      const { queryByTestId } = render(<Header />);

      expect(queryByTestId('header-minimize-button')).not.toBeInTheDocument();
    });

    it('renders minimize button when in mobile full-screen mode', () => {
      (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({ isMobileFullscreen: true });

      const { queryByTestId } = render(<Header />);

      expect(queryByTestId('header-minimize-button')).toBeInTheDocument();
    });

    it('renders minimize chat icon title when in mobile full-screen mode', () => {
      (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({ isMobileFullscreen: true });

      const { queryByTitle } = render(<Header />);

      expect(queryByTitle('Minimize chat')).toBeInTheDocument();
    });

    it('dispatches changeExpandedStatus with expanded false when minimize button is clicked', () => {
      (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({ isMobileFullscreen: true });
      const { mockDispatch } = resetMockRedux();
      const changeExpandedStatusSpy = jest.spyOn(genericActions, 'changeExpandedStatus');

      const { getByTestId } = render(<Header />);
      fireEvent.click(getByTestId('header-minimize-button'));

      expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
      expect(mockDispatch).toHaveBeenCalledWith(changeExpandedStatusSpy.mock.results[0].value);
    });
  });
});
