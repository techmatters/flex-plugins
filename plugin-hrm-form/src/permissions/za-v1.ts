export const canEditCaseSummary = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) =>
  isSupervisor || (isCreator && isCaseOpen);

export const canEditChildIsAtRisk = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) => isCaseOpen;

export const canEditFollowUpDate = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) => isCaseOpen;

/**
 * For now, all the other actions are the same, and can use the below permission.
 */
export const canEditGenericField = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) =>
  isSupervisor || (isCreator && isCaseOpen);
