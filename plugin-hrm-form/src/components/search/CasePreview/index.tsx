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
import { Flex, PreviewWrapper } from '../../../styles';
import getUpdatedDate from '../../../states/getUpdatedDate';
import { PreviewDescription } from '../PreviewDescription';
import { getDefinitionVersion } from '../../../services/ServerlessService';
import { updateDefinitionVersion } from '../../../states/configuration/actions';
import { RootState } from '../../../states';
import TagsAndCounselor from '../TagsAndCounselor';
import { namespace } from '../../../states/storeNamespaces';
import asyncDispatch from '../../../states/asyncDispatch';
import { connectToCaseAsyncAction } from '../../../states/contacts/saveContact';
import selectContactByTaskSid from '../../../states/contacts/selectContactByTaskSid';
import { isStandaloneITask } from '../../case/Case';
import { newCloseModalAction } from '../../../states/routing/actions';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { getAseloFeatureFlags } from '../../../hrmConfig';
import { PreviewRow } from '../styles';
import { selectFirstCaseContact } from '../../../states/contacts/selectContactByCaseId';
import { contactLabelFromHrmContact } from '../../../states/contacts/contactIdentifier';

type OwnProps = {
  currentCase: Case;
  onClickViewCase: () => void;
  counselorsHash: { [sid: string]: string };
  task: RouterTask;
};

const mapStateToProps = (state: RootState, { task, currentCase }: OwnProps) => {
  const taskContact = isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact;
  const firstConnectedContact = selectFirstCaseContact(state, currentCase);
  return {
    definitionVersions: state[namespace].configuration.definitionVersions,
    taskContact,
    firstConnectedContact,
    isConnectedToTaskContact: Boolean(taskContact?.caseId && taskContact.caseId === currentCase?.id),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task, currentCase }: OwnProps) => ({
  connectCaseToTaskContact: async (taskContact: Contact) => {
    await asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, currentCase.id));
  },
  closeModal: () => dispatch(newCloseModalAction(task.taskSid)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const CasePreview: React.FC<Props> = ({
  currentCase,
  onClickViewCase,
  counselorsHash,
  definitionVersions,
  taskContact,
  firstConnectedContact,
  isConnectedToTaskContact,
  connectCaseToTaskContact,
  closeModal,
}) => {
  const { id, createdAt, status, info, twilioWorkerId, categories } = currentCase;
  const updatedAtObj = getUpdatedDate(currentCase);
  const followUpDateObj = info.followUpDate ? new Date(info.followUpDate) : undefined;
  const { definitionVersion: versionId } = info;
  const orphanedCase = !firstConnectedContact;
  const { caseInformation } = (firstConnectedContact || {}).rawJson || {};
  const { callSummary } = caseInformation || {};
  const summary = info?.summary || callSummary;
  const counselor = counselorsHash[twilioWorkerId];

  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  useEffect(() => {
    if (versionId && !definitionVersions[versionId]) {
      getDefinitionVersion(versionId).then(definitionVersion => updateDefinitionVersion(versionId, definitionVersion));
    }
  }, [versionId, definitionVersions]);

  const definitionVersion = definitionVersions[versionId];

  const statusLabel = definitionVersion?.caseStatus[status]?.label ?? status;
  let showConnectButton = false;

  if (getAseloFeatureFlags().enable_case_merging && taskContact) {
    showConnectButton = Boolean(
      can(PermissionActions.UPDATE_CASE_CONTACTS, currentCase) &&
        can(PermissionActions.ADD_CONTACT_TO_CASE, taskContact) &&
        !orphanedCase &&
        (!taskContact.caseId || isConnectedToTaskContact),
    );
  }
  const contactLabel = contactLabelFromHrmContact(definitionVersion, firstConnectedContact, {
    substituteForId: false,
    placeholder: '',
  });

  return (
    <Flex width="100%">
      <PreviewWrapper>
        <CaseHeader
          caseId={id}
          contactLabel={contactLabel}
          createdAt={createdAt}
          updatedAt={updatedAtObj ? updatedAtObj.toISOString() : ''}
          followUpDate={followUpDateObj}
          onClickViewCase={onClickViewCase}
          isOrphanedCase={orphanedCase}
          status={status}
          statusLabel={statusLabel}
          isConnectedToTaskContact={isConnectedToTaskContact}
          showConnectButton={showConnectButton}
          onClickConnectToTaskContact={() => {
            connectCaseToTaskContact(taskContact);
            closeModal();
          }}
        />
        <PreviewRow>
          {summary && (
            <PreviewDescription expandLinkText="ReadMore" collapseLinkText="ReadLess">
              {summary}
            </PreviewDescription>
          )}
        </PreviewRow>
        <TagsAndCounselor counselor={counselor} categories={categories} definitionVersion={definitionVersion} />
      </PreviewWrapper>
    </Flex>
  );
};

CasePreview.displayName = 'CasePreview';

const connected = connector(CasePreview);

export default connected;
