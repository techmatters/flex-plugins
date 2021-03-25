export const canEditCaseSummary = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) => isSupervisor;

/**
 * For now, all the other actions are the same, and can use the below permission.
 */
 export const canEditGenericField = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) =>
 isSupervisor || (isCreator && isCaseOpen);