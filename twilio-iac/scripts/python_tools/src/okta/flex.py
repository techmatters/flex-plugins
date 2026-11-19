# Twilio Flex SSO lookups. Uses the public, unauthenticated endpoint the Flex login page uses
# (also used by e2e-tests/okta/ssoLogin.ts and the okta-app Terraform stage).

from typing import TypedDict

from .http_client import http_request

FLEX_LOGIN_BASE_URL = 'https://login.flex.us1.twilio.com'


class FlexSsoConnection(TypedDict):
    connection_sid: str
    active: bool
    instance_sid: str
    client_id: str


def get_flex_sso_connection(account_sid: str) -> FlexSsoConnection | None:
    '''The Flex SSO connection (JQ...) of an account, or None when the account has none.'''
    response = http_request(f'https://services.twilio.com/v1/Flex/Authentication/Config?AccountSid={account_sid}')
    if response.status != 200:
        raise Exception(f'Flex auth config lookup failed for {account_sid} ({response.status})')
    config_list = response.json().get('config_list') or []
    if not config_list:
        return None
    config = config_list[0]
    return {
        'connection_sid': config.get('connection_name'),
        'active': config.get('active'),
        'instance_sid': config.get('instance_sid'),
        'client_id': config.get('client_id'),
    }


def flex_callback_url(connection_sid: str) -> str:
    return f'{FLEX_LOGIN_BASE_URL}/login/callback?connection={connection_sid}'


def flex_audience(connection_sid: str) -> str:
    return f'urn:flex:{connection_sid}'
