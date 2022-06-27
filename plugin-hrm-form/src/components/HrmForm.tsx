/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';

import { CaseLayout } from '../styles/case';
import CallTypeButtons from './callTypeButtons';
import TabbedForms from './tabbedForms';
import Case from './case';
import CSAMReport from './CSAMReport/CSAMReport';
import { namespace, RootState, routingBase } from '../states';
import type { CustomITask } from '../types/types';

type OwnProps = {
  task: CustomITask;
  featureFlags: { [flag: string]: boolean };
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const HrmForm: React.FC<Props> = ({ routing, task, featureFlags }) => {
  if (!routing) return null;
  const { route } = routing;

  switch (route) {
    case 'tabbed-forms':
      return <TabbedForms task={task} csamReportEnabled={featureFlags.enable_csam_report} />;

    case 'new-case':
      return (
        <CaseLayout>
          <Case task={task} isCreating={true} />
        </CaseLayout>
      );

    case 'csam-report':
      return <CSAMReport taskSid={task.taskSid} />;

    case 'select-call-type':
    default:
      return <CallTypeButtons task={task} />;
  }
};

HrmForm.displayName = 'HrmForm';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const routingState = state[namespace][routingBase];

  return { routing: routingState.tasks[ownProps.task.taskSid] };
};

export default connect(mapStateToProps, null)(HrmForm);
