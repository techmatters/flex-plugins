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
import PreEngagementChatForm from "../../pageObjects/preEngagementChatForm";
import ChatMessagesView from "../../pageObjects/Chat/chatMessagesView";

export const createNewWebchat = () => {
    PreEngagementChatForm.getNameInput().type(Constants.CUSTOMER_NAME);
    PreEngagementChatForm.getEmailInput().type(Cypress.env("TEST_EMAIL"));
    PreEngagementChatForm.getQueryTextarea().type(Constants.CUSTOMER_WELCOME_TEXT);
    PreEngagementChatForm.getStartChatButton().click();
    ChatMessagesView.validateChatStartedVisible(30000);
};
