import React from 'react';
import { Tab } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';

import { formIsValid } from '../states/ValidationRules';

const decorateTab = (label, formRoot) => {
  if (formIsValid(formRoot)) {
    return <Tab key={label} label={label} />;
  }
  return (
    <Tab
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
