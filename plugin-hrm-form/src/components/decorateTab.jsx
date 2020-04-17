import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';

import { StyledTab } from '../styles/HrmStyles';
import { formIsValid } from '../states/ValidationRules';

const decorateTab = (label, formRoot) => {
  if (formIsValid(formRoot)) {
    return <StyledTab key={label} label={label} />;
  }
  return (
    <StyledTab
      key={label}
      label={
        <>
          <div style={{ verticalAlign: 'middle' }}>
            <ErrorIcon fontSize="inherit" style={{ color: 'red' }} />
          </div>{' '}
          {label}{' '}
        </>
      }
    />
  );
};

decorateTab.displayName = 'decorateTab';

export default decorateTab;
