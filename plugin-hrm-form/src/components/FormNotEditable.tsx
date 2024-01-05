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

import React from 'react';
import { Template } from '@twilio/flex-ui';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { InfoTwoTone } from '@material-ui/icons';

import { Row } from '../styles';

const FormNotEditable: React.FC = () => (
  <AppBar style={{ zIndex: 'inherit' }} position="relative">
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
