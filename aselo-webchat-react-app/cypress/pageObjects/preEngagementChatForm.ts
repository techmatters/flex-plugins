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

import * as Constants from "../utils/constants";

const PreEngagementChatForm = {
    toggleWebchatExpanded() {
        cy.get('[data-test="entry-point-button"]').click();
    },

    getStartChatButton() {
        return cy.get('button[data-test="pre-engagement-start-chat-button"]');
    },

    getNameInput() {
        return cy.get('[data-test="pre-engagement-chat-form-name-input"]');
    },

    getEmailInput() {
        return cy.get('[data-test="pre-engagement-chat-form-email-input"]');
    },

    getQueryTextarea() {
        return cy.get('[data-test="pre-engagement-chat-form-query-textarea"]');
    },

    validateFormExist() {
        cy.get('[data-test="pre-engagement-chat-form"]').should("exist");
    },

    validateFieldErrorMessage(inputField, errorMessage: RegExp) {
        inputField.invoke("prop", "validationMessage").should("match", errorMessage);
    },

    validateEmail() {
        this.getEmailInput().type(Constants.INCORRECT_EMAIL);
        this.getStartChatButton().click();
        if (Cypress.isBrowser("firefox")) {
            this.validateFieldErrorMessage(this.getEmailInput(), Constants.INCORRECT_EMAIL_ERROR_MESSAGE_FIREFOX);
        }
        if (Cypress.isBrowser(["chrome", "edge"])) {
            this.validateFieldErrorMessage(this.getEmailInput(), Constants.INCORRECT_EMAIL_ERROR_MESSAGE_CHROME);
        }
    }
};
export default PreEngagementChatForm;
