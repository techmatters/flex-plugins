import { isNullOrUndefined } from '../utils';

export function getQueryParams({ limit, offset, sortBy = undefined, order = undefined, helpline = undefined }) {
  const hasLimit = !isNullOrUndefined(limit);
  const hasOffset = !isNullOrUndefined(offset);
  const hasSortBy = !isNullOrUndefined(sortBy);
  const hasOrder = !isNullOrUndefined(order);
  const hasHelpline = !isNullOrUndefined(helpline);

  const appendLimit = hasLimit ? `limit=${limit}` : '';
  const appendOffset = hasOffset ? `offset=${offset}` : '';
  const appendSortBy = hasSortBy ? `sortBy=${sortBy}` : '';
  const appendOrder = hasOrder ? `order=${order}` : '';
  const appendHelpline = hasHelpline ? `helpline=${helpline}` : '';
  return `?${[appendLimit, appendOffset, appendSortBy, appendOrder, appendHelpline].filter(e => e).join('&')}`;
}
