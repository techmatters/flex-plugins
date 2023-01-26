/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-empty-function */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersionId, StatusInfo } from 'hrm-form-definitions';

import CaseTags from './CaseTags';
import CaseDetailsHeader from './caseDetails/CaseDetailsHeader';
import {
  DetailsContainer,
  DetailDescription,
  StyledInputField,
  CaseDetailsBorder,
  CaseSectionFont,
  ViewButton,
} from '../../styles/case';
import { Box } from '../../styles/HrmStyles';
import { PermissionActions } from '../../permissions';
import { getLocaleDateTime } from '../../utils/helpers';

type Props = {
  caseId: string;
  contactIdentifier: string;
  categories: { [category: string]: { [subcategory: string]: boolean } };
  counselor: string;
  createdAt: string;
  updatedAt: string | undefined;
  followUpDate: string | undefined;
  statusLabel: string;
  definitionVersionName: DefinitionVersionId;
  office: string | undefined;
  childIsAtRisk: boolean;
  isOrphanedCase: boolean | undefined;
  editCaseSummary: () => void;
  handlePrintCase: () => void;
  availableStatusTransitions: StatusInfo[];
  can: (action: string) => boolean;
};

const CaseDetails: React.FC<Props> = ({
  caseId,
  contactIdentifier,
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
  definitionVersionName,
  isOrphanedCase = false,
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
          contactIdentifier={contactIdentifier}
          counselor={counselor}
          office={office}
          handlePrintCase={handlePrintCase}
          isOrphanedCase={isOrphanedCase}
        />
        <div style={{ paddingTop: '15px' }}>
          <CaseTags definitionVersion={definitionVersionName} categories={categories} />
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
