import { APIRequestContext, expect, Request } from '@playwright/test';

export async function oktaSsoLogin(request: APIRequestContext, accountSid: string, username: string, password: string) {
  // Get the saml location URL
  const authenticateResponse = await request.post(`https://preview.twilio.com/iam/Accounts/${accountSid}/authenticate`, { data: {products: ["flex"], resource: "http://localhost:3001/"}});
  expect(authenticateResponse.ok());
  const samlLocation = (await authenticateResponse.json()).location;

  // Login via okta API
  const authnResponse = await request.post('https://techmatters.okta.com/api/v1/authn',{data: { username, password, options: {warnBeforePasswordExpired: true, multiOptionalFactorEnroll: true} } });
  expect(authnResponse.ok());
  const { status, sessionToken } = await authnResponse.json();
  expect(status).toBe('SUCCESS');

  // Cookie redirect
  const redirectResponse = await request.get(`https://techmatters.okta.com/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=${sessionToken}&redirectUrl=${samlLocation}`);
  //const resp = {expiresAt:"2022-05-30T19:17:29.000Z",status:"SUCCESS",sessionToken:"20111s7L4hpHCdhURAkjCSQvdVkzt73WN1ebg06WhrdiYTgOPK5gKJI",_embedded:{user:{id:"00ue24tfc0diT881J357",passwordChanged:"2022-03-29T08:24:50.000Z",profile:{login:"steveh@techmatters.org",firstName:"Steve",lastName:"Hand",locale:"en_US",timeZone:"America/Los_Angeles"}}},_links:{cancel:{href:"https://techmatters.okta.com/api/v1/authn/cancel",hints:{allow:["POST"]}}}}
}

