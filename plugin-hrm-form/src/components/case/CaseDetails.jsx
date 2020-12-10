/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { Grid } from '@material-ui/core';

import CaseDetailsHeader from './caseDetails/CaseDetailsHeader';
import {
  DetailsContainer,
  DetailDescription,
  OpenStatusFont,
  DefaultStatusFont,
  StyledInputField,
} from '../../styles/case';
import { HiddenText } from '../../styles/HrmStyles';
import { caseStatuses } from '../../states/DomainConstants';
import FieldDate from '../FieldDate';

const getField = value => ({
  value,
  error: null,
  validation: null,
  touched: false,
});

// eslint-disable-next-line react/display-name
const renderCaseStatus = status => {
  switch (status) {
    case caseStatuses.open:
      return (
        <OpenStatusFont>
          <HiddenText>
            <Template code="Case-CaseDetailsStatusLabel" />
          </HiddenText>
          <Template code="Case-CaseDetailsStatusOpen" />
        </OpenStatusFont>
      );
    default:
      return <DefaultStatusFont>{status}</DefaultStatusFont>;
  }
};

const CaseDetails = ({ caseId, name, counselor, openedDate, lastUpdatedDate, followUpDate, status }) => {
  const lastUpdatedClosedDate = openedDate === lastUpdatedDate ? ' ̶ ' : lastUpdatedDate;

  return (
    <>
      <CaseDetailsHeader caseId={caseId} childName={name} />
      <DetailsContainer tabIndex={0} role="grid" aria-labelledby="Case-CaseId-label">
        <Grid container spacing={24} justify="center" role="row">
          <Grid item xs role="gridcell" tabIndex={-1}>
            <DetailDescription>
              <Template code="Case-CaseDetailsDateOpened" />
            </DetailDescription>
            <StyledInputField disabled id="Details_DateOpened" value={openedDate} />
          </Grid>
          <Grid item xs role="gridcell" tabIndex={-1}>
            <DetailDescription>
              <Template code="Case-CaseDetailsLastUpdated" />
            </DetailDescription>
            <StyledInputField disabled id="Details_DateLastUpdated" value={lastUpdatedClosedDate} />
          </Grid>
          <Grid item xs role="gridcell" tabIndex={-1}>
            <DetailDescription>
              <Template code="Case-CaseDetailsFollowUpDate" />
            </DetailDescription>
            <FieldDate id="Details_DateFollowUp" field={getField(followUpDate)} placeholder="mm/dd/yyyy" />
          </Grid>
          <Grid item xs role="gridcell" tabIndex={-1}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {renderCaseStatus(status)}
            </div>
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
};

CaseDetails.defaultProps = {
  followUpDate: '',
  lastUpdatedDate: '',
};

export default CaseDetails;
