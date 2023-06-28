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

import { test } from '@playwright/test';
import { getConfigValue } from './config';

export const NOT_TARGETED_MSG = 'Skipping test because it is not the one specified in TEST_NAME';

const getCallerFileName = (): string | null => {
  const origPrepareStackTrace = Error.prepareStackTrace;

  Error.prepareStackTrace = function (_, stack) {
    return stack;
  };

  const err = new Error();
  const stack = <NodeJS.CallSite[]>(<any>err).stack;
  Error.prepareStackTrace = origPrepareStackTrace;
  const callerFile = stack[2].getFileName();

  return callerFile;
};

export const skipTestIfNotTargeted = () => {
  const testName = getConfigValue('testName') as string;

  if (testName === '') return;

  const callerFile = getCallerFileName();
  if (callerFile === null) return;
  if (callerFile.includes(testName)) return;

  test.skip(true, NOT_TARGETED_MSG);
};

export const skipTestIfDataUpdateDisabled = () => {
  const shouldSkip = getConfigValue('skipDataUpdate') as boolean;

  test.skip(shouldSkip, NOT_TARGETED_MSG);
};
