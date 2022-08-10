// This selectors should be used with useFlexSelector. For more information please see https://www.twilio.com/docs/flex/developer/ui/v2/migration-guide#state-management-changes
import type { RootState } from '..';

export const selectWorkerSid = (state: RootState) => state.flex.worker.worker.sid;
