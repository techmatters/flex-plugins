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

import "..";
import { Provider } from "react-redux";
import * as reactDom from "react-dom";

import { sessionDataHandler } from "../sessionDataHandler";
import { WebchatWidget } from "../components/WebchatWidget";
import { store } from "../store/store";
import * as initActions from "../store/actions/initActions";
import * as genericActions from "../store/actions/genericActions";

jest.mock("react-dom");

store.dispatch = jest.fn();

describe("Index", () => {
    const { initWebchat } = window.Twilio;
    beforeAll(() => {
        window.Twilio.getLogger = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initWebchat", () => {
        it("renders Webchat Lite correctly", () => {
            const renderSpy = jest.spyOn(reactDom, "render");

            const root = document.createElement("div");
            root.id = "aselo-webchat-widget-root";
            document.body.appendChild(root);
            initWebchat(undefined, { deploymentKey: "CV000000" });

            expect(renderSpy).toBeCalledWith(
                <Provider store={store}>
                    <WebchatWidget />
                </Provider>,
                root,
            );
        });

        it("sets region correctly", () => {
            const setRegionSpy = jest.spyOn(sessionDataHandler, "setRegion");

            const region = "Foo";
            initWebchat(undefined, { deploymentKey: "CV000000", region });

            expect(setRegionSpy).toBeCalledWith(region);
        });

        it("sets deployment key correctly", () => {
            const setDeploymentKeySpy = jest.spyOn(sessionDataHandler, "setDeploymentKey");

            const deploymentKey = "Foo";
            initWebchat(undefined, { deploymentKey });

            expect(setDeploymentKeySpy).toBeCalledWith(deploymentKey);
        });

        it("initializes config", () => {
            const initConfigSpy = jest.spyOn(initActions, "initConfig");

            initWebchat(undefined, { deploymentKey: "CV000000" });

            expect(initConfigSpy).toBeCalled();
        });

        it("initializes config with provided config merged with default config", () => {
            const initConfigSpy = jest.spyOn(initActions, "initConfig");

            const deploymentKey = "CV000000";
            initWebchat(undefined, { deploymentKey });

            expect(initConfigSpy).toBeCalledWith(expect.objectContaining({ deploymentKey, theme: { isLight: true } }));
        });

        it("gives error when deploymentKey is missing", () => {
            const logger = window.Twilio.getLogger("InitWebChat");
            const errorLoggerSpy = jest.spyOn(logger, "error");

            initWebchat();
            expect(errorLoggerSpy).toBeCalledTimes(1);
            expect(errorLoggerSpy).toHaveBeenCalledWith("deploymentKey must exist to connect to Webchat servers");
        });

        it("triggers expanded true if alwaysOpen is set", () => {
            const changeExpandedStatusSpy = jest.spyOn(genericActions, "changeExpandedStatus");

            initWebchat(undefined, { deploymentKey: "CV000000", alwaysOpen: true });
            expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: true });
        });

        it("triggers expanded false if alwaysOpen is not set", () => {
            const changeExpandedStatusSpy = jest.spyOn(genericActions, "changeExpandedStatus");

            initWebchat(undefined, { deploymentKey: "CV000000", alwaysOpen: false });
            expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });

            initWebchat(undefined, { deploymentKey: "CV000000", alwaysOpen: "some nonsense" as any });
            expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
        });

        it("triggers expanded false with default appStatus", () => {
            const changeExpandedStatusSpy = jest.spyOn(genericActions, "changeExpandedStatus");

            initWebchat(undefined, { deploymentKey: "CV000000" });
            expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
        });
    });
});
