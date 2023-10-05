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

import { fetchHrmApi } from './fetchHrmApi';
import { CSAMReportEntry } from '../types/types';

type CreateCounsellorCSAMReportParams = {
  csamReportId: string;
  twilioWorkerId: string;
  contactId?: number;
  reportType: 'counsellor-generated';
};

type CreateChildCSAMReportParams = {
  twilioWorkerId: string;
  contactId?: number;
  reportType: 'self-generated';
};

export const createCSAMReport = async (
  body: CreateCounsellorCSAMReportParams | CreateChildCSAMReportParams,
): Promise<CSAMReportEntry> => {
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
  };

  return fetchHrmApi('/csamReports', options);
};

export const acknowledgeCSAMReport = async (reportId: CSAMReportEntry['id']): Promise<CSAMReportEntry> => {
  const options = {
    method: 'POST',
    body: JSON.stringify({}),
  };

  return fetchHrmApi(`/csamReports/${reportId}/acknowledge`, options);
};
