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

/* eslint-disable import/no-unused-modules */
import { callTypes, DataCallTypes } from 'hrm-form-definitions';

import * as t from './types';
import { ContactState, EXISTING_CONTACT_UPDATE_DRAFT_ACTION, ExistingContactAction } from './existingContacts';

export const saveEndMillis = (taskId: string): t.ContactsActionType => ({ type: t.SAVE_END_MILLIS, taskId });

export const prepopulateForm = (
  callType: DataCallTypes,
  values: { [property: string]: string },
  contactId: string,
  isCaseInfo?: Boolean,
): ExistingContactAction => {
  let formName = callType === callTypes.child ? 'childInformation' : 'callerInformation';
  if (isCaseInfo) formName = 'caseInformation';
  return {
    type: EXISTING_CONTACT_UPDATE_DRAFT_ACTION,
    contactId,
    draft: {
      rawJson: {
        callType,
        [formName]: values,
      },
    },
  };
};

export const restoreEntireContact = (contact: ContactState): t.ContactsActionType => ({
  type: t.RESTORE_ENTIRE_FORM,
  contact,
});

export const setCallType = (isCallTypeCaller: boolean): t.ContactsActionType => ({
  type: t.SET_CALL_TYPE,
  isCallTypeCaller,
});
