import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { Grid } from '@material-ui/core';

import { DetailsContainer, DetailDescription, DetailValue, OpenStatusFont } from '../../styles/case';

const CaseDetails = ({ name, counselor, createdAt, status }) => {
  return (
    <DetailsContainer>
      <Grid container spacing={24} justify="center">
        <Grid item xs>
          <DetailDescription>
            <Template code="Case-CaseDetailsChildName" />
          </DetailDescription>
          <DetailValue>Kurt McKinley</DetailValue>
        </Grid>
        <Grid item xs>
          <DetailDescription>
            <Template code="Case-CaseDetailsOwner" />
          </DetailDescription>
          <DetailValue>Jane Doe</DetailValue>
        </Grid>
        <Grid item xs>
          <DetailDescription>
            <Template code="Case-CaseDetailsDateOpened" />
          </DetailDescription>
          <DetailValue>3/3/2020</DetailValue>
        </Grid>
        <Grid item xs>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <OpenStatusFont>
              <Template code="Case-CaseDetailsStatusOpen" />
            </OpenStatusFont>
          </div>
        </Grid>
      </Grid>
    </DetailsContainer>
  );
};

CaseDetails.displayName = 'CaseDetails';

export default CaseDetails;
