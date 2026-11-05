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
 * The open board: what's on its canvas (React Flow's nodes and edges, kept here and given to React
 * Flow), its title, status and flow, the mode it's in, the side panel's tab, undo history, the
 * clipboard, and saving. Every change is saved a moment after the last one (startFlowsListeners);
 * if someone else saved the board in between, saving stops and asks to reload, so nobody's work is
 * overwritten silently.
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection as FlowConnection,
  type EdgeChange,
  type NodeChange,
  reconnectEdge,
} from '@xyflow/react';
import {
  ASELO_PEOPLE_CODE,
  type Board,
  type BoardContent,
  designOf,
  type FlowDetails,
  flowDetailsOf,
  type FlowObject,
  type FlowObjectType,
  type FlowVariant,
  messageFor,
  OBJECT_TYPES,
  type Person,
  sharedLanguageVariants,
  statusOf,
  TEMPLATES_CODE,
  type TestedPath,
  toSnake,
  VARIANT_LANGUAGES,
  variantInLanguage,
  variesByVariant,
} from '@tech-matters/form-builder-shared/flows/model';
import { type DesignStatus, STATUS_AFTER_CHANGE } from '@tech-matters/form-builder-shared/designStatus';
import {
  boardChecks,
  issuesByObject,
  sketchIssues,
  splitIgnored,
} from '@tech-matters/form-builder-shared/flows/checks';
import { approvalOf } from '@tech-matters/form-builder-shared/flows/recordings';

import { type AppThunk, rootReducer, type RootState } from '../app/store';
import { selectActingAsStaff, selectUser } from '../app/sessionSlice';
import { HelplineChoices, NO_HELPLINE_CHOICES } from './boardClient';
import {
  ARROW,
  CanvasNode,
  ConnectionEdge,
  createFrameNode,
  createObjectNode,
  createStickyNode,
  duplicate,
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
import type { PaletteItem } from './Palette';
import { coverageOf, type SimRun, testedPathOf, validTestedPaths, visitedBy } from './simulate';

type BoardMode = 'sketch' | 'design' | 'test';

export type BoardSaveState = 'saved' | 'unsaved' | 'saving' | 'retrying' | 'conflict' | 'error';

type SideTab = 'test' | 'settings' | 'tasks' | 'check' | 'recordings';

export type TaskFilter = 'open' | 'mine' | 'all';

type BoardConflict = { updatedBy?: string; updatedAt?: string };

const HISTORY_LIMIT = 100;

type BoardState = {
  // The board as loaded (its content is what follows, as it's being changed)
  board?: Omit<Board, 'content'>;
  // Goes up each time a board is opened (or reloaded), so its editor starts afresh
  opened: number;
  nodes: CanvasNode[];
  edges: ConnectionEdge[];
  title: string;
  // The status, the warnings ignored and the runs marked as tested aren't part of the canvas (nor of undo)
  status: DesignStatus;
  ignoredChecks: string[];
  testedPaths: TestedPath[];
  // What the board's objects outside frames are (an imported board's Studio flow); not on the canvas either
  flow?: FlowDetails;
  // Studio flows sharing this template (FlowDetails.variants): which one is shown (texts, recordings)
  variantKey?: string;
  // Sketch: the flow's shape only (kinds, names, ways out); Build (design): every detail; Test: flows
  // are run (simulate.ts) and the board can't be changed
  mode: BoardMode;
  sideTab: SideTab;
  // Why something wasn't done (e.g. a connection), shown for a few seconds
  notice?: string;
  // Undo and redo: snapshots of the canvas, taken when it stops changing
  history: { stack: string[]; index: number };
  // What was copied (Ctrl+C), and how many times it's been pasted (each paste a step further)
  clipboard?: { nodes: CanvasNode[]; edges: ConnectionEdge[]; pastes: number };
  // What the server has, and its revision, so two people can't overwrite each other unknowingly
  savedJson: string;
  revision: number;
  saveState: BoardSaveState;
  saveError?: string;
  // Saves that failed in a row (a lost connection, the server down): retried a few times, then
  // the error is shown until a save works
  failedSaves: number;
  // Someone else saved in between: saving stops
  conflict?: BoardConflict;
  // Who tasks can be assigned to: only the board's helpline's people (Aselo staff included, once
  // added to it). Templates belong to no helpline, so theirs are the Aselo team's.
  people: Person[];
  // The helpline's chatbots, queues, workflows and skills, offered in objects' settings (none for
  // templates or without designs)
  helplineChoices: HelplineChoices;
  // The Tasks tab's filter
  tasksFilter: TaskFilter;
};

const initialState: BoardState = {
  opened: 0,
  nodes: [],
  edges: [],
  title: '',
  status: STATUS_AFTER_CHANGE,
  ignoredChecks: [],
  testedPaths: [],
  mode: 'design',
  sideTab: 'settings',
  history: { stack: [], index: 0 },
  savedJson: '',
  revision: 0,
  saveState: 'saved',
  failedSaves: 0,
  people: [],
  helplineChoices: NO_HELPLINE_CHOICES,
  tasksFilter: 'open',
};

const canvasJsonOf = (state: Pick<BoardState, 'title' | 'nodes' | 'edges'>) =>
  JSON.stringify(toContent(state.title, state.nodes, state.edges));

// The canvas as it was in a snapshot
const restore = (state: BoardState, snapshot: string) => {
  const restored = JSON.parse(snapshot) as BoardContent;
  state.nodes = toNodes(restored);
  state.edges = toEdges(restored);
  state.title = restored.title;
};

// Changes the objects whose messages can differ per variant
const mapVariantObjects = (
  nodes: CanvasNode[],
  change: (object: ObjectNode['data']['object'], node: ObjectNode) => ObjectNode['data']['object'],
): CanvasNode[] =>
  nodes.map(node =>
    node.type !== 'object' || !variesByVariant(node.data.object)
      ? node
      : { ...node, data: { object: change(node.data.object, node) } },
  );

// Each object's other languages' messages (variantMessages), changed for every object that has them
const withVariantMessages = (
  nodes: CanvasNode[],
  change: (messages: NonNullable<FlowObject['variantMessages']>) => FlowObject['variantMessages'],
) =>
  mapVariantObjects(nodes, current => {
    const variantMessages = change(current.variantMessages ?? {});
    const { variantMessages: _old, ...object } = current;
    return variantMessages && Object.keys(variantMessages).length > 0 ? { ...object, variantMessages } : object;
  });

const variantsOf = (state: BoardState): FlowVariant[] => state.flow?.variants ?? [];

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    boardOpened: (state, action: PayloadAction<{ board: Board; mode: BoardMode }>) => {
      const { board, mode } = action.payload;
      const { content, ...rest } = board;
      const nodes = toNodes(content);
      const edges = toEdges(content);
      return {
        ...initialState,
        board: rest,
        opened: state.opened + 1,
        nodes,
        edges,
        title: content.title,
        status: statusOf(content),
        ignoredChecks: content.ignoredChecks ?? [],
        testedPaths: content.testedPaths ?? [],
        flow: content.flow,
        variantKey: content.flow?.variants?.[0]?.key,
        mode,
        history: { stack: [canvasJsonOf({ title: content.title, nodes, edges })], index: 0 },
        savedJson: JSON.stringify(content),
        revision: board.meta.revision,
      };
    },
    boardClosed: () => initialState,

    // ----- React Flow's own changes (moving, resizing, selecting, removing)
    nodesChanged: (state, action: PayloadAction<NodeChange<CanvasNode>[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
    },
    edgesChanged: (state, action: PayloadAction<EdgeChange<ConnectionEdge>[]>) => {
      state.edges = applyEdgeChanges(action.payload, state.edges);
    },

    // ----- Adding (the new nodes come selected; nothing else stays selected)
    nodesAdded: (state, action: PayloadAction<{ nodes: CanvasNode[]; edges?: ConnectionEdge[] }>) => {
      state.nodes = [...state.nodes.map(node => ({ ...node, selected: false })), ...action.payload.nodes];
      state.edges = [...state.edges.map(edge => ({ ...edge, selected: false })), ...(action.payload.edges ?? [])];
    },
    edgeAdded: (state, action: PayloadAction<ConnectionEdge>) => {
      state.notice = undefined;
      state.edges.push(action.payload);
    },
    edgeReconnected: (
      state,
      action: PayloadAction<{ oldEdge: ConnectionEdge; connection: FlowConnection; exit?: string }>,
    ) => {
      const { oldEdge, connection, exit } = action.payload;
      state.edges = reconnectEdge(oldEdge, connection, state.edges, { shouldReplaceId: false }).map(edge =>
        edge.id === oldEdge.id ? { ...edge, data: { exit } } : edge,
      );
    },

    // ----- Changing
    titleChanged: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    statusChanged: (state, action: PayloadAction<DesignStatus>) => {
      state.status = action.payload;
    },
    nodeDataChanged: (state, action: PayloadAction<{ id: string; data: CanvasNode['data'] }>) => {
      const { id, data } = action.payload;
      state.nodes = state.nodes.map(node => (node.id === id ? ({ ...node, data } as CanvasNode) : node));
    },
    objectTypeChanged: (state, action: PayloadAction<{ id: string; type: FlowObjectType }>) => {
      const { id, type } = action.payload;
      state.nodes = state.nodes.map(node => {
        if (node.id !== id || node.type !== 'object') return node;
        const info = OBJECT_TYPES[type];
        // (A profile check starts with its own: its flags, not blocked and failed)
        // eslint-disable-next-line no-nested-ternary
        const exits = info.editableExits
          ? type === 'checkClientProfile'
            ? info.exits
            : node.data.object.exits ?? info.exits
          : undefined;
        return { ...node, data: { object: { ...node.data.object, type, exits: exits ? [...exits] : undefined } } };
      });
    },
    exitsRenamed: (
      state,
      action: PayloadAction<{ id: string; exits: string[]; renamed?: { from: string; to: string } }>,
    ) => {
      const { id, exits, renamed } = action.payload;
      state.nodes = state.nodes.map(node => {
        if (node.id !== id || node.type !== 'object') return node;
        // A split's operators follow their way out (and go with it)
        const operators = Object.entries(node.data.object.exitOperators ?? {})
          .map(([exit, type]) => [exit === renamed?.from ? renamed.to : exit, type])
          .filter(([exit]) => exits.includes(exit));
        const exitOperators = operators.length > 0 ? Object.fromEntries(operators) : undefined;
        return { ...node, data: { object: { ...node.data.object, exits, exitOperators } } };
      });
      if (renamed) {
        state.edges = state.edges.map(edge =>
          edge.source === id && edge.data?.exit === renamed.from ? { ...edge, data: { exit: renamed.to } } : edge,
        );
      }
    },
    edgeExitChanged: (state, action: PayloadAction<{ id: string; exit: string | undefined }>) => {
      const { id, exit } = action.payload;
      state.edges = state.edges.map(edge => (edge.id === id ? { ...edge, data: { exit } } : edge));
    },
    // A way out left unconnected on purpose: the flow ends there
    exitEnded: (state, action: PayloadAction<{ objectId: string; exit: string; ends?: boolean }>) => {
      const { objectId, exit, ends = true } = action.payload;
      state.nodes = state.nodes.map(node => {
        if (node.id !== objectId || node.type !== 'object') return node;
        const others = (node.data.object.endedExits ?? []).filter(candidate => candidate !== exit);
        const endedExits = ends ? [...others, exit] : others;
        return {
          ...node,
          data: { object: { ...node.data.object, endedExits: endedExits.length > 0 ? endedExits : undefined } },
        };
      });
    },
    // Moved nodes go into the frame they're now over (or out of theirs)
    nodesReparented: (state, action: PayloadAction<string[]>) => {
      state.nodes = action.payload.reduce((result, id) => reparent(result, id), state.nodes);
    },
    // Recordings given their standard names: the widgets stop pointing at the old ones
    recordingFilesCleared: (state, action: PayloadAction<string[]>) => {
      const ids = new Set(action.payload);
      state.nodes = state.nodes.map(node => {
        if (node.type !== 'object' || !ids.has(node.id)) return node;
        const { recordingFile, ...message } = node.data.object.message ?? {};
        return { ...node, data: { object: { ...node.data.object, message } } };
      });
    },
    // Selects one node (or nothing), e.g. to show it
    nodeSelected: (state, action: PayloadAction<string | undefined>) => {
      state.nodes = state.nodes.map(node => ({ ...node, selected: node.id === action.payload }));
      state.edges = state.edges.map(edge => ({ ...edge, selected: false }));
    },

    // ----- The board's flow and the flows sharing its template
    flowChanged: (state, action: PayloadAction<FlowDetails>) => {
      state.flow = action.payload;
    },
    variantShown: (state, action: PayloadAction<string | undefined>) => {
      state.variantKey = action.payload;
    },
    // Another language for the flows sharing this template: a new studio_flows entry (the export asks
    // for it), with its own scripts and recordings folder, empty until written and recorded
    languageAdded: (state, action: PayloadAction<{ locale: string; label?: string }>) => {
      const { locale, label } = action.payload;
      const variants = variantsOf(state);
      const language =
        VARIANT_LANGUAGES.find(candidate => candidate.locale === locale) ?? (label ? { locale, label } : undefined);
      if (!language || !state.flow || variants.length === 0) return;
      const added = variantInLanguage(variants[0], language.locale, language.label);
      if (variants.some(candidate => candidate.key === added.key)) {
        state.notice = `There is already a flow called ${added.key}.`;
        return;
      }
      const code = language.locale.split('-')[0];
      state.flow = { ...state.flow, variants: [...variants, added] };
      state.nodes = mapVariantObjects(state.nodes, object => ({
        ...object,
        variantMessages: { ...object.variantMessages, [added.key]: { language: code } },
      }));
      state.variantKey = added.key;
    },
    // One flow per language sharing this board's template (a new board's, from its languages): each a
    // studio_flows entry to add, named after the board's title; the first language is the board's own
    languagesShared: (state, action: PayloadAction<string[]>) => {
      const languages = action.payload;
      if (languages.length === 0) return;
      const shared = sharedLanguageVariants(state.title, languages);
      state.flow = { ...state.flow, variants: shared };
      state.nodes = state.nodes.map(node => {
        if (node.type !== 'object' || node.parentId || !variesByVariant(node.data.object)) return node;
        const { object } = node.data;
        return {
          ...node,
          data: {
            object: {
              ...object,
              ...(object.message ? { message: { ...object.message, language: languages[0] } } : {}),
              variantMessages: Object.fromEntries(
                shared
                  .slice(1)
                  .map((variant, index) => [
                    variant.key,
                    { ...object.variantMessages?.[variant.key], language: languages[index + 1] },
                  ]),
              ),
            },
          },
        };
      });
      state.variantKey = shared[0].key;
    },
    // Back to one flow, its messages named per language: only for flows added on the board (imported
    // ones are studio_flows entries in the helpline's config); the other languages' texts go
    languagesUnshared: state => {
      const variants = variantsOf(state);
      if (!state.flow || variants.some(candidate => !candidate.added)) return;
      const languages = variants.map(candidate => candidate.key.split('_').pop() ?? candidate.key);
      const { variants: _removed, ...rest } = state.flow;
      state.flow = { ...rest, naming: { ...rest.naming, languages } };
      state.nodes = withVariantMessages(state.nodes, () => undefined);
      state.variantKey = undefined;
    },
    // A language added on the board taken out again (its texts with it)
    languageRemoved: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const variants = variantsOf(state);
      const mainVariant = variants[0]?.key;
      const leaving = variants.find(candidate => candidate.key === key);
      if (!state.flow || !leaving?.added || key === mainVariant) return;
      state.flow = { ...state.flow, variants: variants.filter(candidate => candidate.key !== key) };
      state.nodes = withVariantMessages(state.nodes, ({ [key]: _removed, ...others }) => others);
      if (state.variantKey === key) state.variantKey = mainVariant;
    },
    // A flow added on the board given another studio_flows key (its recordings folder follows when it
    // was the same)
    variantRenamed: (state, action: PayloadAction<{ key: string; renamed: string }>) => {
      const { key, renamed } = action.payload;
      const variants = variantsOf(state);
      const next = toSnake(renamed);
      const variant = variants.find(candidate => candidate.key === key);
      if (!state.flow || !variant?.added || !next || next === key) return;
      if (variants.some(candidate => candidate.key === next)) {
        state.notice = `There is already a flow called ${next}.`;
        return;
      }
      state.flow = {
        ...state.flow,
        variants: variants.map(candidate =>
          candidate.key === key
            ? {
                ...candidate,
                key: next,
                recordingsFolder: candidate.recordingsFolder === key ? next : candidate.recordingsFolder,
              }
            : candidate,
        ),
      };
      state.nodes = withVariantMessages(state.nodes, ({ [key]: moved, ...others }) =>
        moved ? { ...others, [next]: moved } : others,
      );
      if (state.variantKey === key) state.variantKey = next;
    },
    // A variant made its own board: it leaves this one, with its texts
    variantSplitOff: (state, action: PayloadAction<{ key: string; notice: string }>) => {
      const { key, notice } = action.payload;
      const variants = variantsOf(state);
      if (!state.flow) return;
      state.flow = { ...state.flow, variants: variants.filter(candidate => candidate.key !== key) };
      state.variantKey = variants[0]?.key;
      state.nodes = state.nodes.map(node => {
        if (node.type !== 'object' || !node.data.object.variantMessages?.[key]) return node;
        const { [key]: _removed, ...others } = node.data.object.variantMessages;
        return {
          ...node,
          data: {
            object: { ...node.data.object, variantMessages: Object.keys(others).length > 0 ? others : undefined },
          },
        };
      });
      state.notice = notice;
    },

    // ----- Checks and tested paths
    checkIgnored: (state, action: PayloadAction<{ key: string; ignore: boolean }>) => {
      const { key, ignore } = action.payload;
      state.ignoredChecks = ignore
        ? [...new Set([...state.ignoredChecks, key])]
        : state.ignoredChecks.filter(other => other !== key);
    },
    testedPathAdded: (state, action: PayloadAction<TestedPath>) => {
      state.testedPaths.push(action.payload);
      state.notice = 'Path marked as tested: it shows green while nothing on it changes.';
    },
    // One tested path forgotten, or all of them
    testedPathForgotten: (state, action: PayloadAction<string | undefined>) => {
      const pathId = action.payload;
      state.testedPaths = pathId ? state.testedPaths.filter(path => path.id !== pathId) : [];
    },
    testedPathsKept: (state, action: PayloadAction<TestedPath[]>) => {
      state.testedPaths = action.payload;
    },

    // ----- Undo and redo
    historySnapshotTaken: state => {
      if (state.nodes.some(node => node.dragging)) return;
      const json = canvasJsonOf(state);
      const { stack, index } = state.history;
      if (stack[index] === json) return;
      const next = [...stack.slice(0, index + 1), json].slice(-HISTORY_LIMIT);
      state.history = { stack: next, index: next.length - 1 };
    },
    historyUndone: state => {
      if (state.history.index <= 0) return;
      state.history.index -= 1;
      restore(state, state.history.stack[state.history.index]);
    },
    historyRedone: state => {
      if (state.history.index >= state.history.stack.length - 1) return;
      state.history.index += 1;
      restore(state, state.history.stack[state.history.index]);
    },

    // ----- Copying
    copied: (state, action: PayloadAction<{ nodes: CanvasNode[]; edges: ConnectionEdge[] }>) => {
      state.clipboard = { ...action.payload, pastes: 0 };
    },
    pasted: state => {
      if (state.clipboard) state.clipboard.pastes += 1;
    },

    // ----- What's shown
    modeSwitched: (state, action: PayloadAction<BoardMode>) => {
      const next = action.payload;
      state.mode = next;
      if (next === 'test') state.sideTab = 'test';
      else if (state.sideTab === 'test' || (next === 'sketch' && state.sideTab === 'recordings')) {
        state.sideTab = 'settings';
      }
      state.nodes = state.nodes.map(node => (node.selected ? { ...node, selected: false } : node));
    },
    sideTabShown: (state, action: PayloadAction<SideTab>) => {
      state.sideTab = action.payload;
    },
    noticeShown: (state, action: PayloadAction<string>) => {
      state.notice = action.payload;
    },
    noticeDismissed: state => {
      state.notice = undefined;
    },
    tasksFilterChanged: (state, action: PayloadAction<TaskFilter>) => {
      state.tasksFilter = action.payload;
    },
    peopleLoaded: (state, action: PayloadAction<Person[]>) => {
      state.people = action.payload;
    },
    helplineChoicesLoaded: (state, action: PayloadAction<HelplineChoices>) => {
      state.helplineChoices = action.payload;
    },

    // ----- Saving
    saveStateChanged: (state, action: PayloadAction<BoardSaveState>) => {
      state.saveState = action.payload;
    },
    boardSaved: (state, action: PayloadAction<{ revision: number; json: string; latestJson: string }>) => {
      const { revision, json, latestJson } = action.payload;
      state.revision = revision;
      state.savedJson = json;
      state.saveError = undefined;
      state.failedSaves = 0;
      state.saveState = latestJson === json ? 'saved' : 'unsaved';
    },
    saveConflicted: (state, action: PayloadAction<BoardConflict>) => {
      state.failedSaves = 0;
      state.saveError = undefined;
      state.conflict = action.payload;
      state.saveState = 'conflict';
    },
    // Retried while there are retries left (saveRetryDelaysMs), then shown as an error
    saveFailed: (state, action: PayloadAction<{ message: string; retries: number }>) => {
      state.failedSaves += 1;
      state.saveError = action.payload.message;
      state.saveState = state.failedSaves <= action.payload.retries ? 'retrying' : 'error';
    },
    // An edit, or "Try again": a fresh set of retries
    saveRetriesReset: state => {
      state.failedSaves = 0;
    },
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof boardSlice> {}
}

// Added when the store is made (startFlowsListeners): store.ts imports this module through the
// listeners, so it can't be injected as the module loads
export const injectBoardSlice = () => boardSlice.injectInto(rootReducer);

export const {
  nodesChanged,
  edgesChanged,
  titleChanged,
  statusChanged,
  nodeDataChanged,
  objectTypeChanged,
  exitsRenamed,
  edgeExitChanged,
  exitEnded,
  nodesReparented,
  recordingFilesCleared,
  nodeSelected,
  flowChanged,
  variantShown,
  languageAdded,
  languagesShared,
  languagesUnshared,
  languageRemoved,
  variantRenamed,
  checkIgnored,
  testedPathForgotten,
  testedPathsKept,
  historySnapshotTaken,
  sideTabShown,
  noticeShown,
  noticeDismissed,
  tasksFilterChanged,
  modeSwitched,
  boardOpened,
  boardClosed,
  boardSaved,
  saveStateChanged,
  saveFailed,
  saveRetriesReset,
} = boardSlice.actions;
const {
  nodesAdded,
  edgeAdded,
  edgeReconnected,
  variantSplitOff,
  testedPathAdded,
  historyUndone,
  historyRedone,
  copied,
  pasted,
  peopleLoaded,
  helplineChoicesLoaded,
  saveConflicted,
} = boardSlice.actions;

// ---------------------------------------------------------------------------------------------
// Selectors

export const selectBoard = (state: RootState) => state.board ?? initialState;
const selectNodes = (state: RootState) => selectBoard(state).nodes;
const selectEdges = (state: RootState) => selectBoard(state).edges;
const selectTitle = (state: RootState) => selectBoard(state).title;
const selectStatus = (state: RootState) => selectBoard(state).status;
const selectFlow = (state: RootState) => selectBoard(state).flow;
const selectIgnoredChecks = (state: RootState) => selectBoard(state).ignoredChecks;
const selectTestedPaths = (state: RootState) => selectBoard(state).testedPaths;
const selectMode = (state: RootState) => selectBoard(state).mode;

// For now helpline staff see boards without changing them
export const selectReadOnly = (state: RootState) => !selectActingAsStaff(state);
// Test mode can't change the board either
export const selectLocked = (state: RootState) => selectReadOnly(state) || selectMode(state) === 'test';
export const selectDragging = (state: RootState) => selectNodes(state).some(node => node.dragging);
export const selectHasSelection = (state: RootState) => selectNodes(state).some(node => node.selected);

// What's on the canvas; the status isn't part of it (nor of undo)
export const selectCanvasContent = createSelector([selectTitle, selectNodes, selectEdges], toContent);
export const selectCanvasJson = createSelector([selectCanvasContent], content => JSON.stringify(content));
export const selectContent = createSelector(
  [selectCanvasContent, selectStatus, selectFlow, selectIgnoredChecks, selectTestedPaths],
  (canvasContent, status, flow, ignoredChecks, testedPaths): BoardContent => ({
    ...canvasContent,
    status,
    ...(flow ? { flow } : {}),
    ...(ignoredChecks.length > 0 ? { ignoredChecks } : {}),
    ...(testedPaths.length > 0 ? { testedPaths } : {}),
  }),
);
export const selectContentJson = createSelector([selectContent], content => JSON.stringify(content));
// The part of the board that is the design: changing it means it's being worked on again
export const selectDesign = createSelector([selectCanvasContent], designOf);

const NO_VARIANTS: FlowVariant[] = [];
export const selectVariants = (state: RootState) => selectFlow(state)?.variants ?? NO_VARIANTS;
export const selectMainVariant = (state: RootState) => selectVariants(state)[0]?.key;
export const selectVariant = (state: RootState) => {
  const variants = selectVariants(state);
  const { variantKey } = selectBoard(state);
  return variants.find(candidate => candidate.key === variantKey) ?? variants[0];
};

// The helpline's recordings, or the shown variant's own folder (flows sharing a template)
export const selectRecordingsLibrary = (state: RootState) => {
  const { board } = selectBoard(state);
  if (!board) return undefined;
  const variant = selectVariant(state);
  return variant ? `${board.code}/f/${variant.recordingsFolder}` : board.code;
};

export const selectCanUndo = (state: RootState) => selectBoard(state).history.index > 0;
export const selectCanRedo = (state: RootState) => {
  const { history } = selectBoard(state);
  return history.index < history.stack.length - 1;
};

// The tested paths nothing on has changed since
export const selectValidPaths = createSelector([selectCanvasContent, selectTestedPaths], validTestedPaths);

// The board's recordings (recordingsSlice), read here for the checks and approvals
const selectRecordingList = (state: RootState) => state.boardRecordings?.list;
const selectRecordings = (state: RootState) => selectRecordingList(state)?.recordings;

const selectAllIssues = createSelector([selectContent, selectRecordings], boardChecks);
// In a sketch, only what's about the flow's shape (no scripts, recordings, settings...)
export const selectIssues = createSelector(
  [selectAllIssues, selectIgnoredChecks, selectMode],
  (allIssues, ignoredChecks, mode) => {
    const split = splitIgnored(allIssues, ignoredChecks);
    return mode === 'sketch' ? { active: sketchIssues(split.active), ignored: sketchIssues(split.ignored) } : split;
  },
);
export const selectProblems = createSelector([selectIssues], ({ active }) => issuesByObject(active));

// Approved scripts and recordings, in the flow shown: a check on the object
const selectApprovals = createSelector(
  [selectContent, (state: RootState) => selectVariant(state)?.key, selectMainVariant, selectRecordings],
  (content, variantKey, mainVariant, recordings) => {
    const found = new Map<string, 'Approved' | 'Published'>();
    content.objects.forEach(object => {
      const approval = approvalOf(
        { ...object, message: messageFor(object, variantKey, mainVariant) },
        flowDetailsOf(content, object.frameId),
        recordings,
      );
      if (approval) found.set(object.id, approval);
    });
    return found;
  },
);

// Test mode: the run on the board, and the tested paths (simulatorSlice)
const selectRun = (state: RootState) => state.simulator?.run;
const selectShowTested = (state: RootState) => state.simulator?.showTested ?? true;
const selectSimulation = createSelector(
  [selectMode, selectRun, selectShowTested, selectContent, selectValidPaths],
  (mode, run: SimRun | undefined, showTested, content, validPaths) => {
    if (mode !== 'test') return undefined;
    const visited = run ? visitedBy(run) : undefined;
    const coverage = showTested ? coverageOf(content, validPaths) : undefined;
    return {
      visited: visited?.objects ?? new Map<string, number[]>(),
      connections: visited?.connections ?? new Set<string>(),
      current: run?.current,
      activeConnection: visited?.activeConnection,
      deadEnd: run?.ended?.kind === 'deadEnd' ? run.ended.objectId : undefined,
      tested: coverage && { objects: coverage.objects, connections: coverage.connections },
    };
  },
);

// What the canvas's nodes show besides their own data
export const selectEditingView = createSelector(
  [selectLocked, selectProblems, selectSimulation, selectMode, selectApprovals],
  (readOnly, problems, simulation, mode, approvals) => ({
    readOnly,
    problems,
    simulation,
    sketch: mode === 'sketch',
    approvals,
  }),
);

// ---------------------------------------------------------------------------------------------
// Opening

const modeKeyOf = (code: string, id: string) => `flow-mode:${code}/${id}`;

// Remembered per board in this browser; a new board starts as a sketch
const keptMode = (board: Board): BoardMode => {
  try {
    const kept = window.localStorage.getItem(modeKeyOf(board.code, board.id));
    // Test isn't kept: the board opens to be worked on
    if (kept === 'sketch' || kept === 'design') return kept;
  } catch {
    // No storage (private window): the default
  }
  return board.content.objects.length === 0 ? 'sketch' : 'design';
};

// Who tasks can be assigned to: the board's helpline's people (templates: the Aselo team)
const loadBoardPeople =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { board } = selectBoard(getState());
    if (!board) return;
    const code = board.code === TEMPLATES_CODE ? ASELO_PEOPLE_CODE : board.code;
    dispatch(peopleLoaded(await boardClient.people(code).catch((): Person[] => [])));
  };

// The helpline's chatbots, queues, workflows and skills. Read again whenever the board is shown again
// (e.g. after adding a skill in Routing) and when one of those settings is picked
export const loadHelplineChoices =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { board, opened } = selectBoard(getState());
    if (!board || board.code === TEMPLATES_CODE || getState().app.area !== 'flows') return;
    try {
      const found = await boardClient.helplineChoices(board.code);
      // Still the same board
      if (selectBoard(getState()).opened === opened) dispatch(helplineChoicesLoaded(found));
    } catch {
      // None offered
    }
  };

// Shows a board just loaded (or loaded again), with its people and the helpline's choices
export const boardLoaded =
  (board: Board): AppThunk =>
  dispatch => {
    dispatch(boardOpened({ board, mode: keptMode(board) }));
    dispatch(loadBoardPeople());
    dispatch(loadHelplineChoices());
  };

// ---------------------------------------------------------------------------------------------
// Adding and connecting

// An object, sticky note or frame from the palette, centred where it's dropped (or the view's centre)
export const addItem =
  (item: PaletteItem, at: { x: number; y: number }): AppThunk =>
  (dispatch, getState) => {
    if (selectLocked(getState())) return;
    let node: CanvasNode;
    if (item.kind === 'frame') {
      node = createFrameNode({ x: at.x - 450, y: at.y - 300 });
    } else {
      const size = item.kind === 'object' ? OBJECT_TYPES[item.type].defaultSize : { width: 160, height: 120 };
      const frame = frameAt(at, selectNodes(getState()));
      const topLeft = { x: at.x - size.width / 2, y: at.y - size.height / 2 };
      const position = frame ? { x: topLeft.x - frame.position.x, y: topLeft.y - frame.position.y } : topLeft;
      node =
        item.kind === 'object'
          ? createObjectNode(item.type, position, frame?.id)
          : createStickyNode(position, frame?.id);
    }
    dispatch(nodesAdded({ nodes: withIds([node]) }));
  };

const objectNodeOf = (nodes: CanvasNode[], id: string) =>
  nodes.find((node): node is ObjectNode => node.id === id && node.type === 'object');

export const isValidConnection = (nodes: CanvasNode[], params: FlowConnection | ConnectionEdge) =>
  params.source !== params.target &&
  Boolean(objectNodeOf(nodes, params.source)) &&
  Boolean(objectNodeOf(nodes, params.target));

// A connection from one object to another, taking the source's next way out
export const connectObjects =
  (params: FlowConnection): AppThunk =>
  (dispatch, getState) => {
    const { nodes, edges } = selectBoard(getState());
    if (selectLocked(getState()) || params.source === params.target) return;
    const source = objectNodeOf(nodes, params.source);
    if (!source || !objectNodeOf(nodes, params.target)) return;
    const next = nextExit(source, edges);
    if (!next.ok) {
      dispatch(noticeShown(next.reason));
      return;
    }
    dispatch(
      edgeAdded({
        id: newId('c'),
        type: 'connection',
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        markerEnd: ARROW,
        data: { exit: next.exit },
      }),
    );
  };

// A connection's end moved to another object; from another source, it takes that one's next way out
export const reconnectConnection =
  (oldEdge: ConnectionEdge, connection: FlowConnection): AppThunk =>
  (dispatch, getState) => {
    const { nodes, edges } = selectBoard(getState());
    if (selectLocked(getState()) || !isValidConnection(nodes, connection)) return;
    let exit = oldEdge.data?.exit;
    if (connection.source !== oldEdge.source) {
      const next = nextExit(objectNodeOf(nodes, connection.source), edges, oldEdge.id);
      if (!next.ok) {
        dispatch(noticeShown(next.reason));
        return;
      }
      ({ exit } = next);
    }
    dispatch(edgeReconnected({ oldEdge, connection, exit }));
  };

// ---------------------------------------------------------------------------------------------
// Undo, redo and copying

export const undo = (): AppThunk => (dispatch, getState) => {
  if (selectCanUndo(getState()) && !selectLocked(getState())) dispatch(historyUndone());
};

export const redo = (): AppThunk => (dispatch, getState) => {
  if (selectCanRedo(getState()) && !selectLocked(getState())) dispatch(historyRedone());
};

// Selected nodes, plus everything inside selected frames
const selectedWithContents = (nodes: CanvasNode[]) => {
  const ids = new Set(nodes.filter(node => node.selected).map(node => node.id));
  return nodes.filter(node => ids.has(node.id) || (node.parentId && ids.has(node.parentId)));
};

export const copySelection = (): AppThunk => (dispatch, getState) => {
  const { nodes, edges } = selectBoard(getState());
  const selected = selectedWithContents(nodes);
  if (selected.length === 0) return;
  dispatch(copied({ nodes: structuredClone(selected), edges: structuredClone(edges) }));
};

const pasteCopies =
  (source: { nodes: CanvasNode[]; edges: ConnectionEdge[] }, pastes: number): AppThunk =>
  (dispatch, getState) => {
    const step = 40 * pastes;
    const nodes = selectNodes(getState());
    const copies = duplicate(source.nodes, source.edges, new Set(nodes.map(node => node.id)), { x: step, y: step });
    dispatch(nodesAdded(copies));
  };

export const pasteClipboard = (): AppThunk => (dispatch, getState) => {
  const { clipboard } = selectBoard(getState());
  if (!clipboard || selectLocked(getState())) return;
  dispatch(pasted());
  dispatch(pasteCopies(clipboard, clipboard.pastes + 1));
};

export const duplicateSelection = (): AppThunk => (dispatch, getState) => {
  const { nodes, edges } = selectBoard(getState());
  const selected = selectedWithContents(nodes);
  if (selected.length === 0 || selectLocked(getState())) return;
  dispatch(pasteCopies({ nodes: selected, edges }, 1));
};

// ---------------------------------------------------------------------------------------------
// Modes, tests and variants

export const switchMode =
  (next: BoardMode): AppThunk =>
  (dispatch, getState) => {
    const { board } = selectBoard(getState());
    if (board) {
      try {
        window.localStorage.setItem(modeKeyOf(board.code, board.id), next);
      } catch {
        // Not kept: fine
      }
    }
    dispatch(modeSwitched(next));
  };

// The run as a tested path, by whoever's signed in
export const markTested = (): AppThunk => (dispatch, getState) => {
  const run = selectRun(getState());
  if (!run) return;
  const userName = selectUser(getState())?.name ?? '';
  dispatch(testedPathAdded(testedPathOf(selectCanvasContent(getState()), run, userName, newId('t'))));
};

// A variant made its own Studio flow: a new board where its texts are the board's own (its recordings
// stay in its folder), flagged so the export asks for a template of its own; it leaves this board
export const splitVariant =
  (key: string): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const state = getState();
    const { board, flow, title } = selectBoard(state);
    const variants = selectVariants(state);
    const mainVariant = selectMainVariant(state);
    const content = selectContent(state);
    const leaving = variants.find(candidate => candidate.key === key);
    if (!board || !leaving || !flow?.studio) return;
    const { template } = flow.studio;
    const objects = content.objects.map(({ variantMessages, ...object }) => {
      const own = variantMessages?.[key];
      return {
        ...object,
        message: messageFor({ ...object, variantMessages }, key, mainVariant),
        ...(object.studio && own ? { studio: { ...object.studio, importedScript: own.importedScript } } : {}),
      };
    });
    try {
      const created = await boardClient.create(board.code, `${title} (${leaving.label})`, undefined, {
        ...content,
        title: `${title} (${leaving.label})`,
        objects,
        flow: {
          ...flow,
          variants: [leaving],
          ownTemplate: { suggested: template.replace(/\.tftpl$/, `-${key.split('_').pop()}.tftpl`) },
        },
        status: STATUS_AFTER_CHANGE,
      });
      dispatch(variantSplitOff({ key, notice: `${leaving.label} is now its own board: “${created.content.title}”.` }));
    } catch (err) {
      dispatch(noticeShown((err as Error).message));
    }
  };

// Whether any object has texts written in the board's other languages
export const hasOtherLanguageTexts = (nodes: CanvasNode[]) =>
  nodes.some(
    node =>
      node.type === 'object' && Object.values(node.data.object.variantMessages ?? {}).some(message => message.script),
  );

// ---------------------------------------------------------------------------------------------
// Saving: one save at a time, each with the revision the previous one returned

const saveQueues = new WeakMap<object, { current: Promise<void> }>();

const saveNow =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient, saveRetryDelaysMs }) => {
    const state = selectBoard(getState());
    if (!state.board || selectReadOnly(getState()) || state.conflict) return;
    const toSave = selectContentJson(getState());
    if (toSave === state.savedJson) {
      dispatch(saveStateChanged('saved'));
      return;
    }
    const { code, id } = state.board;
    dispatch(saveStateChanged('saving'));
    try {
      const outcome = await boardClient.save(code, id, state.revision, JSON.parse(toSave));
      // Another board opened meanwhile: nothing to record
      if (selectBoard(getState()).opened !== state.opened) return;
      if (outcome.ok) {
        dispatch(
          boardSaved({ revision: outcome.meta.revision, json: toSave, latestJson: selectContentJson(getState()) }),
        );
      } else {
        dispatch(saveConflicted(outcome.conflict));
      }
    } catch (err) {
      // Another board opened meanwhile: its saves aren't failing
      if (selectBoard(getState()).opened !== state.opened) return;
      dispatch(saveFailed({ message: (err as Error).message, retries: saveRetryDelaysMs.length }));
    }
  };

// Saves now, after any save already under way
export const saveBoard = (): AppThunk<Promise<void>> => (dispatch, _getState, services) => {
  const queue = saveQueues.get(services) ?? { current: Promise.resolve() };
  saveQueues.set(services, queue);
  queue.current = queue.current.then(() => dispatch(saveNow()));
  return queue.current;
};

// "Try again" after the retries ran out: the changes are still in the page
export const retryBoardSave = (): AppThunk<Promise<void>> => dispatch => {
  dispatch(saveRetriesReset());
  return dispatch(saveBoard());
};

// Whether there are changes not saved yet (leaving the page warns about them)
export const selectHasUnsavedChanges = (state: RootState) =>
  Boolean(selectBoard(state).board) &&
  !selectReadOnly(state) &&
  selectContentJson(state) !== selectBoard(state).savedJson;
