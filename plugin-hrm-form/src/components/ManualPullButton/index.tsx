import React from 'react';
import { ButtonBase } from '@material-ui/core';

import { ManualPullIconContainer, ManualPullIcon, ManualPullContent, ManualPullText } from '../../styles/HrmStyles';
import { adjustTaskCapacity } from '../../services/ServerlessService';

const increaseChatCapacity = async () => {
  await adjustTaskCapacity('increase');
};

type Props = {};

const ManualPullButton: React.FC<Props> = () => (
  <ButtonBase onClick={increaseChatCapacity} className="Twilio-TaskListBaseItem-UpperArea css-xz5ie1">
    <ManualPullIconContainer>
      <ManualPullIcon icon="Add" />
    </ManualPullIconContainer>
    <ManualPullContent>
      <ManualPullText>Add Another Task</ManualPullText>
    </ManualPullContent>
  </ButtonBase>
);

ManualPullButton.displayName = 'ManualPullButton';

export default ManualPullButton;
