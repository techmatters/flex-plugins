import { omit } from 'lodash';

import * as t from './types';
import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from '../types';
import { initialValuesForCLC } from '../../components/CSAMReport/CSAMReportFormDefinition';

type TaskEntry = {
  form: t.CSAMCLCReportForm;
  reportStatus: t.CSAMCLCReportStatus;
};

type CSAMCLCReportState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
};

const newTaskEntry: TaskEntry = {
  form: { ...initialValuesForCLC },
  reportStatus: {
    responseCode: '',
    responseData: '',
    responseDescription: '',
  },
};

const initialState: CSAMCLCReportState = {
  tasks: {},
};

function reduce(state = initialState, action: t.CSAMCLCReportActionType | GeneralActionType): CSAMCLCReportState {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    }
    case RECREATE_CONTACT_STATE: {
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    }
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case t.UPDATE_FORM:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            form: action.form,
          },
        },
      };
    case t.UPDATE_STATUS:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            reportStatus: action.reportStatus,
          },
        },
      };
    // eslint-disable-next-line sonarjs/no-duplicated-branches
    case t.CLEAR_CSAM_CLC_REPORT:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    default:
      return state;
  }
}
