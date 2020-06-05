import React from 'react';
import { TaskHelper, Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { StyledButton } from '../../styles/HrmStyles';
import { closeChatOriginal, closeCallOriginal, isWarmTransfer } from '../../utils/transfer';
import { loadFormSharedState } from '../../utils/sharedState';
import { Actions } from '../../states/ContactState';

/**
 * @param {import('@twilio/flex-ui').ITask} task the transferred task
 * @param {typeof Actions.restoreEntireForm} restoreEntireForm
 */
const handleAcceptTransfer = async (task, restoreEntireForm) => {
  if (TaskHelper.isChatBasedTask(task)) await closeChatOriginal(task);
  else await closeCallOriginal(task);

  // restore the state of the previous form for warm transfer (if there is any)
  if (isWarmTransfer(task)) {
    const form = await loadFormSharedState(task);
    if (form) restoreEntireForm(form, task.taskSid);
  }
};

const AcceptTransferButton = ({ theme, task, restoreEntireForm }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => handleAcceptTransfer(task, removeContactState)}
    >
      <Template code="Transfer-AcceptTransferButton" />
    </StyledButton>
  );
};

AcceptTransferButton.displayName = 'AcceptTransferButton';
AcceptTransferButton.propTypes = {
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

export default connect(null, mapDispatchToProps)(AcceptTransferButton);
