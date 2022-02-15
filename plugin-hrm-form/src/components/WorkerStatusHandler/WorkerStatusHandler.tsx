/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import type { RootState } from '../../states';

type OwnProps = {
  workerClient: import('@twilio/flex-ui').Manager['workerClient'];
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { worker } = state.flex;

  return { worker };
};

const connector = connect(mapStateToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const WorkerStatusHandler: React.FC<Props> = ({ worker, workerClient }) => {
  const [availableActivity, offlineActivity] = React.useMemo(() => {
    const activitiesArray = Array.from(workerClient.activities);
    const [, available] = activitiesArray.find(([k, v]) => v.name === 'Available');
    const [, offline] = activitiesArray.find(([k, v]) => v.name === 'Offline');
    return [available, offline];
  }, [workerClient.activities]);

  const noTasks = worker.tasks.size === 0;
  const { available } = worker.activity;
  const { attributes } = worker;
  const isSomeTaskPending = Array.from(worker.tasks).some(([, t]) => t.status === 'pending');

  const shouldSetAvailable = noTasks && !available; // here we want to also consider a worker attribute to indicate if should stay offline or if it's "ready to work"
  const shouldSetOffline = available && !noTasks && !worker.attributes.keepAvailable && !isSomeTaskPending;

  console.log('>>>> shouldSetAvailable', shouldSetAvailable);
  console.log('>>>> shouldSetOffline', shouldSetOffline);

  React.useEffect(() => {
    const handleActivities = async () => {
      if (shouldSetAvailable) {
        console.log('>>>> setting available');
        await availableActivity.setAsCurrent();
      } else if (shouldSetOffline) {
        console.log('>>>> setting offline');
        await offlineActivity.setAsCurrent();
      }
    };

    try {
      handleActivities();
    } catch (err) {
      console.log('>>>> err on handleActivities', err);
    }
  }, [availableActivity, offlineActivity, shouldSetAvailable, shouldSetOffline]);

  return null;
};
WorkerStatusHandler.displayName = 'WorkerStatusHandler';

export default connector(WorkerStatusHandler);
