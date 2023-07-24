import base64
import json
from urllib import request
from twilio.rest import Client
from typing import TypedDict, NotRequired, Unpack

from ..aws import SSMClient


FLEX_CONFIGURATION_ENDPOINT = 'https://flex-api.twilio.com/v1/Configuration'


class InitArgsDict(TypedDict):
    helpline_code: str
    environment: str
    account_sid: NotRequired[str | None]
    auth_token: NotRequired[str | None]
    ssm_client: NotRequired[SSMClient | None]


class Twilio():
    client: Client
    account_sid: str
    helpline_code: str
    environment: str
    _auth_token: str
    _ssm_client: SSMClient

    def __init__(self, **kwargs: Unpack[InitArgsDict]):
        self._ssm_client = kwargs.get('ssm_client') or SSMClient()
        self.client = self.getClient(**kwargs)

    def getClient(self, **kwargs: Unpack[InitArgsDict]):
        account_sid = kwargs.get('account_sid')
        auth_token = kwargs.get('auth_token')
        helpline_code = kwargs.get('helpline_code')
        environment = kwargs.get('environment')

        if (not auth_token) and (helpline_code or account_sid) and environment:
            account_sid, auth_token = self._ssm_client.get_twilio_creds_from_ssm(
                environment,
                helpline_code,
                account_sid
            )

        if not (account_sid and auth_token):
            raise Exception(
                'Could not find Twilio credentials. Please provide account_sid and auth_token')

        self.helpline_code = helpline_code
        self.environment = environment
        self.account_sid = account_sid
        self._auth_token = auth_token

        return Client(account_sid, auth_token)

    def get_flex_configuration_headers(self) -> dict[str, str | dict[str, str]]:
        credentials = base64.b64encode(
            f'{self.account_sid}:{self._auth_token}'.encode('utf-8')).decode('utf-8')
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {credentials}'
        }

    def get_flex_configuration(self):
        req = request.Request(
            FLEX_CONFIGURATION_ENDPOINT,
            headers=self.get_flex_configuration_headers()
        )

        with request.urlopen(req) as response:
            if response.status != 200:
                raise Exception(
                    f'Request failed with status {response.status}')

            body = response.read()
            data = json.loads(body)

        return data

    def update_flex_configuration(self, configuration: dict[str, object]):
        req = request.Request(
            FLEX_CONFIGURATION_ENDPOINT,
            data=configuration,
            headers=self.get_flex_configuration_headers(),
            method='POST'
        )

        with request.urlopen(req) as response:
            if response.status != 200:
                raise Exception(
                    f'Request failed with status {response.status}')

            body = response.read()
            data = json.loads(body)

        return data
