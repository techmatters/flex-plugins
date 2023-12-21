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
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';

import { AddTaskButtonBase, AddTaskIconContainer, AddTaskIcon, AddTaskContent, AddTaskText } from '../../../styles';

type Props = {
  onClick: (() => void) | (() => Promise<void>);
  disabled: boolean;
  label: string;
  isLoading?: boolean;
  id?: string;
};

const AddTaskButton: React.FC<Props> = ({ onClick, disabled, label, isLoading, id, ...rest }) => {
  return (
    <AddTaskButtonBase
      id={id}
      onClick={onClick}
      className="Twilio-TaskListBaseItem-UpperArea css-xz5ie1"
      disabled={disabled}
      data-testid="AddTaskButton"
      {...rest}
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
