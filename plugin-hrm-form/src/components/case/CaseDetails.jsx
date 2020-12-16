/* eslint-disable no-empty-function */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { Grid } from '@material-ui/core';

import CaseDetailsHeader from './caseDetails/CaseDetailsHeader';
import {
  DetailsContainer,
  DetailDescription,
  StyledInputField,
  StyledSelectField,
  StyledSelectWrapper,
} from '../../styles/case';
import { FormOption } from '../../styles/HrmStyles';

const statusOptions = [
  { label: 'N/A', value: 'null' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
];

const CaseDetails = ({
  caseId,
  name,
  counselor,
  openedDate,
  lastUpdatedDate,
  followUpDate,
  status,
  handleFieldChange,
}) => {
  const lastUpdatedClosedDate = openedDate === lastUpdatedDate ? '—' : lastUpdatedDate;

  return (
    <>
      <CaseDetailsHeader caseId={caseId} childName={name} />
      <DetailsContainer tabIndex={0} role="grid" aria-labelledby="Case-CaseId-label">
        <Grid container spacing={24} justify="center" role="row">
          <Grid item xs role="gridcell" tabIndex={-1}>
            <DetailDescription>
              <label id="CaseDetailsDateOpened">
                <Template code="Case-CaseDetailsDateOpened" />
              </label>
            </DetailDescription>
            <StyledInputField
              disabled
              id="Details_DateOpened"
              value={openedDate}
              aria-labelledby="CaseDetailsDateOpened"
            />
          </Grid>
          <Grid item xs role="gridcell" tabIndex={-1}>
            <DetailDescription>
              <label id="CaseDetailsLastUpdated">
                <Template code="Case-CaseDetailsLastUpdated" />
              </label>
            </DetailDescription>
            <StyledInputField
              disabled
              id="Details_DateLastUpdated"
              value={lastUpdatedClosedDate}
              aria-labelledby="CaseDetailsLastUpdated"
            />
          </Grid>
          <Grid item xs role="gridcell" tabIndex={-1}>
            <DetailDescription>
              <label id="CaseDetailsFollowUpDate">
                <Template code="Case-CaseDetailsFollowUpDate" />
              </label>
            </DetailDescription>
            <StyledInputField
              type="date"
              id="Details_DateFollowUp"
              name="Details_DateFollowUp"
              value={followUpDate}
              onChange={e => handleFieldChange('followUpDate', e.target.value)}
              aria-labelledby="CaseDetailsFollowUpDate"
            />
          </Grid>
          <Grid item xs role="gridcell" tabIndex={-1}>
            <DetailDescription>
              <label id="CaseDetailsStatusLabel">
                <Template code="Case-CaseDetailsStatusLabel" />
              </label>
            </DetailDescription>
            <StyledSelectWrapper>
              <StyledSelectField
                id="Details_CaseStatus"
                name="Details_CaseStatus"
                aria-labelledby="CaseDetailsStatusLabel"
                onChange={e => handleFieldChange('status', e.target.value)} // ToDo: replace this, we need to change case status that is not inside 'info'
              >
                {statusOptions.map(o => (
                  <FormOption selected={o.value === status} key={o.value} value={o.value}>
                    {o.label}
                  </FormOption>
                ))}
              </StyledSelectField>
            </StyledSelectWrapper>
          </Grid>
        </Grid>
      </DetailsContainer>
    </>
  );
};

CaseDetails.displayName = 'CaseDetails';
CaseDetails.propTypes = {
  caseId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  counselor: PropTypes.string.isRequired,
  openedDate: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  followUpDate: PropTypes.string,
  lastUpdatedDate: PropTypes.string,
  handleFieldChange: PropTypes.func.isRequired,
};

CaseDetails.defaultProps = {
  followUpDate: '',
  lastUpdatedDate: '',
};

export default CaseDetails;
