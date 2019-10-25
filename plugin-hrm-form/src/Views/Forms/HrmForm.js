import React from 'react';
import { InputLabel, Input } from '@material-ui/core';
import { withTaskContext } from "@twilio/flex-ui";

// It is recommended to keep components stateless and use redux for managing states
const HrmForm = (props) => {
  return (
    <form>
      <InputLabel>Name</InputLabel>
      <Input name="jrandomname" value={props.form ? props.form.jrandomname : 'not here'} onChange={(e) => props.handleChange(props.task.taskSid, e)}/>
      <InputLabel>Another Name</InputLabel>
      <Input name="anothername" value={props.form ? props.form.anothername : 'not here'} onChange={(e) => props.handleChange(props.task.taskSid, e)}/>
    </form>
  );
};

export default withTaskContext(HrmForm);