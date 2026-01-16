/**
 * Copyright (C) 2021-2026 Technology Matters
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

import log, { Logger, LogLevelDesc } from 'loglevel';

const VALID_LOGLEVELS: Array<LogLevelDesc> = ['info', 'warn', 'error'];

export default class WebChatLogger {
  className: string;

  logger: Logger;

  constructor(className: string) {
    this.className = className;
    this.logger = log.getLogger(this.className);
  }

  info(message: string) {
    this.logger.info(`[${this.className}]: ${message}`);
  }

  warn(message: string) {
    this.logger.warn(`[${this.className}]: ${message}`);
  }

  error(message: string) {
    this.logger.error(`[${this.className}]: ${message}`);
  }
}

// eslint-disable-next-line func-names
export const { initialize: initLogger, getWebChatLogger: getLogger } = (function () {
  const logDump: Map<string, WebChatLogger> = new Map();

  function initialize(level: LogLevelDesc = 'info') {
    if (!VALID_LOGLEVELS.includes(level)) {
      console.error(
        `Invalid Log Level -> ${level}. Select level higher than INFO or more. Valid levels are INFO, WARN and ERROR.`,
      );
      return;
    }

    log.setLevel(level);
    log.info('Logger has been initialized.');
  }

  function getWebChatLogger(className: string): WebChatLogger {
    if (!logDump.has(className)) {
      logDump.set(className, new WebChatLogger(className));
    }

    return logDump.get(className) as WebChatLogger;
  }

  return {
    initialize,
    getWebChatLogger,
  };
})();
