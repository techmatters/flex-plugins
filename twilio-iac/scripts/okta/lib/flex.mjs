// Twilio Flex SSO lookups. Uses the public, unauthenticated endpoint the Flex login page uses
// (also used by e2e-tests/okta/ssoLogin.ts and the okta-app Terraform stage).

export const FLEX_LOGIN_BASE_URL = 'https://login.flex.us1.twilio.com';

/** { connectionSid: 'JQ...', active, instanceSid, clientId } or null when the account has no Flex SSO connection. */
export async function getFlexSsoConnection(accountSid) {
  const response = await fetch(`https://services.twilio.com/v1/Flex/Authentication/Config?AccountSid=${accountSid}`);
  if (!response.ok) throw new Error(`Flex auth config lookup failed for ${accountSid} (${response.status})`);
  const config = (await response.json()).config_list?.[0];
  if (!config) return null;
  return {
    connectionSid: config.connection_name,
    active: config.active,
    instanceSid: config.instance_sid,
    clientId: config.client_id,
  };
}

export const flexCallbackUrl = (connectionSid) => `${FLEX_LOGIN_BASE_URL}/login/callback?connection=${connectionSid}`;
export const flexAudience = (connectionSid) => `urn:flex:${connectionSid}`;
