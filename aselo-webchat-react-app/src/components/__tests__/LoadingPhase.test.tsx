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

import { LoadingPhase } from "../LoadingPhase";

// Spinner component caused errors
jest.mock("@twilio-paste/core/spinner", () => ({
    Spinner: () => <div title="Authorizing" />
}));

describe("Loading Phase", () => {
    it("renders the loading phase", () => {
        const { container } = render(<LoadingPhase />);

        expect(container).toBeInTheDocument();
    });

    it("renders the spinner", () => {
        const { queryByTitle } = render(<LoadingPhase />);
        const spinner = queryByTitle("Authorizing");

        expect(spinner).toBeInTheDocument();
    });
});
