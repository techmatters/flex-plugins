import { omit } from 'lodash';

import * as t from './types';
import { CSAMReportType, isCSAMActionForContact } from './types';
import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from '../types';
import { childInitialValues, initialValues } from '../../components/CSAMReport/CSAMReportFormDefinition';

type CounsellorTaskEntry = {
  form: t.CounselorCSAMReportForm;
  reportType: CSAMReportType.COUNSELLOR;
  reportStatus: t.CSAMReportStatus;
};

type ChildTaskEntry = {
  form: t.ChildCSAMReportForm;
  reportType: CSAMReportType.CHILD;
  reportStatus: t.CSAMReportStatus;
};

export type TaskEntry = CounsellorTaskEntry | ChildTaskEntry | {};

export const isCounsellorTaskEntry = (t: TaskEntry): t is CounsellorTaskEntry =>
  (t as CounsellorTaskEntry).reportType === CSAMReportType.COUNSELLOR;
export const isChildTaskEntry = (t: TaskEntry): t is ChildTaskEntry =>
  (t as ChildTaskEntry).reportType === CSAMReportType.CHILD;

type CSAMReportState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
  contacts: {
    [taskId: string]: TaskEntry;
  };
};

export const newCounsellorTaskEntry: CounsellorTaskEntry = {
  form: { ...initialValues },
  reportType: CSAMReportType.COUNSELLOR,
  reportStatus: {
    responseCode: '',
    responseData: '',
    responseDescription: '',
  },
};

export const initialState: CSAMReportState = {
  tasks: {},
  contacts: {},
};

export function reduce(state = initialState, action: t.CSAMReportActionType | GeneralActionType): CSAMReportState {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newCounsellorTaskEntry,
        },
      };
    }
    case RECREATE_CONTACT_STATE: {
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newCounsellorTaskEntry,
        },
      };
    }
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case t.UPDATE_FORM:
      /*
       * TS type inference not so smart here, can't work out that the value of 'reportType' constrains the type of 'form'
       * There are verbose workarounds that don't resort to 'as any' but this seems the best compromise
       */
      return isCSAMActionForContact(action)
        ? {
            ...state,
            contacts: {
              ...state.contacts,
              [action.contactId]: {
                ...state.contacts[action.contactId],
                form: action.form as any,
              },
            },
          }
        : {
            ...state,
            tasks: {
              ...state.tasks,
              [action.taskId]: {
                ...state.tasks[action.taskId],
                form: action.form as any,
              },
            },
          };
    case t.UPDATE_STATUS:
      return isCSAMActionForContact(action)
        ? {
            ...state,
            contacts: {
              ...state.contacts,
              [action.contactId]: {
                ...state.contacts[action.contactId],
                reportStatus: action.reportStatus,
              },
            },
          }
        : {
            ...state,
            tasks: {
              ...state.tasks,
              [action.taskId]: {
                ...state.tasks[action.taskId],
                reportStatus: action.reportStatus,
              },
            },
          };
    case t.CLEAR_CSAM_REPORT:
      return isCSAMActionForContact(action)
        ? {
            ...state,
            contacts: omit(state.contacts, action.contactId),
          }
        : {
            ...state,
            tasks: omit(state.tasks, action.taskId),
          };
    case t.NEW_DRAFT_CSAM_REPORT:
      return isCSAMActionForContact(action)
        ? {
            ...state,
            contacts: {
              ...state.contacts,
              [action.contactId]: {
                reportType: action.reportType,
                form: (state.contacts[action.contactId] as any)?.form,
              },
            },
          }
        : {
            ...state,
            tasks: {
              ...state.tasks,
              [action.taskId]: {
                reportType: action.reportType,
                form: (state.contacts[action.taskId] as any)?.form,
              },
            },
          };
    default:
      return state;
  }
}
