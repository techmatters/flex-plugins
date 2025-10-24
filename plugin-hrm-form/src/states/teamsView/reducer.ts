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

export type TeamsViewState = {
  selectedWorkers: Set<string>;
  selectedSkills: Set<string>;
  operation?: 'enable' | 'disable';
};

const initialState: TeamsViewState = {
  selectedWorkers: new Set(),
  selectedSkills: new Set(),
};

// Action types
export const TEAMSVIEW_SELECT_WORKERS = 'teamsview/select-workers';
export const TEAMSVIEW_UNSELECT_WORKERS = 'teamsview/unselect-workers';
export const TEAMSVIEW_SELECT_SKILLS = 'teamsview/select-skills';
export const TEAMSVIEW_SELECT_OPERATION = 'teamsview/select-operation';
export const TEAMSVIEW_RESET_STATE = 'teamsview/reset-state';

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

type TeamsViewResetStateAction = {
  type: typeof TEAMSVIEW_RESET_STATE;
};

type TeamsViewActionTypes =
  | TeamsViewSelectWorkersAction
  | TeamsViewUnselectWorkersAction
  | TeamsViewSelectSkillsAction
  | TeamsViewSelectOperationAction
  | TeamsViewResetStateAction;

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

export const newTeamsViewSelectOperation = (operation: TeamsViewState['operation']): TeamsViewSelectOperationAction => ({
  type: TEAMSVIEW_SELECT_OPERATION,
  payload: operation,
});

export const newTeamsViewResetStateAction = (): TeamsViewResetStateAction => ({
  type: TEAMSVIEW_RESET_STATE,
});

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
    case TEAMSVIEW_RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
};
