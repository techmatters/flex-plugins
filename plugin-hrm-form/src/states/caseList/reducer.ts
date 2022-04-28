import {
  CaseListSettingsActionType,
  caseListSettingsInitialState,
  CaseListSettingsState,
  CLEAR_CASE_LIST_FILTER,
  clearFilterReducer,
  UPDATE_CASE_LIST_FILTER,
  updatedFilterReducer,
  UPDATE_CASE_LIST_PAGE,
  updatedPageReducer,
  UPDATE_CASE_LIST_SORT,
  updatedSortReducer,
} from './settings';
import { GeneralActionType } from '../types';

export type CaseListState = {
  currentSettings: CaseListSettingsState;
  previousSettings?: CaseListSettingsState;
};

const initialState: CaseListState = {
  currentSettings: caseListSettingsInitialState(),
};

// Undo action & reducer
const UNDO_CASE_LIST_SETTINGS_UPDATE = 'UNDO_CASE_LIST_SETTINGS_UPDATE';

type UndoCaseListSettingsUpdateAction = {
  type: typeof UNDO_CASE_LIST_SETTINGS_UPDATE;
};

export const undoCaseListSettingsUpdate = (): UndoCaseListSettingsUpdateAction => ({
  type: UNDO_CASE_LIST_SETTINGS_UPDATE,
});

export const reduce = (
  state = initialState,
  action: CaseListSettingsActionType | UndoCaseListSettingsUpdateAction | GeneralActionType,
): CaseListState => {
  switch (action.type) {
    case UPDATE_CASE_LIST_FILTER:
      return {
        ...state,
        currentSettings: updatedFilterReducer(state.currentSettings, action),
        previousSettings: state.currentSettings,
      };
    case CLEAR_CASE_LIST_FILTER:
      return {
        ...state,
        currentSettings: clearFilterReducer(state.currentSettings, action),
        previousSettings: state.currentSettings,
      };
    case UPDATE_CASE_LIST_SORT:
      return { ...state, currentSettings: updatedSortReducer(state.currentSettings, action) };
    case UPDATE_CASE_LIST_PAGE:
      return { ...state, currentSettings: updatedPageReducer(state.currentSettings, action) };
    case UNDO_CASE_LIST_SETTINGS_UPDATE:
      if (!state.previousSettings) {
        console.warn('No previous settings to roll back to, undo action failed');
        return state;
      }
      return { ...state, currentSettings: state.previousSettings, previousSettings: undefined };
    default:
      return state;
  }
};
