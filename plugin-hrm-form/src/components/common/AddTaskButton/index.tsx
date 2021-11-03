/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';

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
  isLoading?: boolean;
  id?: string;
};

const AddTaskButton: React.FC<Props> = ({ onClick, disabled, label, isLoading, id }) => {
  return (
    <AddTaskButtonBase
      id={id}
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
        {isLoading && <CircularProgress size={12} />}
      </AddTaskContent>
    </AddTaskButtonBase>
  );
};

AddTaskButton.displayName = 'AddTaskButton';

export default AddTaskButton;
