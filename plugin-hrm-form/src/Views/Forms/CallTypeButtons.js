import React from 'react';
import { Grid, Button } from '@material-ui/core';
import { withTaskContext } from "@twilio/flex-ui";
import { callTypes } from '../../states/DomainConstants';

const CallTypeButtons = (props) => {
  const buttons = Object.keys(callTypes).map((option) => {
    return (
      <Button 
        variant="contained" 
        color={(props.form && props.form.callType === callTypes[option]) ? 'primary' : 'secondary'}
        onClick={(e) => props.handleCallTypeButtonClick(props.task.taskSid, callTypes[option], e)}
      >
      {callTypes[option]}
      </Button>
    );
  });
  return (
    <Grid>
      { buttons }
    </Grid>
  );
};

export default withTaskContext(CallTypeButtons);
