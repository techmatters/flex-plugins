/** @jest-environment ./jest/jsdomEnvironment.cjs */

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

import { afterEach, describe, expect, test } from '@jest/globals';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { SIDEBAR_MIN_WIDTH, SidebarResizer, useSidebarWidth } from './SidebarResizer';

// jsdom has no PointerEvent: a mouse event carries the position the same way
if (!window.PointerEvent) (window as { PointerEvent: unknown }).PointerEvent = window.MouseEvent;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

const Panel = () => {
  const sidebar = useSidebarWidth();
  return (
    <aside aria-label="Side panel" style={{ width: sidebar.width }}>
      <SidebarResizer width={sidebar.width} onResize={sidebar.setWidth} onDone={sidebar.keep} />
    </aside>
  );
};

const handle = () => screen.getByRole('separator', { name: 'Resize the side panel' });
const width = () => screen.getByRole('complementary', { name: 'Side panel' }).style.width;

describe('side panel width', () => {
  test('dragged wider, never narrower than it starts, remembered, and reset by a double-click', () => {
    window.innerWidth = 1600;
    render(<Panel />);
    expect(width()).toBe(`${SIDEBAR_MIN_WIDTH}px`);

    // Dragging left makes it wider
    fireEvent.pointerDown(handle(), { button: 0, clientX: 1300 });
    fireEvent.pointerMove(window, { clientX: 1100 });
    fireEvent.pointerUp(window);
    expect(width()).toBe('500px');
    expect(window.localStorage.getItem('flow-sidebar-width')).toBe('500');

    // Not narrower than the minimum, nor wider than most of the window
    fireEvent.keyDown(handle(), { key: 'ArrowRight' });
    expect(width()).toBe('480px');
    fireEvent.pointerDown(handle(), { button: 0, clientX: 1100 });
    fireEvent.pointerMove(window, { clientX: 1500 });
    fireEvent.pointerUp(window);
    expect(width()).toBe(`${SIDEBAR_MIN_WIDTH}px`);
    fireEvent.pointerDown(handle(), { button: 0, clientX: 1300 });
    fireEvent.pointerMove(window, { clientX: 0 });
    fireEvent.pointerUp(window);
    expect(width()).toBe('1120px');

    // Opening the board again keeps it; a double-click goes back
    cleanup();
    render(<Panel />);
    expect(width()).toBe('1120px');
    fireEvent.doubleClick(handle());
    expect(width()).toBe(`${SIDEBAR_MIN_WIDTH}px`);
  });
});
