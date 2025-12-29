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

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { WebchatWidget } from "../WebchatWidget";
import { sessionDataHandler } from "../../sessionDataHandler";
import * as genericActions from "../../store/actions/genericActions";
import * as initActions from "../../store/actions/initActions";
import { EngagementPhase } from "../../store/definitions";
import WebChatLogger from "../../logger";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

jest.mock("../../sessionDataHandler", () => ({
    sessionDataHandler: {
        tryResumeExistingSession: jest.fn(),
        getRegion: jest.fn()
    }
}));

jest.mock("../../store/actions/initActions", () => ({
    initSession: jest.fn()
}));

jest.mock("../../store/actions/genericActions", () => ({
    changeEngagementPhase: jest.fn()
}));

jest.mock("../RootContainer", () => ({
    RootContainer: () => <div title="RootContainer" />
}));

jest.mock("../../logger");

beforeAll(() => {
    Object.defineProperty(window, "Twilio", {
        value: {
            getLogger(className: string) {
                return new WebChatLogger(className);
            }
        }
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Webchat Lite", () => {
    const sessionData = {
        token: "token",
        conversationSid: "sid"
    };
    const region = "stage";

    beforeEach(() => {
        (sessionDataHandler.tryResumeExistingSession as jest.Mock).mockReturnValue(sessionData);
        (sessionDataHandler.getRegion as jest.Mock).mockReturnValueOnce(region);
    });

    it("renders Webchat Lite", () => {
        const { container } = render(<WebchatWidget />);

        expect(container).toBeInTheDocument();
    });

    it("renders the root container", () => {
        const { queryByTitle } = render(<WebchatWidget />);

        expect(queryByTitle("RootContainer")).toBeInTheDocument();
    });

    it("initializes session with fetched session data", () => {
        const initSessionSpy = jest.spyOn(initActions, "initSession");

        render(<WebchatWidget />);

        expect(initSessionSpy).toHaveBeenCalledWith({
            token: sessionData.token,
            conversationSid: sessionData.conversationSid
        });
    });

    it("start pre-engagement form if no pre-existing session data", () => {
        (sessionDataHandler.tryResumeExistingSession as jest.Mock).mockReturnValueOnce(null);
        const changeEngagementPhaseSpy = jest.spyOn(genericActions, "changeEngagementPhase");

        render(<WebchatWidget />);

        expect(changeEngagementPhaseSpy).toHaveBeenCalledWith({ phase: EngagementPhase.PreEngagementForm });
    });

    it("start pre-engagement form if session initialization failed", () => {
        (initActions.initSession as jest.Mock).mockImplementationOnce(() => {
            throw new Error("Failed Initialization");
        });
        const changeEngagementPhaseSpy = jest.spyOn(genericActions, "changeEngagementPhase");

        render(<WebchatWidget />);

        expect(changeEngagementPhaseSpy).toHaveBeenCalledWith({ phase: EngagementPhase.PreEngagementForm });
    });
});
