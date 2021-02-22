/**
 * @param {{
 *  sid: string;
 *  fullName: string;
 *}[]} counselors
 * @returns {{ [sid: string]: string }} an object containing for each counselor,
 * a property with its sid, and as a value the counselor's fullName
 */
export const createCounselorsHash = counselors => {
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const hash = counselors.reduce(
    (obj, counselor) => ({
      ...obj,
      [counselor.sid]: counselor.fullName,
    }),
    {},
  );

  return hash;
};
