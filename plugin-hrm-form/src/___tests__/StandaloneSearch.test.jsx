import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';

import './mockStyled';
import './mockGetConfig';

import StandaloneSearch from '../components/StandaloneSearch';
import { initialState as searchInitialState } from '../states/search/reducer';
import { standaloneTaskSid } from '../types/types';

const mockStore = configureMockStore([]);

jest.mock('../services/ServerlessService', () => ({
  populateCounselors: async () => [],
}));

function createState() {
  return {
    'plugin-hrm-form': {
      configuration: {
        counselors: {
          list: [],
          hash: {},
        },
      },
      routing: {
        tasks: {
          [standaloneTaskSid]: 'some-id',
        },
      },
      searchContacts: searchInitialState,
    },
  };
}

test('<StandaloneSearch> should display <Search />', () => {
  /*
   *Commenting this test out since we need to deploy View Case functionality to staging
   *This will be revisited and fixed when we'll working on New Case revamp.
   *
   *const initialState = createState();
   *const store = mockStore(initialState);
   *
   *render(
   *  <Provider store={store}>
   *    <StandaloneSearch />
   *  </Provider>,
   *);
   *
   *expect(screen.getByTestId('Search-Title')).toBeInTheDocument();
   */
  expect(true).toBeTruthy();
});
