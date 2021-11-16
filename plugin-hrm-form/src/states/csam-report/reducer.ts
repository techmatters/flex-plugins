import { omit } from 'lodash';

import * as t from './types';
import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from '../types';

type CSAMReportState = {
  tasks: {
    [taskId: string]: t.CSAMReportForm;
  };
};

const newTaskEntry: t.CSAMReportForm = {
  webAddress: '',
  anonymous: true,
  description: '',
  firstName: undefined,
  lastName: undefined,
  email: undefined,
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
          [action.taskId]: action.form,
        },
      };
    default:
      return state;
  }
}
