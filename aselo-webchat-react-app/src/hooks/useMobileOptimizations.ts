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

import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AppState } from '../store/definitions';
import { isMobileDevice, updateViewport } from '../mobile-optimization';

/**
 * Hook that applies mobile optimizations when enabled.
 *
 * Mobile optimizations are enabled by default and can be disabled via the
 * `enableMobileOptimizations: false` configuration option.
 *
 * When enabled on a mobile device:
 * - Updates the page viewport meta tag for proper mobile rendering
 * - Returns `isMobileFullscreen: true` so components can apply full-screen styles
 */
export const useMobileOptimizations = () => {
  const enableMobileOptimizations = useSelector((state: AppState) => state.config.enableMobileOptimizations);

  // Mobile optimizations are enabled by default (when undefined) and only disabled when explicitly set to false
  const mobileOptimizationsEnabled = enableMobileOptimizations !== false;

  const isMobile = useMemo(() => isMobileDevice(), []);

  useEffect(() => {
    if (mobileOptimizationsEnabled) {
      updateViewport();
    }
  }, [mobileOptimizationsEnabled]);

  return {
    isMobileFullscreen: mobileOptimizationsEnabled && isMobile,
  };
};
