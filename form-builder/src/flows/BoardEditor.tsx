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
import { Copy, Download, Languages, Redo2, RefreshCw, Trash2, Undo2, Users } from 'lucide-react';
import { boardChecks, issuesByObject, splitIgnored } from './checks';
import { downloadFlowExport, downloadScripts } from './exports';
import { CheckPanel } from './CheckPanel';
import type { RecordingsList } from './recordings';
import { standardRecordingName } from './recordings';
import { RecordingActions, RecordingsPanel } from './RecordingControls';
import type { BoardClient } from './boardClient';
import type { Board, BoardContent, FlowObjectType, Person } from './model';
import {
  ASELO_PEOPLE_CODE,
  designOf,
  flowDetailsOf,
  messageFor,
  isImportedBoard,
  objectColor,
  OBJECT_TYPES,
  statusOf,
  STICKY_COLORS,
  TEMPLATES_CODE,
} from './model';
import type { DesignStatus } from '../designStatus';
import { STATUS_AFTER_CHANGE } from '../designStatus';
import { DesignStatusPicker } from '../components/DesignStatusPicker';
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
  // Acting as Aselo staff: exports the JSON for Claude, approves and publishes recordings
  staffMode: boolean;
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

const Editor = ({ board, client, readOnly, userName, userEmail, staffMode, onClose, onReload }: Props) => {
  const flow = useReactFlow<CanvasNode, ConnectionEdge>();
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(toNodes(board.content));
  const [edges, setEdges, onEdgesChange] = useEdgesState<ConnectionEdge>(toEdges(board.content));
  const [title, setTitle] = useState(board.content.title);
  const wrapper = useRef<HTMLDivElement>(null);
  // Show the whole board when opening it; an empty board keeps the view still as things are added
  const [fitOnOpen] = useState(() => nodes.length > 0);

  const [status, setStatus] = useState<DesignStatus>(() => statusOf(board.content));
  // Warnings marked as not needed here; like the status, not part of the canvas (nor of undo)
  const [ignoredChecks, setIgnoredChecks] = useState<string[]>(() => board.content.ignoredChecks ?? []);
  // What's on the canvas; the status isn't part of it (nor of undo)
  const canvasContent = useMemo(() => toContent(title, nodes, edges), [title, nodes, edges]);
  const canvasJson = useMemo(() => JSON.stringify(canvasContent), [canvasContent]);
  // What the board's objects outside frames are (an imported board's Studio flow); not on the canvas either
  const [boardFlow, setBoardFlow] = useState(board.content.flow);
  // Studio flows sharing this template (FlowDetails.variants): which one is shown (texts, recordings)
  const variants = boardFlow?.variants ?? [];
  const mainVariant = variants[0]?.key;
  const [variantKey, setVariantKey] = useState(mainVariant);
  const variant = variants.find((candidate) => candidate.key === variantKey) ?? variants[0];
  const content = useMemo(
    () => ({
      ...canvasContent,
      status,
      ...(boardFlow ? { flow: boardFlow } : {}),
      ...(ignoredChecks.length > 0 ? { ignoredChecks } : {}),
    }),
    [canvasContent, status, boardFlow, ignoredChecks],
  );
  const json = useMemo(() => JSON.stringify(content), [content]);
  const dragging = nodes.some((node) => node.dragging);

  // ----- Status: every change goes through the canvas, so a change to the design (not to comments
  // or stickies) is seen here, and means the board is being worked on again
  const design = useMemo(() => designOf(canvasContent), [canvasContent]);
  const lastDesign = useRef(design);
  useEffect(() => {
    if (design === lastDesign.current) return;
    lastDesign.current = design;
    if (!readOnly) setStatus(STATUS_AFTER_CHANGE);
  }, [design, readOnly]);

  // ----- Undo and redo: snapshots of the board, taken when it stops changing
  const history = useRef({ stack: [canvasJson], index: 0 });
  const [, setHistoryVersion] = useState(0);

  useEffect(() => {
    if (dragging) return undefined;
    const timer = setTimeout(() => {
      const { current } = history;
      if (current.stack[current.index] === canvasJson) return;
      current.stack = [...current.stack.slice(0, current.index + 1), canvasJson].slice(-HISTORY_LIMIT);
      current.index = current.stack.length - 1;
      setHistoryVersion((version) => version + 1);
    }, HISTORY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [canvasJson, dragging]);

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

  // A variant made its own Studio flow: a new board where its texts are the board's own (its recordings
  // stay in its folder), flagged so the export asks for a template of its own; it leaves this board
  const splitVariant = async (key: string) => {
    const leaving = variants.find((candidate) => candidate.key === key);
    if (!leaving || !boardFlow?.studio) return;
    // eslint-disable-next-line no-alert
    if (
      !window.confirm(
        `Make ${leaving.label} (${key}) its own Studio flow? It becomes a new board, with a template of its own, and leaves this one.`,
      )
    )
      return;
    const template = boardFlow.studio.template;
    const objects = content.objects.map(({ variantMessages, ...object }) => {
      const own = variantMessages?.[key];
      return {
        ...object,
        message: messageFor({ ...object, variantMessages }, key, mainVariant),
        ...(object.studio && own ? { studio: { ...object.studio, importedScript: own.importedScript } } : {}),
      };
    });
    try {
      const created = await client.create(board.code, `${title} (${leaving.label})`, undefined, {
        ...content,
        title: `${title} (${leaving.label})`,
        objects,
        flow: {
          ...boardFlow,
          variants: [leaving],
          ownTemplate: { suggested: template.replace(/\.tftpl$/, `-${key.split('_').pop()}.tftpl`) },
        },
        status: STATUS_AFTER_CHANGE,
      });
      setBoardFlow({ ...boardFlow, variants: variants.filter((candidate) => candidate.key !== key) });
      setVariantKey(mainVariant);
      setNodes((current) =>
        current.map((node) => {
          if (node.type !== 'object' || !node.data.object.variantMessages?.[key]) return node;
          const { [key]: removed, ...others } = node.data.object.variantMessages;
          return {
            ...node,
            data: {
              object: { ...node.data.object, variantMessages: Object.keys(others).length > 0 ? others : undefined },
            },
          };
        }),
      );
      setNotice(`${leaving.label} is now its own board: “${created.content.title}”.`);
    } catch (err) {
      setNotice((err as Error).message);
    }
  };
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
  const [sideTab, setSideTab] = useState<'settings' | 'tasks' | 'check' | 'recordings'>('settings');

  // ----- Recordings: loaded when the board opens, after every change, and with Refresh
  const [recordingList, setRecordingList] = useState<RecordingsList>();
  const [recordingsUnavailable, setRecordingsUnavailable] = useState<string>();
  const [busyFiles, setBusyFiles] = useState<Set<string>>(() => new Set());
  const [refreshing, setRefreshing] = useState(false);

  // The helpline's recordings, or the shown variant's own folder (flows sharing a template)
  const recordingsLibrary = variant ? `${board.code}/f/${variant.recordingsFolder}` : board.code;
  const loadRecordings = useCallback(async () => {
    if (board.code === TEMPLATES_CODE) {
      setRecordingsUnavailable('Templates have no recordings: each helpline records its own.');
      return;
    }
    setRefreshing(true);
    try {
      setRecordingList(await client.recordings(recordingsLibrary));
      setRecordingsUnavailable(undefined);
    } catch (err) {
      setRecordingsUnavailable((err as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [client, board.code, recordingsLibrary]);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  /**
   * Recordings given their standard names (the widget's): each file is copied under the new name, in
   * every folder the board's flows play from (each variant's), and the widgets stop pointing at the
   * old name. A file not uploaded yet just takes the new name.
   */
  const renameRecordings = async (objectIds: string[]) => {
    const libraries =
      variants.length > 0 ? variants.map((candidate) => `${board.code}/f/${candidate.recordingsFolder}`) : [board.code];
    const renamed = new Set<string>();
    for (const id of objectIds) {
      const object = content.objects.find((candidate) => candidate.id === id);
      const from = object?.message?.recordingFile;
      if (!object?.studioName || !from) continue;
      const to = standardRecordingName(object.studioName, from);
      try {
        for (const library of libraries) {
          await client.copyRecording(library, from, to).catch((err: Error) => {
            // Not uploaded in that folder: nothing to copy
            if (!/no .* to copy/i.test(err.message)) throw err;
          });
        }
        renamed.add(id);
      } catch (err) {
        setNotice(`${from}: ${(err as Error).message}`);
      }
    }
    setNodes((current) =>
      current.map((node) => {
        if (node.type !== 'object' || !renamed.has(node.id)) return node;
        const { recordingFile, ...message } = node.data.object.message ?? {};
        return { ...node, data: { object: { ...node.data.object, message } } };
      }),
    );
    await loadRecordings();
    if (renamed.size > 0) {
      setNotice(
        `${renamed.size} recording${renamed.size === 1 ? '' : 's'} renamed to the standard (copied; the old files are kept).`,
      );
    }
  };

  const changeRecording = async (fileName: string, change: () => Promise<RecordingsList>) => {
    setBusyFiles((current) => new Set(current).add(fileName));
    try {
      setRecordingList(await change());
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusyFiles((current) => {
        const next = new Set(current);
        next.delete(fileName);
        return next;
      });
    }
  };

  const recordingActions: RecordingActions = {
    list: recordingList,
    unavailable: recordingsUnavailable,
    busy: busyFiles,
    staff: staffMode,
    readOnly,
    upload: (fileName, file) =>
      changeRecording(fileName, () => client.uploadRecording(recordingsLibrary, fileName, file)),
    approve: (fileName, approved) =>
      changeRecording(fileName, () => client.approveRecording(recordingsLibrary, fileName, approved)),
    publish: (fileName) => changeRecording(fileName, () => client.publishRecording(recordingsLibrary, fileName)),
    remove: (fileName) => changeRecording(fileName, () => client.removeRecording(recordingsLibrary, fileName)),
    rename: (objectIds) => renameRecordings(objectIds),
  };
  // Who tasks can be assigned to: the helpline's people and the Aselo team
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const codes = board.code === TEMPLATES_CODE ? [ASELO_PEOPLE_CODE] : [board.code, ASELO_PEOPLE_CODE];
    Promise.all(codes.map((code) => client.people(code).catch((): Person[] => []))).then((lists) =>
      setPeople(mergePeople(lists)),
    );
  }, [client, board.code]);
  const allIssues = useMemo(() => boardChecks(content, recordingList?.recordings), [content, recordingList]);
  const { active: issues, ignored: ignoredIssues } = useMemo(
    () => splitIgnored(allIssues, ignoredChecks),
    [allIssues, ignoredChecks],
  );
  const ignoreCheck = (key: string, ignore: boolean) =>
    setIgnoredChecks((current) =>
      ignore ? [...new Set([...current, key])] : current.filter((other) => other !== key),
    );
  const problems = useMemo(() => issuesByObject(issues), [issues]);
  const editingContext = useMemo(() => ({ readOnly, problems }), [readOnly, problems]);
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;

  // A way out left unconnected on purpose: the flow ends there
  const endHere = (objectId: string, exit: string, ends = true) =>
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== objectId || node.type !== 'object') return node;
        const others = (node.data.object.endedExits ?? []).filter((candidate) => candidate !== exit);
        const endedExits = ends ? [...others, exit] : others;
        return {
          ...node,
          data: { object: { ...node.data.object, endedExits: endedExits.length > 0 ? endedExits : undefined } },
        };
      }),
    );

  // The board as it is now, for the exports
  const currentBoard = () => ({ ...board, content });
  const [exporting, setExporting] = useState(false);
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
          {board.code !== TEMPLATES_CODE && (
            <DesignStatusPicker
              status={status}
              isNew={!isImportedBoard(content)}
              editable={!readOnly}
              onChange={setStatus}
              label="Board status"
            />
          )}
          {/* The Studio flow the board is (an imported board's), as its frame used to say */}
          {boardFlow?.studio && (
            <span
              className="flow-board-source"
              title={`Studio flow template${boardFlow.studio.channels.length > 0 ? `, used by ${boardFlow.studio.channels.join(', ')}` : ''}`}
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
          <button
            type="button"
            className="secondary-button flow-refresh"
            title="Check for recordings uploaded or published since the board opened"
            disabled={refreshing || board.code === TEMPLATES_CODE}
            onClick={loadRecordings}
          >
            <RefreshCw size={15} aria-hidden /> {refreshing ? 'Refreshing…' : 'Recordings'}
          </button>
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

        {/* A template other helplines use too: where a change to its widgets goes */}
        {(boardFlow?.studio?.sharedWith?.length ?? 0) > 0 && boardFlow?.studio && (
          <div className={`flow-shared-bar ${boardFlow.studio.changeShared ? 'everyone' : ''}`}>
            <span
              className="flow-shared-label"
              title={boardFlow.studio.sharedWith!.map((code) => code.toUpperCase()).join(', ')}
            >
              <Users size={15} aria-hidden /> Shared template, also used by{' '}
              {boardFlow.studio.sharedWith!.length <= 5
                ? boardFlow.studio.sharedWith!.map((code) => code.toUpperCase()).join(', ')
                : `${boardFlow.studio
                    .sharedWith!.slice(0, 4)
                    .map((code) => code.toUpperCase())
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
                  onChange={(e) =>
                    setBoardFlow({
                      ...boardFlow,
                      studio: { ...boardFlow.studio!, changeShared: e.target.checked || undefined },
                    })
                  }
                />
                <span>Change the shared template for every helpline</span>
              </label>
            )}
          </div>
        )}

        {/* Studio flows sharing this template: whose texts and recordings are shown */}
        {variants.length > 1 && (
          <div className="flow-variant-bar">
            <span className="flow-variant-bar-label">
              <Languages size={15} aria-hidden /> Flows sharing this template
            </span>
            <span className="flow-variants" role="tablist" aria-label="Flows sharing this template">
              {variants.map((candidate) => (
                <button
                  key={candidate.key}
                  type="button"
                  role="tab"
                  aria-selected={candidate.key === variant?.key}
                  title={`${candidate.key}: its texts and recordings (folder ${candidate.recordingsFolder})`}
                  onClick={() => setVariantKey(candidate.key)}
                >
                  {candidate.label}
                </button>
              ))}
            </span>
            {variant && (
              <span className="field-hint flow-variant-bar-hint">
                Scripts and recordings shown: <code>{variant.key}</code>. Widgets and connections are the same for all.
              </span>
            )}
            {!readOnly && variant && variant.key !== mainVariant && (
              <button
                type="button"
                className="link-button flow-variant-split"
                onClick={() => splitVariant(variant.key)}
              >
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
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === 'check'}
                className={errorCount > 0 ? 'has-errors' : ''}
                onClick={() => setSideTab('check')}
              >
                Check{issues.length > 0 ? ` (${issues.length})` : ''}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sideTab === 'recordings'}
                onClick={() => setSideTab('recordings')}
              >
                Recordings
              </button>
            </div>
            {sideTab === 'recordings' && (
              <RecordingsPanel
                messages={content.objects.map((object) => ({
                  object: { ...object, message: messageFor(object, variant?.key, mainVariant) },
                  frame: flowDetailsOf(content, object.frameId),
                }))}
                actions={recordingActions}
                onShow={showNode}
                onRefresh={loadRecordings}
              />
            )}
            {sideTab === 'check' && (
              <CheckPanel
                issues={issues}
                ignored={ignoredIssues}
                readOnly={readOnly}
                onShow={showNode}
                onEndHere={endHere}
                onIgnore={ignoreCheck}
              />
            )}
            {sideTab === 'settings' && (
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
                onEndHere={endHere}
                recordings={recordingActions}
                variant={variant?.key}
              />
            )}
            {sideTab === 'tasks' && (
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
