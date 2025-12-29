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

import { NotificationState } from "../../store/definitions";
import { NotificationBar } from "../NotificationBar";

const mockNotificationState: NotificationState = [
    {
        message: "Test notification 1",
        id: "TestNotification1",
        type: "neutral",
        dismissible: false
    },
    {
        message: "Test notification 2",
        id: "TestNotification2",
        type: "neutral",
        dismissible: false
    }
];

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useSelector: (callback: any) => callback({ notifications: mockNotificationState }),
    useDispatch: jest.fn()
}));

describe("Notification Bar", () => {
    it("renders a notification bar", () => {
        const { container } = render(<NotificationBar />);

        expect(container).toBeInTheDocument();
    });

    it("renders a list of notifications", () => {
        const { queryByText } = render(<NotificationBar />);

        expect(queryByText("Test notification 1")).toBeInTheDocument();
        expect(queryByText("Test notification 2")).toBeInTheDocument();
    });
});
