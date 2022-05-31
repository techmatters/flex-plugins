import { APIRequestContext, expect, Request } from '@playwright/test';

export async function oktaSsoLogin(request: APIRequestContext, username: string, password: string, accountSid: string) {

  // Get the saml location URL
  const authenticateRequestOptions = { data: {products: ["flex"], resource: "http://localhost:3001/"}}
  console.log('Requesting:', 'POST', `https://preview.twilio.com/iam/Accounts/${accountSid}/authenticate`, authenticateRequestOptions);
  const authenticateResponse = await request.post(`https://preview.twilio.com/iam/Accounts/${accountSid}/authenticate`, authenticateRequestOptions);
  expect(authenticateResponse.ok());
  const responsePayload = await authenticateResponse.json();
  console.log('Response:', responsePayload)
  const samlLocation = responsePayload.location;

  // Login via okta API
  const authnResponse = await request.post('https://techmatters.okta.com/api/v1/authn',{
    data: { username, password, options: {warnBeforePasswordExpired: true, multiOptionalFactorEnroll: true} },
    headers: {
      accept: '*/*',
      authority: 'techmatters.okta.org'
    }

  });
  expect(authnResponse.ok()).toBe(true);
  const { status, sessionToken } = await authnResponse.json();
  expect(status).toBe('SUCCESS');

  console.log('Requesting:', 'GET', `https://techmatters.okta.com/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=${sessionToken}&redirectUrl=${samlLocation}`);
  // Cookie redirect
  const redirectResponse = await request.get(`https://techmatters.okta.com/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=${sessionToken}&redirectUrl=${samlLocation}`);
  //const resp = {expiresAt:"2022-05-30T19:17:29.000Z",status:"SUCCESS",sessionToken:"20111s7L4hpHCdhURAkjCSQvdVkzt73WN1ebg06WhrdiYTgOPK5gKJI",_embedded:{user:{id:"00ue24tfc0diT881J357",passwordChanged:"2022-03-29T08:24:50.000Z",profile:{login:"steveh@techmatters.org",firstName:"Steve",lastName:"Hand",locale:"en_US",timeZone:"America/Los_Angeles"}}},_links:{cancel:{href:"https://techmatters.okta.com/api/v1/authn/cancel",hints:{allow:["POST"]}}}}
  console.log(redirectResponse);
  if (!redirectResponse.ok()) {
    console.log('sessionCookieRedirect error body:', await redirectResponse.text())
  }
  expect(redirectResponse.ok()).toBe(true);
}

/*
curl 'https://techmatters.okta.com/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=20111df6OjxzUqs7mFLf_xo7sWoV96qZxr25YLXOCMoYZIucJgyZALq&redirectUrl=https%3A%2F%2Ftechmatters.okta.com%2Fapp%2Ftechmatters_e2etesting_1%2Fexkir47g9zer3zXs8357%2Fsso%2Fsaml%3FSAMLRequest%3DrVNNj9owEP0rke8hCfkiFiCl0A8kCghoVfWCHGdYrE3i1J4Au7%252B%252Bxiwthy6nnizNzJt58%252BZ5qFldtTTv8NCs4VcHGp1zXTWa2sSIdKqhkmmhacNq0BQ53eRf57Tf82mrJEouK3IHeYxgWoNCIRvizKYjslx8nC8%252Fzxa7oIB%252BnBV7N%252FRZ5kZBlrmFn3I3Sgoe7v24TP0Bcb6D0gY7IqaVaaB1B7NGI2vQhPx%252B3%252FVjNwy2QUbjiEbRT%252BKslDyKEtTCMBmR7UlUQhJnarYUDUPb64DYaup5CPxQM0QzoyefkfW4rD3WtveJHfQBLfhpF3hwfhYqSp%252ByV1Dh6w89COPU01p6Fx3sbKvOB9GUBvBYmOJapOmX7XblrpabLXHym1gT2eiuBrUBdRQcvq3nf2kLVvfQ7mUJHwMv51x2DWovnyQsictoXxQ8DQNIIgh4FkE28JMkjXlYWKZ9Mh5eXmoFVeP%252F2NmrAVnJkA29%252BwnDq%252BkuR5lNV7IS%252FMX5JJUR%252BX2Rgl5gI6J097aUQs1ElZelAq2NWFUlTxMFDM2hUXVAHO826M3YUFqbGzURzuhMZN0yJfTFBHBmHG863FdNKmPZNezHD13NKb%252FUmfDKPCepyreF%252F9nqmnuH1p%252Fs%252FZcc%252FwY%253D%26RelayState%3DAAAAAS5GQVNfUzNfS01TX3YxOjo6VUwn6PI2J6J6slzF2x%252F3xsYiCgVPCUX%252BDrlPrftGs73YWIJA8yQLtcuhPvsP03ZH%252FotBQzjiX1r0y03P5if%252BJDxbux9IXPwfEjzKgGuyg1YacqANmA%253D%253D' \
  -H 'authority: techmatters.okta.com' \
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,;q=0.8,application/signed-exchange;v=b3;q=0.9' \
  -H 'accept-language: en-GB,en;q=0.9' \
  -H 'cookie: t=default; DT=DI03O3NWY2QRUOcAOpgJWchyQ; JSESSIONID=28E0699B7F7948355CCFB21C97F2B749' \
  -H 'referer: https://techmatters.okta.com/login/login.htm?fromURI=%2Fapp%2Ftechmatters_e2etesting_1%2Fexkir47g9zer3zXs8357%2Fsso%2Fsaml%3FSAMLRequest%3DrVNNj9owEP0rke8hCfkiFiCl0A8kCghoVfWCHGdYrE3i1J4Au7%252B%252Bxiwthy6nnizNzJt58%252BZ5qFldtTTv8NCs4VcHGp1zXTWa2sSIdKqhkmmhacNq0BQ53eRf57Tf82mrJEouK3IHeYxgWoNCIRvizKYjslx8nC8%252Fzxa7oIB%252BnBV7N%252FRZ5kZBlrmFn3I3Sgoe7v24TP0Bcb6D0gY7IqaVaaB1B7NGI2vQhPx%252B3%252FVjNwy2QUbjiEbRT%252BKslDyKEtTCMBmR7UlUQhJnarYUDUPb64DYaup5CPxQM0QzoyefkfW4rD3WtveJHfQBLfhpF3hwfhYqSp%252ByV1Dh6w89COPU01p6Fx3sbKvOB9GUBvBYmOJapOmX7XblrpabLXHym1gT2eiuBrUBdRQcvq3nf2kLVvfQ7mUJHwMv51x2DWovnyQsictoXxQ8DQNIIgh4FkE28JMkjXlYWKZ9Mh5eXmoFVeP%252F2NmrAVnJkA29%252BwnDq%252BkuR5lNV7IS%252FMX5JJUR%252BX2Rgl5gI6J097aUQs1ElZelAq2NWFUlTxMFDM2hUXVAHO826M3YUFqbGzURzuhMZN0yJfTFBHBmHG863FdNKmPZNezHD13NKb%252FUmfDKPCepyreF%252F9nqmnuH1p%252Fs%252FZcc%252FwY%253D%26RelayState%3DAAAAAS5GQVNfUzNfS01TX3YxOjo6VUwn6PI2J6J6slzF2x%252F3xsYiCgVPCUX%252BDrlPrftGs73YWIJA8yQLtcuhPvsP03ZH%252FotBQzjiX1r0y03P5if%252BJDxbux9IXPwfEjzKgGuyg1YacqANmA%253D%253D' \
  -H 'sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="101", "Microsoft Edge";v="101"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: document' \
  -H 'sec-fetch-mode: navigate' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-fetch-user: ?1' \
  -H 'upgrade-insecure-requests: 1' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36 Edg/101.0.1210.53' \
  --compressed
 */