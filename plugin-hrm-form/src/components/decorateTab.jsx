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
import ErrorIcon from '@material-ui/icons/Error';
import { Template } from '@twilio/flex-ui';

import { StyledTab } from '../styles/HrmStyles';
import { formIsValid } from '../states/ValidationRules';

const decorateTab = (label, formRoot) => {
  if (formIsValid(formRoot)) {
    return <StyledTab key={label} label={<Template code={label} />} />;
  }
  return (
    <StyledTab
      key={label}
      label={
        <>
          <div style={{ verticalAlign: 'middle' }}>
            <ErrorIcon fontSize="inherit" style={{ color: 'red' }} />
          </div>{' '}
          <Template code={label} />
        </>
      }
    />
  );
};

decorateTab.displayName = 'decorateTab';

export default decorateTab;
