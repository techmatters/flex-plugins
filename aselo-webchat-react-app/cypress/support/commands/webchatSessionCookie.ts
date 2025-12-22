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

const LOCAL_STORAGE_ITEM_ID = "TWILIO_WEBCHAT_WIDGET";
let webchatSessionCookie;
const error = `It looks like you're trying to restore a webchat session, but there isn't one.

Make sure to run a test that creates a session and stores it using the "storeWebchatSessionCookie" command.`;

export const storeWebchatSessionCookie = () => {
    webchatSessionCookie = localStorage.getItem(LOCAL_STORAGE_ITEM_ID);
    if (!webchatSessionCookie) {
        throw Error("No conversation cookie found");
    }
    return webchatSessionCookie;
};

export const resumeWebchatSessionCookie = () => {
    if (!webchatSessionCookie) {
        throw Error(error);
    }
    localStorage.setItem(LOCAL_STORAGE_ITEM_ID, webchatSessionCookie);

    return cy.reload();
};

export const getConversationSid = () => {
    if (!webchatSessionCookie) {
        throw Error(error);
    }
    return JSON.parse(webchatSessionCookie).conversationSid;
};
