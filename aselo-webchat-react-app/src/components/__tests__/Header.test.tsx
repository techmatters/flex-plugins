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

import { Header } from "../Header";

describe("Header", () => {
    it("renders the header", () => {
        const { container } = render(<Header />);

        expect(container).toBeInTheDocument();
    });

    it("renders header with custom title", () => {
        const customTitle = "Chat Title";
        const { queryByText } = render(<Header customTitle={customTitle} />);

        expect(queryByText(customTitle)).toBeInTheDocument();
    });

    it("renders header with default text when no custom title provided", () => {
        const { queryByText } = render(<Header />);

        expect(queryByText("Live Chat")).toBeInTheDocument();
    });
});
