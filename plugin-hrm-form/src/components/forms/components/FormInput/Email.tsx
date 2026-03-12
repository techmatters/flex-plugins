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

import { FormInputBaseProps } from '../types';
import FormInput from './FormInput';

const EMAIL_PATTERN = { value: /\S+@\S+\.\S+/, message: 'Entered value does not match email format' };

type Props = FormInputBaseProps;

const Email: React.FC<Props> = props => <FormInput {...props} pattern={EMAIL_PATTERN} />;

export default Email;
