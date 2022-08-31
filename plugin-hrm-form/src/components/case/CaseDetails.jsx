/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-empty-function */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import CaseTags from './CaseTags';
import CaseDetailsHeader from './caseDetails/CaseDetailsHeader';
import {
  DetailsContainer,
  DetailDescription,
  StyledInputField,
  CaseDetailsBorder,
  CaseSectionFont,
  StyledCaseOverview,
  ViewButton,
} from '../../styles/case';
import { Box } from '../../styles/HrmStyles';
import { PermissionActions } from '../../permissions';
import { getLocaleDateTime } from '../../utils/helpers';

const CaseDetails = ({
  caseId,
  name,
  categories,
  counselor,
  createdAt,
  updatedAt,
  followUpDate,
  status,
  can,
  office,
  childIsAtRisk,
  handlePrintCase,
  definitionVersion,
  definitionVersionName,
  isOrphanedCase,
  editCaseSummary,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const color = definitionVersion.caseStatus[status].color || '#000000';
  const formattedCreatedAt = getLocaleDateTime(createdAt);
  const formattedUpdatedAt = createdAt === updatedAt ? '—' : getLocaleDateTime(updatedAt);
  const editButton = can(PermissionActions.EDIT_CASE_SUMMARY);
  const formatFollowUpDate = getLocaleDateTime(followUpDate);

  return (
    <>
      <CaseDetailsBorder>
        <CaseDetailsHeader
          caseId={caseId}
          childName={name}
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
          <Box style={{ display: 'inline-block' }} alignSelf="flex-end" marginTop="-20px" marginRight="50px">
            <ViewButton secondary roundCorners onClick={editCaseSummary} data-testid="Case-EditButton">
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
              defaultValue={status === 'open' ? 'Open' : 'Closed'}
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseChildIsAtRisk">
                <Template code="Case-ChildIsAtRisk" />
              </label>
            </DetailDescription>
            <StyledCaseOverview
              data-testid="Case-Details_ChildAtRisk"
              id="Details_ChildAtRisk"
              name="Details_ChildAtRisk"
              aria-labelledby="CaseDetailsStatusLabel"
              disabled={true}
              defaultValue={childIsAtRisk ? 'Yes' : 'No'}
              color={childIsAtRisk ? 'red' : '#d8d8d8'}
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
            <StyledCaseOverview
              id="Details_DateFollowUp"
              name="Details_DateFollowUp"
              data-testid="Case-Details_DateFollowUp"
              color="#d8d8d8"
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
CaseDetails.propTypes = {
  caseId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  categories: PropTypes.object.isRequired,
  counselor: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  can: PropTypes.func.isRequired,
  office: PropTypes.string,
  followUpDate: PropTypes.string,
  updatedAt: PropTypes.string,
  childIsAtRisk: PropTypes.bool.isRequired,
  handlePrintCase: PropTypes.func.isRequired,
  definitionVersion: PropTypes.shape({}).isRequired,
  definitionVersionName: PropTypes.string.isRequired,
  isOrphanedCase: PropTypes.bool,
};

CaseDetails.defaultProps = {
  office: '',
  followUpDate: '',
  updatedAt: '',
  isOrphanedCase: false,
};

export default CaseDetails;
