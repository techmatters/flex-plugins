import React from 'react';
import { Tab } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import { formIsValid } from '../states/ValidationRules';

const decorateTab = (label, formRoot) => {
  if (formIsValid(formRoot)) {
    return (
      <Tab label={label} />
    );  
  } else {
    return (
      <Tab label={<><span style={{verticalAlign: 'middle'}}><ErrorIcon fontSize="inherit" /></span> {label} </>} />
    );
  }
}

export default decorateTab;