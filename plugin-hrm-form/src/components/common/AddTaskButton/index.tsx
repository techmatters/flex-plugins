/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import {
  AddTaskButtonBase,
  AddTaskIconContainer,
  AddTaskIcon,
  AddTaskContent,
  AddTaskText,
} from '../../../styles/HrmStyles';

type Props = {
  onClick: (() => void) | (() => Promise<void>);
  disabled: boolean;
  label: string;
};

const AddTaskButton: React.FC<Props> = ({ onClick, disabled, label }) => {
  return (
    <AddTaskButtonBase
      onClick={onClick}
      className="Twilio-TaskListBaseItem-UpperArea css-xz5ie1"
      disabled={disabled}
      data-testid="AddTaskButton"
    >
      <AddTaskIconContainer>
        <AddTaskIcon icon="Add" />
      </AddTaskIconContainer>
      <AddTaskContent>
        <AddTaskText>
          <Template code={label} />
        </AddTaskText>
      </AddTaskContent>
    </AddTaskButtonBase>
  );
};

AddTaskButton.displayName = 'AddTaskButton';

export default AddTaskButton;
