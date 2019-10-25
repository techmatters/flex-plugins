import React from 'react';
import { InputLabel, Input } from '@material-ui/core';

// It is recommended to keep components stateless and use redux for managing states
const HrmForm = () => {
  return (
    <form>
      <InputLabel>Name</InputLabel><Input name="jrandomname" />
      <InputLabel>Another Name</InputLabel><Input name="anothername" />
    </form>
  );
};

export default HrmForm;