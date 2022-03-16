const zmRules = require('./zm.json');

// TODO: do this once, on initialization, then consume from the global state.
export const fetchRules = (permissionConfig: string) => {
  try {
    // eslint-disable-next-line global-require
    const rules = require(`./${permissionConfig}.json`);

    if (!rules) throw new Error(`Cannot find rules for ${permissionConfig}`);

    return rules;
  } catch (err) {
    const errorMessage = err.message ?? err;
    console.error('Error fetching rules, using fallback rules. ', errorMessage);

    return zmRules;
  }
};
