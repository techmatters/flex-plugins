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
import { act, render } from '@testing-library/react';

import { useLoadWithRetry } from '../../../states/hooks/useLoadWithRetry';
import { ParseFetchErrorResult } from '../../../states/parseFetchError';

type HookParams = Parameters<typeof useLoadWithRetry>[0];

let capturedResult: ReturnType<typeof useLoadWithRetry>;

const TestComponent = (props: HookParams) => {
  capturedResult = useLoadWithRetry(props);
  return null;
};

const renderHook = (params: HookParams) => render(<TestComponent {...params} />);

const noError: ParseFetchErrorResult = undefined;
const serverError: ParseFetchErrorResult = {
  message: 'Server Error',
  status: 500,
  statusText: 'Internal Server Error',
};
const clientError: ParseFetchErrorResult = { message: 'Not Found', status: 404, statusText: 'Not Found' };

describe('useLoadWithRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    capturedResult = undefined;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial load', () => {
    test('calls loadFunction when safeToLoad and shouldLoad are true', () => {
      const loadFunction = jest.fn();
      renderHook({ loadFunction, error: noError, loading: false, safeToLoad: true, shouldLoad: true, retry: false });
      expect(loadFunction).toHaveBeenCalledTimes(1);
    });

    test('does not call loadFunction when safeToLoad is false', () => {
      const loadFunction = jest.fn();
      renderHook({ loadFunction, error: noError, loading: false, safeToLoad: false, shouldLoad: true, retry: false });
      expect(loadFunction).not.toHaveBeenCalled();
    });

    test('does not call loadFunction when shouldLoad is false', () => {
      const loadFunction = jest.fn();
      renderHook({ loadFunction, error: noError, loading: false, safeToLoad: true, shouldLoad: false, retry: false });
      expect(loadFunction).not.toHaveBeenCalled();
    });
  });

  describe('forceRefresh', () => {
    test('returns a forceRefresh function', () => {
      const loadFunction = jest.fn();
      renderHook({ loadFunction, error: noError, loading: false, safeToLoad: true, shouldLoad: true, retry: false });
      expect(typeof capturedResult.forceRefresh).toBe('function');
    });

    test('calling forceRefresh triggers another load when shouldLoad and safeToLoad are true', () => {
      const loadFunction = jest.fn();
      const { rerender } = renderHook({
        loadFunction,
        error: noError,
        loading: false,
        safeToLoad: true,
        shouldLoad: true,
        retry: false,
      });

      // Initial load happens once
      expect(loadFunction).toHaveBeenCalledTimes(1);

      // After forceRefresh, load is triggered again
      act(() => {
        capturedResult.forceRefresh();
      });

      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={noError}
          loading={false}
          safeToLoad={true}
          shouldLoad={true}
          retry={false}
        />,
      );

      expect(loadFunction).toHaveBeenCalledTimes(2);
    });

    test('forceRefresh does not trigger load when safeToLoad is false', () => {
      const loadFunction = jest.fn();
      const { rerender } = renderHook({
        loadFunction,
        error: noError,
        loading: false,
        safeToLoad: false,
        shouldLoad: true,
        retry: false,
      });

      expect(loadFunction).not.toHaveBeenCalled();

      act(() => {
        capturedResult.forceRefresh();
      });

      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={noError}
          loading={false}
          safeToLoad={false}
          shouldLoad={true}
          retry={false}
        />,
      );

      expect(loadFunction).not.toHaveBeenCalled();
    });
  });

  describe('retry behavior', () => {
    test('retries after server error (5xx) when retry is true', () => {
      const loadFunction = jest.fn();
      const { rerender } = renderHook({
        loadFunction,
        error: noError,
        loading: false,
        safeToLoad: true,
        shouldLoad: true,
        retry: true,
      });

      expect(loadFunction).toHaveBeenCalledTimes(1);

      // Simulate a server error response
      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={serverError}
          loading={false}
          safeToLoad={true}
          shouldLoad={true}
          retry={true}
        />,
      );

      // Advance timers to trigger the retry (first retry: 2^0 * 1000ms = 1000ms)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(loadFunction).toHaveBeenCalledTimes(2);
    });

    test('does not retry on 4xx client errors', () => {
      const loadFunction = jest.fn();
      const { rerender } = renderHook({
        loadFunction,
        error: noError,
        loading: false,
        safeToLoad: true,
        shouldLoad: true,
        retry: true,
      });

      expect(loadFunction).toHaveBeenCalledTimes(1);

      // Simulate a 4xx error
      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={clientError}
          loading={false}
          safeToLoad={true}
          shouldLoad={true}
          retry={true}
        />,
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should still only be called once (no retry on 4xx)
      expect(loadFunction).toHaveBeenCalledTimes(1);
    });

    test('does not retry when retry is false', () => {
      const loadFunction = jest.fn();
      const { rerender } = renderHook({
        loadFunction,
        error: noError,
        loading: false,
        safeToLoad: true,
        shouldLoad: true,
        retry: false,
      });

      expect(loadFunction).toHaveBeenCalledTimes(1);

      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={serverError}
          loading={false}
          safeToLoad={true}
          shouldLoad={true}
          retry={false}
        />,
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(loadFunction).toHaveBeenCalledTimes(1);
    });

    test('does not retry while a load is still in progress', () => {
      const loadFunction = jest.fn();
      const { rerender } = renderHook({
        loadFunction,
        error: noError,
        loading: false,
        safeToLoad: true,
        shouldLoad: true,
        retry: true,
      });

      expect(loadFunction).toHaveBeenCalledTimes(1);

      // Error occurs but loading is still true
      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={serverError}
          loading={true}
          safeToLoad={true}
          shouldLoad={true}
          retry={true}
        />,
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(loadFunction).toHaveBeenCalledTimes(1);
    });

    test('does not start a new retry when safeToLoad becomes false after error', () => {
      const loadFunction = jest.fn();
      const { rerender } = renderHook({
        loadFunction,
        error: noError,
        loading: false,
        safeToLoad: true,
        shouldLoad: true,
        retry: true,
      });

      expect(loadFunction).toHaveBeenCalledTimes(1);

      // Trigger an error to start a retry
      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={serverError}
          loading={false}
          safeToLoad={true}
          shouldLoad={true}
          retry={true}
        />,
      );

      // Advance far beyond first retry window
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(loadFunction).toHaveBeenCalledTimes(2);

      // safeToLoad becomes false — should not trigger another retry cycle
      rerender(
        <TestComponent
          loadFunction={loadFunction}
          error={serverError}
          loading={false}
          safeToLoad={false}
          shouldLoad={true}
          retry={true}
        />,
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // No additional retry started because safeToLoad is false
      expect(loadFunction).toHaveBeenCalledTimes(2);
    });
  });
});
