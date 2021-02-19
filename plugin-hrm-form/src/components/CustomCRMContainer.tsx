/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import TaskView from './TaskView';
import { Absolute } from '../styles/HrmStyles';
import { populateCounselors } from '../services/ServerlessService';
import { populateCounselorsState } from '../states/configuration/actions';
import type { RootState } from '../states';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CustomCRMContainer: React.FC<Props> = ({ tasks, dispatch }) => {
  useEffect(() => {
    const fetchPopulateCounselors = async () => {
      try {
        const counselorsList = await populateCounselors();
        dispatch(populateCounselorsState(counselorsList));
      } catch (err) {
        // TODO (Gian): probably we need to handle this in a nicer way
        console.error(err.message);
      }
    };

    fetchPopulateCounselors();
  }, [dispatch]);

  return (
    <Absolute top="0" bottom="0" left="0" right="0">
      {Array.from(tasks.values()).map(item => (
        <TaskView thisTask={item} key={`controller-${item.taskSid}`} />
      ))}
    </Absolute>
  );
};

CustomCRMContainer.displayName = 'CustomCRMContainer';

const mapStateToProps = (state: RootState) => {
  return {
    tasks: state.flex.worker.tasks,
  };
};

const connector = connect(mapStateToProps);
export default connector(CustomCRMContainer);
