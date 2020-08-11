/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { namespace, connectedCaseBase, configurationBase } from '../../states';
import { CaseState } from '../../states/case/reducer';
import * as RoutingActions from '../../states/routing/actions';

type OwnProps = {
  taskSid: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewNote: React.FC<Props> = ({ taskSid, connectedCaseState, changeRoute, counselorsHash }) => {
  const { counselor, date, note } = connectedCaseState.viewNoteInfo;
  const counselorName = counselorsHash[counselor] || 'Unknown';

  const handleClose = () => changeRoute({ route: 'new-case' }, taskSid);

  return (
    <>
      <h1>View Note</h1>
      <h2>Counselor: {counselorName}</h2>
      <h2>Date: {date}</h2>
      <h2>Note: {note}</h2>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={handleClose}>
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </>
  );
};

ViewNote.displayName = 'ViewNote';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;

  return { connectedCaseState, counselorsHash };
};

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewNote);
