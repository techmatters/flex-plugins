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

import "react-redux";
import "@testing-library/jest-dom";

import { ConfigReducer } from "../config.reducer";
import { ConfigState } from "../definitions";
import { ACTION_LOAD_CONFIG } from "../actions/actionTypes";
import { store } from "../store";

describe("Config Reducer", () => {
    store.getState();
    let configState: ConfigState = {};

    beforeEach(() => {
        configState = {};
    });

    it("updates config state when ACTION_LOAD_CONFIG is dispatched", async () => {
        expect(configState.serverUrl).toBeUndefined();
        const newState: ConfigState = ConfigReducer(
            {},
            {
                type: ACTION_LOAD_CONFIG,
                payload: {
                    serverUrl: "test-endpoint-1"
                }
            }
        );
        expect(newState.serverUrl).toEqual("test-endpoint-1");
    });
});
