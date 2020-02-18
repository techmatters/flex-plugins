import React from 'react';
import { ValidationType } from '../states/ContactFormStateFactory';

const RequiredAsterisk = ({ field }) => {
  const isRequired = field.validation && field.validation.includes(ValidationType.REQUIRED);
  return isRequired && <span style={{color: 'red'}}>*</span>;
};

export default RequiredAsterisk;