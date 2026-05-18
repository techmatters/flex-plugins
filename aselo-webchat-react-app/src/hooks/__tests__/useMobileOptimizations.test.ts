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

import { renderHook } from '@testing-library/react-hooks';
import { useSelector } from 'react-redux';

import { useMobileOptimizations } from '../useMobileOptimizations';
import * as mobileOptimization from '../../mobile-optimization';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../mobile-optimization', () => ({
  updateViewport: jest.fn(),
  isMobileDevice: jest.fn(),
}));

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('useMobileOptimizations', () => {
  const mockUpdateViewport = mobileOptimization.updateViewport as jest.Mock;
  const mockIsMobileDevice = mobileOptimization.isMobileDevice as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls updateViewport when enableMobileOptimizations is undefined (enabled by default)', () => {
    mockUseSelector.mockReturnValue(undefined);
    mockIsMobileDevice.mockReturnValue(false);

    renderHook(() => useMobileOptimizations());

    expect(mockUpdateViewport).toHaveBeenCalledTimes(1);
  });

  it('calls updateViewport when enableMobileOptimizations is true', () => {
    mockUseSelector.mockReturnValue(true);
    mockIsMobileDevice.mockReturnValue(false);

    renderHook(() => useMobileOptimizations());

    expect(mockUpdateViewport).toHaveBeenCalledTimes(1);
  });

  it('does not call updateViewport when enableMobileOptimizations is false', () => {
    mockUseSelector.mockReturnValue(false);
    mockIsMobileDevice.mockReturnValue(true);

    renderHook(() => useMobileOptimizations());

    expect(mockUpdateViewport).not.toHaveBeenCalled();
  });

  it('returns isMobileFullscreen true when enabled and on mobile device', () => {
    mockUseSelector.mockReturnValue(true);
    mockIsMobileDevice.mockReturnValue(true);

    const { result } = renderHook(() => useMobileOptimizations());

    expect(result.current.isMobileFullscreen).toBe(true);
  });

  it('returns isMobileFullscreen false when enabled but not on mobile device', () => {
    mockUseSelector.mockReturnValue(true);
    mockIsMobileDevice.mockReturnValue(false);

    const { result } = renderHook(() => useMobileOptimizations());

    expect(result.current.isMobileFullscreen).toBe(false);
  });

  it('returns isMobileFullscreen false when disabled even on mobile device', () => {
    mockUseSelector.mockReturnValue(false);
    mockIsMobileDevice.mockReturnValue(true);

    const { result } = renderHook(() => useMobileOptimizations());

    expect(result.current.isMobileFullscreen).toBe(false);
  });

  it('returns isMobileFullscreen true when enableMobileOptimizations is undefined and on mobile device', () => {
    mockUseSelector.mockReturnValue(undefined);
    mockIsMobileDevice.mockReturnValue(true);

    const { result } = renderHook(() => useMobileOptimizations());

    expect(result.current.isMobileFullscreen).toBe(true);
  });
});
