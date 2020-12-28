/* eslint-disable react/prop-types */
import React from 'react';
import { withTaskContext, ITask } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import CallTypeButtons from './callTypeButtons';
import TabbedForms from './tabbedForms';
import Case from './case';
import { namespace, routingBase } from '../states';
import * as RoutingActions from '../states/routing/actions';
import { RoutingState } from '../states/routing/reducer';

type OwnProps = {
  task: ITask;
  handleCompleteTask: any;
  changeRoute: any;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const HrmForm: React.FC<Props> = props => {
  // eslint-disable-next-line react/prop-types
  if (!props.routing) return null;
  // eslint-disable-next-line react/prop-types
  const { route } = props.routing;

  switch (route) {
    case 'tabbed-forms':
      return <TabbedForms handleCompleteTask={props.handleCompleteTask} />;

    case 'new-case':
      return <Case handleCompleteTask={props.handleCompleteTask} />;

    case 'select-call-type':
    default:
      return <CallTypeButtons handleCompleteTask={props.handleCompleteTask} />;
  }
};

HrmForm.displayName = 'HrmForm';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const routingState: RoutingState = state[namespace][routingBase];

  return { routing: routingState.tasks[ownProps.task.taskSid] };
};

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
};

// @ts-ignore
export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(HrmForm));
