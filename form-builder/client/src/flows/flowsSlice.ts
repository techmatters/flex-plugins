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
 * The Contact flows area: which board is open (kept in the address, ?area=flows&board=usnm/1a2b3c4d,
 * so it can be linked to and survives a page reload), and the start page: the boards list, the
 * form to start a new board, the people lists tasks are assigned from, and importing a live helpline.
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import {
  ASELO_PEOPLE_CODE,
  type BoardSummary,
  type Person,
  TEMPLATES_CODE,
} from '@tech-matters/form-builder-shared/flows/model';
import type { DesignStatus } from '@tech-matters/form-builder-shared/designStatus';
import type { BranchChoice, FromBranch, HelplineImport } from '@tech-matters/form-builder-shared';
import {
  hasNonStandardRecording,
  importedRecordingKey,
  standardRecordingName,
} from '@tech-matters/form-builder-shared/flows/recordings';

import { type AppThunk, rootReducer, type RootState } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { boardClosed, boardLoaded, saveBoard } from './boardSlice';

export type BoardFilter = 'all' | DesignStatus;

type Open = { code: string; id: string };

type ImportCopying = { done: number; total: number; failed: string[] };

type FlowsState = {
  // The area read the board to open from the address
  started: boolean;
  open?: Open;
  // Why the open board couldn't be loaded
  openError?: string;
  home: {
    boards?: BoardSummary[];
    error?: string;
    // The new board form
    code: string;
    title: string;
    template: string;
    creating: boolean;
    // What the list shows
    filter: BoardFilter;
    helpline: string;
  };
  people: {
    // The list shown
    code: string;
    people?: Person[];
    error?: string;
    // Who's being added
    name: string;
    email: string;
    // The Aselo team, to add to a helpline's list
    team: Person[];
  };
  importer: {
    code: string;
    branch: string;
    preview?: HelplineImport & FromBranch;
    error?: string;
    working: boolean;
    copyRecordings: boolean;
    // Give recordings with older names their standard ones (the widget's) as they're copied
    standardNames: boolean;
    copying?: ImportCopying;
    // The flows to import, by their place in the preview (all of them to start with)
    selected: number[];
    // The boards made, one per Studio flow
    created?: { code: string; id: string; title: string }[];
  };
};

const initialHome: FlowsState['home'] = {
  code: '',
  title: '',
  template: '',
  creating: false,
  filter: 'all',
  helpline: '',
};
const initialPeople: FlowsState['people'] = { code: '', name: '', email: '', team: [] };
const initialImporter: FlowsState['importer'] = {
  code: '',
  branch: '',
  working: false,
  copyRecordings: true,
  standardNames: false,
  selected: [],
};

const initialState: FlowsState = {
  started: false,
  home: initialHome,
  people: initialPeople,
  importer: initialImporter,
};

const flowsSlice = createSlice({
  name: 'flows',
  initialState,
  reducers: {
    boardShown: (state, action: PayloadAction<Open | undefined>) => {
      state.started = true;
      state.open = action.payload;
      state.openError = undefined;
    },
    boardLoadFailed: (state, action: PayloadAction<string>) => {
      state.openError = action.payload;
    },

    // ----- The start page, as new each time it's shown
    homeShown: (state, action: PayloadAction<{ code: string; peopleCode: string }>) => {
      state.home = { ...initialHome, code: action.payload.code };
      state.people = { ...initialPeople, code: action.payload.peopleCode };
      state.importer = initialImporter;
    },
    boardsLoaded: (state, action: PayloadAction<BoardSummary[]>) => {
      state.home.boards = action.payload;
    },
    homeFailed: (state, action: PayloadAction<string>) => {
      state.home.error = action.payload;
      state.home.creating = false;
    },
    newBoardChanged: (
      state,
      action: PayloadAction<Partial<Pick<FlowsState['home'], 'code' | 'title' | 'template'>>>,
    ) => {
      Object.assign(state.home, action.payload);
    },
    creatingStarted: state => {
      state.home.creating = true;
      state.home.error = undefined;
    },
    boardFilterChanged: (state, action: PayloadAction<BoardFilter>) => {
      state.home.filter = action.payload;
    },
    helplineFilterChanged: (state, action: PayloadAction<string>) => {
      state.home.helpline = action.payload;
    },

    // ----- People
    peopleListChosen: (state, action: PayloadAction<string>) => {
      state.people.code = action.payload;
      state.people.people = undefined;
      state.people.error = undefined;
    },
    peopleListLoaded: (state, action: PayloadAction<{ code: string; people: Person[] }>) => {
      if (action.payload.code === state.people.code) state.people.people = action.payload.people;
    },
    peopleFailed: (state, action: PayloadAction<string>) => {
      state.people.error = action.payload;
    },
    teamLoaded: (state, action: PayloadAction<Person[]>) => {
      state.people.team = action.payload;
    },
    personTyped: (state, action: PayloadAction<Partial<Pick<FlowsState['people'], 'name' | 'email'>>>) => {
      Object.assign(state.people, action.payload);
    },
    peopleSaving: state => {
      state.people.error = undefined;
    },

    // ----- Importing a live helpline. A preview is of one helpline and branch: choosing another one
    // clears it (unless boards were made from it)
    importSourceChosen: (state, action: PayloadAction<{ code?: string; branch?: string }>) => {
      Object.assign(state.importer, action.payload);
      if (!state.importer.created) {
        state.importer.preview = undefined;
        state.importer.error = undefined;
      }
    },
    previewStarted: state => {
      Object.assign(state.importer, {
        working: true,
        error: undefined,
        preview: undefined,
        copying: undefined,
        created: undefined,
      });
    },
    previewLoaded: (state, action: PayloadAction<HelplineImport & FromBranch>) => {
      state.importer.preview = action.payload;
      state.importer.selected = action.payload.boards.map((_, index) => index);
    },
    importFailed: (state, action: PayloadAction<string>) => {
      state.importer.error = action.payload;
    },
    importWorking: (state, action: PayloadAction<boolean>) => {
      state.importer.working = action.payload;
      if (action.payload) state.importer.error = undefined;
    },
    importFlowsSelected: (state, action: PayloadAction<number[]>) => {
      state.importer.selected = action.payload;
    },
    importFlowToggled: (state, action: PayloadAction<number>) => {
      const { selected } = state.importer;
      state.importer.selected = selected.includes(action.payload)
        ? selected.filter(index => index !== action.payload)
        : [...selected, action.payload];
    },
    importOptionsChanged: (
      state,
      action: PayloadAction<Partial<Pick<FlowsState['importer'], 'copyRecordings' | 'standardNames'>>>,
    ) => {
      Object.assign(state.importer, action.payload);
    },
    importedBoardsCreated: (state, action: PayloadAction<NonNullable<FlowsState['importer']['created']>>) => {
      state.importer.created = action.payload;
    },
    importCopying: (state, action: PayloadAction<ImportCopying>) => {
      state.importer.copying = action.payload;
    },
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof flowsSlice> {}
}

// Added when the store is made (startFlowsListeners)
export const injectFlowsSlice = () => flowsSlice.injectInto(rootReducer);

export const {
  newBoardChanged,
  boardFilterChanged,
  helplineFilterChanged,
  personTyped,
  importFlowsSelected,
  importFlowToggled,
  importOptionsChanged,
  importSourceChosen,
} = flowsSlice.actions;
const {
  boardShown,
  boardLoadFailed,
  homeShown,
  boardsLoaded,
  homeFailed,
  creatingStarted,
  peopleListChosen,
  peopleListLoaded,
  peopleFailed,
  teamLoaded,
  peopleSaving,
  previewStarted,
  previewLoaded,
  importFailed,
  importWorking,
  importedBoardsCreated,
  importCopying,
} = flowsSlice.actions;

export const selectFlows = (state: RootState) => state.flows ?? initialState;
export const selectHelplineCodes = createSelector([(state: RootState) => state.session.helplines], helplines =>
  helplines.map(helpline => helpline.code),
);

// ---------------------------------------------------------------------------------------------
// Opening and closing boards

const setBoardInUrl = (open?: Open) => {
  const params = new URLSearchParams(window.location.search);
  params.set('area', 'flows');
  if (open) params.set('board', `${open.code}/${open.id}`);
  else params.delete('board');
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
};

// Loads the open board (again, after someone else saved it)
export const loadOpenBoard =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { open } = selectFlows(getState());
    if (!open) return;
    try {
      const board = await boardClient.load(open.code, open.id);
      // Still the one open
      if (selectFlows(getState()).open === open) dispatch(boardLoaded(board));
    } catch (err) {
      dispatch(boardLoadFailed((err as Error).message));
    }
  };

// Shows a board (or the boards, with none)
export const openBoard =
  (open?: Open): AppThunk =>
  dispatch => {
    setBoardInUrl(open);
    dispatch(boardClosed());
    dispatch(boardShown(open));
    void dispatch(loadOpenBoard());
  };

// The area shown for the first time: the board in the address, if any
export const startFlowsArea = (): AppThunk => (dispatch, getState) => {
  if (selectFlows(getState()).started) return;
  const [code, id] = (new URLSearchParams(window.location.search).get('board') ?? '').split('/');
  dispatch(openBoard(code && id ? { code, id } : undefined));
};

// Back to the boards, once what's still waiting is saved
export const closeBoard = (): AppThunk<Promise<void>> => async dispatch => {
  await dispatch(saveBoard());
  dispatch(openBoard(undefined));
};

// ---------------------------------------------------------------------------------------------
// The start page

const loadBoards =
  (): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { boardClient }) => {
    try {
      dispatch(boardsLoaded(await boardClient.list()));
    } catch (err) {
      dispatch(homeFailed((err as Error).message));
    }
  };

// The people lists this person can see: helplines first (their lists are the ones boards offer)
export const selectPeopleCodes = createSelector([selectActingAsStaff, selectHelplineCodes], (staff, helplineCodes) =>
  staff ? [...helplineCodes, ASELO_PEOPLE_CODE] : helplineCodes,
);

const loadPeopleList =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { code } = selectFlows(getState()).people;
    if (!code) return;
    try {
      dispatch(peopleListLoaded({ code, people: await boardClient.people(code) }));
    } catch (err) {
      dispatch(peopleFailed((err as Error).message));
    }
  };

const loadTeam =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    if (!selectActingAsStaff(getState())) return;
    dispatch(teamLoaded(await boardClient.people(ASELO_PEOPLE_CODE).catch((): Person[] => [])));
  };

// The start page shown: the boards, the people lists and an empty import, all as new
export const showFlowsHome = (): AppThunk => (dispatch, getState) => {
  const helplineCodes = selectHelplineCodes(getState());
  dispatch(
    homeShown({
      code: helplineCodes.length === 1 ? helplineCodes[0] : '',
      peopleCode: selectPeopleCodes(getState())[0] ?? '',
    }),
  );
  void dispatch(loadBoards());
  void dispatch(loadTeam());
  void dispatch(loadPeopleList());
};

export const createBoard =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { code, title, template } = selectFlows(getState()).home;
    if (!code || !title.trim()) return;
    dispatch(creatingStarted());
    try {
      const copyFrom = template ? { code: TEMPLATES_CODE, id: template } : undefined;
      const board = await boardClient.create(code, title.trim(), copyFrom);
      dispatch(openBoard({ code: board.code, id: board.id }));
    } catch (err) {
      dispatch(homeFailed((err as Error).message));
    }
  };

// (Asked to confirm first, by the page)
export const removeBoard =
  (board: BoardSummary): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { boardClient }) => {
    try {
      await boardClient.remove(board.code, board.id);
      await dispatch(loadBoards());
    } catch (err) {
      dispatch(homeFailed((err as Error).message));
    }
  };

// ---------------------------------------------------------------------------------------------
// People

export const choosePeopleList =
  (code: string): AppThunk =>
  dispatch => {
    dispatch(peopleListChosen(code));
    void dispatch(loadPeopleList());
  };

// The list as changed; whether it was saved
export const savePeople =
  (updated: Person[]): AppThunk<Promise<boolean>> =>
  async (dispatch, getState, { boardClient }) => {
    const { code } = selectFlows(getState()).people;
    dispatch(peopleSaving());
    try {
      dispatch(peopleListLoaded({ code, people: await boardClient.savePeople(code, updated) }));
      return true;
    } catch (err) {
      dispatch(peopleFailed((err as Error).message));
      return false;
    }
  };

// Who's typed in, added to the list
export const addPerson = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { name, email, people } = selectFlows(getState()).people;
  if (!name.trim() || !people) return;
  const person = { name: name.trim(), ...(email.trim() ? { email: email.trim() } : {}) };
  if (await dispatch(savePeople([...people, person]))) dispatch(personTyped({ name: '', email: '' }));
};

// ---------------------------------------------------------------------------------------------
// Importing a live helpline

// The flex-plugins branches a helpline can be imported from
export const fetchImportBranches =
  (): AppThunk<Promise<BranchChoice[]>> =>
  (_dispatch, _getState, { boardClient }) =>
    boardClient.branches();

export const previewImport =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { code, branch } = selectFlows(getState()).importer;
    dispatch(previewStarted());
    try {
      dispatch(previewLoaded(await boardClient.previewImport(code, branch)));
    } catch (err) {
      dispatch(importFailed((err as Error).message));
    } finally {
      dispatch(importWorking(false));
    }
  };

// The flows chosen, and the recordings they play
export const selectImportChoice = createSelector(
  [(state: RootState) => selectFlows(state).importer],
  ({ preview, selected }) => {
    const chosenBoards = preview?.boards.filter((_, index) => selected.includes(index)) ?? [];
    // Only the recordings the chosen flows play
    const chosenFiles = new Set(chosenBoards.flatMap(board => board.recordingFiles));
    const chosenRecordings =
      preview?.recordings.filter(recording => chosenFiles.has(importedRecordingKey(recording))) ?? [];
    return { chosenBoards, chosenRecordings };
  },
);

// A board per chosen Studio flow, then their recordings copied into the recordings bucket
export const createImportedBoards =
  (): AppThunk<Promise<void>> =>
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async (dispatch, getState, { boardClient }) => {
    const { preview, code, standardNames, copyRecordings } = selectFlows(getState()).importer;
    const { chosenBoards, chosenRecordings } = selectImportChoice(getState());
    if (!preview || chosenBoards.length === 0) return;
    dispatch(importWorking(true));
    try {
      const boards = [];
      for (const { title, content } of chosenBoards) {
        // With standard names, the widgets play files named after them (copied so below)
        const objects =
          standardNames && copyRecordings
            ? content.objects.map(object => {
                if (!hasNonStandardRecording(object)) return object;
                const { recordingFile, ...message } = object.message ?? {};
                return { ...object, message };
              })
            : content.objects;
        const board = await boardClient.create(code, title, undefined, { ...content, objects });
        boards.push({ code: board.code, id: board.id, title });
      }
      dispatch(importedBoardsCreated(boards));
      if (copyRecordings && chosenRecordings.length > 0) {
        // A file several widgets play becomes a copy for each, named after it (the standard)
        const copies = chosenRecordings.flatMap(recording =>
          standardNames && recording.widgets?.length
            ? recording.widgets.map(widget => ({
                ...recording,
                fileName: standardRecordingName(widget, recording.fileName),
              }))
            : [recording],
        );
        const progress: ImportCopying = { done: 0, total: copies.length, failed: [] };
        dispatch(importCopying({ ...progress }));
        for (const recording of copies) {
          try {
            // A flow sharing its template keeps its recordings in its own folder
            await boardClient.importRecording(recording.folder ? `${code}/f/${recording.folder}` : code, recording);
          } catch (err) {
            progress.failed.push(`${recording.environment}/${recording.fileName}: ${(err as Error).message}`);
          }
          progress.done += 1;
          dispatch(importCopying({ ...progress, failed: [...progress.failed] }));
        }
      }
    } catch (err) {
      dispatch(importFailed((err as Error).message));
    } finally {
      dispatch(importWorking(false));
    }
  };
