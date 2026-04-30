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

import { isMobileDevice, updateViewport } from '..';

describe('isMobileDevice', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('returns true when matchMedia matches mobile query', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    });

    expect(isMobileDevice()).toBe(true);
  });

  it('returns false when matchMedia does not match mobile query', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: false }),
    });

    expect(isMobileDevice()).toBe(false);
  });

  it('returns false when matchMedia is not available', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });

    expect(isMobileDevice()).toBe(false);
  });
});

describe('updateViewport', () => {
  beforeEach(() => {
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.remove();
    }
  });

  it('creates a viewport meta tag when one does not exist', () => {
    updateViewport();

    const meta = document.querySelector('meta[name="viewport"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute('content')).toContain('width=device-width');
    expect(meta?.getAttribute('content')).toContain('initial-scale=1.0');
  });

  it('appends to an existing viewport meta tag', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width');
    document.head.appendChild(meta);

    updateViewport();

    const updatedMeta = document.querySelector('meta[name="viewport"]');
    expect(updatedMeta?.getAttribute('content')).toContain('width=device-width');
    expect(updatedMeta?.getAttribute('content')).toContain('initial-scale=1.0');
    expect(updatedMeta?.getAttribute('content')).toContain('maximum-scale=1');
    expect(updatedMeta?.getAttribute('content')).toContain('user-scalable=yes');
  });

  it('does not duplicate viewport content when called multiple times', () => {
    updateViewport();
    updateViewport();

    const meta = document.querySelector('meta[name="viewport"]');
    const content = meta?.getAttribute('content') ?? '';
    const occurrences = content.split('initial-scale=1.0').length - 1;
    expect(occurrences).toBe(1);
  });
});
