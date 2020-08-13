/* eslint-disable import/no-unused-modules */

import { CallerFormValues } from '../components/common/forms/CallerForm';

export type CaseStatus = 'open' | 'close';

export type CaseInfo = {
  summary?: string;
  notes?: string[];
  perpetrators?: { perpetrator: CallerFormValues; createdAt: string }[];
  households?: { household: CallerFormValues; createdAt: string }[];
};

export type Case = {
  id: number;
  status: CaseStatus;
  helpline: string;
  twilioWorkerId: string;
  info?: CaseInfo;
  createdAt: string;
  updatedAt: string;
};
