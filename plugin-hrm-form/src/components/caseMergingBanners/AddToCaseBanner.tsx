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
import { Template } from '@twilio/flex-ui';

import { Case, Contact, CustomITask, StandaloneITask } from '../../types/types';
import { getInitializedCan, PermissionActions } from '../../permissions';
import { RootState } from '../../states';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import { isStandaloneITask } from '../case/Case';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { Flex } from '../../styles';
import InfoIcon from './InfoIcon';
import ConnectToCaseButton from '../case/ConnectToCaseButton';
import asyncDispatch from '../../states/asyncDispatch';
import { connectToCaseAsyncAction } from '../../states/contacts/saveContact';
import { newCloseModalAction } from '../../states/routing/actions';
import { BannerContainer, Text } from '../../styles/banners';
import selectContextContactId from '../../states/contacts/selectContextContactId';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';

type MyProps = {
  task: CustomITask | StandaloneITask;
};

const mapStateToProps = (state: RootState, { task }: MyProps) => {
  const { connectedCase } = selectCurrentRouteCaseState(state, task.taskSid) ?? {};
  const contactId = selectContextContactId(state, task.taskSid, 'case', 'home');
  const taskContact = selectContactStateByContactId(state, contactId)?.savedContact;

  return { connectedCase, taskContact };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: MyProps) => ({
  connectCaseToTaskContact: async (taskContact: Contact, cas: Case) =>
    asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, cas.id)),
  closeModal: () =>
    dispatch(newCloseModalAction(task.taskSid, task.taskSid === 'standalone-task-sid' ? 'contact' : 'tabbed-forms')),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = MyProps & ConnectedProps<typeof connector>;

const AddToCaseBanner: React.FC<Props> = ({
  connectedCase,
  taskContact,
  connectCaseToTaskContact,
  closeModal,
}: Props) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const isConnectedToTaskContact = taskContact && taskContact.caseId === connectedCase.id;

  const showConnectToCaseButton = Boolean(
    taskContact &&
      !taskContact.caseId &&
      !isConnectedToTaskContact &&
      connectedCase?.connectedContacts?.length &&
      can(PermissionActions.UPDATE_CASE_CONTACTS, connectedCase) &&
      can(PermissionActions.ADD_CONTACT_TO_CASE, taskContact),
  );

  if (!showConnectToCaseButton) {
    return null;
  }

  return (
    <BannerContainer color="yellow" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
      <Flex width="100%" justifyContent="space-between">
        <Flex alignItems="center">
          <InfoIcon color="#fed44b" />
          <Text>
            <Template code="CaseMerging-AddContactToCase" />
          </Text>
        </Flex>
        <ConnectToCaseButton
          caseId={connectedCase.id}
          isConnectedToTaskContact={isConnectedToTaskContact}
          onClickConnectToTaskContact={() => {
            connectCaseToTaskContact(taskContact, connectedCase);
            closeModal();
          }}
          color="black"
        />
      </Flex>
    </BannerContainer>
  );
};

AddToCaseBanner.displayName = 'AddToCaseBanner';

export default connector(AddToCaseBanner);
