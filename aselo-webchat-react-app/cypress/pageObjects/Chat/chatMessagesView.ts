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

const ChatMessagesView = {
    getChatStarted(time) {
        return cy.get('[data-test="chat-started"]', { timeout: time });
    },

    getMessagesRootContainer() {
        return cy.get('[data-test="root-container"]');
    },

    getNewMessageSeparator() {
        return cy.get('[data-test="new-message-separator"]');
    },

    getAllMessagesBubbles() {
        return cy.get('[data-test="all-message-bubbles"]');
    },

    getMessagesBubblesFile() {
        return cy.get('[data-test="file-preview-main-area"]');
    },

    validateChatStartedVisible(time) {
        this.getChatStarted(time).should("be.visible");
    },

    validateNewMessageSeparatorExist() {
        this.getNewMessageSeparator().should("exist");
    },

    validateNewMessageSeparatorNotExist() {
        this.getNewMessageSeparator().should("not.exist");
    },

    validateMessagesRootContainerExist() {
        this.getMessagesRootContainer().should("exist");
    },

    validateMessagesRootContainerNotExist() {
        this.getMessagesRootContainer().should("not.exist");
    }
};
export default ChatMessagesView;
