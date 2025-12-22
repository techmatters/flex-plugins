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

import { initLogger, getLogger } from "../logger";

describe("loggerManager", () => {
    it("should show a proper message if an invalid log level `DEBUG` is selected", () => {
        const consoleLogSpy = jest.spyOn(global.console, "error");

        initLogger("debug");

        expect(consoleLogSpy).toHaveBeenCalled();
    });

    describe("logger", () => {
        beforeAll(() => {
            Object.defineProperty(window, "Twilio", {
                value: {}
            });
        });

        beforeEach(() => {
            initLogger("info");
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should add the new logger to the logger map", () => {
            const className = "testName";
            const consoleLogSpy = jest.spyOn(global.console, "info");

            const logger = getLogger(className);
            logger.info("test message");

            expect(consoleLogSpy).toHaveBeenCalledWith(`[${className}]: test message`);
        });

        it("should add a logger with LEVEL `error`", () => {
            const className = "testName";
            const consoleLogSpy = jest.spyOn(global.console, "error");

            const logger = getLogger(className);
            logger.error("test message");

            expect(consoleLogSpy).toHaveBeenCalledWith(`[${className}]: test message`);
        });
    });
});
