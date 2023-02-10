/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React from 'react';

import { fieldType } from '../types';

export const ValidationType = {
  REQUIRED: 'REQUIRED', // Will not be applied if in the callerInformation tab and callType is not caller.  Will not be applied when callType is standalone.
};

const RequiredAsterisk = ({ field }) => {
  const isRequired = field.validation && field.validation.includes(ValidationType.REQUIRED);
  return isRequired && <span style={{ color: 'red' }}>*</span>;
};

RequiredAsterisk.displayName = 'RequiredAsterisk';
RequiredAsterisk.propTypes = {
  field: fieldType.isRequired,
};

export default RequiredAsterisk;
