/* eslint-disable no-console */
export const logSuccess = (s: string) => {
  console.log('\x1b[32m', s);
};

export const logError = (s: string) => {
  console.log('\x1b[31m', s);
};

export const logWarning = (s: string) => {
  console.log('\x1b[33m', s);
};
