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

import { Case, CustomITask, StandaloneITask } from '../../../types/types';
import { CaseSectionFont, DetailsContainer, ViewButton } from '../styles';
import { Box } from '../../../styles';
import { PermissionActions } from '../../../permissions';
import CaseTextAreaEntry from './CaseTextAreaEntry';
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
  const { info, status, createdAt, updatedAt } = connectedCase;

  const editButton = can(PermissionActions.EDIT_CASE_OVERVIEW) || availableStatusTransitions.length > 1; // availableStatusTransitions always includes current status, if that's the only one available, you cannot change it
  const caseOverviewFields = definitionVersion?.caseOverview;
  const caseOverviewFieldsArray = Object.values(caseOverviewFields);

  // 1st row: status, childIsAtRisk and any other checkbox fields
  const statusLabel = definitionVersion?.caseStatus[status]?.label ?? status;
  const caseStatusField = caseOverviewFieldsArray.filter(field => field.name === 'status');
  const checkboxFields = caseOverviewFieldsArray.filter(field => field.type === 'checkbox');

  const renderChildRiskColor = (fieldName: string) => {
    if (fieldName === 'childIsAtRisk') {
      return info?.childIsAtRisk ? '#d22f2f' : '#d8d8d8';
    }
    return null;
  };

  // 2nd row: date fields
  const requiredDateFields = [
    {
      name: 'createdAt',
      label: 'Case-CaseDetailsDateOpened',
      type: 'date-input',
    },
    {
      name: 'updatedAt',
      label: 'Case-CaseDetailsLastUpdated',
      type: 'date-input',
    },
  ];
  const dateFields = caseOverviewFieldsArray.filter(field => field.type === 'date-input');

  const renderDateValue = (fieldName: string) => {
    switch (fieldName) {
      case 'createdAt':
        return parseISO(createdAt).toLocaleDateString();
      case 'updatedAt':
        return createdAt === updatedAt ? '—' : parseISO(updatedAt).toLocaleDateString();
      default:
        if (!info?.[fieldName] || info?.[fieldName] === '') return '—';
        return parseISO(info?.[fieldName] || '').toLocaleDateString() || '—';
    }
  };

  // 3rd row: remaining fields (new helpline based fields)
  const additionalFields = caseOverviewFieldsArray.filter(
    field =>
      !dateFields.includes(field) &&
      field.name !== 'status' &&
      field.name !== 'summary' &&
      field.type !== 'checkbox' &&
      field.type !== 'textarea',
  );

  const renderInfoValue = field => {
    const value = info?.[field.name];

    switch (field.type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'select':
        const option = field.options?.find(opt => opt.value === value);
        return option?.label || value || '—';
      default:
        return value.toString() || '—';
    }
  };

  // 4th row: textarea fields (summary)
  const textareaFields = caseOverviewFieldsArray.filter(field => field.type === 'textarea');

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
          {checkboxFields.map(field => (
            <CaseOverviewItem
              key={field.name}
              labelId={field.name}
              templateCode={field.label}
              inputId={`Details_${field.name}`}
              value={renderInfoValue(field)}
              color={renderChildRiskColor(field.name)}
            />
          ))}
        </div>
      </DetailsContainer>
      <DetailsContainer>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[...requiredDateFields, ...dateFields].map(field => (
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
      {additionalFields.length > 0 && (
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
      )}
      <CaseTextAreaEntry task={task} textareaFields={textareaFields} />
    </>
  );
};

CaseOverview.displayName = 'CaseOverview';

export default CaseOverview;
