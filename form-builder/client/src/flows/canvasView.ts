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
 * What the board's panels do with the canvas's view, which React Flow keeps itself (where things
 * are on screen, the zoom): showing a node, focusing a frame, removing what's selected (React Flow
 * also removes what's inside frames and the connections left loose, through its changes).
 */
import { useReactFlow } from '@xyflow/react';
import { useAppDispatch, useAppSelector } from '../app/store';
import type { CanvasNode, ConnectionEdge } from './canvasModel';
import { nodeSelected, selectLocked } from './boardSlice';

export const useCanvasView = () => {
  const flow = useReactFlow<CanvasNode, ConnectionEdge>();
  const dispatch = useAppDispatch();
  const locked = useAppSelector(selectLocked);

  // Where an object is on the canvas, from React Flow's own measurements
  const rectOf = (id: string) => {
    const internal = flow.getInternalNode(id);
    if (!internal) return undefined;
    return {
      ...internal.internals.positionAbsolute,
      width: internal.measured.width ?? internal.width ?? 0,
      height: internal.measured.height ?? internal.height ?? 0,
    };
  };

  // Selects a node and brings it into view
  const showNode = (id: string) => {
    const rect = rectOf(id);
    dispatch(nodeSelected(id));
    if (rect) flow.setCenter(rect.x + rect.width / 2, rect.y + rect.height / 2, { zoom: 1, duration: 400 });
  };

  const focusFrame = (id: string) => {
    const frame = flow.getNode(id);
    if (!frame) return;
    flow.fitBounds(
      { ...frame.position, width: frame.width ?? 900, height: frame.height ?? 600 },
      { padding: 0.08, duration: 400 },
    );
  };

  const deleteSelected = () => {
    if (locked) return;
    flow.deleteElements({
      nodes: flow.getNodes().filter((node) => node.selected),
      edges: flow.getEdges().filter((edge) => edge.selected),
    });
  };

  return { flow, rectOf, showNode, focusFrame, deleteSelected };
};
