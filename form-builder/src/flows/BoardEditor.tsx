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
 * One board: the palette on the left, the canvas, and the settings of what's selected on the
 * right. Every change is saved automatically; if someone else saved the board in between, saving
 * stops and asks to reload, so nobody's work is overwritten silently.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Connection as FlowConnection,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  FinalConnectionState,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Copy, Redo2, Trash2, Undo2 } from 'lucide-react';
import { objectProblems } from './checks';
import type { BoardClient } from './boardClient';
import type { Board, BoardContent, FlowObjectType, Person } from './model';
import { ASELO_PEOPLE_CODE, objectColor, OBJECT_TYPES, STICKY_COLORS, TEMPLATES_CODE } from './model';
import {
  ARROW,
  CanvasNode,
  ConnectionEdge,
  createFrameNode,
  createObjectNode,
  createStickyNode,
  duplicate,
  facingSide,
  frameAt,
  newId,
  nextExit,
  ObjectNode,
  reparent,
  toContent,
  toEdges,
  toNodes,
  withIds,
} from './canvasModel';
import { BoardEditingContext, EDGE_TYPES, NODE_TYPES } from './nodes';
import { Palette, PALETTE_MIME, PaletteItem } from './Palette';
import { Inspector } from './Inspector';
import { openTaskCount, TasksPanel } from './TasksPanel';

type Props = {
  board: Board;
  client: BoardClient;
  readOnly: boolean;
  userName: string;
  userEmail?: string;
  onClose: () => void;
  onReload: () => void;
};

type SaveState = 'saved' | 'unsaved' | 'saving' | 'conflict' | 'error';

const AUTOSAVE_DELAY_MS = 1200;
const HISTORY_DELAY_MS = 300;
const HISTORY_LIMIT = 100;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// Selected nodes, plus everything inside selected frames
const withContents = (nodes: CanvasNode[], selected: CanvasNode[]) => {
  const ids = new Set(selected.map((node) => node.id));
  return nodes.filter((node) => ids.has(node.id) || (node.parentId && ids.has(node.parentId)));
};

// One list, without repeats: the same email (or name, without one) is the same person
const mergePeople = (lists: Person[][]) => {
  const byKey = new Map<string, Person>();
  lists.flat().forEach((person) => byKey.set((person.email ?? person.name).toLowerCase(), person));
  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
};

const Editor = ({ board, client, readOnly, userName, userEmail, onClose, onReload }: Props) => {
  const flow = useReactFlow<CanvasNode, ConnectionEdge>();
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(toNodes(board.content));
  const [edges, setEdges, onEdgesChange] = useEdgesState<ConnectionEdge>(toEdges(board.content));
  const [title, setTitle] = useState(board.content.title);
  const wrapper = useRef<HTMLDivElement>(null);
  // Show the whole board when opening it; an empty board keeps the view still as things are added
  const [fitOnOpen] = useState(() => nodes.length > 0);

  const content = useMemo(() => toContent(title, nodes, edges), [title, nodes, edges]);
  const json = useMemo(() => JSON.stringify(content), [content]);
  const dragging = nodes.some((node) => node.dragging);

  // ----- Undo and redo: snapshots of the board, taken when it stops changing
  const history = useRef({ stack: [JSON.stringify(board.content)], index: 0 });
  const [, setHistoryVersion] = useState(0);

  useEffect(() => {
    if (dragging) return undefined;
    const timer = setTimeout(() => {
      const { current } = history;
      if (current.stack[current.index] === json) return;
      current.stack = [...current.stack.slice(0, current.index + 1), json].slice(-HISTORY_LIMIT);
      current.index = current.stack.length - 1;
      setHistoryVersion((version) => version + 1);
    }, HISTORY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [json, dragging]);

  const restore = (snapshot: string) => {
    const restored = JSON.parse(snapshot) as BoardContent;
    setNodes(toNodes(restored));
    setEdges(toEdges(restored));
    setTitle(restored.title);
  };
  const canUndo = history.current.index > 0;
  const canRedo = history.current.index < history.current.stack.length - 1;
  const undo = () => {
    if (!canUndo || readOnly) return;
    history.current.index -= 1;
    restore(history.current.stack[history.current.index]);
    setHistoryVersion((version) => version + 1);
  };
  const redo = () => {
    if (!canRedo || readOnly) return;
    history.current.index += 1;
    restore(history.current.stack[history.current.index]);
    setHistoryVersion((version) => version + 1);
  };

  // ----- Saving
  const revision = useRef(board.meta.revision);
  const savedJson = useRef(JSON.stringify(board.content));
  const latestJson = useRef(json);
  latestJson.current = json;
  const inFlight = useRef<Promise<void> | null>(null);
  const stopped = useRef(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [saveError, setSaveError] = useState<string>();
  const [conflict, setConflict] = useState<{ updatedBy?: string; updatedAt?: string }>();

  const saveNow = useCallback(async (): Promise<void> => {
    if (readOnly || stopped.current) return;
    while (inFlight.current) await inFlight.current;
    const toSave = latestJson.current;
    if (toSave === savedJson.current) {
      setSaveState('saved');
      return;
    }
    setSaveState('saving');
    const run = (async () => {
      try {
        const outcome = await client.save(board.code, board.id, revision.current, JSON.parse(toSave));
        if (outcome.ok) {
          revision.current = outcome.meta.revision;
          savedJson.current = toSave;
          setSaveError(undefined);
          setSaveState(latestJson.current === toSave ? 'saved' : 'unsaved');
        } else {
          stopped.current = true;
          setConflict(outcome.conflict);
          setSaveState('conflict');
        }
      } catch (err) {
        setSaveError((err as Error).message);
        setSaveState('error');
      }
    })();
    inFlight.current = run;
    await run;
    inFlight.current = null;
    // Changes made while saving
    if (!stopped.current && latestJson.current !== savedJson.current) setTimeout(() => saveNow(), AUTOSAVE_DELAY_MS);
  }, [board.code, board.id, client, readOnly]);

  useEffect(() => {
    if (readOnly || stopped.current || json === savedJson.current) return undefined;
    setSaveState((state) => (state === 'saving' ? state : 'unsaved'));
    if (dragging) return undefined;
    const timer = setTimeout(() => saveNow(), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [json, dragging, readOnly, saveNow]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (latestJson.current !== savedJson.current && !readOnly) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [readOnly]);

  const close = async () => {
    await saveNow();
    onClose();
  };

  // ----- Adding
  const viewCentre = () => {
    const rect = wrapper.current?.getBoundingClientRect();
    return flow.screenToFlowPosition({
      x: (rect?.left ?? 0) + (rect?.width ?? 800) / 2,
      y: (rect?.top ?? 0) + (rect?.height ?? 600) / 2,
    });
  };

  const add = (item: PaletteItem, at = viewCentre()) => {
    if (readOnly) return;
    let node: CanvasNode;
    if (item.kind === 'frame') {
      node = createFrameNode({ x: at.x - 450, y: at.y - 300 });
    } else {
      const size = item.kind === 'object' ? OBJECT_TYPES[item.type].defaultSize : { width: 160, height: 120 };
      const frame = frameAt(at, nodes);
      const topLeft = { x: at.x - size.width / 2, y: at.y - size.height / 2 };
      const position = frame ? { x: topLeft.x - frame.position.x, y: topLeft.y - frame.position.y } : topLeft;
      node =
        item.kind === 'object'
          ? createObjectNode(item.type, position, frame?.id)
          : createStickyNode(position, frame?.id);
    }
    setNodes((current) => [...current.map((n) => ({ ...n, selected: false })), ...withIds([node])]);
    setEdges((current) => current.map((edge) => ({ ...edge, selected: false })));
  };

  const onDrop = (event: React.DragEvent) => {
    const raw = event.dataTransfer.getData(PALETTE_MIME);
    if (!raw) return;
    event.preventDefault();
    add(JSON.parse(raw) as PaletteItem, flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  };

  // ----- Connecting
  // Why a connection wasn't made, shown for a few seconds
  const [notice, setNotice] = useState<string>();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(undefined), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const objectNode = (id: string) => nodes.find((node): node is ObjectNode => node.id === id && node.type === 'object');

  const connect = (params: FlowConnection) => {
    if (readOnly || params.source === params.target) return;
    const source = objectNode(params.source);
    if (!source || !objectNode(params.target)) return;
    const next = nextExit(source, edges);
    if (!next.ok) {
      setNotice(next.reason);
      return;
    }
    setNotice(undefined);
    setEdges((current) => [
      ...current,
      {
        id: newId('c'),
        type: 'connection',
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        markerEnd: ARROW,
        data: { exit: next.exit },
      },
    ]);
  };

  const isValidConnection = (params: FlowConnection | ConnectionEdge) =>
    params.source !== params.target && Boolean(objectNode(params.source)) && Boolean(objectNode(params.target));

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

  /**
   * A connection let go anywhere over an object (not only on one of its connection points)
   * connects to it, on the side facing where it comes from.
   */
  const onConnectEnd = (event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
    setConnecting(false);
    if (readOnly || state.isValid || !state.fromNode) return;
    const pointer = 'changedTouches' in event ? event.changedTouches[0] : event;
    if (!pointer) return;
    const at = flow.screenToFlowPosition({ x: pointer.clientX, y: pointer.clientY });
    const fromId = state.fromNode.id;
    const target = [...nodes].reverse().find((node) => {
      const rect = node.type === 'object' && node.id !== fromId ? rectOf(node.id) : undefined;
      return rect && at.x >= rect.x && at.x <= rect.x + rect.width && at.y >= rect.y && at.y <= rect.y + rect.height;
    });
    const fromRect = rectOf(fromId);
    const toRect = target && rectOf(target.id);
    if (!target || !fromRect || !toRect) return;
    connect({
      source: fromId,
      sourceHandle: state.fromHandle?.id ?? null,
      target: target.id,
      targetHandle: facingSide(fromRect, toRect),
    });
  };

  const onReconnect = (oldEdge: ConnectionEdge, connection: FlowConnection) => {
    if (readOnly || !isValidConnection(connection)) return;
    let exit = oldEdge.data?.exit;
    if (connection.source !== oldEdge.source) {
      const next = nextExit(objectNode(connection.source), edges, oldEdge.id);
      if (!next.ok) {
        setNotice(next.reason);
        return;
      }
      exit = next.exit;
    }
    setEdges((current) =>
      reconnectEdge(oldEdge, connection, current, { shouldReplaceId: false }).map((edge) =>
        edge.id === oldEdge.id ? { ...edge, data: { exit } } : edge,
      ),
    );
  };

  // ----- Changing
  const onNodeData = (id: string, data: CanvasNode['data']) =>
    setNodes((current) => current.map((node) => (node.id === id ? ({ ...node, data } as CanvasNode) : node)));

  const onChangeType = (id: string, type: FlowObjectType) =>
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== id || node.type !== 'object') return node;
        const info = OBJECT_TYPES[type];
        const exits = info.editableExits ? (node.data.object.exits ?? info.exits) : undefined;
        return { ...node, data: { object: { ...node.data.object, type, exits: exits ? [...exits] : undefined } } };
      }),
    );

  const onRenameExit = (id: string, exits: string[], renamed?: { from: string; to: string }) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === id && node.type === 'object' ? { ...node, data: { object: { ...node.data.object, exits } } } : node,
      ),
    );
    if (renamed) {
      setEdges((current) =>
        current.map((edge) =>
          edge.source === id && edge.data?.exit === renamed.from ? { ...edge, data: { exit: renamed.to } } : edge,
        ),
      );
    }
  };

  const onEdgeExit = (id: string, exit: string | undefined) =>
    setEdges((current) => current.map((edge) => (edge.id === id ? { ...edge, data: { exit } } : edge)));

  const deleteSelected = () => {
    if (readOnly) return;
    flow.deleteElements({
      nodes: nodes.filter((node) => node.selected),
      edges: edges.filter((edge) => edge.selected),
    });
  };

  // ----- Copying
  const clipboard = useRef<{ nodes: CanvasNode[]; edges: ConnectionEdge[]; pastes: number }>();

  const copy = () => {
    const selected = withContents(
      nodes,
      nodes.filter((node) => node.selected),
    );
    if (selected.length === 0) return;
    clipboard.current = { nodes: structuredClone(selected), edges: structuredClone(edges), pastes: 0 };
  };

  const paste = (source = clipboard.current) => {
    if (!source || readOnly) return;
    source.pastes += 1;
    const step = 40 * source.pastes;
    const copies = duplicate(source.nodes, source.edges, new Set(nodes.map((node) => node.id)), { x: step, y: step });
    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), ...copies.nodes]);
    setEdges((current) => [...current.map((edge) => ({ ...edge, selected: false })), ...copies.edges]);
  };

  const duplicateSelected = () => {
    const selected = withContents(
      nodes,
      nodes.filter((node) => node.selected),
    );
    if (selected.length === 0) return;
    paste({ nodes: selected, edges, pastes: 0 });
  };

  const focusFrame = (id: string) => {
    const frame = nodes.find((node) => node.id === id);
    if (!frame) return;
    flow.fitBounds(
      { ...frame.position, width: frame.width ?? 900, height: frame.height ?? 600 },
      { padding: 0.08, duration: 400 },
    );
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (isTyping(event.target)) return;
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;
    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey) undo();
    else if (key === 'y' || (key === 'z' && event.shiftKey)) redo();
    else if (key === 'c') copy();
    else if (key === 'v') paste();
    else if (key === 'd') duplicateSelected();
    else return;
    event.preventDefault();
  };

  // ----- Side panel, problems and tasks
  const [sideTab, setSideTab] = useState<'settings' | 'tasks'>('settings');
  // Who tasks can be assigned to: the helpline's people and the Aselo team
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const codes = board.code === TEMPLATES_CODE ? [ASELO_PEOPLE_CODE] : [board.code, ASELO_PEOPLE_CODE];
    Promise.all(codes.map((code) => client.people(code).catch((): Person[] => []))).then((lists) =>
      setPeople(mergePeople(lists)),
    );
  }, [client, board.code]);
  const problems = useMemo(() => objectProblems(content), [content]);
  const editingContext = useMemo(() => ({ readOnly, problems }), [readOnly, problems]);
  const openTasks = openTaskCount(nodes);

  // Selects a node and brings it into view
  const showNode = (id: string) => {
    const rect = rectOf(id);
    setNodes((current) => current.map((node) => ({ ...node, selected: node.id === id })));
    setEdges((current) => current.map((edge) => ({ ...edge, selected: false })));
    if (rect) flow.setCenter(rect.x + rect.width / 2, rect.y + rect.height / 2, { zoom: 1, duration: 400 });
  };

  const statusText: Record<SaveState, string> = {
    saved: 'All changes saved',
    unsaved: 'Unsaved changes…',
    saving: 'Saving…',
    conflict: 'Not saved',
    error: 'Could not save',
  };

  return (
    <BoardEditingContext.Provider value={editingContext}>
      <div className="flow-editor" onKeyDown={onKeyDown}>
        <div className="flow-toolbar">
          <button type="button" className="link-button" onClick={close}>
            ← Boards
          </button>
          <h2>{title || 'Untitled board'}</h2>
          <span className="flow-board-code">
            {board.code === '_templates' ? 'Aselo template' : board.code.toUpperCase()}
          </span>
          {readOnly ? (
            <span className="flow-save-state">View only</span>
          ) : (
            <span className={`flow-save-state ${saveState}`} role="status">
              {statusText[saveState]}
              {saveState === 'error' && (
                <>
                  {' '}
                  <button type="button" className="link-button" onClick={() => saveNow()}>
                    Try again
                  </button>
                </>
              )}
            </span>
          )}
          {!readOnly && (
            <span className="flow-toolbar-buttons">
              <button
                type="button"
                className="icon-button"
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
                disabled={!canUndo}
                onClick={undo}
              >
                <Undo2 size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Redo"
                title="Redo (Ctrl+Y)"
                disabled={!canRedo}
                onClick={redo}
              >
                <Redo2 size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Duplicate"
                title="Duplicate (Ctrl+D)"
                disabled={!nodes.some((node) => node.selected)}
                onClick={duplicateSelected}
              >
                <Copy size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Delete"
                title="Delete (Delete)"
                disabled={!nodes.some((node) => node.selected) && !edges.some((edge) => edge.selected)}
                onClick={deleteSelected}
              >
                <Trash2 size={16} />
              </button>
            </span>
          )}
        </div>

        {conflict && (
          <div className="alert alert-error">
            {conflict.updatedBy ?? 'Someone else'} changed this board
            {conflict.updatedAt ? ` at ${new Date(conflict.updatedAt).toLocaleString()}` : ''}, so your latest changes
            weren&apos;t saved. Reload to see theirs (your unsaved changes here will be lost).{' '}
            <button type="button" className="secondary-button" onClick={onReload}>
              Reload
            </button>
          </div>
        )}
        {saveState === 'error' && saveError && <div className="alert alert-error">{saveError}</div>}

        <div className="flow-workspace">
          {!readOnly && <Palette onAdd={(item) => add(item)} />}
          <div
            className={connecting ? 'flow-canvas connecting' : 'flow-canvas'}
            ref={wrapper}
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes(PALETTE_MIME)) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
              }
            }}
            onDrop={onDrop}
          >
            <ReactFlow<CanvasNode, ConnectionEdge>
              nodes={nodes}
              edges={edges}
              nodeTypes={NODE_TYPES}
              edgeTypes={EDGE_TYPES}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={connect}
              onConnectStart={() => setConnecting(true)}
              onConnectEnd={onConnectEnd}
              connectionRadius={36}
              isValidConnection={isValidConnection}
              onNodeClick={() => setSideTab('settings')}
              onEdgeClick={() => setSideTab('settings')}
              onNodeDragStop={(_, __, dragged) => {
                if (readOnly) return;
                setNodes((current) =>
                  dragged.reduce(
                    (result, node) => (node.type === 'frame' ? result : reparent(result, node.id)),
                    current,
                  ),
                );
              }}
              connectionMode={ConnectionMode.Loose}
              connectionLineType={ConnectionLineType.SmoothStep}
              defaultEdgeOptions={{ type: 'connection', markerEnd: ARROW }}
              nodesDraggable={!readOnly}
              nodesConnectable={!readOnly}
              edgesReconnectable={!readOnly}
              onReconnect={onReconnect}
              deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
              selectionKeyCode="Shift"
              multiSelectionKeyCode={['Meta', 'Control']}
              snapToGrid
              snapGrid={[10, 10]}
              minZoom={0.1}
              maxZoom={2.5}
              fitView={fitOnOpen}
              fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                nodeColor={(node) => {
                  const canvasNode = node as CanvasNode;
                  if (canvasNode.type === 'object') return objectColor(canvasNode.data.object);
                  if (canvasNode.type === 'sticky') return STICKY_COLORS[canvasNode.data.sticky.color];
                  return 'rgba(96, 125, 139, 0.15)';
                }}
              />
            </ReactFlow>
            {notice && (
              <div className="flow-notice" role="alert">
                {notice}
              </div>
            )}
          </div>
          <aside className="flow-sidebar" aria-label="Side panel">
            <div className="flow-sidebar-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === 'settings'}
                onClick={() => setSideTab('settings')}
              >
                Settings
              </button>
              <button type="button" role="tab" aria-selected={sideTab === 'tasks'} onClick={() => setSideTab('tasks')}>
                Tasks{openTasks > 0 ? ` (${openTasks})` : ''}
              </button>
            </div>
            {sideTab === 'settings' ? (
              <Inspector
                title={title}
                content={content}
                problems={problems}
                people={people}
                nodes={nodes}
                edges={edges}
                readOnly={readOnly}
                userName={userName}
                onTitleChange={setTitle}
                onNodeData={onNodeData}
                onChangeType={onChangeType}
                onRenameExit={onRenameExit}
                onEdgeExit={onEdgeExit}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
                onFocusFrame={focusFrame}
              />
            ) : (
              <TasksPanel
                nodes={nodes}
                readOnly={readOnly}
                userName={userName}
                userEmail={userEmail}
                onNodeData={onNodeData}
                onShow={showNode}
              />
            )}
          </aside>
        </div>
      </div>
    </BoardEditingContext.Provider>
  );
};

export const BoardEditor = (props: Props) => (
  <ReactFlowProvider>
    <Editor {...props} />
  </ReactFlowProvider>
);
