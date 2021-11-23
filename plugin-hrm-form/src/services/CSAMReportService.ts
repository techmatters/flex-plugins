import fetchHrmApi from './fetchHrmApi';
// import { CSAMReportEntry } from '../types/types';

type CreateCSAMReportParams = {
  csamReportId: string;
  twilioWorkerId: string;
  contactId?: number;
};

export const createCSAMReport = async ({ csamReportId, twilioWorkerId, contactId }: CreateCSAMReportParams) => {
  const body = {
    twilioWorkerId,
    csamReportId,
    contactId,
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
  };

  return fetchHrmApi('/csamReports', options);
};
