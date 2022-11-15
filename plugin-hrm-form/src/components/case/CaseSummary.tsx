/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { CaseDetailsBorder, CaseSectionFont, CaseSummaryTextArea } from '../../styles/case';
import { namespace, connectedCaseBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import { getConfig } from '../../HrmFormPlugin';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { CaseState } from '../../states/case/types';

type OwnProps = {
  task: CustomITask | StandaloneITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const CaseSummary: React.FC<Props> = ({ connectedCaseState }) => {
  const { strings } = getConfig();
  const { connectedCase } = connectedCaseState;
  const summary = connectedCase.info?.summary || '';

  return (
    <CaseDetailsBorder marginBottom="-25px" paddingBottom="15px">
      <CaseSectionFont id="Case-CaseSummary-label">
        <Template code="Case-CaseSummarySection" />
      </CaseSectionFont>
      <CaseSummaryTextArea
        rows={summary ? 5 : undefined}
        data-testid="Case-CaseSummary-TextArea"
        aria-labelledby="Case-CaseSummary-label"
        // Add Case summary doesn't show up as default value
        placeholder={strings.NoCaseSummary}
        value={summary}
        readOnly={true}
      />
    </CaseDetailsBorder>
  );
};

CaseSummary.displayName = 'CaseSummary';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

export default connect(mapStateToProps)(CaseSummary);
