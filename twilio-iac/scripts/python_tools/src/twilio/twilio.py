from twilio.rest import Client
from typing import TypedDict, NotRequired
from typing_extensions import Unpack

from ..aws import SSMClient


class InitArgsDict(TypedDict):
    helpline_code: NotRequired[str]
    environment: NotRequired[str]
    account_sid: NotRequired[str]
    auth_token: NotRequired[str]


class Twilio():
    client: Client
    account_sid: str
    _ssm_client: SSMClient

    def __init__(self, **kwargs: Unpack[InitArgsDict]):
        self._ssm_client = SSMClient(
            f"arn:aws:iam::712893914485:role/tf-twilio-iac-{kwargs.get('environment')}")
        self.client = self.getClient(**kwargs)
        self.account_sid = self.client.account_sid

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

        return Client(account_sid, auth_token)
