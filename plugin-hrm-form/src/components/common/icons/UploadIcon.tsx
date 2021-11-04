/**
 * The @material-ui/icons version that "@twilio/flex-ui": "1.27.0" uses does not contain the Upload icon.
 * This file implements material's Upload icon from latest material version.
 */
import React from 'react';
import { SvgIcon } from '@material-ui/core';

const UploadIcon = props => (
  <SvgIcon {...props}>
    <path d="M5,20h14v-2H5V20z M5,10h4v6h6v-6h4l-7-7L5,10z" />
  </SvgIcon>
);

UploadIcon.displayName = 'UploadIcon';

export default UploadIcon;
