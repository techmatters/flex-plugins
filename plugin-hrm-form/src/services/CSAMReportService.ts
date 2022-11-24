import fetchHrmApi from './fetchHrmApi';
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

export const aknowledgeCSAMReport = async (reportId: CSAMReportEntry['id']): Promise<CSAMReportEntry> => {
  const options = {
    method: 'PATCH',
    body: JSON.stringify({}),
  };

  return fetchHrmApi(`/csamReports/${reportId}/aknowledge`, options);
};

export const deleteCSAMReport = async (reportId: CSAMReportEntry['id']): Promise<CSAMReportEntry> => {
  const options = {
    method: 'DELETE',
    body: JSON.stringify({}),
  };

  return fetchHrmApi(`/csamReports/${reportId}`, options);
};
