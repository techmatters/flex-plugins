/* eslint-disable react/prop-types */
import React from 'react';

import Search from './search';
import { StandaloneSearchContainer } from '../styles/search';
import { StandaloneITask, standaloneTaskSid } from '../types/types';

const standaloneTask: StandaloneITask = {
  taskSid: standaloneTaskSid,
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
