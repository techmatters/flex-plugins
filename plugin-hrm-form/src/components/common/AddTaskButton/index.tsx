/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import {
  ManualPullButtonBase,
  ManualPullIconContainer,
  ManualPullIcon,
  ManualPullContent,
  ManualPullText,
} from '../../../styles/HrmStyles';

type Props = {
  onClick: (() => void) | (() => Promise<void>);
  disabled: boolean;
  label: string;
};

const AddTaskButton: React.FC<Props> = ({ onClick, disabled, label }) => {
  return (
    <ManualPullButtonBase
      onClick={onClick}
      className="Twilio-TaskListBaseItem-UpperArea css-xz5ie1"
      disabled={disabled}
    >
      <ManualPullIconContainer>
        <ManualPullIcon icon="Add" />
      </ManualPullIconContainer>
      <ManualPullContent>
        <ManualPullText>
          <Template code={label} />
        </ManualPullText>
      </ManualPullContent>
    </ManualPullButtonBase>
  );
};

AddTaskButton.displayName = 'AddTaskButton';

export default AddTaskButton;
