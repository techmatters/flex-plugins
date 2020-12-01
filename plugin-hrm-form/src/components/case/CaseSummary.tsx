/* eslint-disable react/prop-types */
import React from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { CaseSectionFont, CaseSummaryTextArea } from '../../styles/case';
import { namespace, connectedCaseBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import { CaseState } from '../../states/case/reducer';
import { getConfig } from '../../HrmFormPlugin';

type OwnProps = {
  task: ITask;
  readonly?: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const CaseSummary: React.FC<Props> = ({ task, connectedCaseState, updateCaseInfo, readonly }) => {
  const { strings } = getConfig();
  const { connectedCase } = connectedCaseState;
  const summary = connectedCase.info?.summary || '';

  const handleOnChange = (newSummary: string) => {
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
        placeholder={!readonly && strings['Case-AddCaseSummaryHere']}
        value={summary}
        onChange={e => handleOnChange(e.target.value)}
        readOnly={readonly}
      />
    </>
  );
};

CaseSummary.displayName = 'CaseSummary';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  updateCaseInfo: bindActionCreators(CaseActions.updateCaseInfo, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CaseSummary);
