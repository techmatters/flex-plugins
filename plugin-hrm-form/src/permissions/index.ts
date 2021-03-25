import { getConfig } from '../HrmFormPlugin';
import type * as t from '../types/types';
import { canEditCaseSummary as canEditCaseSummaryV1 } from './v1';
import { canEditCaseSummary as canEditCaseSummaryZaV1 } from './za-v1';

export const PermissionActions = {
  OTHER: 'other',
  CLOSE_CASE: 'closeCase',
  REOPEN_CASE: 'reopenCase',
  ADD_NOTE: 'addNote',
  EDIT_NOTE: 'editNote',
  ADD_REFERRAL: 'addReferral',
  EDIT_REFERRAL: 'editReferral',
  ADD_HOUSEHOLD: 'addHousehold',
  EDIT_HOUSEHOLD: 'editHousehold',
  ADD_PERPETRATOR: 'addPerpetrator',
  EDIT_PERPETRATOR: 'editPerpetrator',
  ADD_INCIDENT: 'addIncident',
  EDIT_INCIDENT: 'editIncident',
  EDIT_CASE_SUMMARY: 'editCaseSummary',
};

type PermissionActionsKeys = keyof typeof PermissionActions;
export type PermissionActionType = typeof PermissionActions[PermissionActionsKeys];
type Version = 'v1' | 'za-v1';

type canEditCaseSummaryType = (isSpervisor: boolean, isCreator: boolean, isCaseOpen: boolean) => boolean;
const canEditCaseSummaryMap: { [version in Version]: canEditCaseSummaryType } = {
  v1: canEditCaseSummaryV1,
  'za-v1': canEditCaseSummaryZaV1,
};

export const getPermissionsForCase = (caseObj: t.Case) => {
  const { workerSid, isSupervisor } = getConfig();
  const version = (caseObj.info.definitionVersion || 'za-v1') as Version;
  const { twilioWorkerId } = caseObj;
  const isCreator = workerSid === twilioWorkerId;
  const isCaseOpen = caseObj.status === 'open';

  const canEditFields = isSupervisor || (isCreator && isCaseOpen);
  const canEditCaseSummary = canEditCaseSummaryMap[version];

  const can = (action: PermissionActionType): boolean => {
    switch (action) {
      case PermissionActions.OTHER:
        return true;
      case PermissionActions.EDIT_CASE_SUMMARY:
        return canEditCaseSummary(isSupervisor, isCreator, isCaseOpen);
      default:
        return canEditFields;
    }
  };

  return {
    can,
  };
};
