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
import { useSelector } from 'react-redux';

import { EntryPoint } from '../EntryPoint';
import * as genericActions from '../../store/actions/genericActions';
import * as useMobileOptimizationsModule from '../../hooks/useMobileOptimizations';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../hooks/useMobileOptimizations', () => ({
  useMobileOptimizations: jest.fn(() => ({ isMobileFullscreen: false })),
}));

const mockState = (expanded: boolean) => ({ session: { expanded }, config: { translations: {} } });

describe('Entry Point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the entry point', () => {
    const { container } = render(<EntryPoint />);

    expect(container).toBeInTheDocument();
  });

  it('renders the minimize chat button when expanded', () => {
    (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockState(true)));

    const { queryByTitle } = render(<EntryPoint />);

    expect(queryByTitle('Minimize chat')).toBeInTheDocument();
  });

  it('renders the open chat button when un-expanded', () => {
    (useSelector as jest.Mock).mockImplementation((callback: any) =>
      callback({ session: { expanded: false }, config: { translations: {} } }),
    );

    const { queryByTitle } = render(<EntryPoint />);

    expect(queryByTitle('Open chat')).toBeInTheDocument();
  });

  it('changes expanded status to false when clicked and already true', () => {
    (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockState(true)));
    const changeExpandedStatusSpy = jest.spyOn(genericActions, 'changeExpandedStatus');

    const { container } = render(<EntryPoint />);
    const button = container.firstChild as Element;
    fireEvent.click(button);

    expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
  });

  it('changes expanded status to true when clicked and already false', () => {
    (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockState(false)));
    const changeExpandedStatusSpy = jest.spyOn(genericActions, 'changeExpandedStatus');

    const { container } = render(<EntryPoint />);
    const button = container.firstChild as Element;
    fireEvent.click(button);

    expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: true });
  });

  describe('mobile optimizations', () => {
    it('does not render button when on mobile (isMobileFullscreen) and expanded', () => {
      (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({ isMobileFullscreen: true });
      (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockState(true)));

      const { queryByTestId } = render(<EntryPoint />);

      expect(queryByTestId('entry-point-button')).not.toBeInTheDocument();
    });

    it('renders button when on mobile (isMobileFullscreen) but not expanded', () => {
      (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({ isMobileFullscreen: true });
      (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockState(false)));

      const { queryByTestId } = render(<EntryPoint />);

      expect(queryByTestId('entry-point-button')).toBeInTheDocument();
    });

    it('renders button when not mobile (isMobileFullscreen false) even when expanded', () => {
      (useMobileOptimizationsModule.useMobileOptimizations as jest.Mock).mockReturnValue({
        isMobileFullscreen: false,
      });
      (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockState(true)));

      const { queryByTestId } = render(<EntryPoint />);

      expect(queryByTestId('entry-point-button')).toBeInTheDocument();
    });
  });
});
