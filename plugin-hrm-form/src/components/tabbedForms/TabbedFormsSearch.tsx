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

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { callTypes } from 'hrm-types';
import { AnyAction } from 'redux';

import { RootState } from '../../states';
import asyncDispatch from '../../states/asyncDispatch';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import { ContactDraftChanges } from '../../states/contacts/existingContacts';
import { updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { Contact } from '../../types/types';
import Search from '../search';
import { TabbedFormsCommonProps } from './types';

type Props = TabbedFormsCommonProps;

const TabbedFormsSearch: React.FC<Props> = ({ task }) => {
  const dispatch = useDispatch();
  const { savedContact, draftContact } = useSelector((state: RootState) =>
    selectContactByTaskSid(state, task.taskSid),
  );
  const updatedContact = getUnsavedContact(savedContact, draftContact);

  const saveDraft = async (savedContact: Contact, draftContact: ContactDraftChanges) => {
    await asyncDispatch<AnyAction>(dispatch)(updateContactInHrmAsyncAction(savedContact, draftContact, task.taskSid));
  };
  return (
    <Search
      task={task}
      currentIsCaller={savedContact?.rawJson?.callType === callTypes.caller}
      saveUpdates={() => saveDraft(savedContact, draftContact)}
    />
  );
};

TabbedFormsSearch.displayName = 'TabbedFormsSearch';

export default TabbedFormsSearch;
