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

export type IWFSelfReportPayload = {
  secret_key: string;
  case_number: string;
  user_age_range: '<13' | '13-15' | '16-17';
};

type IWFSelfReportCredentials = {
  caseUrl: string;
  reportUrl: string;
  secretKey: string;
};

interface IWFResponse {
  result?: string;
  message?: {
    access_token?: string;
  };
}

const getIWFSelfReportCredentials = async (
  accountSid: AccountSID,
): Promise<IWFSelfReportCredentials> => {
  const environment = process.env.NODE_ENV!;

  const [caseUrl, reportUrl, secretKey] = await Promise.all([
    getSsmParameter(`/${environment}/iwf/${accountSid}/api_case_url`),
    getSsmParameter(`/${environment}/iwf/${accountSid}/report_url`),
    getSsmParameter(`/${environment}/iwf/${accountSid}/secret_key`),
  ]);

  return {
    caseUrl,
    reportUrl,
    secretKey,
  };
};

export const selfReportToIWFHandler: FlexValidatedHandler = async (
  { body },
  accountSid,
) => {
  console.info(`selfReportToIWF invoked for account ${accountSid}`);

  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { user_age_range, case_number } = body;

    if (!user_age_range) return newMissingParameterResult('user_age_range');
    if (!case_number) return newMissingParameterResult('case_number');

    console.info(
      `Processing IWF self-report for account ${accountSid}, case: ${case_number}, age range: ${user_age_range}`,
    );

    const credentials = await getIWFSelfReportCredentials(accountSid);

    const formData = new URLSearchParams();
    formData.append('secret_key', credentials.secretKey);
    formData.append('case_number', case_number);
    formData.append('user_age_range', user_age_range);

    const response = await fetch(credentials.caseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = (await response.json()) as IWFResponse;

    if (data?.result !== 'OK') {
      console.warn(
        `IWF self-report failed for account ${accountSid}, case: ${case_number}, result: ${data?.result}`,
      );
      return newErr({
        message: data.message?.access_token || 'IWF self-report request failed',
        error: { statusCode: 400 },
      });
    }

    const reportUrl = `${credentials.reportUrl}/?t=${data.message?.access_token}`;

    console.info(
      `IWF self-report successful for account ${accountSid}, case: ${case_number}`,
    );

    const responseData = {
      reportUrl,
      status: data?.result,
    };

    return newOk(responseData);
  } catch (err) {
    console.error(`Error in self-report to IWF for account ${accountSid}:`, err);
    return newErr({
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      error: {
        statusCode: 500,
        cause: err instanceof Error ? err : new Error(String(err)),
      },
    });
  }
};
