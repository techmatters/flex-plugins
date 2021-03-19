import { isNullOrUndefined } from './checkers';
import { isOfflineContactTask } from '../types/types';

export const fillEndMillis = metadata => ({
  ...metadata,
  endMillis: metadata.endMillis || new Date().getTime(),
});

/**
 * Metrics will be invalid if:
 * - page was reloaded (form recreated and thus initial information will be lost)
 * - endMillis was not set
 * @param {import('../types/types').CustomITask} task
 * @param {{ startMillis: number, endMillis: number, recreated: boolean }} metadata
 */
export const getConversationDuration = (task, metadata) => {
  if (isOfflineContactTask(task)) return null;

  const { startMillis, endMillis, recreated } = metadata;
  const validMetrics = !recreated && !isNullOrUndefined(endMillis);

  if (!validMetrics) return null;

  const milisecondsElapsed = endMillis - startMillis;
  return Math.floor(milisecondsElapsed / 1000);
};
