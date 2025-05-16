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
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Case, RouterTask } from '../../../types/types';
import CaseHeader from './CaseHeader';
import { Flex, PreviewWrapper } from '../../../styles';
import getUpdatedDate from '../../../states/getUpdatedDate';
import { PreviewDescription } from '../PreviewDescription';
import { getDefinitionVersion } from '../../../services/ServerlessService';
import { updateDefinitionVersion } from '../../../states/configuration/actions';
import { RootState } from '../../../states';
import TagsAndCounselor from '../TagsAndCounselor';
import asyncDispatch from '../../../states/asyncDispatch';
import { connectToCaseAsyncAction } from '../../../states/contacts/saveContact';
import { newCloseModalAction } from '../../../states/routing/actions';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { PreviewRow } from '../styles';
import selectContactStateByContactId from '../../../states/contacts/selectContactStateByContactId';
import selectContextContactId from '../../../states/contacts/selectContextContactId';
import { selectDefinitionVersions } from '../../../states/configuration/selectDefinitions';
import {
  newGetTimelineAsyncAction,
  selectCaseLabel,
  selectTimelineContactCategories,
  selectTimelineCount,
} from '../../../states/case/timeline';

type Props = {
  currentCase: Case;
  onClickViewCase: () => void;
  counselorsHash: { [sid: string]: string };
  task: RouterTask;
};

const CONTACTS_TIMELINE_ID = 'print-contacts';

const CasePreview: React.FC<Props> = ({ currentCase, onClickViewCase, counselorsHash, task }) => {
  const contactId = useSelector((state: RootState) =>
    selectContextContactId(state, task.taskSid, 'search', 'case-results'),
  );
  const definitionVersions = useSelector(selectDefinitionVersions);
  const taskContact = useSelector((state: RootState) => selectContactStateByContactId(state, contactId)?.savedContact);
  const isConnectedToTaskContact = Boolean(taskContact?.caseId && taskContact.caseId === currentCase?.id);
  const timelineCategories = useSelector((state: RootState) =>
    selectTimelineContactCategories(state, currentCase.id, CONTACTS_TIMELINE_ID),
  );
  const contactCount = useSelector((state: RootState) =>
    selectTimelineCount(state, currentCase.id, CONTACTS_TIMELINE_ID),
  );
  const caseLabel = useSelector((state: RootState) =>
    selectCaseLabel(state, currentCase.id, CONTACTS_TIMELINE_ID, {
      substituteForId: false,
      placeholder: '',
    }),
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!timelineCategories) {
      dispatch(
        newGetTimelineAsyncAction(
          currentCase.id,
          CONTACTS_TIMELINE_ID,
          [],
          true,
          { offset: 0, limit: 10000 },
          `search-${task.taskSid}`,
        ),
      );
    }
  }, [timelineCategories, currentCase.id, dispatch, task.taskSid]);

  const { id, createdAt, status, info, twilioWorkerId } = currentCase;
  const updatedAtObj = getUpdatedDate(currentCase);
  const followUpDateObj = info.followUpDate ? new Date(info.followUpDate) : undefined;
  const { definitionVersion: versionId } = info;
  const orphanedCase = contactCount === 0;
  const summary = info?.summary;
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

  if (taskContact) {
    showConnectButton = Boolean(
      can(PermissionActions.UPDATE_CASE_CONTACTS, currentCase) &&
        can(PermissionActions.ADD_CONTACT_TO_CASE, taskContact) &&
        !orphanedCase &&
        (!taskContact.caseId || isConnectedToTaskContact),
    );
  }

  return (
    <Flex width="100%">
      <PreviewWrapper>
        <CaseHeader
          caseId={id}
          caseLabel={caseLabel}
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
            asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, currentCase.id));
            dispatch(newCloseModalAction(task.taskSid));
          }}
        />
        <PreviewRow>
          {summary && (
            <PreviewDescription expandLinkText="ReadMore" collapseLinkText="ReadLess">
              {summary}
            </PreviewDescription>
          )}
        </PreviewRow>
        <TagsAndCounselor counselor={counselor} categories={timelineCategories} definitionVersion={definitionVersion} />
      </PreviewWrapper>
    </Flex>
  );
};

CasePreview.displayName = 'CasePreview';

export default CasePreview;
