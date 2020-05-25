import React from 'react';
import { TaskHelper } from '@twilio/flex-ui';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { StyledButton } from '../../styles/HrmStyles';
import {
  resolveTransferChat,
  closeCallOriginal,
  setTransferCompleted,
  loadFormSharedState,
  isWarmTransfer,
} from './helpers';
import { transferStatuses } from '../../states/DomainConstants';
import { Actions } from '../../states/ContactState';

const handleCompleteTransfer = async (transferredTask, restoreEntireForm) => {
  if (TaskHelper.isChatBasedTask(transferredTask)) {
    const closeSid = transferredTask.attributes.transferMeta.originalTask;
    const keepSid = transferredTask.taskSid;
    await resolveTransferChat(closeSid, keepSid, transferStatuses.completed);
  } else {
    await closeCallOriginal(transferredTask);
    await setTransferCompleted(transferredTask);
  }

  // restore the state of the previous form (if there is any)
  if (isWarmTransfer(transferredTask)) {
    const form = await loadFormSharedState(transferredTask);
    if (form) restoreEntireForm(form, transferredTask.taskSid);
  }
};

const CompleteTransferButton = ({ theme, task, restoreEntireForm }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => handleCompleteTransfer(task, restoreEntireForm)}
    >
      Complete Transfer
    </StyledButton>
  );
};

CompleteTransferButton.displayName = 'CompleteTransferButton';
CompleteTransferButton.propTypes = {
  theme: PropTypes.shape({
    colors: PropTypes.shape({
      base2: PropTypes.string,
      base11: PropTypes.string,
    }),
  }).isRequired,
  task: PropTypes.shape({
    attributes: PropTypes.shape({
      transferMeta: PropTypes.shape({
        transferStatus: PropTypes.string,
      }),
    }),
  }).isRequired,
  restoreEntireForm: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  restoreEntireForm: bindActionCreators(Actions.restoreEntireForm, dispatch),
});

export default connect(null, mapDispatchToProps)(CompleteTransferButton);
