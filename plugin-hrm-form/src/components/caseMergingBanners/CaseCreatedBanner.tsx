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
import { Template } from '@twilio/flex-ui';

import InfoIcon from './InfoIcon';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction } from '../../states/contacts/saveContact';
import { newGoBackAction } from '../../states/routing/actions';
import { getOfflineContactTaskSid } from '../../states/contacts/offlineContactTask';
import { cancelCaseAsyncAction } from '../../states/case/saveCase';
import { showRemovedFromCaseBannerAction } from '../../states/case/caseBanners';
import { CustomITask, StandaloneITask } from '../../types/types';
import { BannerActionLink, BannerContainer, Text } from '../../styles/banners';
import { getInitializedCan, PermissionActions } from '../../permissions';
import { selectContactsByCaseIdInCreatedOrder } from '../../states/contacts/selectContactByCaseId';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';

type OwnProps = {
  task?: CustomITask | StandaloneITask;
  caseId: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const mapStateToProps = (state, { task, caseId }: OwnProps) => {
  const taskSid = task ? task.taskSid : getOfflineContactTaskSid();
  const cas = selectCaseByCaseId(state, caseId)?.connectedCase;
  const caseContacts = selectContactsByCaseIdInCreatedOrder(state, caseId);
  const taskContact = selectContactByTaskSid(state, taskSid)?.savedContact;
  return {
    cas,
    taskSid,
    hasOtherContacts: Boolean(caseContacts.find(contact => contact.savedContact?.taskId !== taskSid)),
    taskContact,
  };
};

const mapDispatchToProps = dispatch => ({
  removeContactFromCase: async (contactId: string) => asyncDispatch(dispatch)(removeFromCaseAsyncAction(contactId)),
  cancelCase: async (caseId: string) => asyncDispatch(dispatch)(cancelCaseAsyncAction(caseId)),
  showRemovedFromCaseBanner: (contactId: string) => dispatch(showRemovedFromCaseBannerAction(contactId)),
  navigateBack: (taskSid: string) => dispatch(newGoBackAction(taskSid)),
});

const CreatedCaseBanner: React.FC<Props> = ({
  task: { taskSid },
  caseId,
  cas,
  hasOtherContacts,
  taskContact,
  removeContactFromCase,
  cancelCase,
  showRemovedFromCaseBanner,
  navigateBack,
}) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const canRemoveContactsFromCase =
    can(PermissionActions.REMOVE_CONTACT_FROM_CASE, taskContact) && can(PermissionActions.UPDATE_CASE_CONTACTS, cas);

  const handleCancelCase = async () => {
    await removeContactFromCase(taskContact?.id);

    // Navigating back before removing the case provides a better user experience.
    navigateBack(taskSid);
    showRemovedFromCaseBanner(taskContact?.id);
    if (!hasOtherContacts) {
      await cancelCase(caseId);
    }
  };

  return (
    <BannerContainer color="blue">
      <InfoIcon color="#001489" />
      <Text>
        <Template
          code={hasOtherContacts ? 'CaseMerging-ContactAddedToExistingCase' : 'CaseMerging-CaseCreatedAndContactAdded'}
          caseId={caseId}
        />
      </Text>
      {canRemoveContactsFromCase && (
        <BannerActionLink type="button" onClick={handleCancelCase} data-fs-id="CancelNewCase-Button">
          <Template code={hasOtherContacts ? 'CaseMerging-RemoveFromCase' : 'CaseMerging-CancelCase'} />
        </BannerActionLink>
      )}
    </BannerContainer>
  );
};

CreatedCaseBanner.displayName = 'CreatedCaseBanner';

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CreatedCaseBanner);
