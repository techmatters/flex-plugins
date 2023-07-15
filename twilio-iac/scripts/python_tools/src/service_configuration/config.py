from argparse import ArgumentParser
import os
from typing import NotRequired, Type, TypedDict
from ..aws import SSMClient
from ..twilio import Twilio

ACTIONS = {
    'SHOW': 'show',
    'UPDATE': 'update',
}


class ConfigDict(TypedDict):
    action: str
    helpline_code: NotRequired[str]
    environment: NotRequired[str]
    account_sid: NotRequired[str]
    auth_token: NotRequired[str]
    dry_run: NotRequired[bool]
    twilio_clients: dict[str, Type[Twilio]]


class Config():
    _ssm_client: SSMClient
    _arg_parser: ArgumentParser
    _config: ConfigDict = {
        'action': ACTIONS['SHOW'],
        'twilio_clients': {},
    }

    def __init__(self):
        self.init_arg_parser()
        self.parse_args()
        self._ssm_client = SSMClient(
            f"arn:aws:iam::712893914485:role/tf-twilio-iac-{self.get_value('environment')}")
        self.init_twilio_clients()

    def init_arg_parser(self):
        self._arg_parser = ArgumentParser()
        self._arg_parser.add_argument(
            'action', choices=ACTIONS.values(), default=ACTIONS['SHOW'])
        self._arg_parser.add_argument(
            '--account_sid', required=False, default=os.environ.get('TWILIO_ACCOUNT_SID'))
        self._arg_parser.add_argument(
            '--helpline_code', required=False, default=os.environ.get('HL'))
        self._arg_parser.add_argument(
            '--environment', required=False, default=os.environ.get('HL_ENV'))
        self._arg_parser.add_argument(
            '--dry_run', required=False, default=False)

    def parse_args(self):
        args = self._arg_parser.parse_args()
        self._config.update(vars(args))

        # we don't want to encourage anyone to pass auth_token as a command line argument
        # so we don't add it to the arg parser and instead just check the environment variable
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        if auth_token:
            self._config['auth_token'] = auth_token

    def init_twilio_clients(self):
        account_sid = self._config.get('account_sid')
        auth_token = self._config.get('auth_token')
        helpline_code = self._config.get('helpline_code')
        environment = self._config.get('environment')

        if (account_sid or auth_token) and environment:
            client = Twilio(
                helpline_code=helpline_code,
                environment=environment,
                account_sid=account_sid,
                auth_token=auth_token
            )
            self._config['twilio_clients'][client.account_sid] = client
            return

        if environment:
            for hl in self._ssm_client.get_helplines_for_env(environment):
                client = Twilio(
                    environment=environment,
                    account_sid=hl['account_sid']
                )
                self._config['twilio_clients'][client.account_sid] = client

            return

        raise Exception(
            "Invalid configuration. Please provide account_sid and auth_token or environment")

    def get_value(self, key: str):
        return self._config.get(key)

    def get_twilio_client(self, account_sid: str):
        return self._config['twilio_clients'][account_sid]


config = Config()
