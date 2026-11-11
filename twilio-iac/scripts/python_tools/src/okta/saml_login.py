# Captures the SAML assertion Okta sends to Flex for a test user, WITHOUT completing the Flex login
# (so no Flex worker is created or updated). Same flow as e2e-tests/okta/ssoLogin.ts, stopped before
# the SAMLResponse is posted to Twilio.
#
# The test user must not require MFA. Credentials come from OKTA_TEST_USERNAME / OKTA_TEST_PASSWORD
# and are never printed.

import base64
import hashlib
import html
import json
import os
import re
import secrets
import uuid
import xml.etree.ElementTree as ElementTree
from http.cookiejar import CookieJar
from urllib import parse, request

from .flex import get_flex_sso_connection
from .http_client import http_request
from .okta_client import ORG_URL, base64url


def _browser_opener() -> request.OpenerDirector:
    '''An opener that follows redirects and keeps cookies across them, like a browser.'''
    redirect_handler = request.HTTPRedirectHandler()
    redirect_handler.max_redirections = 15
    return request.build_opener(request.HTTPCookieProcessor(CookieJar()), redirect_handler)


def get_saml_start_url(account_sid: str) -> str:
    '''Where Flex sends the browser to start SAML for this account (an Okta /sso/saml URL).'''
    connection = get_flex_sso_connection(account_sid)
    if not connection:
        raise Exception(f'No Flex SSO connection for {account_sid}')
    code_challenge = base64url(hashlib.sha256(str(uuid.uuid4()).encode('ascii')).digest())
    nonce = secrets.token_hex(8)
    authorize_url = (
        f'https://services.twilio.com/v1/Flex/Authorize?codeChallenge={code_challenge}&nonce={nonce}'
        f'&redirectUrl={parse.quote("https://flex.twilio.com/agent-desktop", safe="")}'
        f'&ssoProfileSid={connection["connection_sid"]}'
    )
    final_url = parse.urlsplit(http_request(authorize_url, opener=_browser_opener()).url)
    query = parse.parse_qs(final_url.query)
    if 'fromURI' in query:
        saml_start = query['fromURI'][0]
    elif final_url.path.endswith('/sso/saml') and 'SAMLRequest' in query:
        saml_start = parse.urlunsplit(final_url)
    else:
        raise Exception(
            f'Flex authorize did not redirect to Okta SAML (ended at {final_url.scheme}://{final_url.netloc}{final_url.path})')
    return parse.urljoin(ORG_URL, saml_start)


def _local_name(tag: str) -> str:
    return tag.rsplit('}', 1)[-1]


def capture_saml_assertion(account_sid: str) -> dict:
    '''Logs the test user into Okta and returns { destination, attributes: { name: [values] } } from the SAML assertion.'''
    username = os.environ.get('OKTA_TEST_USERNAME')
    password = os.environ.get('OKTA_TEST_PASSWORD')
    if not username or not password:
        raise Exception('Set OKTA_TEST_USERNAME and OKTA_TEST_PASSWORD (a test account without MFA)')

    saml_start = get_saml_start_url(account_sid)

    authn = http_request(
        f'{ORG_URL}/api/v1/authn',
        method='POST',
        data=json.dumps({
            'username': username,
            'password': password,
            'options': {'warnBeforePasswordExpired': True, 'multiOptionalFactorEnroll': True},
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
    )
    authn_body = authn.json() if authn.body else {}
    if authn_body.get('status') != 'SUCCESS':
        raise Exception(
            f'Okta authentication for the test user returned {authn_body.get("status") or authn.status} '
            '(MFA or wrong credentials?)')

    response = http_request(
        f'{ORG_URL}/login/sessionCookieRedirect?checkAccountSetupComplete=true'
        f'&token={parse.quote(authn_body["sessionToken"], safe="")}&redirectUrl={parse.quote(saml_start, safe="")}',
        opener=_browser_opener(),
    )
    page = response.text()
    match = (re.search(r'name=["\']SAMLResponse["\'][^>]*value=["\']([^"\']+)["\']', page, re.IGNORECASE)
             or re.search(r'value=["\']([^"\']+)["\'][^>]*name=["\']SAMLResponse["\']', page, re.IGNORECASE))
    if not match:
        raise Exception('No SAMLResponse in the Okta response (is the test user assigned to this app?)')

    root = ElementTree.fromstring(base64.b64decode(html.unescape(match.group(1))))
    attributes = {}
    for element in root.iter():
        if _local_name(element.tag) == 'Attribute':
            attributes[element.get('Name')] = [
                ''.join(value.itertext()) for value in element if _local_name(value.tag) == 'AttributeValue']
    return {'destination': root.get('Destination'), 'attributes': attributes}
