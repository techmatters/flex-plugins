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

/* eslint-disable react/prop-types */
import React from 'react';
import FaceIcon from '@material-ui/icons/Face';
import { callTypes, CallType } from 'hrm-types';

import { Flex } from '../../../styles';
import { SilentText } from '../../search/styles';

type OwnProps = {
  callType: CallType; // Refactor to use callType.name instead the label
  fontSize?: string;
};

type Props = OwnProps;

const CallTypeIcon: React.FC<Props> = ({ callType, fontSize = '24px' }) => {
  const faceIcon = <FaceIcon style={{ fontSize }} />;

  switch (callType) {
    case callTypes.child:
      return faceIcon;
    case callTypes.caller:
      return (
        <>
          <Flex marginRight="-5px">{faceIcon}</Flex>
          {faceIcon}
        </>
      );
    default:
      return <SilentText>{callType}</SilentText>;
  }
};

CallTypeIcon.displayName = 'CallTypeIcon';

export default CallTypeIcon;
