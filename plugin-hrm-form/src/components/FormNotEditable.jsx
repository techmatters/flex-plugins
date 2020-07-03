import React from 'react';
import { Template } from '@twilio/flex-ui';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { InfoTwoTone } from '@material-ui/icons';

import { Row } from '../styles/HrmStyles';

const FormNotEditable = () => (
  <AppBar position="relative">
    <Toolbar style={{ backgroundColor: '#2196f3' }}>
      <Row>
        <InfoTwoTone style={{ fontSize: 26, marginRight: 10 }} />
        <Typography variant="subtitle1" style={{ color: '#ffffff' }}>
          <Template code="Transfer-FormNotEditable" />
        </Typography>
      </Row>
    </Toolbar>
  </AppBar>
);

FormNotEditable.displayName = 'FormNotEditable';

export default FormNotEditable;
