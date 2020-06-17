import { isNullOrUndefined } from './checkers';

export const fillEndMillis = metadata => ({
  ...metadata,
  endMillis: new Date().getTime(),
});

/**
 * Metrics will be invalid if:
 * - page was reloaded (form recreated and thus initial information will be lost)
 * - endMillis was not set
 * @param metadata
 */
export const getConversationDuration = metadata => {
  const { startMillis, endMillis, recreated } = metadata;
  const validMetrics = !recreated && !isNullOrUndefined(endMillis);
  if (!validMetrics) return null;

  const milisecondsElapsed = endMillis - startMillis;
  return Math.floor(milisecondsElapsed / 1000);
};
