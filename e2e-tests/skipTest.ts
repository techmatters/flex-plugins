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
