// This type is incomplete as we don't know the types for the remaining properties (perpetrators, etc)
export type CaseInfo = { summary?: string; notes?: { note: string; createdAt: string }[] };

export type Case = {
  id: number;
  status: string;
  helpline: string;
  twilioWorkerId: string;
  info?: CaseInfo;
  createdAt: string;
  updatedAt: string;
};
