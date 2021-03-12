/* eslint-disable react/prop-types */
import React from 'react';
import { Actions, Icon } from '@twilio/flex-ui';
import { connect, ConnectedComponent, ConnectedProps } from 'react-redux';

import { configurationBase, namespace, RootState, routingBase } from '../../states';
import type { ContactFormDefinition } from '../../states/types';
import * as GeneralActions from '../../states/actions';
import {
  AddTaskContent,
  AddTaskIconContainer,
  OfflineContactTaskIcon,
  OfflineContactTaskButton,
} from '../../styles/HrmStyles';

type OwnProps = { selectedTaskSid: string };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactTask: React.FC<Props> = ({ isAddingOfflineContact, selectedTaskSid, ...props }) => {
  console.log('>>>>>>>>', props);

  if (!isAddingOfflineContact) return null;

  const onClick = async () => {
    await Actions.invokeAction('SelectTask', { task: undefined });
  };

  const selected = !selectedTaskSid && isAddingOfflineContact;

  return (
    <OfflineContactTaskButton onClick={onClick} selected={selected}>
      <AddTaskIconContainer>
        <OfflineContactTaskIcon />
      </AddTaskIconContainer>
      <AddTaskContent>Offline Contact</AddTaskContent>
    </OfflineContactTaskButton>
  );
};

OfflineContactTask.displayName = 'OfflineContactTask';

const mapStateToProps = (state: RootState) => ({
  isAddingOfflineContact: state[namespace][routingBase].isAddingOfflineContact,
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(OfflineContactTask);
