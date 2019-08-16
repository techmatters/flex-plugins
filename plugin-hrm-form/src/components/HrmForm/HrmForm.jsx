import React from 'react';

import { HrmFormComponentStyles } from './HrmForm.Styles';

// It is recommended to keep components stateless and use redux for managing states
const HrmForm = (props) => {
  if (!props.isOpen) {
    return null;
  }

  return (
    <HrmFormComponentStyles>
      This is a dismissible demo component
      <i className="accented" onClick={props.dismissBar}>
        close
      </i>
    </HrmFormComponentStyles>
  );
};

export default HrmForm;
