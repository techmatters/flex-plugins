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

/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-empty-function */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersion, StatusInfo } from 'hrm-form-definitions';

import CaseTags from './CaseTags';
import CaseDetailsHeader from './caseDetails/CaseDetailsHeader';
import {
  DetailsContainer,
  DetailDescription,
  StyledInputField,
  CaseDetailsBorder,
  CaseSectionFont,
  ViewButton,
} from './styles';
import { Box } from '../../styles/HrmStyles';
import { PermissionActions } from '../../permissions';
import { getLocaleDateTime } from '../../utils/helpers';

type Props = {
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
  isCreating?: boolean;
  editCaseSummary: () => void;
  handlePrintCase: () => void;
  availableStatusTransitions: StatusInfo[];
  can: (action: string) => boolean;
};

const CaseDetails: React.FC<Props> = ({
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
  isCreating,
  editCaseSummary,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const formattedCreatedAt = getLocaleDateTime(createdAt);
  const formattedUpdatedAt = createdAt === updatedAt ? '—' : getLocaleDateTime(updatedAt);
  const editButton =
    can(PermissionActions.EDIT_CASE_SUMMARY) ||
    can(PermissionActions.EDIT_FOLLOW_UP_DATE) ||
    can(PermissionActions.EDIT_CHILD_IS_AT_RISK) ||
    availableStatusTransitions.length > 1; // availableStatusTransitions always includes current status, if that's the only one available, you cannot change it
  const formatFollowUpDate = getLocaleDateTime(followUpDate);

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
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsStatusLabel">
                <Template code="Case-CaseDetailsStatusLabel" />
              </label>
            </DetailDescription>
            <StyledInputField
              data-testid="Case-Details_CaseStatus"
              id="Details_CaseStatus"
              name="Details_CaseStatus"
              aria-labelledby="CaseDetailsStatusLabel"
              disabled={true}
              defaultValue={statusLabel}
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseChildIsAtRisk">
                <Template code="Case-ChildIsAtRisk" />
              </label>
            </DetailDescription>
            <StyledInputField
              data-testid="Case-Details_ChildAtRisk"
              id="Details_ChildAtRisk"
              name="Details_ChildAtRisk"
              aria-labelledby="CaseDetailsStatusLabel"
              disabled={true}
              defaultValue={childIsAtRisk ? 'Yes' : 'No'}
              color={childIsAtRisk ? '#d22f2f' : '#d8d8d8'}
            />
          </div>
        </div>
      </DetailsContainer>
      <DetailsContainer aria-labelledby="Case-CaseId-label">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsDateOpened">
                <Template code="Case-CaseDetailsDateOpened" />
              </label>
            </DetailDescription>
            <StyledInputField
              data-testid="Case-Details_DateOpened"
              disabled
              id="Details_DateOpened"
              value={formattedCreatedAt}
              aria-labelledby="CaseDetailsDateOpened"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsLastUpdated">
                <Template code="Case-CaseDetailsLastUpdated" />
              </label>
            </DetailDescription>
            <StyledInputField
              data-testid="Case-Details_DateLastUpdated"
              disabled
              id="Details_DateLastUpdated"
              value={formattedUpdatedAt}
              aria-labelledby="CaseDetailsLastUpdated"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsFollowUpDate">
                <Template code="Case-CaseDetailsFollowUpDate" />
              </label>
            </DetailDescription>
            <StyledInputField
              id="Details_DateFollowUp"
              name="Details_DateFollowUp"
              data-testid="Case-Details_DateFollowUp"
              disabled={true}
              defaultValue={formatFollowUpDate === 'Invalid Date' ? '—' : formatFollowUpDate}
              aria-labelledby="CaseDetailsFollowUpDate"
            />
          </div>
        </div>
      </DetailsContainer>
    </>
  );
};

CaseDetails.displayName = 'CaseDetails';

export default CaseDetails;
