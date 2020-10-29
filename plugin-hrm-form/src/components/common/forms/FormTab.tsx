/* eslint-disable react/prop-types */
import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import { Template } from '@twilio/flex-ui';

import { StyledTab, StyledTabProps } from '../../../styles/HrmStyles';

type Props = {
  label?: string;
  error?: any;
} & Omit<StyledTabProps, 'label'>;

const FormTab: React.FC<Props> = ({ label, error, ...rest }) => {
  return (
    <StyledTab
      {...rest}
      key={label}
      label={
        <>
          {error && (
            <div style={{ verticalAlign: 'middle', marginRight: 2 }}>
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
