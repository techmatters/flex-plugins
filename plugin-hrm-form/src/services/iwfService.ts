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

/* eslint-disable camelcase */
import fetchProtectedApi from './fetchProtectedApi';
import { getAseloFeatureFlags } from '../hrmConfig';
import type { ChildCSAMReportForm, CounselorCSAMReportForm } from '../states/csam-report/types';

/**
 * Send a CSAM report to IWF
 */
export const reportToIWF = async (form: CounselorCSAMReportForm) => {
  const useTwilioLambda = getAseloFeatureFlags().use_twilio_lambda_for_iwf_reporting;
  const body = {
    Reported_URL: form.webAddress,
    Reporter_Description: form.description,
    Reporter_Anonymous: form.anonymous === 'anonymous' ? 'Y' : 'N',
    Reporter_First_Name: form.firstName,
    Reporter_Last_Name: form.lastName,
    Reporter_Email_ID: form.email,
  };

  const response = await fetchProtectedApi(useTwilioLambda ? '/integrations/iwf/reportToIWF' : '/reportToIWF', body, {
    useTwilioLambda,
  });
  // The account-scoped lambda wraps the IWF response in { status, data }, whereas the
  // serverless endpoint returns the IWF response directly. Normalise to the direct format.
  return useTwilioLambda ? response.data : response;
};

export const selfReportToIWF = async (form: ChildCSAMReportForm, caseNumber: string) => {
  const useTwilioLambda = getAseloFeatureFlags().use_twilio_lambda_for_iwf_reporting;
  const body = {
    user_age_range: form.childAge,
    case_number: caseNumber,
  };

  // The account-scoped lambda returns { reportUrl, status } directly (no wrapper), matching the
  // serverless response format, so no normalisation is required here.
  return fetchProtectedApi(useTwilioLambda ? '/integrations/iwf/selfReportToIWF' : '/selfReportToIWF', body, {
    useTwilioLambda,
  });
};
