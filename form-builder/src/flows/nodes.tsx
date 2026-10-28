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
 * How frames, objects, stickies and connections look on the canvas.
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  Handle,
  NodeProps,
  NodeResizer,
  Position,
  useReactFlow,
} from '@xyflow/react';
import { MessageSquareText, Square, SquareCheck, TriangleAlert } from 'lucide-react';
import { iconOf, OBJECT_TYPES, objectColor, STICKY_COLORS } from './model';
import type { ConnectionEdge, FrameNode, ObjectNode, StickyNode } from './canvasModel';
import { ObjectIcon, ShapeOutline } from './shapes';

export const BoardEditingContext = createContext<{ readOnly: boolean; problems?: Map<string, string[]> }>({
  readOnly: false,
});

const HANDLES: { id: string; position: Position }[] = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

// Connection points on every side; each can start or end a connection
const SideHandles = () => (
  <>
    {HANDLES.map(({ id, position }) => (
      <Handle key={id} id={id} type="source" position={position} className="flow-handle" />
    ))}
  </>
);

/**
 * Text edited in place: double-click to edit, Enter (without Shift) or clicking away to finish,
 * Escape to cancel.
 */
const InlineText = ({
  value,
  placeholder,
  className,
  onChange,
}: {
  value: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
}) => {
  const { readOnly } = useContext(BoardEditingContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      input.current?.focus();
      input.current?.select();
    }
  }, [editing]);

  if (editing) {
    const finish = () => {
      setEditing(false);
      if (draft !== value) onChange(draft);
    };
    return (
      <textarea
        ref={input}
        className={`flow-inline-input nodrag nowheel ${className ?? ''}`}
        value={draft}
        aria-label="Text"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={finish}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            finish();
          }
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }
  return (
    <span
      className={`${className ?? ''} ${value ? '' : 'flow-placeholder'}`}
      onDoubleClick={() => {
        if (readOnly) return;
        setDraft(value);
        setEditing(true);
      }}
    >
      {value || placeholder}
    </span>
  );
};

const openComments = (thread?: { comments: unknown[]; resolved: boolean }) =>
  thread && !thread.resolved ? thread.comments.length : 0;

export const ObjectNodeView = ({ id, data, selected, width, height }: NodeProps<ObjectNode>) => {
  const { updateNodeData } = useReactFlow();
  const { readOnly, problems } = useContext(BoardEditingContext);
  const { object } = data;
  const info = OBJECT_TYPES[object.type];
  const comments = openComments(object.thread);
  const objectProblems = problems?.get(id) ?? [];
  let stroke = '#37474f';
  if (objectProblems.length > 0) stroke = '#e65100';
  if (selected) stroke = '#1565c0';
  return (
    <div className={`flow-object flow-shape-${info.shape} ${selected ? 'selected' : ''}`}>
      {!readOnly && <NodeResizer isVisible={selected} minWidth={60} minHeight={32} />}
      <ShapeOutline
        shape={info.shape}
        width={width ?? info.defaultSize.width}
        height={height ?? info.defaultSize.height}
        fill={objectColor(object)}
        stroke={stroke}
      />
      {objectProblems.length > 0 && (
        <span className="flow-problem-badge" title={objectProblems.join('\n')} aria-label="Has problems">
          <TriangleAlert size={13} aria-hidden />
        </span>
      )}
      <div className="flow-object-body">
        <span className="flow-object-icon">
          <ObjectIcon name={iconOf(object)} />
        </span>
        <InlineText
          className="flow-object-text"
          value={object.text}
          placeholder={info.label}
          onChange={(text) => updateNodeData(id, { object: { ...object, text } })}
        />
        {object.studioName ? (
          <span className="flow-object-caption" title={info.studioWidget}>
            {object.studioName}
          </span>
        ) : (
          info.studioWidget && <span className="flow-object-caption">{info.studioWidget}</span>
        )}
      </div>
      {comments > 0 && (
        <span className="flow-comment-badge" title={`${comments} open comment${comments === 1 ? '' : 's'}`}>
          <MessageSquareText size={12} aria-hidden /> {comments}
        </span>
      )}
      {object.type !== 'text' && <SideHandles />}
    </div>
  );
};

export const FrameNodeView = ({ id, data, selected }: NodeProps<FrameNode>) => {
  const { updateNodeData } = useReactFlow();
  const { readOnly } = useContext(BoardEditingContext);
  const { frame } = data;
  return (
    <div className={`flow-frame ${selected ? 'selected' : ''}`}>
      {!readOnly && <NodeResizer isVisible={selected} minWidth={200} minHeight={120} />}
      <div className="flow-frame-title">
        <InlineText
          value={frame.title}
          placeholder="Frame"
          onChange={(title) => updateNodeData(id, { frame: { ...frame, title } })}
        />
        {(frame.channel || frame.stage) && (
          <span className="flow-frame-tags">
            {[frame.channel, frame.stage === 'postqueue' ? 'post-queue' : frame.stage].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
    </div>
  );
};

export const StickyNodeView = ({ id, data, selected }: NodeProps<StickyNode>) => {
  const { updateNodeData } = useReactFlow();
  const { readOnly } = useContext(BoardEditingContext);
  const { sticky } = data;
  const { task } = sticky;
  const done = task?.status === 'done';
  return (
    <div
      className={`flow-sticky ${selected ? 'selected' : ''} ${task ? `flow-sticky-task ${task.status}` : ''}`}
      style={{ background: STICKY_COLORS[sticky.color] }}
    >
      {!readOnly && <NodeResizer isVisible={selected} minWidth={80} minHeight={60} />}
      {task && (
        <div className="flow-sticky-task-bar">
          <button
            type="button"
            className="flow-task-check nodrag"
            aria-label={done ? 'Mark as not done' : 'Mark as done'}
            disabled={readOnly}
            onClick={() =>
              updateNodeData(id, { sticky: { ...sticky, task: { ...task, status: done ? 'todo' : 'done' } } })
            }
          >
            {done ? <SquareCheck size={16} /> : <Square size={16} />}
          </button>
          <span className="flow-sticky-assignee">
            {task.assignee ?? 'Not assigned'}
            {task.status === 'doing' ? ' · in progress' : ''}
          </span>
        </div>
      )}
      <InlineText
        className="flow-sticky-text"
        value={sticky.text}
        placeholder="Double-click to write"
        onChange={(text) => updateNodeData(id, { sticky: { ...sticky, text } })}
      />
    </div>
  );
};

// Straight lines with rounded corners, an arrow, and the exit it stands for
export const ConnectionEdgeView = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  selected,
  data,
}: EdgeProps<ConnectionEdge>) => {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
    offset: 24,
  });
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} className={selected ? 'flow-edge selected' : 'flow-edge'} />
      {data?.exit && (
        <EdgeLabelRenderer>
          <div
            className={`flow-edge-label nodrag nopan ${selected ? 'selected' : ''}`}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data.exit}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const NODE_TYPES = { object: ObjectNodeView, frame: FrameNodeView, sticky: StickyNodeView };
export const EDGE_TYPES = { connection: ConnectionEdgeView };
