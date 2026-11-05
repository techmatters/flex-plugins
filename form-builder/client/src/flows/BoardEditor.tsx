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
 * right. Its state is the store's (boardSlice.ts: React Flow shows the nodes and edges kept there,
 * and changes them through actions); every change is saved automatically, and if someone else saved
 * the board in between, saving stops and asks to reload, so nobody's work is overwritten silently.
 */
import { useEffect, useRef, useState } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Copy,
  Download,
  FlaskConical,
  Languages,
  PencilRuler,
  PenLine,
  Redo2,
  RefreshCw,
  Trash2,
  Undo2,
  Users,
} from 'lucide-react';
import {
  isImportedBoard,
  objectColor,
  STICKY_COLORS,
  TEMPLATES_CODE,
  VARIANT_LANGUAGES,
  variantInLanguage,
} from '@tech-matters/form-builder-shared/flows/model';

import { downloadFlowExport, downloadScripts } from './exports';
import { CheckPanel } from './CheckPanel';
import { RecordingsPanel } from './RecordingControls';
import { DesignStatusPicker } from '../common/DesignStatusPicker';
import { ARROW, CanvasNode, ConnectionEdge, facingSide } from './canvasModel';
import { EDGE_TYPES, NODE_TYPES } from './nodes';
import { Palette, PALETTE_MIME, PaletteItem } from './Palette';
import { Inspector } from './Inspector';
import { SidebarResizer, useSidebarWidth } from './SidebarResizer';
import { openTaskCount, TasksPanel } from './TasksPanel';
import { SimulatorPanel } from './SimulatorPanel';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import {
  addItem,
  BoardSaveState,
  checkIgnored,
  connectObjects,
  copySelection,
  duplicateSelection,
  edgesChanged,
  exitEnded,
  flowChanged,
  isValidConnection,
  languageAdded,
  nodesChanged,
  nodesReparented,
  noticeDismissed,
  pasteClipboard,
  reconnectConnection,
  redo,
  retryBoardSave,
  selectBoard,
  selectCanRedo,
  selectCanUndo,
  selectContent,
  selectHasSelection,
  selectHasUnsavedChanges,
  selectIssues,
  selectLocked,
  selectMainVariant,
  selectReadOnly,
  selectVariant,
  selectVariants,
  sideTabShown,
  splitVariant,
  statusChanged,
  switchMode,
  undo,
  variantShown,
} from './boardSlice';
import { loadRecordings, selectBoardRecordings } from './recordingsSlice';
import { selectSimulator } from './simulatorSlice';
import { closeBoard, loadOpenBoard } from './flowsSlice';
import { useCanvasView } from './canvasView';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const NOTICE_MS = 5000;

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
const Editor = () => {
  const dispatch = useAppDispatch();
  const { flow, rectOf, showNode, deleteSelected } = useCanvasView();
  const {
    board: loaded,
    nodes,
    edges,
    title,
    status,
    mode,
    sideTab,
    notice,
    saveState,
    saveError,
    conflict,
    flow: boardFlow,
  } = useAppSelector(selectBoard);
  // Shown only once a board is loaded (FlowsArea)
  const board = loaded!;
  const readOnly = useAppSelector(selectReadOnly);
  // Acting as Aselo staff: exports the JSON for Claude, approves and publishes recordings
  const staffMode = useAppSelector(selectActingAsStaff);
  const locked = useAppSelector(selectLocked);
  const content = useAppSelector(selectContent);
  const variants = useAppSelector(selectVariants);
  const mainVariant = useAppSelector(selectMainVariant);
  const variant = useAppSelector(selectVariant);
  const { list: recordingList, refreshing } = useAppSelector(selectBoardRecordings);
  const { active: issues, ignored: ignoredIssues } = useAppSelector(selectIssues);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const hasSelection = useAppSelector(selectHasSelection);
  const hasUnsaved = useAppSelector(selectHasUnsavedChanges);
  const { run } = useAppSelector(selectSimulator);

  // The side panel's width: dragged wider for long JSON and scripts
  const sidebar = useSidebarWidth();
  const wrapper = useRef<HTMLDivElement>(null);
  // Show the whole board when opening it; an empty board keeps the view still as things are added
  const [fitOnOpen] = useState(() => nodes.length > 0);
  // A connection being dragged; the export menu open
  const [connecting, setConnecting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Leaving the page with changes not saved yet asks first
  const unsaved = useRef(hasUnsaved);
  unsaved.current = hasUnsaved;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (unsaved.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  // A notice shows for a few seconds
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => dispatch(noticeDismissed()), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice, dispatch]);

  // The run's current widget kept in view
  const follow = run?.current;
  useEffect(() => {
    if (!follow) return;
    const rect = rectOf(follow);
    if (rect)
      flow.setCenter(rect.x + rect.width / 2, rect.y + rect.height / 2, { zoom: flow.getZoom(), duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow]);

  const close = () => dispatch(closeBoard());

  // ----- Adding: in the middle of the view, or where it's dropped
  const viewCentre = () => {
    const rect = wrapper.current?.getBoundingClientRect();
    return flow.screenToFlowPosition({
      x: (rect?.left ?? 0) + (rect?.width ?? 800) / 2,
      y: (rect?.top ?? 0) + (rect?.height ?? 600) / 2,
    });
  };

  const add = (item: PaletteItem, at = viewCentre()) => dispatch(addItem(item, at));

  const onDrop = (event: React.DragEvent) => {
    const raw = event.dataTransfer.getData(PALETTE_MIME);
    if (!raw) return;
    event.preventDefault();
    add(JSON.parse(raw) as PaletteItem, flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  };

  // ----- Connecting
  const connect = (params: FlowConnection) => dispatch(connectObjects(params));

  /**
   * A connection let go anywhere over an object (not only on one of its connection points)
   * connects to it, on the side facing where it comes from.
   */
  const onConnectEnd = (event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
    setConnecting(false);
    if (locked || state.isValid || !state.fromNode) return;
    const pointer = 'changedTouches' in event ? event.changedTouches[0] : event;
    if (!pointer) return;
    const at = flow.screenToFlowPosition({ x: pointer.clientX, y: pointer.clientY });
    const fromId = state.fromNode.id;
    const target = [...nodes].reverse().find(node => {
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

  // ----- Variants
  // A variant made its own Studio flow: a new board, and it leaves this one
  const split = (key: string) => {
    const leaving = variants.find(candidate => candidate.key === key);
    if (!leaving || !boardFlow?.studio) return;
    // eslint-disable-next-line no-alert
    if (
      !window.confirm(
        `Make ${leaving.label} (${key}) its own Studio flow? It becomes a new board, with a template of its own, and leaves this one.`,
      )
    )
      return;
    void dispatch(splitVariant(key));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (isTyping(event.target)) return;
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;
    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey) dispatch(undo());
    else if (key === 'y' || (key === 'z' && event.shiftKey)) dispatch(redo());
    else if (key === 'c') dispatch(copySelection());
    else if (key === 'v') dispatch(pasteClipboard());
    else if (key === 'd') dispatch(duplicateSelection());
    else return;
    event.preventDefault();
  };

  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const endHere = (objectId: string, exit: string, ends?: boolean) => dispatch(exitEnded({ objectId, exit, ends }));

  // The board as it is now, for the exports
  const currentBoard = () => ({ ...board, content });
  const openTasks = openTaskCount(nodes);

  const statusText: Record<BoardSaveState, string> = {
    saved: 'All changes saved',
    unsaved: 'Unsaved changes…',
    saving: 'Saving…',
    retrying: 'Couldn’t save, trying again…',
    conflict: 'Not saved',
    error: 'Could not save',
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- dnd-kit's attributes make it a focusable button
    <div className={`flow-editor ${mode}`} onKeyDown={onKeyDown}>
      <div className="flow-toolbar">
        <button type="button" className="link-button" onClick={close}>
          ← Boards
        </button>
        <h2>{title || 'Untitled board'}</h2>
        <span className="flow-board-code">
          {board.code === '_templates' ? 'Aselo template' : board.code.toUpperCase()}
        </span>
        {board.code !== TEMPLATES_CODE && (
          <DesignStatusPicker
            status={status}
            isNew={!isImportedBoard(content)}
            editable={!readOnly}
            onChange={next => dispatch(statusChanged(next))}
            label="Board status"
          />
        )}
        <span className="flow-variants flow-mode" role="tablist" aria-label="Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sketch'}
            title="The flow's shape: kinds, names and ways out (no scripts, recordings or settings)"
            onClick={() => dispatch(switchMode('sketch'))}
          >
            <PenLine size={14} aria-hidden /> Sketch
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'design'}
            title="Every detail: scripts, recordings, settings, task attributes"
            onClick={() => dispatch(switchMode('design'))}
          >
            <PencilRuler size={14} aria-hidden /> Build
          </button>
          <button type="button" role="tab" aria-selected={mode === 'test'} onClick={() => dispatch(switchMode('test'))}>
            <FlaskConical size={14} aria-hidden /> Test
          </button>
        </span>
        {/* The Studio flow the board is (an imported board's), as its frame used to say */}
        {boardFlow?.studio && (
          <span
            className="flow-board-source"
            title={`Studio flow template${
              boardFlow.studio.channels.length > 0 ? `, used by ${boardFlow.studio.channels.join(', ')}` : ''
            }`}
          >
            {boardFlow.channel && <span className="flow-board-channel">{boardFlow.channel}</span>}
            <code>{boardFlow.studio.template}</code>
          </span>
        )}
        {readOnly ? (
          <span className="flow-save-state">View only</span>
        ) : (
          <span className={`flow-save-state ${saveState}`} role="status">
            {statusText[saveState]}
          </span>
        )}
        {mode !== 'sketch' && (
          <button
            type="button"
            className="secondary-button flow-refresh"
            title="Check for recordings uploaded or published since the board opened"
            disabled={refreshing || board.code === TEMPLATES_CODE}
            onClick={() => dispatch(loadRecordings())}
          >
            <RefreshCw size={15} aria-hidden /> {refreshing ? 'Refreshing…' : 'Recordings'}
          </button>
        )}
        <span className="flow-export">
          <button
            type="button"
            className="secondary-button"
            aria-expanded={exporting}
            onClick={() => setExporting(!exporting)}
          >
            <Download size={15} aria-hidden /> Export
          </button>
          {exporting && (
            <span className="flow-export-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setExporting(false);
                  downloadScripts(currentBoard(), recordingList);
                }}
              >
                Recordings and scripts (spreadsheet)
              </button>
              {staffMode && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setExporting(false);
                    downloadFlowExport(currentBoard(), recordingList);
                  }}
                >
                  Flows for Claude (JSON)
                </button>
              )}
            </span>
          )}
        </span>
        {!locked && (
          <span className="flow-toolbar-buttons">
            <button
              type="button"
              className="icon-button"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              disabled={!canUndo}
              onClick={() => dispatch(undo())}
            >
              <Undo2 size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Redo"
              title="Redo (Ctrl+Y)"
              disabled={!canRedo}
              onClick={() => dispatch(redo())}
            >
              <Redo2 size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Duplicate"
              title="Duplicate (Ctrl+D)"
              disabled={!hasSelection}
              onClick={() => dispatch(duplicateSelection())}
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Delete"
              title="Delete (Delete)"
              disabled={!hasSelection && !edges.some(edge => edge.selected)}
              onClick={deleteSelected}
            >
              <Trash2 size={16} />
            </button>
          </span>
        )}
      </div>

      {/* A template other helplines use too: where a change to its widgets goes */}
      {(boardFlow?.studio?.sharedWith?.length ?? 0) > 0 && boardFlow?.studio && (
        <div className={`flow-shared-bar ${boardFlow.studio.changeShared ? 'everyone' : ''}`}>
          <span
            className="flow-shared-label"
            title={boardFlow.studio.sharedWith!.map(code => code.toUpperCase()).join(', ')}
          >
            <Users size={15} aria-hidden /> Shared template, also used by{' '}
            {boardFlow.studio.sharedWith!.length <= 5
              ? boardFlow.studio.sharedWith!.map(code => code.toUpperCase()).join(', ')
              : `${boardFlow.studio
                  .sharedWith!.slice(0, 4)
                  .map(code => code.toUpperCase())
                  .join(', ')} and ${boardFlow.studio.sharedWith!.length - 4} more`}
          </span>
          <span className="field-hint">
            {boardFlow.studio.changeShared
              ? 'Changes to widgets and connections go to the shared template: every one of these helplines changes too.'
              : `Changes to widgets and connections give ${board.code.toUpperCase()} a copy of its own; texts are always its own.`}
          </span>
          {staffMode && !readOnly && (
            <label className="field-checkbox flow-shared-switch">
              <input
                type="checkbox"
                checked={Boolean(boardFlow.studio.changeShared)}
                onChange={e =>
                  dispatch(
                    flowChanged({
                      ...boardFlow,
                      studio: { ...boardFlow.studio!, changeShared: e.target.checked || undefined },
                    }),
                  )
                }
              />
              <span>Change the shared template for every helpline</span>
            </label>
          )}
        </div>
      )}

      {/* Studio flows sharing this template: whose texts and recordings are shown */}
      {(variants.length > 1 || (variants.length === 1 && !readOnly)) && (
        <div className="flow-variant-bar">
          <span className="flow-variant-bar-label">
            <Languages size={15} aria-hidden /> Flows sharing this template
          </span>
          <span className="flow-variants" role="tablist" aria-label="Flows sharing this template">
            {variants.map(candidate => (
              <button
                key={candidate.key}
                type="button"
                role="tab"
                aria-selected={candidate.key === variant?.key}
                title={`${candidate.key}: its texts and recordings (folder ${candidate.recordingsFolder})`}
                onClick={() => dispatch(variantShown(candidate.key))}
              >
                {candidate.label}
              </button>
            ))}
          </span>
          {!readOnly && (
            <select
              className="flow-variant-add"
              aria-label="Add a language"
              value=""
              onChange={e => dispatch(languageAdded({ locale: e.target.value }))}
            >
              <option value="">+ Add a language</option>
              {VARIANT_LANGUAGES.filter(
                ({ locale }) =>
                  !variants.some(candidate => candidate.key === variantInLanguage(variants[0], locale, '').key),
              ).map(({ locale, label }) => (
                <option key={locale} value={locale}>
                  {label} ({locale})
                </option>
              ))}
            </select>
          )}
          {variant && (
            <span className="field-hint flow-variant-bar-hint">
              Scripts and recordings shown: <code>{variant.key}</code>. Widgets and connections are the same for all.
            </span>
          )}
          {!readOnly && variant && variant.key !== mainVariant && (
            <button type="button" className="link-button flow-variant-split" onClick={() => split(variant.key)}>
              Make {variant.label} its own flow
            </button>
          )}
        </div>
      )}

      {conflict && (
        <div className="alert alert-error">
          {conflict.updatedBy ?? 'Someone else'} changed this board
          {conflict.updatedAt ? ` at ${new Date(conflict.updatedAt).toLocaleString()}` : ''}, so your latest changes
          weren&apos;t saved. Reload to see theirs (your unsaved changes here will be lost).{' '}
          <button type="button" className="secondary-button" onClick={() => dispatch(loadOpenBoard())}>
            Reload
          </button>
        </div>
      )}
      {saveState === 'error' && saveError && (
        <div className="alert alert-error" role="alert">
          <strong>Your changes couldn’t be saved</strong> ({saveError}). They’re still here in this page: don’t close or
          reload it until they’re saved.{' '}
          <button type="button" className="link-button" onClick={() => dispatch(retryBoardSave())}>
            Try again
          </button>
          <span className="muted">
            {' '}
            If it keeps happening, check your internet connection or contact the Aselo team.
          </span>
        </div>
      )}

      <div className="flow-workspace">
        {!locked && <Palette onAdd={item => add(item)} />}
        <div
          className={connecting ? 'flow-canvas connecting' : 'flow-canvas'}
          ref={wrapper}
          onDragOver={event => {
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
            onNodesChange={changes => dispatch(nodesChanged(changes))}
            onEdgesChange={changes => dispatch(edgesChanged(changes))}
            onConnect={connect}
            onConnectStart={() => setConnecting(true)}
            onConnectEnd={onConnectEnd}
            connectionRadius={36}
            isValidConnection={params => isValidConnection(nodes, params)}
            onNodeClick={() => mode === 'design' && dispatch(sideTabShown('settings'))}
            onEdgeClick={() => mode === 'design' && dispatch(sideTabShown('settings'))}
            onNodeDragStop={(_, __, dragged) => {
              if (locked) return;
              dispatch(nodesReparented(dragged.filter(node => node.type !== 'frame').map(node => node.id)));
            }}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{ type: 'connection', markerEnd: ARROW }}
            nodesDraggable={!locked}
            nodesConnectable={!locked}
            edgesReconnectable={!locked}
            onReconnect={(oldEdge, connection) => dispatch(reconnectConnection(oldEdge, connection))}
            deleteKeyCode={locked ? null : ['Backspace', 'Delete']}
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
              nodeColor={node => {
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
        <aside className="flow-sidebar" aria-label="Side panel" style={{ width: sidebar.width }}>
          <SidebarResizer width={sidebar.width} onResize={sidebar.setWidth} onDone={sidebar.keep} />
          <div className="flow-sidebar-tabs" role="tablist">
            {mode === 'test' && (
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === 'test'}
                onClick={() => dispatch(sideTabShown('test'))}
              >
                Test
              </button>
            )}
            <button
              type="button"
              role="tab"
              aria-selected={sideTab === 'settings'}
              onClick={() => dispatch(sideTabShown('settings'))}
            >
              Settings
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sideTab === 'tasks'}
              onClick={() => dispatch(sideTabShown('tasks'))}
            >
              Tasks{openTasks > 0 ? ` (${openTasks})` : ''}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sideTab === 'check'}
              className={errorCount > 0 ? 'has-errors' : ''}
              onClick={() => dispatch(sideTabShown('check'))}
            >
              Check{issues.length > 0 ? ` (${issues.length})` : ''}
            </button>
            {mode !== 'sketch' && (
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === 'recordings'}
                onClick={() => dispatch(sideTabShown('recordings'))}
              >
                Recordings
              </button>
            )}
          </div>
          {sideTab === 'test' && mode === 'test' && <SimulatorPanel />}
          {sideTab === 'recordings' && <RecordingsPanel />}
          {sideTab === 'check' && (
            <CheckPanel
              issues={issues}
              ignored={ignoredIssues}
              readOnly={locked}
              onShow={showNode}
              onEndHere={endHere}
              onIgnore={(key, ignore) => dispatch(checkIgnored({ key, ignore }))}
            />
          )}
          {sideTab === 'settings' && <Inspector />}
          {sideTab === 'tasks' && <TasksPanel />}
        </aside>
      </div>
    </div>
  );
};

export const BoardEditor = () => (
  <ReactFlowProvider>
    <Editor />
  </ReactFlowProvider>
);
