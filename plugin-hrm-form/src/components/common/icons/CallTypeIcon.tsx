/* eslint-disable react/prop-types */
import React from 'react';
import FaceIcon from '@material-ui/icons/Face';
import { callTypes, CallTypes } from 'hrm-form-definitions';

import { Flex } from '../../../styles/HrmStyles';
import { SilentText } from '../../../styles/search';

type OwnProps = {
  callType: CallTypes; // Refactor to use callType.name instead the label
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
