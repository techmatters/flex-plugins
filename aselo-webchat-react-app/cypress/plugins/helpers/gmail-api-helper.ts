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

import { Credentials, OAuth2ClientOptions } from "google-auth-library";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";

export class GmailAPIHelper {
    oAuth2Client: OAuth2Client;

    refreshToken: string;

    constructor(oAuthClientOptions: OAuth2ClientOptions, token: Credentials) {
        this.oAuth2Client = new google.auth.OAuth2(
            oAuthClientOptions.clientId,
            oAuthClientOptions.clientSecret,
            oAuthClientOptions.redirectUri
        );
        this.refreshToken = token.refresh_token;
        this.oAuth2Client.setCredentials(token);
    }

    public async getReceivedEmails(emailCount: number) {
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        const response = await gmail.users.messages.list({ userId: "me", labelIds: ["INBOX"], maxResults: emailCount });
        return Promise.all(
            response.data.messages.map(async (message) => {
                return this.getEmail(message.id);
            })
        );
    }

    public async getEmail(messageId) {
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        const response = await gmail.users.messages.get({ id: messageId, userId: "me" });
        return response.data;
    }
}
