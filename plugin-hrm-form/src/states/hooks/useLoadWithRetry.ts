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
import { useEffect, useRef } from 'react';

import { ParseFetchErrorResult } from '../parseFetchError';

/**
 * @param params - Parameters for the hook
 * @param params.loadFunction - Callback that performs the actual work
 * @param params.error - A ParseFetchErrorResult object representing the error, if any
 * @param params.loading - Indicates if we are in the middle of loadFunction execution
 * @param params.safeToLoad - Indicates if the load function is safe to call
 * @param params.shouldLoad - Indicates if the requirements are met to trigger a load
 * @param params.retry - Indicates if the retry mechanism should be enabled
 */
export const useLoadWithRetry = ({
  loadFunction,
  error,
  loading,
  safeToLoad,
  shouldLoad,
  retry,
}: {
  loadFunction: () => void;
  error: ParseFetchErrorResult;
  loading: boolean;
  safeToLoad: boolean;
  shouldLoad: boolean;
  retry: boolean;
}) => {
  // effect to trigger loading, if conditions are met
  useEffect(() => {
    if (!safeToLoad) return;

    if (shouldLoad) {
      loadFunction();
    }
  }, [loadFunction, safeToLoad, shouldLoad]);

  // vars used to handle the retry and backoff logic
  const retryCount = useRef(0);
  const retrying = useRef(false);
  const timerId = useRef(null);

  // effect to trigger retries, in case of errors
  useEffect(() => {
    if (!retry) {
      return;
    }

    if (error && !loading && !retrying.current && retryCount.current < 10) {
      console.error('[useLoadWithRetry] calling "loadFunction" resulted in error:', error);

      // don't retry 4xx, the problem is on the client
      if (error.status >= 400 && error.status < 500) {
        return;
      }

      retrying.current = true;
      timerId.current = setTimeout(() => {
        if (!safeToLoad) return;

        if (shouldLoad) {
          loadFunction();
        }
        retrying.current = false;
        retryCount.current += 1;
      }, 1000 * Math.pow(2, retryCount.current));
    }
  }, [error, loadFunction, loading, retry, safeToLoad, shouldLoad]);

  // cleanup the retry timeout on unmount
  useEffect(() => {
    return () => clearTimeout(timerId.current);
  }, []);
};
