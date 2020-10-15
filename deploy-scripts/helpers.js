/**
 * Given fromIds and toIds files with accounts information, and a string, will replace each incidence of the values
 * present in fromIds in the string, for the analogus ones in toIds.
 * @param {{ [key: string]: string }} fromIds Key-value pairs of the account to copy from (account info, services, workspaces, etc)
 * @param {{ [key: string]: string }} toIds Key-value pairs of the account to copy to (account info, services, workspaces, etc)
 * @param {string} string The string to replace each incidence of the values in fromIds for it's analogus in toIds
 *
 * @example
 * const fromIds = { k1: 'from value' };
 * const toIds = { k1: 'to value' };
 * const s = 'This is a string with > from values <';
 * const result = replaceIncidence(fromIds, toIds, s);
 * console.log(result); // 'This is a string with > to values <'
 */
const replaceIncidence = (fromIds, toIds, string) => {
  const from = Object.keys(fromIds);

  const result = from.reduce((prev, key) => prev.replace(fromIds[key], toIds[key]), string);

  return result;
};

module.exports = {
  replaceIncidence,
};
