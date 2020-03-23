import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';

import { StyledTab } from '../Styles/HrmStyles';
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
          <span style={{ verticalAlign: 'middle' }}>
            <ErrorIcon fontSize="inherit" style={{ color: 'red' }} />
          </span>{' '}
          {label}{' '}
        </>
      }
    />
  );
};

decorateTab.displayName = 'decorateTab';

export default decorateTab;
