/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { AccountSID, ChatServiceSID, WorkspaceSID } from '../twilioTypes';
import { getSsmParameter } from '../ssmCache';

export const getWorkspaceSid = async (accountSid: AccountSID): Promise<WorkspaceSID> =>
  (await getSsmParameter(
    `/${process.env.NODE_ENV}/twilio/${accountSid}/workspace_sid`,
  )) as WorkspaceSID;

export const getChatServiceSid = async (
  accountSid: AccountSID,
): Promise<ChatServiceSID> =>
  (await getSsmParameter(
    `/${process.env.NODE_ENV}/twilio/${accountSid}/chat_service_sid`,
  )) as ChatServiceSID;

export const getAccountAuthToken = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/auth_token`);

export const getTwilioWorkspaceSid = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/workspace_sid`);

export const getSurveyWorkflowSid = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/survey_workflow_sid`);

export const getHelplineCode = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/short_helpline`);

export const getServerlessBaseUrl = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/serverless/${accountSid}/base_url`);
