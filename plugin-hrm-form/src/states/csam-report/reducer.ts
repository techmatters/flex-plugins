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

import { omit } from 'lodash';

import * as t from './types';
import { isCSAMActionForContact, CSAMReportStateEntry } from './types';
import { GeneralActionType, REMOVE_CONTACT_STATE } from '../types';

type CSAMReportState = {
  tasks: {
    [taskId: string]: CSAMReportStateEntry;
  };
  contacts: {
    [taskId: string]: CSAMReportStateEntry;
  };
};

export const initialState: CSAMReportState = {
  tasks: {},
  contacts: {},
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function reduce(state = initialState, action: t.CSAMReportActionType | GeneralActionType): CSAMReportState {
  switch (action.type) {
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
                reportType: action.reportType,
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
                reportType: action.reportType,
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
    case t.REMOVE_DRAFT_CSAM_REPORT:
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
                reportType: action.reportType ?? state.contacts[action.contactId]?.reportType,
                form: action.createForm ? {} : (state.contacts[action.contactId] as any)?.form,
              },
            },
          }
        : {
            ...state,
            tasks: {
              ...state.tasks,
              [action.taskId]: {
                reportType: action.reportType ?? state.tasks[action.taskId]?.reportType,
                form: action.createForm ? {} : (state.tasks[action.taskId] as any)?.form,
              },
            },
          };
    default:
      return state;
  }
}
