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

/**
 * The board's side panel can be made wider, for long JSON and scripts: drag its left edge (or
 * use the arrow keys on it), double-click it to go back. Never narrower than it starts, never
 * wider than most of the window; the width is remembered in this browser.
 */
import { useRef, useState } from 'react';

export const SIDEBAR_MIN_WIDTH = 300;
const STORAGE_KEY = 'flow-sidebar-width';
const KEY_STEP = 20;

const maxWidth = () => Math.max(SIDEBAR_MIN_WIDTH, Math.round(window.innerWidth * 0.7));
const clamp = (width: number) => Math.min(Math.max(Math.round(width), SIDEBAR_MIN_WIDTH), maxWidth());

export const useSidebarWidth = () => {
  const [width, setWidth] = useState(() => {
    try {
      const kept = Number(window.localStorage.getItem(STORAGE_KEY));
      return Number.isFinite(kept) && kept > 0 ? clamp(kept) : SIDEBAR_MIN_WIDTH;
    } catch {
      // No storage (private window): the default
      return SIDEBAR_MIN_WIDTH;
    }
  });
  const keep = (next: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Not kept: fine
    }
  };
  return { width, setWidth: (next: number) => setWidth(clamp(next)), keep };
};

export const SidebarResizer = ({
  width,
  onResize,
  onDone,
}: {
  width: number;
  onResize: (width: number) => void;
  // When a resize ends, with the final width (to remember it)
  onDone: (width: number) => void;
}) => {
  const latest = useRef(width);
  latest.current = width;
  const resizeBy = (change: number) => {
    const next = clamp(width + change);
    onResize(next);
    onDone(next);
  };
  return (
    <div
      className="flow-sidebar-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the side panel"
      aria-valuemin={SIDEBAR_MIN_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to make the panel wider; double-click to go back"
      onPointerDown={e => {
        if (e.button !== 0) return;
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = width;
        document.body.classList.add('flow-resizing');
        // The panel is on the right: dragging left makes it wider
        const move = (event: PointerEvent) => {
          if (Number.isFinite(event.clientX)) onResize(clamp(startWidth + startX - event.clientX));
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          document.body.classList.remove('flow-resizing');
          onDone(latest.current);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      }}
      onDoubleClick={() => resizeBy(SIDEBAR_MIN_WIDTH - width)}
      onKeyDown={e => {
        if (e.key === 'ArrowLeft') resizeBy(KEY_STEP);
        else if (e.key === 'ArrowRight') resizeBy(-KEY_STEP);
        else return;
        e.preventDefault();
      }}
    />
  );
};
