/* eslint-disable no-console */
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Typescript blows
// @ts-ignore
const level: LogLevel = LogLevel[process.env.LOG_LEVEL ?? 'INFO'] ?? LogLevel.INFO;
const colourReset = '\x1b[0m';

const log = (colorString: string, requiredLevel: LogLevel) => {
  if (requiredLevel <= level) {
    return (...s: unknown[]) => {
      console.log(colorString, ...s, colourReset);
    };
  }
  return () => {};
};

export const logSuccess = log('\x1b[32m', LogLevel.INFO);
export const logError = log('\x1b[31m', LogLevel.ERROR);
export const logWarning = log('\x1b[33m', LogLevel.WARN);
export const logDebug = log('\x1b[2m', LogLevel.DEBUG);
export const logInfo = log('\x1b[37m', LogLevel.INFO);
