import { isNullOrUndefined } from '../utils';

export function getLimitAndOffsetParams(limit, offset) {
  const hasLimit = !isNullOrUndefined(limit);
  const hasOffset = !isNullOrUndefined(offset);

  if (!hasLimit && !hasOffset) return '';

  const appendLimit = hasLimit ? `limit=${limit}` : '';
  const appendOffset = hasOffset ? `offset=${offset}` : '';
  return `?${[appendLimit, appendOffset].filter(e => e).join('&')}`;
}
