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

const MessageInputBoxView = {
    getMessageInputTextArea() {
        return cy.get('[data-test="message-input-textarea"]');
    },

    getMessageFileInput() {
        return cy.get('input[type="file"]');
    },

    getMessageAttachments() {
        return cy.get('[data-test="message-attachments"]');
    },

    getMessageFileAttachmentRemoveButton() {
        return cy.get('[data-test="message-file-attachment-remove-button"]');
    },

    getMessageSendButton() {
        return cy.get('[data-test="message-send-button"]');
    },

    validateMessageFileAttachmentRemoveButtonNotExist() {
        this.getMessageFileAttachmentRemoveButton().should("not.exist");
    },

    validateMessageAttachmentsNotVisible() {
        this.getMessageAttachments().should("not.be.visible");
    }
};
export default MessageInputBoxView;
