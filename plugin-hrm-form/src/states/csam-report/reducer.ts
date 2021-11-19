import { omit } from 'lodash';

import * as t from './types';
import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from '../types';
import { initialValues } from '../../components/CSAMReport/CSAMReportFormDefinition';

type TaskEntry = {
  form: t.CSAMReportForm;
  reportStatus: t.CSAMReportStatus;
};

type CSAMReportState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
};

const newTaskEntry: TaskEntry = {
  form: { ...initialValues },
  reportStatus: {
    responseCode: '',
    responseData: '',
    responseDescription: '',
  },
};

const initialState: CSAMReportState = {
  tasks: {},
};

export function reduce(state = initialState, action: t.CSAMReportActionType | GeneralActionType): CSAMReportState {
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
    case t.CLEAR_CSAM_REPORT:
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
