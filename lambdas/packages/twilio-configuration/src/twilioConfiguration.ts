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

import {
  AccountSID,
  ChatServiceSID,
  WorkflowSID,
  WorkspaceSID,
} from '@tech-matters/twilio-types';
import { getSsmParameter, SsmParameterNotFound } from '@tech-matters/ssm-cache';
import twilio, { Twilio } from 'twilio';

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

export const getMasterWorkflowSid = async (
  accountSid: AccountSID,
): Promise<WorkflowSID> =>
  (await getSsmParameter(
    `/${process.env.NODE_ENV}/twilio/${accountSid}/chat_workflow_sid`,
  )) as WorkflowSID;

export const getAccountAuthToken = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/auth_token`);

/**
 * @deprecated - use getWorkspaceSid, these got duplicated somehow
 */
export const getTwilioWorkspaceSid = getWorkspaceSid;

export const getSurveyWorkflowSid = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/survey_workflow_sid`);

export const getHelplineCode = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/short_helpline`);

export const getSyncServiceSid = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/sync_sid`);

export const getFlexProxyServiceSid = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/flex_proxy_service_sid`);

export const getOperatingInfoKey = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/operating_info_key`);

export const areOperatingHoursEnforced = async (
  accountSid: AccountSID,
): Promise<boolean> => {
  try {
    const overrideText = await getSsmParameter(
      `/${process.env.NODE_ENV}/twilio/${accountSid}/operating_hours_enforced_override`,
    );
    if (overrideText.toLowerCase() === 'true') return true;
    if (overrideText.toLowerCase() === 'false') return false;
  } catch (error) {
    // fall back to default behaviour silently if parameter not found - this is the normal case
    if (!(error instanceof SsmParameterNotFound)) {
      console.error(
        'Error looking up operating hours override in SSM, falling back to default',
        error,
      );
    }
  }
  // Only enforce operating hours in prod by default
  return process.env.NODE_ENV === 'production';
};

export const getSwitchboardQueueSid = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/switchboard_queue_sid`);

export const getServerlessBaseUrl = (accountSid: AccountSID): Promise<string> =>
  getSsmParameter(`/${process.env.NODE_ENV}/serverless/${accountSid}/base_url`);

export const getTwilioClient = async (accountSid: AccountSID): Promise<Twilio> => {
  const authToken = await getAccountAuthToken(accountSid);
  return twilio(accountSid, authToken);
};
