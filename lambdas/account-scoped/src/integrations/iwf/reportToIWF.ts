/* eslint-disable @typescript-eslint/naming-convention */
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

import { FlexValidatedHandler } from '../../validation/flexToken';
import { newOk, newErr } from '../../Result';
import { newMissingParameterResult } from '../../httpErrors';
import { getSsmParameter } from '@tech-matters/ssm-cache';
import type { AccountSID } from '@tech-matters/twilio-types';

export type IWFReportPayload = {
  Reporting_Type: 'R'; // "R" for report
  Live_Report: 'L' | 'T'; // "L" for Live, "T" for test
  Media_Type_ID: 1; // 1 for a URL report
  Report_Channel_ID: number; // 51 for online report
  Origin_ID: 5; // 5 for public report
  Submission_Type_ID: 1; // 1 for online report
  Reported_Category_ID: 2; // 2 for suspected child sexual abuse report (remit child)
  Reported_URL: string; // Max 1000 characters
  Reporter_Anonymous: 'Y' | 'N'; // Is the report anonymous or not
  Reporter_First_Name: string | null; // Max 50 characters
  Reporter_Last_Name: string | null; // Max 50 characters
  Reporter_Email_ID: string | null; // Max 100 characters
  Reporter_Country_ID: number | null; // Reporter's country (Helpline specific)
  Reporter_Description: string | null; // Max 500 characters
};

type IWFCredentials = {
  username: string;
  password: string;
  url: string;
  environment?: string;
  countryCode?: string;
  channelId?: string;
};

const getIWFCredentials = async (accountSid: AccountSID): Promise<IWFCredentials> => {
  const environment = process.env.NODE_ENV!;

  const [username, password, url, iwfEnvironment, countryCode, channelId] =
    await Promise.all([
      getSsmParameter(`/${environment}/twilio/${accountSid}/iwf_api_username`),
      getSsmParameter(`/${environment}/twilio/${accountSid}/iwf_api_password`),
      getSsmParameter(`/${environment}/twilio/${accountSid}/iwf_api_url`),
      getSsmParameter(`/${environment}/twilio/${accountSid}/iwf_api_environment`).catch(
        () => null,
      ),
      getSsmParameter(`/${environment}/twilio/${accountSid}/iwf_api_country_code`).catch(
        () => null,
      ),
      getSsmParameter(`/${environment}/twilio/${accountSid}/iwf_api_channel_id`).catch(
        () => null,
      ),
    ]);

  return {
    username,
    password,
    url,
    environment: iwfEnvironment || undefined,
    countryCode: countryCode || undefined,
    channelId: channelId || undefined,
  };
};

export const reportToIWFHandler: FlexValidatedHandler = async ({ body }, accountSid) => {
  try {
    const {
      Reported_URL,
      Reporter_Anonymous,
      Reporter_First_Name,
      Reporter_Last_Name,
      Reporter_Email_ID,
      Reporter_Description,
    } = body;

    if (!Reported_URL) return newMissingParameterResult('Reported_URL');
    if (
      !Reporter_Anonymous ||
      (Reporter_Anonymous !== 'Y' && Reporter_Anonymous !== 'N')
    ) {
      return newMissingParameterResult('Reporter_Anonymous');
    }

    const credentials = await getIWFCredentials(accountSid);

    const liveReportFlag = credentials.environment === 'L' ? 'L' : 'T';
    const countryID = credentials.countryCode
      ? parseInt(credentials.countryCode, 10)
      : null;

    const channelID = credentials.channelId ? parseInt(credentials.channelId, 10) : 51;

    const payload: IWFReportPayload = {
      Reporting_Type: 'R',
      Live_Report: liveReportFlag,
      Media_Type_ID: 1,
      Report_Channel_ID: channelID,
      Origin_ID: 5,
      Submission_Type_ID: 1,
      Reported_Category_ID: 2,
      Reported_URL,
      Reporter_Anonymous,
      Reporter_First_Name: Reporter_First_Name || null,
      Reporter_Last_Name: Reporter_Last_Name || null,
      Reporter_Email_ID: Reporter_Email_ID || null,
      Reporter_Description: Reporter_Description || null,
      Reporter_Country_ID: countryID,
    };

    const authHash = Buffer.from(
      `${credentials.username}:${credentials.password}`,
    ).toString('base64');

    const response = await fetch(credentials.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHash}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    return newOk({
      status: response.status,
      data: responseData,
    });
  } catch (err) {
    console.error('Error reporting to IWF:', err);
    return newErr({
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      error: {
        statusCode: 500,
        cause: err instanceof Error ? err : new Error(String(err)),
      },
    });
  }
};
