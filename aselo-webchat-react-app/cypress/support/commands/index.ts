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

import { createNewWebchat } from "./createNewWebchat";
import {
    addAttachmentFileAndSend,
    addAttachmentFile,
    validateLastAttachmentMessage,
    validateLastTextMessage
} from "./addAttachmentFileAndSend";
import { storeWebchatSessionCookie, resumeWebchatSessionCookie, getConversationSid } from "./webchatSessionCookie";

Cypress.Commands.add("createNewWebchat", createNewWebchat);
Cypress.Commands.add("addAttachmentFileAndSend", addAttachmentFileAndSend);
Cypress.Commands.add("addAttachmentFile", addAttachmentFile);
Cypress.Commands.add("validateLastTextMessage", validateLastTextMessage);
Cypress.Commands.add("validateLastAttachmentMessage", validateLastAttachmentMessage);
Cypress.Commands.add("getConversationSid", getConversationSid);
Cypress.Commands.add("storeWebchatSessionCookie", storeWebchatSessionCookie);
Cypress.Commands.add("resumeWebchatSessionCookie", resumeWebchatSessionCookie);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            createNewWebchat: typeof createNewWebchat;
            addAttachmentFileAndSend: typeof addAttachmentFileAndSend;
            addAttachmentFile: typeof addAttachmentFile;
            validateLastTextMessage: typeof validateLastTextMessage;
            validateLastAttachmentMessage: typeof validateLastAttachmentMessage;
            storeWebchatSessionCookie: typeof storeWebchatSessionCookie;
            resumeWebchatSessionCookie: typeof resumeWebchatSessionCookie;
            getConversationSid: () => Chainable<ReturnType<typeof getConversationSid>>;
        }
    }
}
