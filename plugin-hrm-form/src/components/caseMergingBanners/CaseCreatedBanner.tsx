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
import { Template } from '@twilio/flex-ui';

import InfoIcon from './InfoIcon';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction } from '../../states/contacts/saveContact';
import { newGoBackAction } from '../../states/routing/actions';
import { getOfflineContactTaskSid } from '../../states/contacts/offlineContactTask';
import { cancelCaseAsyncAction } from '../../states/case/saveCase';
import { showRemovedFromCaseBannerAction } from '../../states/case/caseBanners';
import { CustomITask, StandaloneITask } from '../../types/types';
import { BannerAction, BannerContainer, BannerText } from '../../styles/banners';
import { getInitializedCan } from '../../permissions/rules';
import { selectContactsByCaseIdInCreatedOrder } from '../../states/contacts/selectContactByCaseId';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';
import { PermissionActions } from '../../permissions/actions';
import { RootState } from '../../states';

type Props = {
  task?: CustomITask | StandaloneITask;
  caseId: string;
};

const CreatedCaseBanner: React.FC<Props> = ({ task, caseId }) => {
  const dispatch = useDispatch();
  const taskSid = task ? task.taskSid : getOfflineContactTaskSid();
  const cas = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.connectedCase);
  const caseContacts = useSelector((state: RootState) => selectContactsByCaseIdInCreatedOrder(state, caseId));
  const taskContact = useSelector((state: RootState) => selectContactByTaskSid(state, taskSid)?.savedContact);
  const hasOtherContacts = Boolean(caseContacts.find(contact => contact.savedContact?.taskId !== taskSid));

  const removeContactFromCase = async (contactId: string) =>
    asyncDispatch(dispatch)(removeFromCaseAsyncAction(contactId));
  const cancelCase = async (caseId: string) => asyncDispatch(dispatch)(cancelCaseAsyncAction(caseId));
  const showRemovedFromCaseBanner = (contactId: string) => dispatch(showRemovedFromCaseBannerAction(contactId));
  const navigateBack = (taskSid: string) => dispatch(newGoBackAction(taskSid));
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
      <BannerText>
        <Template
          code={hasOtherContacts ? 'CaseMerging-ContactAddedToExistingCase' : 'CaseMerging-CaseCreatedAndContactAdded'}
          caseId={caseId}
        />
      </BannerText>
      {canRemoveContactsFromCase && (
        <BannerAction type="button" onClick={handleCancelCase} data-fs-id="CancelNewCase-Button">
          <Template code={hasOtherContacts ? 'CaseMerging-RemoveFromCase' : 'CaseMerging-CancelCase'} />
        </BannerAction>
      )}
    </BannerContainer>
  );
};

CreatedCaseBanner.displayName = 'CreatedCaseBanner';

export default CreatedCaseBanner;
