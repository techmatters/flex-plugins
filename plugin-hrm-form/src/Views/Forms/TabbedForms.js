import React from 'react';
// import { Button } from '@material-ui/core';
import { withTaskContext } from "@twilio/flex-ui";

const TabbedForms = (props) => {
  return (
    <h1>TabbedForms go here! Your selected type is: {props.form && props.form.callType ? props.form.callType : 'unknown!'}</h1>
  );
};

export default withTaskContext(TabbedForms);