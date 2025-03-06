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

/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersion, StatusInfo } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';

import { CustomITask, StandaloneITask } from '../../../types/types';
import { CaseSectionFont, DetailsContainer, ViewButton } from '../styles';
import { Box } from '../../../styles';
import { PermissionActions } from '../../../permissions';
import CaseSummary from './CaseSummary';
import CaseOverviewItem from './CaseOverviewItem';

type Props = {
  task: CustomITask | StandaloneITask;
  createdAt: string;
  updatedAt: string | undefined;
  followUpDate: string | undefined;
  statusLabel: string;
  definitionVersion: DefinitionVersion;
  childIsAtRisk: boolean;
  editCaseSummary: () => void;
  availableStatusTransitions: StatusInfo[];
  can: (action: string) => boolean;
};

const CaseOverview: React.FC<Props> = ({
  task,
  createdAt,
  updatedAt = '',
  followUpDate = '',
  statusLabel,
  can,
  childIsAtRisk,
  availableStatusTransitions,
  editCaseSummary,
  definitionVersion,
}) => {
  const formattedCreatedAt = parseISO(createdAt).toLocaleDateString();
  const formattedUpdatedAt = createdAt === updatedAt ? '—' : parseISO(updatedAt).toLocaleDateString();
  const editButton = can(PermissionActions.EDIT_CASE_OVERVIEW) || availableStatusTransitions.length > 1; // availableStatusTransitions always includes current status, if that's the only one available, you cannot change it
  const formatFollowUpDate = parseISO(followUpDate).toLocaleDateString();

  return (
    <div>
      <DetailsContainer aria-labelledby="Case-CaseId-label">
        <Box style={{ display: 'inline-block' }}>
          <CaseSectionFont style={{ marginBottom: '5px' }} id="Case-CaseOverview-label">
            <Template code="Case-CaseOverviewLabel" />
          </CaseSectionFont>
        </Box>
        {editButton && (
          <Box style={{ display: 'inline-block' }} alignSelf="flex-end" marginTop="-20px" marginRight="35px">
            <ViewButton onClick={editCaseSummary} data-testid="Case-EditButton">
              <Template code="Case-EditButton" />
            </ViewButton>
          </Box>
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CaseOverviewItem
            labelId="CaseDetailsStatusLabel"
            templateCode="Case-CaseDetailsStatusLabel"
            inputId="Details_CaseStatus"
            value={statusLabel}
          />
          <CaseOverviewItem
            labelId="CaseChildIsAtRisk"
            templateCode="Case-ChildIsAtRisk"
            inputId="Details_ChildAtRisk"
            value={childIsAtRisk ? 'Yes' : 'No'}
            color={childIsAtRisk ? '#d22f2f' : '#d8d8d8'}
          />
        </div>
      </DetailsContainer>
      <DetailsContainer aria-labelledby="Case-CaseId-label">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CaseOverviewItem
            labelId="CaseDetailsDateOpened"
            templateCode="Case-CaseDetailsDateOpened"
            inputId="Details_DateOpened"
            value={formattedCreatedAt}
          />
          <CaseOverviewItem
            labelId="CaseDetailsLastUpdated"
            templateCode="Case-CaseDetailsLastUpdated"
            inputId="Details_DateLastUpdated"
            value={formattedUpdatedAt}
          />
          <CaseOverviewItem
            labelId="CaseDetailsFollowUpDate"
            templateCode="Case-CaseDetailsFollowUpDate"
            inputId="Details_DateFollowUp"
            value={formatFollowUpDate === 'Invalid Date' ? '—' : formatFollowUpDate}
          />
        </div>
        <CaseSummary task={task} />
      </DetailsContainer>
    </div>
  );
};

CaseOverview.displayName = 'CaseOverview';

export default CaseOverview;
