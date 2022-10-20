import { CaseSectionApiName } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { noteSectionApi } from './note';
import { incidentSectionApi } from './incident';
import { householdSectionApi } from './household';
import { perpetratorSectionApi } from './perpetrator';
import { referralSectionApi } from './referral';
import { documentSectionApi } from './document';

const apiMap: Record<CaseSectionApiName, CaseSectionApi<unknown>> = {
  notes: noteSectionApi,
  incidents: incidentSectionApi,
  households: householdSectionApi,
  perpetrators: perpetratorSectionApi,
  referrals: referralSectionApi,
  documents: documentSectionApi,
};

export const lookupApi = (name: CaseSectionApiName): CaseSectionApi<unknown> => apiMap[name];
