/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { Grid } from '@material-ui/core';

import { DetailsContainer, DetailDescription, DetailValue, OpenStatusFont, DefaultStatusFont } from '../../styles/case';
import { caseStatuses } from '../../states/DomainConstants';

// eslint-disable-next-line react/display-name
const renderCaseStatus = status => {
  switch (status) {
    case caseStatuses.open:
      return (
        <OpenStatusFont aria-label="Status: ">
          <Template code="Case-CaseDetailsStatusOpen" />
        </OpenStatusFont>
      );
    default:
      return <DefaultStatusFont>{status}</DefaultStatusFont>;
  }
};

const CaseDetails = ({ name, counselor, date, status }) => {
  return (
    <DetailsContainer tabIndex={0} role="grid" aria-labelledby="Case-CaseDetailsSection-label">
      <Grid container spacing={24} justify="center" role="row">
        <Grid item xs role="gridcell" tabIndex={-1}>
          <DetailDescription>
            <Template code="Case-CaseDetailsChildName" />
          </DetailDescription>
          <DetailValue>{name}</DetailValue>
        </Grid>
        <Grid item xs role="gridcell" tabIndex={-1}>
          <DetailDescription>
            <Template code="Case-CaseDetailsOwner" />
          </DetailDescription>
          <DetailValue>{counselor}</DetailValue>
        </Grid>
        <Grid item xs role="gridcell" tabIndex={-1}>
          <DetailDescription>
            <Template code="Case-CaseDetailsDateOpened" />
          </DetailDescription>
          <DetailValue>{date}</DetailValue>
        </Grid>
        <Grid item xs role="gridcell" tabIndex={-1}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {renderCaseStatus(status)}
          </div>
        </Grid>
      </Grid>
    </DetailsContainer>
  );
};

CaseDetails.displayName = 'CaseDetails';
CaseDetails.propTypes = {
  name: PropTypes.string.isRequired,
  counselor: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};

export default CaseDetails;
