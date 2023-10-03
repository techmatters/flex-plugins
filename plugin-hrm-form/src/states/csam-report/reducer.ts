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
import { CSAMReportStateEntry } from './types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import findContactByTaskSid from '../contacts/findContactByTaskSid';

type CSAMReportState = {
  contacts: {
    [contactId: string]: CSAMReportStateEntry;
  };
};

export const initialState: CSAMReportState = {
  contacts: {},
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function reduce(
  state = initialState,
  action: t.CSAMReportActionType | RemoveContactStateAction,
): CSAMReportState {
  switch (action.type) {
    case REMOVE_CONTACT_STATE:
    case t.REMOVE_DRAFT_CSAM_REPORT:
      return {
        ...state,
        contacts: omit(state.contacts, action.contactId),
      };
    case t.UPDATE_FORM:
      /*
       * TS type inference not so smart here, can't work out that the value of 'reportType' constrains the type of 'form'
       * There are verbose workarounds that don't resort to 'as any' but this seems the best compromise
       */
      return {
        ...state,
        contacts: {
          ...state.contacts,
          [action.contactId]: {
            ...state.contacts[action.contactId],
            reportType: action.reportType,
            form: action.form as any,
          },
        },
      };
    case t.UPDATE_STATUS:
      return {
        ...state,
        contacts: {
          ...state.contacts,
          [action.contactId]: {
            ...state.contacts[action.contactId],
            reportStatus: action.reportStatus,
          },
        },
      };
    case t.NEW_DRAFT_CSAM_REPORT:
      return {
        ...state,
        contacts: {
          ...state.contacts,
          [action.contactId]: {
            reportType: action.reportType ?? state.contacts[action.contactId]?.reportType,
            form: action.createForm ? {} : (state.contacts[action.contactId] as any)?.form,
          },
        },
      };
    default:
      return state;
  }
}
