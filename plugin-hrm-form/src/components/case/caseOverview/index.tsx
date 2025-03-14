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
import { DefinitionVersion, StatusInfo, CASE_OVERVIEW_FIELDS } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';

import { Case, CustomITask, StandaloneITask } from '../../../types/types';
import { CaseSectionFont, DetailsContainer, ViewButton } from '../styles';
import { Box } from '../../../styles';
import { PermissionActions } from '../../../permissions';
import CaseSummary from './CaseSummary';
import CaseOverviewItem from './CaseOverviewItem';

type Props = {
  task: CustomITask | StandaloneITask;
  can: (action: string) => boolean;
  editCaseOverview: () => void;
  availableStatusTransitions: StatusInfo[];
  definitionVersion: DefinitionVersion;
  connectedCase: Case;
};

const CaseOverview: React.FC<Props> = ({
  task,
  can,
  editCaseOverview,
  availableStatusTransitions,
  definitionVersion,
  connectedCase,
}) => {
  const {
    info: { followUpDate, childIsAtRisk },
    status,
    createdAt,
    updatedAt,
  } = connectedCase;

  const editButton = can(PermissionActions.EDIT_CASE_OVERVIEW) || availableStatusTransitions.length > 1; // availableStatusTransitions always includes current status, if that's the only one available, you cannot change it
  const caseOverviewFields = definitionVersion?.caseOverview;
  const caseOverviewFieldsArray = Object.values(caseOverviewFields);

  // status & childIsAtRisk fields
  const statusLabel = definitionVersion?.caseStatus[status]?.label ?? status;
  const caseStatusField = caseOverviewFieldsArray.filter(field => field.name === CASE_OVERVIEW_FIELDS.CASE_STATUS);
  const childIsAtRiskField = caseOverviewFieldsArray.filter(
    field => field.name === CASE_OVERVIEW_FIELDS.CHILD_IS_AT_RISK,
  );

  // date fields
  const formattedCreatedAt = parseISO(createdAt).toLocaleDateString();
  const formattedUpdatedAt = createdAt === updatedAt ? '—' : parseISO(updatedAt).toLocaleDateString();
  const formattedFollowUpDate = parseISO(followUpDate).toLocaleDateString();

  const renderDateValue = (fieldName: string) => {
    switch (fieldName) {
      case CASE_OVERVIEW_FIELDS.CREATED_AT:
        return formattedCreatedAt;
      case CASE_OVERVIEW_FIELDS.UPDATED_AT:
        return formattedUpdatedAt;
      case CASE_OVERVIEW_FIELDS.FOLLOW_UP_DATE:
        return formattedFollowUpDate === 'Invalid Date' ? '—' : formattedFollowUpDate;
      default:
        return connectedCase?.[fieldName] || connectedCase?.info?.[fieldName] || '—';
    }
  };

  const dateFields = caseOverviewFieldsArray.filter(
    field =>
      field.name === CASE_OVERVIEW_FIELDS.CREATED_AT ||
      field.name === CASE_OVERVIEW_FIELDS.UPDATED_AT ||
      field.name === CASE_OVERVIEW_FIELDS.FOLLOW_UP_DATE,
  );

  // additional fields
  const additionalFields = caseOverviewFieldsArray.filter(
    field =>
      !Object.values(CASE_OVERVIEW_FIELDS).includes(
        field.name as typeof CASE_OVERVIEW_FIELDS[keyof typeof CASE_OVERVIEW_FIELDS],
      ),
  );

  const renderInfoValue = (field: any) => {
    const value = connectedCase?.info?.[field.name];
    if (value === undefined || value === '') return '—';

    switch (field.type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'select':
        const option = field.options?.find(opt => opt.value === value);
        return option?.label || value;
      case 'date-input':
        return parseISO(value).toLocaleDateString();
      default:
        return value.toString();
    }
  };

  return (
    <>
      <DetailsContainer aria-labelledby="Case-CaseId-label">
        <Box style={{ display: 'inline-block' }}>
          <CaseSectionFont style={{ marginBottom: '5px' }} id="Case-CaseOverview-label">
            <Template code="Case-CaseOverviewLabel" />
          </CaseSectionFont>
        </Box>
        {editButton && (
          <Box style={{ display: 'inline-block' }} alignSelf="flex-end" marginTop="-20px" marginRight="35px">
            <ViewButton onClick={editCaseOverview} data-testid="Case-EditButton">
              <Template code="Case-EditButton" />
            </ViewButton>
          </Box>
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {caseStatusField && (
            <CaseOverviewItem
              labelId="CaseDetailsStatusLabel"
              templateCode="Case-CaseDetailsStatusLabel"
              inputId="Details_CaseStatus"
              value={statusLabel}
            />
          )}
          {childIsAtRiskField && (
            <CaseOverviewItem
              labelId="CaseChildIsAtRisk"
              templateCode="Case-ChildIsAtRisk"
              inputId="Details_ChildAtRisk"
              value={childIsAtRisk ? 'Yes' : 'No'}
              color={childIsAtRisk ? '#d22f2f' : '#d8d8d8'}
            />
          )}
        </div>
      </DetailsContainer>
      <DetailsContainer>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {dateFields.map(field => (
            <CaseOverviewItem
              key={field.name}
              labelId={field.name}
              templateCode={field.label}
              inputId={`Details_${field.name}`}
              value={renderDateValue(field.name)}
            />
          ))}
        </div>
      </DetailsContainer>
      <DetailsContainer>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {additionalFields.map(field => (
            <CaseOverviewItem
              key={field.name}
              labelId={field.name}
              templateCode={field.label}
              inputId={`Details_${field.name}`}
              value={renderInfoValue(field)}
            />
          ))}
        </div>
      </DetailsContainer>
      <CaseSummary task={task} />
    </>
  );
};

CaseOverview.displayName = 'CaseOverview';

export default CaseOverview;
