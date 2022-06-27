import {
  CaseListSettingsActionType,
  caseListSettingsInitialState,
  CaseListSettingsState,
  CLEAR_CASE_LIST_FILTER,
  clearFilterReducer,
  UPDATE_CASE_LIST_FILTER,
  UPDATE_CASE_LIST_PAGE,
  UPDATE_CASE_LIST_SORT,
  updatedFilterReducer,
  updatedPageReducer,
  updatedSortReducer,
} from './settings';
import { GeneralActionType } from '../types';
import {
  CaseListContentState,
  CaseListContentStateAction,
  CLOSE_CASE_DETAILS,
  FETCH_CASE_LIST_ERROR,
  FETCH_CASE_LIST_STARTED,
  FETCH_CASE_LIST_SUCCESS,
  fetchCaseListStartReducer,
  caseListContentInitialState,
  OPEN_CASE_DETAILS,
  fetchCaseListSuccessReducer,
  fetchCaseListErrorReducer,
  openCaseDetailsReducer,
  closeCaseDetailsReducer,
} from './listContent';

export type CaseListState = {
  currentSettings: CaseListSettingsState;
  previousSettings?: CaseListSettingsState;
  content: CaseListContentState;
};

const initialState: CaseListState = {
  currentSettings: caseListSettingsInitialState(),
  content: caseListContentInitialState(),
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
  action:
    | CaseListSettingsActionType
    | CaseListContentStateAction
    | UndoCaseListSettingsUpdateAction
    | GeneralActionType,
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
    case FETCH_CASE_LIST_STARTED:
      return { ...state, content: fetchCaseListStartReducer(state.content, action) };
    case FETCH_CASE_LIST_SUCCESS:
      return { ...state, content: fetchCaseListSuccessReducer(state.content, action) };
    case FETCH_CASE_LIST_ERROR:
      return { ...state, content: fetchCaseListErrorReducer(state.content, action) };
    case OPEN_CASE_DETAILS:
      return { ...state, content: openCaseDetailsReducer(state.content, action) };
    case CLOSE_CASE_DETAILS:
      return { ...state, content: closeCaseDetailsReducer(state.content, action) };
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
