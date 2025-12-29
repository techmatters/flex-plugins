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

import type * as Conversations from "@twilio/conversations";

import type { Notification } from "./store/definitions";

/*
 *  It's tricky to check if a notification is shown or not as its id contains a `Math.random` that changes with every call.
 *  This helper simplify the match by removing replacing the id with a regex that compare the strings without the generated number,
 */
export const matchPartialNotificationObject = (expectedNotification: Notification) => {
    return {
        ...expectedNotification,
        id: expect.stringMatching(new RegExp(expectedNotification.id.replace(/_(.*)/, "")))
    };
};

export * from "@testing-library/react";

export class MockedPaginator<T> implements Conversations.Paginator<T> {
    /**
     * Indicates the existence of the next page.
     */
    hasNextPage = false;

    /**
     * Indicates the existence of the previous page.
     */
    hasPrevPage = false;

    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-parameter-properties,no-empty-function
    constructor(public items: T[] = []) {}

    /**
     * Request next page.
     * Does not modify the existing object.
     */
    async nextPage(): Promise<MockedPaginator<T>> {
        return Promise.resolve(new MockedPaginator(this.items));
    }

    /**
     * Request previous page.
     * Does not modify the existing object.
     */
    async prevPage(): Promise<MockedPaginator<T>> {
        return Promise.resolve(new MockedPaginator(this.items));
    }
}
