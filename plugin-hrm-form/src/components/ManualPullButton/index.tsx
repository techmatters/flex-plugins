import React, { ObjectHTMLAttributes } from 'react';
import { Manager, Actions } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { requestTask } from '../../utils/manualPull';
import { ManualPullIconContainer, ManualPullIcon, ManualPullContent, ManualPullText } from '../../styles/HrmStyles';

type Props = {
  addAnotherTask: () => void;
};

const ManualPullButton: React.FC<Props> = () => {

  return(<ButtonBase onClick={(e) => requestTask(true)} className="Twilio-TaskListBaseItem-UpperArea css-xz5ie1">
    <ManualPullIconContainer>
      <ManualPullIcon icon="Add" />
    </ManualPullIconContainer>
    <ManualPullContent>
      <ManualPullText>Add Another Task</ManualPullText>
    </ManualPullContent>
  </ButtonBase>);
};

ManualPullButton.displayName = 'ManualPullButton';

// remove once the proper callback is provided
ManualPullButton.defaultProps = {
  addAnotherTask: () => console.log('>>> Manual Pull pressed'),
};

export default ManualPullButton;
