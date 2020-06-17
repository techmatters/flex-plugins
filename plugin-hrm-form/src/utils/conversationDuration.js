import { isNullOrUndefined } from './checkers';

export const fillEndMillis = form => ({
  ...form,
  metadata: {
    ...form.metadata,
    endMillis: new Date().getTime(),
  },
});

/**
 * Metrics will be invalid if:
 * - page was reloaded (form recreated and thus initial information will be lost)
 * - call was never ended (endMillis not set)
 * @param {*} form
 */
export const getConversationDuration = form => {
  const { startMillis, endMillis, recreated } = form.metadata;
  const validMetrics = !recreated && !isNullOrUndefined(endMillis);
  if (!validMetrics) return null;

  const milisecondsElapsed = endMillis - startMillis;
  return Math.floor(milisecondsElapsed / 1000);
};
