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

import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { callTypes } from 'hrm-form-definitions';

import { RootState } from '../../states';
import asyncDispatch from '../../states/asyncDispatch';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import { ContactDraftChanges } from '../../states/contacts/existingContacts';
import { updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { Contact } from '../../types/types';
import Search from '../search';
import { TabbedFormsCommonProps } from './types';

type OwnProps = TabbedFormsCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const { savedContact, draftContact } = selectContactByTaskSid(state, taskSid);
  return {
    draftContact,
    savedContact,
    updatedContact: getUnsavedContact(savedContact, draftContact),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => ({
  saveDraft: (savedContact: Contact, draftContact: ContactDraftChanges) =>
    asyncDispatch(dispatch)(updateContactInHrmAsyncAction(savedContact, draftContact, task.taskSid)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedFormsSearch: React.FC<Props> = ({ task, draftContact, savedContact, saveDraft }) => {
  return (
    <Search
      task={task}
      currentIsCaller={savedContact?.rawJson?.callType === callTypes.caller}
      saveUpdates={() => saveDraft(savedContact, draftContact)}
    />
  );
};

TabbedFormsSearch.displayName = 'TabbedFormsSearch';

export default connector(TabbedFormsSearch);
