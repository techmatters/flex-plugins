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

/* eslint-disable react/prop-types */
import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import { Template } from '@twilio/flex-ui';

import { StyledTab, StyledSearchTab, StyledTabProps } from '../../../styles';

type Props = {
  label?: string;
  error?: any;
  searchTab?: boolean;
} & Omit<StyledTabProps, 'label'>;

const FormTab: React.FC<Props> = ({ label, error, searchTab, ...rest }) => {
  if (searchTab) {
    return <StyledSearchTab {...rest} />;
  }

  return (
    <StyledTab
      {...rest}
      key={label}
      label={
        <>
          {error && (
            <div style={{ height: 10 }}>
              <ErrorIcon fontSize="inherit" style={{ color: 'red' }} />
            </div>
          )}
          <Template code={label} />
        </>
      }
    />
  );
};

FormTab.displayName = 'FormTab';

export default FormTab;
