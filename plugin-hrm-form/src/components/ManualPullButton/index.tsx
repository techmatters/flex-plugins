import React from 'react';
import { ButtonBase } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { ManualPullIconContainer, ManualPullIcon, ManualPullContent, ManualPullText } from '../../styles/HrmStyles';
import { adjustChatCapacity } from '../../services/ServerlessService';

const increaseChatCapacity = async () => {
  await adjustChatCapacity('increase');
};

type Props = {};

const ManualPullButton: React.FC<Props> = () => (
  <ButtonBase onClick={increaseChatCapacity} className="Twilio-TaskListBaseItem-UpperArea css-xz5ie1">
    <ManualPullIconContainer>
      <ManualPullIcon icon="Add" />
    </ManualPullIconContainer>
    <ManualPullContent>
      <ManualPullText>
        <Template code="ManualPullButtonText" />
      </ManualPullText>
    </ManualPullContent>
  </ButtonBase>
);

ManualPullButton.displayName = 'ManualPullButton';

export default ManualPullButton;
