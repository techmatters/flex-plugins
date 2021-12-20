import type { RootState } from '..';

export const selectWorkerSid = (state: RootState) => state.flex.worker.worker.sid;
