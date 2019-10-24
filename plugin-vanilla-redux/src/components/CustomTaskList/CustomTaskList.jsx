import React from 'react';
import { Input } from '@material-ui/core';

import { CustomTaskListComponentStyles } from './CustomTaskList.Styles';

// It is recommended to keep components stateless and use redux for managing states
const CustomTaskList = (props) => {
  if (!props.isOpen) {
    return null;
  }

  return (
    <CustomTaskListComponentStyles>
      This is a dismissible demo component
      <i className="accented" onClick={props.dismissBar}>
        close
      </i>
      <Input name="jrandomname" value={props.form.jrandomname} onChange={props.handleChange} />
      <Input name="anothername" value={props.form.anothername} onChange={props.handleChange} />
    </CustomTaskListComponentStyles>
  );
};

export default CustomTaskList;
