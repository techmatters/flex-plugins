import base64
import json
from urllib import request
from twilio.rest import Client
from typing import TypedDict, NotRequired
from typing_extensions import Unpack

from ..aws import SSMClient


FLEX_CONFIGURATION_ENDPOINT = 'https://flex-api.twilio.com/v1/Configuration'


class InitArgsDict(TypedDict):
    helpline_code: NotRequired[str]
    environment: NotRequired[str]
    account_sid: NotRequired[str]
    auth_token: NotRequired[str]


class Twilio():
    client: Client
    account_sid: str
    _auth_token: str
    _ssm_client: SSMClient

    def __init__(self, **kwargs: Unpack[InitArgsDict]):
        self._ssm_client = SSMClient(
            f"arn:aws:iam::712893914485:role/tf-twilio-iac-{kwargs.get('environment')}")
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
                "Could not find Twilio credentials. Please provide account_sid and auth_token")

        self.account_sid = account_sid
        self._auth_token = auth_token
        return Client(account_sid, auth_token)

    def get_flex_configuration_headers(self) -> dict[str, str | dict[str, str]]:
        credentials = base64.b64encode(
            f"{self.account_sid}:{self._auth_token}".encode('utf-8')).decode('utf-8')
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
                    f"Request failed with status {response.status}")

            body = response.read()
            data = json.loads(body)

        return data

    def update_flex_configuration(self, configuration):
        req = request.Request(
            FLEX_CONFIGURATION_ENDPOINT,
            data=configuration,
            headers=self.get_flex_configuration_headers(),
            method='POST'
        )

        with request.urlopen(req) as response:
            if response.status != 200:
                raise Exception(
                    f"Request failed with status {response.status}")

            body = response.read()
            data = json.loads(body)

        return data
