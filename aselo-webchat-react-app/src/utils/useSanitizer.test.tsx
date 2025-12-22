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

import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { useSanitizer } from "./useSanitizer";
import validator from "validator";
describe("useSanitizer custom hook", () => {
    it("should set the default state on render", () => {
        const { result } = renderHook(() => useSanitizer());

        expect(result.current.userInput).toBe('');
    });

    it("should update the local state of the hook after input sanitization", () => {
        const { result } = renderHook(() => useSanitizer());

        act(() => {
            result.current.onUserInputSubmit("newText");
        });

        expect(result.current.userInput).toBe("newText");
    });

    it("should escape unwanted characters", () => {
        const blackListSpy = jest.spyOn(validator, "blacklist");
        const { result } = renderHook(() => useSanitizer());

        act(() => {
            result.current.onUserInputSubmit("<script>alert('Hello!!!')</script>");
        });

        expect(result.current.userInput).toBe("script>alert('Hello!!!')script>");
        expect(blackListSpy).toBeCalled();
    });
});