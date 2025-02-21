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
import CaseTags from '../casePrint/CasePrintTags';
import CaseDetailsHeader from './CaseDetailsHeader';
import { CaseDetailsBorder, CaseSectionFont, DetailsContainer, ViewButton } from '../styles';
import { Box } from '../../../styles';
import { PermissionActions } from '../../../permissions';
import CaseSummary from './CaseSummary';
import CaseDetailsInput from './CaseDetailsInput';

type Props = {
  task: CustomITask | StandaloneITask;
  caseId: string;
  categories: { [category: string]: string[] };
  counselor: string;
  createdAt: string;
  updatedAt: string | undefined;
  followUpDate: string | undefined;
  statusLabel: string;
  definitionVersion: DefinitionVersion;
  office: string | undefined;
  childIsAtRisk: boolean;
  isOrphanedCase: boolean | undefined;
  editCaseSummary: () => void;
  handlePrintCase: () => void;
  availableStatusTransitions: StatusInfo[];
  can: (action: string) => boolean;
};

const CaseDetails: React.FC<Props> = ({
  task,
  caseId,
  categories,
  counselor,
  createdAt,
  updatedAt = '',
  followUpDate = '',
  statusLabel,
  can,
  office = '',
  childIsAtRisk,
  availableStatusTransitions,
  handlePrintCase,
  definitionVersion,
  isOrphanedCase = false,
  editCaseSummary,
}) => {
  const formattedCreatedAt = parseISO(createdAt).toLocaleDateString();
  const formattedUpdatedAt = createdAt === updatedAt ? '—' : parseISO(updatedAt).toLocaleDateString();
  const editButton = can(PermissionActions.EDIT_CASE_OVERVIEW) || availableStatusTransitions.length > 1; // availableStatusTransitions always includes current status, if that's the only one available, you cannot change it
  const formatFollowUpDate = parseISO(followUpDate).toLocaleDateString();

  console.log('>>> CaseDetailsHeader', { caseId, categoriesKeys: Object.keys(categories), isOrphanedCase });

  return (
    <>
      <CaseDetailsBorder>
        <CaseDetailsHeader
          caseId={caseId}
          counselor={counselor}
          office={office}
          handlePrintCase={handlePrintCase}
          isOrphanedCase={isOrphanedCase}
        />
        <div style={{ paddingTop: '15px' }}>
          <CaseTags definitionVersion={definitionVersion} categories={categories} />
        </div>
      </CaseDetailsBorder>
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
          <CaseDetailsInput
            labelId="CaseDetailsStatusLabel"
            templateCode="Case-CaseDetailsStatusLabel"
            inputId="Details_CaseStatus"
            value={statusLabel}
          />
          <CaseDetailsInput
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
          <CaseDetailsInput
            labelId="CaseDetailsDateOpened"
            templateCode="Case-CaseDetailsDateOpened"
            inputId="Details_DateOpened"
            value={formattedCreatedAt}
          />
          <CaseDetailsInput
            labelId="CaseDetailsLastUpdated"
            templateCode="Case-CaseDetailsLastUpdated"
            inputId="Details_DateLastUpdated"
            value={formattedUpdatedAt}
          />
          <CaseDetailsInput
            labelId="CaseDetailsFollowUpDate"
            templateCode="Case-CaseDetailsFollowUpDate"
            inputId="Details_DateFollowUp"
            value={formatFollowUpDate === 'Invalid Date' ? '—' : formatFollowUpDate}
          />
        </div>
        <CaseSummary task={task} />
      </DetailsContainer>
    </>
  );
};

CaseDetails.displayName = 'CaseDetails';

export default CaseDetails;
