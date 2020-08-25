/* eslint-disable import/no-unused-modules */

import { CallerFormValues } from '../components/common/forms/CallerForm';

export type CaseStatus = 'open' | 'close';

export type PerpetratorEntry = { perpetrator: CallerFormValues; createdAt: string; twilioWorkerId: string };

export function isPerpetratorEntry(entry: any): entry is PerpetratorEntry {
  return (
    typeof entry === 'object' &&
    typeof entry.createdAt === 'string' &&
    typeof entry.twilioWorkerId === 'string' &&
    typeof entry.perpetrator === 'object' // couldn't make typeguard for recursive type
  );
}

export type HouseholdEntry = { household: CallerFormValues; createdAt: string; twilioWorkerId: string };

export function isHouseholdEntry(entry: any): entry is HouseholdEntry {
  return (
    typeof entry === 'object' &&
    typeof entry.createdAt === 'string' &&
    typeof entry.twilioWorkerId === 'string' &&
    typeof entry.household === 'object' // couldn't make typeguard for recursive type
  );
}

export type CaseInfo = {
  summary?: string;
  notes?: string[];
  perpetrators?: PerpetratorEntry[];
  households?: HouseholdEntry[];
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
