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

/**
 * The @material-ui/icons version that "@twilio/flex-ui": "1.27.0" uses does not contain the Upload icon.
 * This file implements material's Upload icon from latest material version.
 */
import React from 'react';
import { SvgIcon } from '@material-ui/core';

const UploadIcon = props => (
  <SvgIcon {...props} aria-label="Upload">
    <path d="M5,20h14v-2H5V20z M5,10h4v6h6v-6h4l-7-7L5,10z" />
  </SvgIcon>
);

UploadIcon.displayName = 'UploadIcon';

export default UploadIcon;
