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

import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";

import { EntryPoint } from "../EntryPoint";
import * as genericActions from "../../store/actions/genericActions";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

describe("Entry Point", () => {
    it("renders the entry point", () => {
        const { container } = render(<EntryPoint />);

        expect(container).toBeInTheDocument();
    });

    it("renders the minimize chat button when expanded", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: true } }));

        const { queryByTitle } = render(<EntryPoint />);

        expect(queryByTitle("Minimize chat")).toBeInTheDocument();
    });

    it("renders the open chat button when un-expanded", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: false } }));

        const { queryByTitle } = render(<EntryPoint />);

        expect(queryByTitle("Open chat")).toBeInTheDocument();
    });

    it("changes expanded status to false when clicked and already true", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: true } }));
        const changeExpandedStatusSpy = jest.spyOn(genericActions, "changeExpandedStatus");

        const { container } = render(<EntryPoint />);
        const button = container.firstChild as Element;
        fireEvent.click(button);

        expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
    });

    it("changes expanded status to true when clicked and already false", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: false } }));
        const changeExpandedStatusSpy = jest.spyOn(genericActions, "changeExpandedStatus");

        const { container } = render(<EntryPoint />);
        const button = container.firstChild as Element;
        fireEvent.click(button);

        expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: true });
    });
});
