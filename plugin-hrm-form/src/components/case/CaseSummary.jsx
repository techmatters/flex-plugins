import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { CaseSectionFont, CaseSummaryTextArea } from '../../styles/case';
import { namespace, contactFormsBase } from '../../states';
import { Actions } from '../../states/ContactState';
import { formType, taskType } from '../../types';
import { getConfig } from '../../HrmFormPlugin';

const CaseSummary = ({ task, form, updateCaseInfo }) => {
  const { strings } = getConfig();
  const { connectedCase } = form.metadata;
  const summary = (connectedCase.info && connectedCase.info.summary) || '';

  const handleOnChange = newSummary => {
    const { info } = connectedCase;
    const newInfo = info ? { ...info, summary: newSummary } : { summary: newSummary };
    updateCaseInfo(newInfo, task.taskSid);
  };

  return (
    <>
      <CaseSectionFont id="Case-CaseSummary-label">
        <Template code="Case-CaseSummarySection" />
      </CaseSectionFont>
      <CaseSummaryTextArea
        // rows={5} -> change the height (maybe needed when merging all the changes in Case)
        data-testid="Case-CaseSummary-TextArea"
        aria-labelledby="Case-CaseSummary-label"
        placeholder={strings['Case-AddCaseSummaryHere']}
        value={summary}
        onChange={e => handleOnChange(e.target.value)}
      />
    </>
  );
};

CaseSummary.displayName = 'CaseSummary';
CaseSummary.propTypes = {
  task: taskType.isRequired,
  form: formType.isRequired,
  updateCaseInfo: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
});

const mapDispatchToProps = dispatch => ({
  updateCaseInfo: bindActionCreators(Actions.updateCaseInfo, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CaseSummary);
