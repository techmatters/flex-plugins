/* eslint-disable react/prop-types */
import React from 'react';

import Search from './search';
import { StandaloneSearchContainer } from '../styles/search';

export const standaloneTaskSid = 'standalone-task-sid';

export type StandaloneITask = {
  taskSid: 'standalone-task-sid';
  attributes: {
    isContactlessTask: boolean;
  };
};

const standaloneTask: StandaloneITask = {
  taskSid: 'standalone-task-sid',
  attributes: { isContactlessTask: false },
};

const StandaloneSearch: React.FC = () => {
  return (
    <StandaloneSearchContainer>
      <Search task={standaloneTask} />
    </StandaloneSearchContainer>
  );
};

StandaloneSearch.displayName = 'StandaloneSearch';

export default StandaloneSearch;
