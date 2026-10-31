/**
 * Copyright (C) 2021-2025 Technology Matters
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

/* eslint-disable no-console */
import { URLSearchParams } from 'url';
import type { ALBEvent, ALBResult } from 'aws-lambda';
import { getCachedParameters, loadSsmCacheByName } from '@tech-matters/ssm-cache';

type HelplineAccount = {
  accountSid: string;
  environment: string; // e.g. 'production', 'staging', 'development'
  shortHelpline: string; // e.g. 'AS', 'EUMC'
};

const PRODUCTION = 'production';

// Parameters are named /<environment>/twilio/<account sid>/short_helpline
const SHORT_HELPLINE_PARAMETER_NAME = /^\/([^/]+)\/twilio\/(AC[^/]+)\/short_helpline$/;

const toHelplineAccount = ([name, shortHelpline]: [string, string]): HelplineAccount => {
  const [, environment, accountSid] = name.match(SHORT_HELPLINE_PARAMETER_NAME) ?? [];
  return { accountSid, environment, shortHelpline: shortHelpline.toUpperCase() };
};

const getHelplineAccount = async (
  accountSid: string,
): Promise<HelplineAccount | undefined> => {
  await loadSsmCacheByName({
    configs: [{ nameContains: '/short_helpline', regex: SHORT_HELPLINE_PARAMETER_NAME }],
  });

  return Object.entries(getCachedParameters(SHORT_HELPLINE_PARAMETER_NAME))
    .map(toHelplineAccount)
    .find(account => account.accountSid === accountSid);
};

type DebuggerEvent = {
  Sid: string; //	Unique identifier of this Debugger event.
  AccountSid: string; //	Unique identifier of the account that generated the Debugger event.
  ParentAccountSid: string; //	Unique identifier of the parent account. This parameter only exists if the above account is a subaccount.
  Timestamp: string; //	Time of occurrence of the Debugger event.
  Level: string; //	Severity of the Debugger event. Possible values are Error and Warning.
  PayloadType: string; //	application/json
  Payload: string; //	JSON data specific to the Debugger Event.
};

type DebuggerPayload = Partial<{
  resource_sid: string; // The ID of this Twilio Platform Resource that this error is associated with
  service_sid: string; // The ID of the Twilio Platform Service that this error is associated with
  error_code: string; // The unique error code for this debugging event
  more_info: {
    // A subdocument containing more information about this debugging event
    Msg?: string;
    EmailNotification?: string;
    contentType?: string;
    LogLevel?: string;
    url?: string;
  };
  webhook: {
    response?: {
      status_code: number;
      body?: string;
      headers?: { [k: string]: string };
    };
  }; // A subdocument containing Information about the request and response of the webhook associated with this debugging event.
}>;

const paramsToObject = (params: URLSearchParams) =>
  Array.from(params).reduce<{ [key: string]: string }>((acc, [k, v]) => {
    acc[k] = v;
    return acc;
  }, {});

// Twilio errors that may be omitted
const TWILIO_FLOW_REVISION = '81021'; // Flow revision must be an integer or enum(LatestPublished, LatestRevision): Autopilot
const TWILIO_FUNCTION_ERROR_LOG = '82005'; // Function execution resulted in an error log
const TWILIO_INVALID_CONTENT_TYPE = '12300'; // Attempt to retrieve MediaUrl returned an unsupported Content-Type.
const TWILIO_FLEX_UI_ERROR = '45600'; // Flex UI Error, since September 5th(-ish) Twilio is throwing a lot of "Flex UI error"

const MEDIAURL_MSG = 'Attempt to retrieve MediaUrl returned an unsupported Content-Type.';

const shouldOmitLoggingEvent = (
  account: HelplineAccount | undefined,
  payload: DebuggerPayload,
) => {
  const isProduction = account?.environment === PRODUCTION;

  // As of Sep 8 2021, occurring when people include images in messages, breaking autopilot
  // This filter should be removed once our autopilot bot handles this correctly
  if (
    isProduction &&
    account.shortHelpline === 'ZM' &&
    payload.error_code === TWILIO_FLOW_REVISION
  )
    return true;

  // As of Oct 30 2021, counselors can cause pages by clicking repeatedly on 'Add Another Task'
  // Once we have prevented this in the UI, we can consider removing this filter
  //
  // As of Nov 14 2022, we want to suppress duplicates for custom channel send message fieldErrors
  // See https://bugs.benetech.org/browse/CHI-1495
  if (isProduction && payload.error_code === TWILIO_FUNCTION_ERROR_LOG) return true;

  // As of May 25 2022, URLs sent via Facebook Messenger cannot be handled by Twilio
  // See Nick's Twilio support ticket on Aselo Dev:
  //   https://console.twilio.com/us1/support/tickets?frameUrl=%2Fconsole%2Fsupport%2Ftickets%2F8709011
  // Also see Jira issue: https://bugs.benetech.org/browse/CHI-1214
  // Once that is resolved, this filter can be removed
  if (
    isProduction &&
    payload.error_code === TWILIO_INVALID_CONTENT_TYPE &&
    payload.more_info?.Msg?.includes(MEDIAURL_MSG)
  )
    return true;

  // As of Sep 5th 2022, Twilio is throwing a lot of randoms "Flex UI error", especially "Flex UI error: Voice SDK device error intercepted"
  // This is happening to all helplines
  return isProduction && payload.error_code === TWILIO_FLEX_UI_ERROR;
};

const accountCode = (account: HelplineAccount | undefined) =>
  account
    ? `${account.shortHelpline}_${account.environment.toUpperCase()}`
    : 'UNRECOGNISED_ACCOUNT';

const eventCategory = (
  account: HelplineAccount | undefined,
  payload: DebuggerPayload,
) => {
  if (shouldOmitLoggingEvent(account, payload)) return 'OMITTED';
  return account ? account.environment.toUpperCase() : 'UNKNOWN';
};

/**
 * accountSid: The account triggering this event
 * account: The helpline account matching accountSid, if it is recognised
 * level: Severity of the event (ERROR/WARNING)
 * payload: Webhook payload https://www.twilio.com/docs/usage/troubleshooting/debugging-event-webhooks#payload
 */
const log = (
  accountSid: string,
  account: HelplineAccount | undefined,
  level: string,
  payload: DebuggerPayload,
) => {
  console.log(
    `[${eventCategory(account, payload)} ${level}]: `,
    `${accountCode(account)} (${accountSid})`,
    payload,
  );
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  const decoded = Buffer.from(event.body!, 'base64').toString('ascii');
  const params = new URLSearchParams(decoded);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { AccountSid, Level, Payload } = paramsToObject(params) as DebuggerEvent;

  if (!AccountSid || !Level || !Payload) {
    console.error('Missing required parameters', { AccountSid, Level, Payload });
    return {
      statusCode: 400,
      body: JSON.stringify('Missing required parameters'),
    };
  }

  const payloadObject: DebuggerPayload = JSON.parse(Payload);

  const helplineAccount = await getHelplineAccount(AccountSid);
  log(AccountSid, helplineAccount, Level, payloadObject);

  return {
    statusCode: 200,
    body: JSON.stringify('Event received'),
  };
};
