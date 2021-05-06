/* eslint-disable react/prop-types */
import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import { Template } from '@twilio/flex-ui';

import { StyledTab, StyledSearchTab, StyledTabProps } from '../../../styles/HrmStyles';

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
