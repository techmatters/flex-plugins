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
 * Converts between a saved board (model.ts) and what the canvas (React Flow) works with: nodes
 * for frames, objects and stickies, edges for connections. Frames are parents of the nodes
 * inside them, so React Flow moves them together.
 */
import { Edge, MarkerType, Node } from '@xyflow/react';
import {
  BOARD_SCHEMA_VERSION,
  BoardContent,
  Connection,
  exitsOf,
  FlowObject,
  FlowObjectType,
  Frame,
  OBJECT_TYPES,
  Position,
  Side,
  Sticky,
  StickyColor,
} from './model';

type Without<T> = Omit<T, 'x' | 'y' | 'width' | 'height' | 'frameId'>;

export type FrameNode = Node<{ frame: Without<Frame> }, 'frame'>;
export type ObjectNode = Node<{ object: Without<FlowObject> }, 'object'>;
export type StickyNode = Node<{ sticky: Without<Sticky> }, 'sticky'>;
export type CanvasNode = FrameNode | ObjectNode | StickyNode;
export type ConnectionEdge = Edge<{ exit?: string }, 'connection'>;

export const newId = (prefix: string) =>
  `${prefix}-${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)).replace(/-/g, '').slice(0, 8)}`;

// The record without what the node itself holds (position, size, frame)
const strip = <T extends Position & { width: number; height: number; frameId?: string }>(record: T): Without<T> => {
  const { x, y, width, height, frameId, ...rest } = record;
  return rest;
};

const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];
const sideOf = (handle: string | null | undefined): Side | undefined => SIDES.find((side) => side === handle);

export const toNodes = (content: BoardContent): CanvasNode[] => {
  const frameIds = new Set(content.frames.map((frame) => frame.id));
  const parentOf = (frameId?: string) => (frameId && frameIds.has(frameId) ? frameId : undefined);
  return [
    // Parents have to come before their children
    ...content.frames.map((frame): FrameNode => ({
      id: frame.id,
      type: 'frame',
      position: { x: frame.x, y: frame.y },
      width: frame.width,
      height: frame.height,
      dragHandle: '.flow-frame-title',
      zIndex: -1,
      data: { frame: strip(frame) },
    })),
    ...content.objects.map((object): ObjectNode => ({
      id: object.id,
      type: 'object',
      position: { x: object.x, y: object.y },
      width: object.width,
      height: object.height,
      parentId: parentOf(object.frameId),
      data: { object: strip(object) },
    })),
    ...content.stickies.map((sticky): StickyNode => ({
      id: sticky.id,
      type: 'sticky',
      position: { x: sticky.x, y: sticky.y },
      width: sticky.width,
      height: sticky.height,
      parentId: parentOf(sticky.frameId),
      data: { sticky: strip(sticky) },
    })),
  ];
};

export const ARROW = { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#37474f' };

export const toEdges = (content: BoardContent): ConnectionEdge[] =>
  content.connections.map((connection) => ({
    id: connection.id,
    type: 'connection',
    markerEnd: ARROW,
    source: connection.from,
    target: connection.to,
    sourceHandle: connection.fromSide ?? 'bottom',
    targetHandle: connection.toSide ?? 'top',
    data: { exit: connection.exit },
  }));

const sizeOf = (node: CanvasNode) => ({
  width: Math.round(node.width ?? node.measured?.width ?? 0),
  height: Math.round(node.height ?? node.measured?.height ?? 0),
});

const placeOf = (node: CanvasNode) => ({
  x: Math.round(node.position.x),
  y: Math.round(node.position.y),
  ...sizeOf(node),
  ...(node.parentId ? { frameId: node.parentId } : {}),
});

export const toContent = (title: string, nodes: CanvasNode[], edges: ConnectionEdge[]): BoardContent => {
  const nodeIds = new Set(nodes.map((node) => node.id));
  return {
    schemaVersion: BOARD_SCHEMA_VERSION,
    title,
    frames: nodes
      .filter((node): node is FrameNode => node.type === 'frame')
      .map((node) => {
        const { frameId, ...place } = placeOf(node);
        return { ...node.data.frame, id: node.id, ...place };
      }),
    objects: nodes
      .filter((node): node is ObjectNode => node.type === 'object')
      .map((node) => ({ ...node.data.object, id: node.id, ...placeOf(node) })),
    stickies: nodes
      .filter((node): node is StickyNode => node.type === 'sticky')
      .map((node) => ({ ...node.data.sticky, id: node.id, ...placeOf(node) })),
    connections: edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge): Connection => {
        const fromSide = sideOf(edge.sourceHandle);
        const toSide = sideOf(edge.targetHandle);
        return {
          id: edge.id,
          from: edge.source,
          to: edge.target,
          ...(edge.data?.exit ? { exit: edge.data.exit } : {}),
          ...(fromSide ? { fromSide } : {}),
          ...(toSide ? { toSide } : {}),
        };
      }),
  };
};

// ---------------------------------------------------------------------------------------------
// Building and changing nodes

export const createObjectNode = (type: FlowObjectType, position: Position, parentId?: string): ObjectNode => {
  const info = OBJECT_TYPES[type];
  return {
    id: newId('o'),
    type: 'object',
    position,
    ...info.defaultSize,
    parentId,
    selected: true,
    data: {
      object: {
        id: '',
        type,
        text: type === 'text' ? 'Text' : info.label,
        ...(info.editableExits && info.exits ? { exits: [...info.exits] } : {}),
      },
    },
  };
};

export const createFrameNode = (position: Position, title = 'New frame'): FrameNode => ({
  id: newId('f'),
  type: 'frame',
  position,
  width: 900,
  height: 600,
  dragHandle: '.flow-frame-title',
  zIndex: -1,
  selected: true,
  data: { frame: { id: '', title } },
});

export const createStickyNode = (position: Position, parentId?: string, color: StickyColor = 'yellow'): StickyNode => ({
  id: newId('s'),
  type: 'sticky',
  position,
  width: 160,
  height: 120,
  parentId,
  selected: true,
  data: { sticky: { id: '', text: '', color } },
});

// The model's records keep their own id in sync with the node's
export const withIds = (nodes: CanvasNode[]): CanvasNode[] =>
  nodes.map((node) => {
    if (node.type === 'frame') return { ...node, data: { frame: { ...node.data.frame, id: node.id } } };
    if (node.type === 'object') return { ...node, data: { object: { ...node.data.object, id: node.id } } };
    return { ...node, data: { sticky: { ...node.data.sticky, id: node.id } } };
  });

// A node's position on the canvas, adding its frame's
export const absolutePosition = (node: CanvasNode, nodes: CanvasNode[]): Position => {
  const parent = node.parentId ? nodes.find((candidate) => candidate.id === node.parentId) : undefined;
  return parent ? { x: parent.position.x + node.position.x, y: parent.position.y + node.position.y } : node.position;
};

// The frame under a point, if any (the smallest one, when frames overlap)
export const frameAt = (point: Position, nodes: CanvasNode[], except?: string): FrameNode | undefined =>
  nodes
    .filter((node): node is FrameNode => node.type === 'frame' && node.id !== except)
    .filter((frame) => {
      const { width, height } = sizeOf(frame);
      return (
        point.x >= frame.position.x &&
        point.x <= frame.position.x + width &&
        point.y >= frame.position.y &&
        point.y <= frame.position.y + height
      );
    })
    .sort((a, b) => sizeOf(a).width * sizeOf(a).height - sizeOf(b).width * sizeOf(b).height)[0];

/**
 * After a node is moved: puts it in the frame its centre is now over (or takes it out of its
 * frame), keeping it where it is on screen. Frames stay before the nodes inside them.
 */
export const reparent = (nodes: CanvasNode[], nodeId: string): CanvasNode[] => {
  const node = nodes.find((candidate) => candidate.id === nodeId);
  if (!node || node.type === 'frame') return nodes;
  const absolute = absolutePosition(node, nodes);
  const { width, height } = sizeOf(node);
  const frame = frameAt({ x: absolute.x + width / 2, y: absolute.y + height / 2 }, nodes);
  if (frame?.id === node.parentId) return nodes;
  const moved: CanvasNode = {
    ...node,
    parentId: frame?.id,
    position: frame ? { x: absolute.x - frame.position.x, y: absolute.y - frame.position.y } : absolute,
  };
  const others = nodes.filter((candidate) => candidate.id !== nodeId);
  return [...others.filter((n) => n.type === 'frame'), ...others.filter((n) => n.type !== 'frame'), moved];
};

export type NextExit = { ok: true; exit?: string } | { ok: false; reason: string };

/**
 * Whether another connection can start from this object, and which way out it is. In Studio each
 * way out leads to one place, so an object has at most one connection per way out: one in all
 * for objects with a single way out, none for those without (End, Go to frame, Text).
 * `ignoreEdge` leaves out a connection being moved.
 */
export const nextExit = (source: ObjectNode | undefined, edges: ConnectionEdge[], ignoreEdge?: string): NextExit => {
  if (!source) return { ok: false, reason: 'Connections start from an object.' };
  const { object } = source.data;
  const exits = exitsOf(object);
  const name = object.text || OBJECT_TYPES[object.type].label;
  if (exits.length === 0) return { ok: false, reason: `“${name}” ends the flow, so nothing comes after it.` };
  const outgoing = edges.filter((edge) => edge.source === source.id && edge.id !== ignoreEdge);
  const named = exits.filter(Boolean);
  if (named.length === 0) {
    return outgoing.length === 0
      ? { ok: true }
      : { ok: false, reason: `“${name}” has only one way out, and it's already connected.` };
  }
  const used = new Set(outgoing.map((edge) => edge.data?.exit));
  const free = named.find((exit) => !used.has(exit));
  if (free !== undefined) return { ok: true, exit: free };
  return {
    ok: false,
    reason: OBJECT_TYPES[object.type].editableExits
      ? `All of “${name}”'s ways out are connected. Add a way out in its settings first.`
      : `All of “${name}”'s ways out (${named.join(', ')}) are already connected.`,
  };
};

/**
 * The side of the target a connection dropped on it arrives at: the one facing the source.
 */
export const facingSide = (
  source: { x: number; y: number; width: number; height: number },
  target: { x: number; y: number; width: number; height: number },
): Side => {
  const dx = source.x + source.width / 2 - (target.x + target.width / 2);
  const dy = source.y + source.height / 2 - (target.y + target.height / 2);
  if (Math.abs(dy) * 1.2 >= Math.abs(dx)) return dy < 0 ? 'top' : 'bottom';
  return dx < 0 ? 'left' : 'right';
};

/**
 * Copies of the given nodes (and the connections between them), with new ids, moved by offset.
 * Copies keep their frame when it still exists, unless the frame is copied too.
 */
export const duplicate = (
  nodes: CanvasNode[],
  edges: ConnectionEdge[],
  existingIds: Set<string>,
  offset: Position = { x: 40, y: 40 },
): { nodes: CanvasNode[]; edges: ConnectionEdge[] } => {
  const idMap = new Map(nodes.map((node) => [node.id, newId(node.id.split('-')[0] || 'n')]));
  const copies = nodes.map((node): CanvasNode => {
    const copiedParent = node.parentId ? idMap.get(node.parentId) : undefined;
    const keptParent = node.parentId && existingIds.has(node.parentId) ? node.parentId : undefined;
    const parentId = copiedParent ?? keptParent;
    return {
      ...structuredClone(node),
      id: idMap.get(node.id)!,
      parentId,
      selected: true,
      // Nodes inside a copied frame keep their place in it
      position: copiedParent ? node.position : { x: node.position.x + offset.x, y: node.position.y + offset.y },
    } as CanvasNode;
  });
  const copiedEdges = edges
    .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
    .map((edge) => ({
      ...structuredClone(edge),
      id: newId('c'),
      source: idMap.get(edge.source)!,
      target: idMap.get(edge.target)!,
      selected: false,
    }));
  const ordered = [
    ...copies.filter((node) => node.type === 'frame'),
    ...copies.filter((node) => node.type !== 'frame'),
  ];
  return { nodes: withIds(ordered), edges: copiedEdges };
};
