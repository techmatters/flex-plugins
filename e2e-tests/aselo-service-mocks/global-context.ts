const context = {
  HRM_BASE_URL: new URL('https://fake.hrm.url'),
  SERVERLESS_BASE_URL: new URL('https://serverless-0000-production.twil.io'),
  FORM_DEFINITIONS_BASE_URL: new URL('https://fake.form-definitions.url'),
  CACHE_PREBUILT_PLUGIN: (process.env.CACHE_PREBUILT_PLUGIN ?? 'false') === 'true',
};

export default context;
