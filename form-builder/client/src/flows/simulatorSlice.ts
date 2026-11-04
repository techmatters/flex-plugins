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
 * Test mode: a run of the open board's flow (simulate.ts), the runs before each answer (for Back),
 * whether tested paths show, and what's typed into the Test panel. A new board, or another mode,
 * starts without a run.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import { OBJECT_TYPES } from '@tech-matters/form-builder-shared/flows/model';
import type { AppThunk, RootState } from '../app/store';
import { rootReducer } from '../app/store';
import { answer, SimAnswer, SimRun, startRun } from './simulate';
import { boardOpened, exitEnded, modeSwitched, selectContent, selectReadOnly } from './boardSlice';

export type MemoryRow = { key: string; value: string };

export type SimulatorState = {
  run?: SimRun;
  // The run as it was before each answer, for Back
  history: SimRun[];
  showTested: boolean;
  // Where the run starts (a trigger), when there are several
  startId?: string;
  // What's typed or pressed for the widget waiting
  text: string;
  digits: string;
  memory: MemoryRow[];
  // Stopping at every widget, to check its script or recording before going on
  pauseEach: boolean;
};

const EMPTY_MEMORY: MemoryRow[] = [{ key: '', value: '' }];

const initialState: SimulatorState = {
  history: [],
  showTested: true,
  text: '',
  digits: '',
  memory: EMPTY_MEMORY,
  pauseEach: true,
};

const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {
    // The next state of the run (Back returns to this one)
    runAnswered: (state, action: PayloadAction<SimRun>) => {
      if (state.run) state.history.push(state.run);
      state.run = action.payload;
      state.text = '';
      state.digits = '';
    },
    // A new run (nothing to go back to), or none
    runStarted: (state, action: PayloadAction<SimRun | undefined>) => {
      state.history = [];
      state.run = action.payload;
      if (action.payload) state.memory = EMPTY_MEMORY;
    },
    runBack: (state) => {
      const previous = state.history.pop();
      if (previous) state.run = previous;
    },
    // A way out left unconnected on purpose (a design change): the run ended as it should
    runEndedHere: (state, action: PayloadAction<{ objectId: string; exit: string }>) => {
      if (state.run) state.run.ended = { kind: 'end', message: 'Ends here on purpose.', ...action.payload };
    },
    showTestedChanged: (state, action: PayloadAction<boolean>) => {
      state.showTested = action.payload;
    },
    startChosen: (state, action: PayloadAction<string>) => {
      state.startId = action.payload;
    },
    textTyped: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
    digitsPressed: (state, action: PayloadAction<string>) => {
      state.digits = action.payload;
    },
    memoryChanged: (state, action: PayloadAction<MemoryRow[]>) => {
      state.memory = action.payload;
    },
    // The same run changed: pausing turned on or off
    pauseEachChanged: (state, action: PayloadAction<boolean>) => {
      state.pauseEach = action.payload;
      if (state.run) state.run.pauseEach = action.payload || undefined;
    },
  },
  extraReducers: (builder) =>
    builder
      // Each board, and each mode, starts without a run (the Test panel as new)
      .addCase(boardOpened, () => initialState)
      .addCase(modeSwitched, (state) => ({ ...initialState, showTested: state.showTested })),
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof simulatorSlice> {}
}

// Added when the store is made (startFlowsListeners)
export const injectSimulatorSlice = () => simulatorSlice.injectInto(rootReducer);

export const { runBack, showTestedChanged, startChosen, textTyped, digitsPressed, memoryChanged, pauseEachChanged } =
  simulatorSlice.actions;
const { runAnswered, runStarted, runEndedHere } = simulatorSlice.actions;

export const selectSimulator = (state: RootState) => state.simulator ?? initialState;

// Where a run can start: each trigger, named after its frame
export const startsOf = (content: ReturnType<typeof selectContent>) =>
  content.objects
    .filter((object) => object.type === 'incoming')
    .map((object) => {
      const frame = content.frames.find((candidate) => candidate.id === object.frameId);
      return {
        id: object.id,
        label: frame
          ? `${frame.title}${frame.channel ? ` (${frame.channel})` : ''}`
          : object.text.trim() || OBJECT_TYPES[object.type].label,
      };
    });

// The trigger chosen, or the first one
const startOf = (state: RootState) => {
  const starts = startsOf(selectContent(state));
  const { startId } = selectSimulator(state);
  return starts.find((candidate) => candidate.id === startId)?.id ?? starts[0]?.id;
};

export const playRun = (): AppThunk => (dispatch, getState) => {
  const start = startOf(getState());
  if (!start) return;
  dispatch(runStarted(startRun(selectContent(getState()), start, selectSimulator(getState()).pauseEach)));
};

export const clearRun = (): AppThunk => (dispatch) => {
  dispatch(runStarted(undefined));
};

export const answerRun =
  (given: SimAnswer): AppThunk =>
  (dispatch, getState) => {
    const { run } = selectSimulator(getState());
    if (!run) return;
    dispatch(runAnswered(answer(selectContent(getState()), run, given)));
  };

// The dead end the run stopped at is where the flow ends, on purpose
export const endRunHere =
  (objectId: string, exit: string): AppThunk =>
  (dispatch, getState) => {
    if (selectReadOnly(getState())) return;
    dispatch(exitEnded({ objectId, exit }));
    dispatch(runEndedHere({ objectId, exit }));
  };
