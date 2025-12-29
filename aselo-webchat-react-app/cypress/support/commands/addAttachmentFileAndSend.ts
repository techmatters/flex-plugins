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

import * as Constants from "../../utils/constants";
import MessageInputBoxView from "../../pageObjects/Chat/messageInputBoxView";
import ChatMessagesView from "../../pageObjects/Chat/chatMessagesView";

export const addAttachmentFileAndSend = (fileName: string) => {
    MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${fileName}`);
    MessageInputBoxView.getMessageAttachments().contains(fileName);
    MessageInputBoxView.getMessageSendButton().click();
};

export const addAttachmentFile = (fileName: string) => {
    MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${fileName}`);
    MessageInputBoxView.getMessageAttachments().contains(fileName);
};

export const validateLastAttachmentMessage = (fileName: string) => {
    ChatMessagesView.getMessagesBubblesFile().last().should("contain", fileName);
};

export const validateLastTextMessage = (text: string) => {
    cy.wait(1000);
    ChatMessagesView.getAllMessagesBubbles().last().should("contain", text);
};
