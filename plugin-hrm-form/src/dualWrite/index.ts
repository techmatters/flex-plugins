import { ITask } from '@twilio/flex-ui';

import { getConfig } from '../HrmFormPlugin';
import { savePendingContactToSharedState, autoRetrySavingPendingContacts } from '../utils/sharedState';
import saveContactToSaferNet from './br';

type DualWriteFn = (task: ITask, payload: any) => Promise<void>;

type SaveContactByDefinitionVersion = {
  [definitionVersion: string]: DualWriteFn;
};

const saveContactByDefinitionVersion: SaveContactByDefinitionVersion = {
  'br-v1': saveContactToSaferNet,
};

export const saveContactToExternalBackend = async (task: ITask, payload: any) => {
  const { featureFlags, definitionVersion } = getConfig();
  if (!featureFlags.enable_dual_write) return;

  const saveContact = saveContactByDefinitionVersion[definitionVersion];
  if (saveContact) {
    try {
      await saveContact(task, payload);
      autoRetrySavingPendingContacts(saveContact);
    } catch (err) {
      savePendingContactToSharedState(task, payload, err);
    }
  }
};
