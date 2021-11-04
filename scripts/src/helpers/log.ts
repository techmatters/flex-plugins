/* eslint-disable no-console */
const log = (colorString: string) => (s: unknown) => {
  if (typeof s === 'string') console.log(colorString, s);
  else if ((s as any).toString) console.log(colorString, (s as any).toString());
  else console.log(colorString, s);
};

export const logSuccess = log('\x1b[32m');
export const logError = log('\x1b[31m');
export const logWarning = log('\x1b[33m');
