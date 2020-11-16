import React from 'react';

import { assignMeContactlessTask } from '../../services/ServerlessService';
import AddTaskButton from '../common/AddTaskButton';

type Props = {};

const OfflineContactButton: React.FC<Props> = () => {
  const onClick = async () => {
    await assignMeContactlessTask();
  };

  return <AddTaskButton onClick={onClick} disabled={false} label="OfflineContactButtonText" />;
};

OfflineContactButton.displayName = 'OfflineContactButton';

export default OfflineContactButton;
