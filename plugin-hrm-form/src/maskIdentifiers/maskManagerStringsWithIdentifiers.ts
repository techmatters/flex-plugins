import { Manager } from '@twilio/flex-ui';

import { getTemplateStrings } from '../hrmConfig';
import { getInitializedCan, PermissionActions } from '../permissions';

export const maskManagerStringsWithIdentifiers = (newStrings: ReturnType<typeof getTemplateStrings>) => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  if (!maskIdentifiers) return;

  const { strings } = Manager.getInstance();

  // eslint-disable-next-line consistent-return
  return Object.fromEntries(
    Object.entries(strings).map(([key, value]) => [
      key,
      value.replace(/{{task.defaultFrom}}/g, newStrings.MaskIdentifiers),
    ]),
  );
};
