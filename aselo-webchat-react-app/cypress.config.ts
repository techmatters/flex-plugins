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

require("dotenv").config();

import { getTwilioClient } from "./cypress/plugins/helpers/twilioClient";
import { defineConfig } from "cypress";
import * as fs from "fs";

import {
    acceptReservation,
    sendMessage,
    validateAttachmentLink,
    wrapReservation,
    completeReservation,
    getCustomerName,
    getLastMessageMediaData,
    getLastMessageAllMediaFilenames,
    getLastMessageText
} from "./cypress/plugins/helpers/interactionHandler";
import { GmailAPIHelper } from "./cypress/plugins/helpers/gmail-api-helper";

export default defineConfig({
    e2e: {
        baseUrl: `http://localhost:3000?deploymentKey=${process.env.REACT_APP_DEPLOYMENT_KEY}`,
        retries: 0,
        supportFile: "cypress/support/e2e.ts",
        downloadsFolder: "cypress/downloads",
        trashAssetsBeforeRuns: true,
        chromeWebSecurity: true,
        responseTimeout: 100000,
        setupNodeEvents(on, config) {
            on("task", {
                acceptReservation,
                sendMessage,
                validateAttachmentLink,
                wrapReservation,
                completeReservation,
                getCustomerName,
                getLastMessageMediaData,
                getLastMessageAllMediaFilenames,
                getLastMessageText,
                downloads: (downloadspath) => {
                    try {
                        return fs.readdirSync(downloadspath);
                    } catch (e) {
                        fs.mkdirSync(downloadspath, { recursive: true });
                        return fs.readdirSync(downloadspath);
                    }
                },
                log(message) {
                    // eslint-disable-next-line no-console
                    console.log(message);
                    return null;
                },
                async getReceivedEmails({ oAuthClientOptions, token, count }) {
                    const gmailAPIHelper = new GmailAPIHelper(oAuthClientOptions, token);
                    return gmailAPIHelper.getReceivedEmails(count);
                }
            });
            config.env = {
                ...process.env
            };

            return config;
        }
    },
});
