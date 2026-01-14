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

import { Case, Contact, CustomITask, StandaloneITask } from '../../types/types';
import { getInitializedCan } from '../../permissions/rules';
import { RootState } from '../../states';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import { Flex } from '../../styles';
import InfoIcon from './InfoIcon';
import ConnectToCaseButton from '../case/ConnectToCaseButton';
import asyncDispatch from '../../states/asyncDispatch';
import { connectToCaseAsyncAction } from '../../states/contacts/saveContact';
import { newCloseModalAction } from '../../states/routing/actions';
import { BannerContainer, BannerText } from '../../styles/banners';
import selectContextContactId from '../../states/contacts/selectContextContactId';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { selectFirstContactByCaseId } from '../../states/contacts/selectContactByCaseId';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { isCaseRoute } from '../../states/routing/types';
import { PermissionActions } from '../../permissions/actions';

type Props = {
  task: CustomITask | StandaloneITask;
};

const AddToCaseBanner: React.FC<Props> = ({ task }: Props) => {
  const dispatch = useDispatch();
  const route = useSelector((state: RootState) => selectCurrentTopmostRouteForTask(state, task.taskSid));
  const { connectedCase } = useSelector((state: RootState) => selectCurrentRouteCaseState(state, task.taskSid) ?? {});
  const contactId = useSelector((state: RootState) => selectContextContactId(state, task.taskSid, 'case', 'home'));
  const contact = useSelector((state: RootState) => selectContactStateByContactId(state, contactId)?.savedContact);
  const isOrphanedCase = useSelector((state: RootState) => {
    if (!isCaseRoute(route)) return true;
    return !selectFirstContactByCaseId(state, route.caseId);
  });

  const connectCaseToContact = async (taskContact: Contact, cas: Case) =>
    asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, cas.id));
  const closeModal = () =>
    dispatch(newCloseModalAction(task.taskSid, task.taskSid === 'standalone-task-sid' ? 'contact' : 'tabbed-forms'));
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const isConnectedToTaskContact = contact && contact.caseId === connectedCase.id;

  const showConnectToCaseButton = Boolean(
    contact &&
      !contact.caseId &&
      !isConnectedToTaskContact &&
      !isOrphanedCase &&
      can(PermissionActions.UPDATE_CASE_CONTACTS, connectedCase) &&
      can(PermissionActions.ADD_CONTACT_TO_CASE, contact),
  );

  if (!showConnectToCaseButton) {
    return null;
  }

  return (
    <BannerContainer color="yellow" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
      <Flex width="100%" justifyContent="space-between">
        <Flex alignItems="center">
          <InfoIcon color="#fed44b" />
          <BannerText>
            <Template code="CaseMerging-AddContactToCase" />
          </BannerText>
        </Flex>
        <ConnectToCaseButton
          caseId={connectedCase.id}
          isConnectedToTaskContact={isConnectedToTaskContact}
          onClickConnectToTaskContact={() => {
            connectCaseToContact(contact, connectedCase);
            closeModal();
          }}
          color="black"
        />
      </Flex>
    </BannerContainer>
  );
};

AddToCaseBanner.displayName = 'AddToCaseBanner';

export default AddToCaseBanner;
