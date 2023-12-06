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
import { connect, ConnectedProps } from 'react-redux';
import { callTypes } from 'hrm-form-definitions';

import asyncDispatch from '../../states/asyncDispatch';
import { updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import { selectContactByTaskSid } from '../../states/contacts/selectContactByTaskSid';
import Search from '../search';
import { TabbedFormsCommonProps } from './types';

type OwnProps = TabbedFormsCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid }, contactId }: OwnProps) => {
  const {
    [namespace]: { routing, activeContacts, configuration },
  } = state;
  const savedContact = selectContactByTaskSid(state, taskSid);

  return {
    contactId,
    savedContact,
    draftContact,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => ({
  saveDraft: (savedContact: Contact, draftContact: ContactDraftChanges) =>
    asyncDispatch(dispatch)(updateContactInHrmAsyncAction(savedContact, draftContact, task.taskSid)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

export const TabbedFormsSearch: React.FC<Props> = ({ task, savedContact }) => {
  const onSelectSearchResult = (searchResult: Contact) => {
    const selectedIsCaller = searchResult.rawJson.callType === callTypes.caller;
    closeModal();
    if (isCallerType && selectedIsCaller && isCallTypeCaller) {
      updateDraftForm({ callerInformation: searchResult.rawJson.callerInformation });
      navigateToTab('callerInformation');
    } else {
      updateDraftForm({ childInformation: searchResult.rawJson.childInformation });
      navigateToTab('childInformation');
    }
  };

  return (
    <Search
      task={task}
      currentIsCaller={savedContact?.rawJson?.callType === callTypes.caller}
      handleSelectSearchResult={onSelectSearchResult}
      contactId={contactId}
      saveUpdates={() => saveDraft(savedContact, draftContact)}
    />
  );
};

export default connector(TabbedFormsSearch);
