/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import * as React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../../../mockGetConfig';
import { useCase } from '../../../../states/case/hooks/useCase';
import { namespace, connectedCaseBase } from '../../../../states/storeNamespaces';
import { LOAD_CASE_ACTION } from '../../../../states/case/types';
import { RecursivePartial } from '../../../RecursivePartial';
import { RootState } from '../../../../states';
import { VALID_EMPTY_CASE } from '../../../testCases';

jest.mock('../../../../states/case/singleCase', () => ({
  loadCaseAsync: jest.fn(({ caseId }) => ({
    type: 'case-action/load-case',
    payload: Promise.resolve(),
    meta: { caseId },
  })),
}));

const mockStore = configureMockStore([]);

type UseCaseParams = Parameters<typeof useCase>[0];

let capturedResult: ReturnType<typeof useCase>;

const TestComponent = (props: UseCaseParams) => {
  capturedResult = useCase(props);
  return null;
};

const buildState = (
  caseEntry?: RecursivePartial<RootState[typeof namespace][typeof connectedCaseBase]['cases'][string]>,
): RecursivePartial<RootState> => ({
  [namespace]: {
    [connectedCaseBase]: {
      cases: caseEntry ? { case1: caseEntry } : {},
    },
  },
});

describe('useCase', () => {
  beforeEach(() => {
    capturedResult = undefined;
  });

  describe('autoload behaviour', () => {
    test('dispatches load action when case is not in state and autoload is true (default)', () => {
      const store = mockStore(buildState());

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" />
        </Provider>,
      );

      const actions = store.getActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(LOAD_CASE_ACTION);
      expect(actions[0].meta.caseId).toBe('case1');
    });

    test('does not dispatch load action when case is already in state', () => {
      const store = mockStore(buildState({ connectedCase: VALID_EMPTY_CASE, loading: false, error: null }));

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" />
        </Provider>,
      );

      expect(store.getActions()).toHaveLength(0);
    });

    test('does not dispatch load action when autoload is false', () => {
      const store = mockStore(buildState());

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" autoload={false} />
        </Provider>,
      );

      expect(store.getActions()).toHaveLength(0);
    });

    test('does not dispatch load action when caseId is falsy', () => {
      const store = mockStore(buildState());

      render(
        <Provider store={store}>
          <TestComponent caseId={undefined} />
        </Provider>,
      );

      expect(store.getActions()).toHaveLength(0);
    });
  });

  describe('return values', () => {
    test('returns connectedCase from state when present', () => {
      const store = mockStore(buildState({ connectedCase: VALID_EMPTY_CASE, loading: false, error: null }));

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" />
        </Provider>,
      );

      expect(capturedResult.connectedCase).toStrictEqual(VALID_EMPTY_CASE);
    });

    test('returns undefined connectedCase when case is not in state', () => {
      const store = mockStore(buildState());

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" />
        </Provider>,
      );

      expect(capturedResult.connectedCase).toBeUndefined();
    });

    test('returns loading state from store', () => {
      const store = mockStore(buildState({ loading: true }));

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" autoload={false} />
        </Provider>,
      );

      expect(capturedResult.loading).toBe(true);
    });

    test('returns error state from store', () => {
      const error = { message: 'Server Error', status: 500, statusText: 'Internal Server Error' };
      const store = mockStore(buildState({ error, loading: false }));

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" autoload={false} />
        </Provider>,
      );

      expect(capturedResult.error).toStrictEqual(error);
    });

    test('returns a forceRefresh function', () => {
      const store = mockStore(buildState());

      render(
        <Provider store={store}>
          <TestComponent caseId="case1" autoload={false} />
        </Provider>,
      );

      expect(typeof capturedResult.forceRefresh).toBe('function');
    });
  });
});
