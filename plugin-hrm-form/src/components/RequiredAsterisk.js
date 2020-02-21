import React from 'react';

import { ValidationType } from '../states/ContactFormStateFactory';
import { fieldType } from '../types';

const RequiredAsterisk = ({ field }) => {
  const isRequired = field.validation && field.validation.includes(ValidationType.REQUIRED);
  return isRequired && <span style={{ color: 'red' }}>*</span>;
};

RequiredAsterisk.displayName = 'RequiredAsterisk';
RequiredAsterisk.propTypes = {
  field: fieldType.isRequired,
};

export default RequiredAsterisk;
