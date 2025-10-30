/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { updateWorkersSkills } from '../../services/twilioWorkerService';

export type TeamsViewState = {
  selectedWorkers: Set<string>;
  selectedSkills: Set<string>;
  operation?: 'enable' | 'disable';
  status: {
    loading: boolean;
    error: any;
  };
};

const initialState: TeamsViewState = {
  selectedWorkers: new Set(),
  selectedSkills: new Set(),
  status: {
    loading: false,
    error: null,
  },
};

// Action types
export const TEAMSVIEW_SELECT_WORKERS = 'teamsview/select-workers';
export const TEAMSVIEW_UNSELECT_WORKERS = 'teamsview/unselect-workers';
export const TEAMSVIEW_SELECT_SKILLS = 'teamsview/select-skills';
export const TEAMSVIEW_SELECT_OPERATION = 'teamsview/select-operation';
const TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION = 'teamsview/update-workers-skills';
const TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION_PENDING = `${TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION}_PENDING` as const;
const TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION_FULFILLED = `${TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION}_FULFILLED` as const;
const TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION_REJECTED = `${TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION}_REJECTED` as const;

type TeamsViewSelectWorkersAction = {
  type: typeof TEAMSVIEW_SELECT_WORKERS;
  payload: string[];
};

type TeamsViewUnselectWorkersAction = {
  type: typeof TEAMSVIEW_UNSELECT_WORKERS;
  payload: string[];
};

type TeamsViewSelectSkillsAction = {
  type: typeof TEAMSVIEW_SELECT_SKILLS;
  payload: string[];
};

type TeamsViewSelectOperationAction = {
  type: typeof TEAMSVIEW_SELECT_OPERATION;
  payload: TeamsViewState['operation'];
};

type TeamsviewUpdateWorkersSkillsAsyncActionPending = {
  type: typeof TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION_PENDING;
} & ReturnType<typeof newUpdateWorkersSkillsAsyncAction.pending>;

type TeamsviewUpdateWorkersSkillsAsyncActionFulfilled = {
  type: typeof TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION_FULFILLED;
} & ReturnType<typeof newUpdateWorkersSkillsAsyncAction.fulfilled>;

type TeamsviewUpdateWorkersSkillsAsyncActionRejected = {
  type: typeof TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION_REJECTED;
} & ReturnType<typeof newUpdateWorkersSkillsAsyncAction.rejected>;

type TeamsViewActionTypes =
  | TeamsViewSelectWorkersAction
  | TeamsViewUnselectWorkersAction
  | TeamsViewSelectSkillsAction
  | TeamsViewSelectOperationAction
  | TeamsviewUpdateWorkersSkillsAsyncActionPending
  | TeamsviewUpdateWorkersSkillsAsyncActionFulfilled
  | TeamsviewUpdateWorkersSkillsAsyncActionRejected;

// Action creators
export const newTeamsViewSelectWorkers = (workers: string[]): TeamsViewSelectWorkersAction => ({
  type: TEAMSVIEW_SELECT_WORKERS,
  payload: workers,
});

export const newTeamsViewUnselectWorkers = (workers: string[]): TeamsViewUnselectWorkersAction => ({
  type: TEAMSVIEW_UNSELECT_WORKERS,
  payload: workers,
});

export const newTeamsViewSelectSkills = (skills: string[]): TeamsViewSelectSkillsAction => ({
  type: TEAMSVIEW_SELECT_SKILLS,
  payload: skills,
});

export const newTeamsViewSelectOperation = (
  operation: TeamsViewState['operation'],
): TeamsViewSelectOperationAction => ({
  type: TEAMSVIEW_SELECT_OPERATION,
  payload: operation,
});

// eslint-disable-next-line
export const newUpdateWorkersSkillsAsyncAction = createAsyncAction(
  TEAMSVIEW_UPDATE_WORKERS_SKILLS_ASYNC_ACTION,
  async ({
    operation,
    workers,
    skills,
  }: {
    workers: string[];
    skills: string[];
    operation: Required<TeamsViewState['operation']>;
  }): Promise<void> => {
    return updateWorkersSkills({
      operation,
      workers,
      skills,
    });
  },
);

const asyncReducer = createReducer(initialState, handleAction => [
  handleAction(newUpdateWorkersSkillsAsyncAction.pending, (state, _action) => {
    return {
      ...state,
      status: {
        error: null,
        loading: true,
      },
    };
  }),
  handleAction(newUpdateWorkersSkillsAsyncAction.fulfilled, (_state, _action) => {
    return initialState;
  }),
  handleAction(newUpdateWorkersSkillsAsyncAction.rejected, (state, action) => {
    return {
      ...state,
      status: {
        error: action.payload,
        loading: false,
      },
    };
  }),
]);

export const reduce = (state = initialState, action: TeamsViewActionTypes): TeamsViewState => {
  switch (action.type) {
    case TEAMSVIEW_SELECT_WORKERS: {
      const selectedWorkers = new Set([...Array.from(state.selectedWorkers), ...action.payload]);
      return {
        ...state,
        selectedWorkers,
      };
    }
    case TEAMSVIEW_UNSELECT_WORKERS: {
      const removeSet = new Set(action.payload);
      const selectedWorkers = new Set(Array.from(state.selectedWorkers).filter(w => !removeSet.has(w)));
      return {
        ...state,
        selectedWorkers,
      };
    }
    case TEAMSVIEW_SELECT_SKILLS: {
      return {
        ...state,
        selectedSkills: new Set(action.payload),
      };
    }
    case TEAMSVIEW_SELECT_OPERATION: {
      return {
        ...state,
        operation: action.payload,
      };
    }
    default:
      return asyncReducer(state, action as any);
  }
};
