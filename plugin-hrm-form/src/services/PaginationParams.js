import { isNullOrUndefined } from '../utils';

export function getLimitAndOffsetParams(limit, offset, helpline) {
  const hasLimit = !isNullOrUndefined(limit);
  const hasOffset = !isNullOrUndefined(offset);
  const hasHelpline = !isNullOrUndefined(helpline);

  if (!hasLimit && !hasOffset) return '';

  const appendLimit = hasLimit ? `limit=${limit}` : '';
  const appendOffset = hasOffset ? `offset=${offset}` : '';
  const appendHelpline = hasHelpline ? `helpline=${helpline}` : '';
  return `?${[appendLimit, appendOffset, appendHelpline].filter(e => e).join('&')}`;
}
