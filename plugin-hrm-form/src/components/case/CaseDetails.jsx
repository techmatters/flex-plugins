/* eslint-disable no-empty-function */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { Grid } from '@material-ui/core';
import CaseTags from 'components/search/CasePreview/CaseTags';

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
  { label: 'Open', value: 'open', color: 'green' },
  { label: 'Closed', value: 'closed', color: 'red' },
];

const CaseDetails = ({
  caseId,
  name,
  categories,
  counselor,
  openedDate,
  lastUpdatedDate,
  followUpDate,
  status,
  handleInfoChange,
  handleStatusChange,
}) => {
  const lastUpdatedClosedDate = openedDate === lastUpdatedDate ? '—' : lastUpdatedDate;

  const initialColor = (statusOptions.find(x => x.value === status) || {}).color || '#000000';

  const [color, setColor] = useState(initialColor);

  const onStatusChange = selectedOption => {
    setColor(statusOptions.find(x => x.value === selectedOption).color);
    handleStatusChange(selectedOption);
  };

  return (
    <>
      <CaseDetailsHeader caseId={caseId} childName={name} />
      <DetailsContainer tabIndex={0} role="grid" aria-labelledby="Case-CaseId-label">
        <Grid container spacing={24} justify="start" role="row">
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
              onChange={e => handleInfoChange('followUpDate', e.target.value)}
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
                onChange={e => onStatusChange(e.target.value)}
                color={color}
              >
                {statusOptions.map(o => (
                  <FormOption selected={o.value === status} key={o.value} value={o.value} style={{ color: '#000000' }}>
                    {o.label}
                  </FormOption>
                ))}
              </StyledSelectField>
            </StyledSelectWrapper>
          </Grid>
          <div style={{ paddingLeft: '12px' }}>
            <CaseTags categories={categories} />
          </div>
        </Grid>
      </DetailsContainer>
    </>
  );
};

CaseDetails.displayName = 'CaseDetails';
CaseDetails.propTypes = {
  caseId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  counselor: PropTypes.string.isRequired,
  openedDate: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  followUpDate: PropTypes.string,
  lastUpdatedDate: PropTypes.string,
  handleInfoChange: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
};

CaseDetails.defaultProps = {
  followUpDate: '',
  lastUpdatedDate: '',
};

export default CaseDetails;
