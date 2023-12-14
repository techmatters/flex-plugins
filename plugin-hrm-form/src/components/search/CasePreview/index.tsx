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

/* eslint-disable react/prop-types */
import React, { Dispatch, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Case, Contact, RouterTask } from '../../../types/types';
import CaseHeader from './CaseHeader';
import { Flex, PreviewWrapper } from '../../../styles/HrmStyles';
import getUpdatedDate from '../../../states/getUpdatedDate';
import { PreviewDescription } from '../PreviewDescription';
import { getDefinitionVersion } from '../../../services/ServerlessService';
import { updateDefinitionVersion } from '../../../states/configuration/actions';
import { RootState } from '../../../states';
import TagsAndCounselor from '../TagsAndCounselor';
import { contactLabelFromHrmContact } from '../../../states/contacts/contactIdentifier';
import { namespace } from '../../../states/storeNamespaces';
import asyncDispatch from '../../../states/asyncDispatch';
import { connectToCaseAsyncAction } from '../../../states/contacts/saveContact';
import selectContactByTaskSid from '../../../states/contacts/selectContactByTaskSid';
import { isStandaloneITask } from '../../case/Case';
import { newCloseModalAction } from '../../../states/routing/actions';
import { getPermissionsForCase, getPermissionsForContact, PermissionActions } from '../../../permissions';
import { getAseloFeatureFlags } from '../../../hrmConfig';
import { setCaseConnectedToContact } from '../../../states/contacts/actions';

type OwnProps = {
  currentCase: Case;
  onClickViewCase: () => void;
  counselorsHash: { [sid: string]: string };
  task: RouterTask;
};

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const taskContact = isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact;
  return {
    definitionVersions: state[namespace].configuration.definitionVersions,
    taskContact,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task, currentCase }: OwnProps) => ({
  connectCaseToTaskContact: async (taskContact: Contact) => {
    await asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, currentCase.id));
  },
  closeModal: () => dispatch(newCloseModalAction(task.taskSid)),
  setCaseConnectedToContact: (connectedCase: Case, contactId: string) =>
    dispatch(setCaseConnectedToContact(connectedCase, contactId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const CasePreview: React.FC<Props> = ({
  currentCase,
  onClickViewCase,
  counselorsHash,
  definitionVersions,
  taskContact,
  connectCaseToTaskContact,
  closeModal,
  setCaseConnectedToContact,
}) => {
  const { id, createdAt, connectedContacts, status, info, twilioWorkerId } = currentCase;
  const createdAtObj = new Date(createdAt);
  const updatedAtObj = getUpdatedDate(currentCase);
  const followUpDateObj = info.followUpDate ? new Date(info.followUpDate) : undefined;
  const { definitionVersion: versionId } = info;
  const orphanedCase = !connectedContacts || connectedContacts.length === 0;
  const firstContact = !orphanedCase && connectedContacts[0];
  const { categories, caseInformation } = (firstContact || {}).rawJson || {};
  const { callSummary } = caseInformation || {};
  const summary = info?.summary || callSummary;
  const counselor = counselorsHash[twilioWorkerId];

  useEffect(() => {
    if (versionId && !definitionVersions[versionId]) {
      getDefinitionVersion(versionId).then(definitionVersion => updateDefinitionVersion(versionId, definitionVersion));
    }
  }, [versionId, definitionVersions]);

  const definitionVersion = definitionVersions[versionId];

  const statusLabel = definitionVersion?.caseStatus[status]?.label ?? status;
  const contactLabel = contactLabelFromHrmContact(definitionVersion, firstContact, {
    substituteForId: false,
    placeholder: '',
  });
  let isConnectedToTaskContact = false;
  let showConnectButton = false;

  if (getAseloFeatureFlags().enable_case_merging && taskContact) {
    isConnectedToTaskContact = Boolean(connectedContacts?.find(contact => contact.id === taskContact.id));

    const { can: canForCase } = getPermissionsForCase(currentCase.twilioWorkerId, currentCase.status);
    const { can: canForContact } = getPermissionsForContact(taskContact?.twilioWorkerId);
    showConnectButton = Boolean(
      canForCase(PermissionActions.UPDATE_CASE_CONTACTS) &&
        canForContact(PermissionActions.ADD_CONTACT_TO_CASE) &&
        connectedContacts?.length &&
        (!taskContact.caseId || isConnectedToTaskContact),
    );
  }
  return (
    <Flex width="100%">
      <PreviewWrapper>
        <CaseHeader
          caseId={id}
          contactLabel={contactLabel}
          createdAt={createdAtObj}
          updatedAt={updatedAtObj}
          followUpDate={followUpDateObj}
          onClickViewCase={onClickViewCase}
          isOrphanedCase={orphanedCase}
          status={status}
          statusLabel={statusLabel}
          isConnectedToTaskContact={isConnectedToTaskContact}
          showConnectButton={showConnectButton}
          onClickConnectToTaskContact={() => {
            connectCaseToTaskContact(taskContact);
            setCaseConnectedToContact(currentCase, taskContact.id);
            closeModal();
          }}
        />
        {summary && (
          <PreviewDescription expandLinkText="ReadMore" collapseLinkText="ReadLess">
            {summary}
          </PreviewDescription>
        )}

        <TagsAndCounselor counselor={counselor} categories={categories} definitionVersion={definitionVersion} />
      </PreviewWrapper>
    </Flex>
  );
};

CasePreview.displayName = 'CasePreview';

const connected = connector(CasePreview);

export default connected;
