from argparse import ArgumentParser
import os
from typing import NotRequired, TypedDict
from typing_extensions import Unpack
from ..aws import SSMClient
from ..twilio import Twilio
from .service_configuration import ServiceConfiguration


ACTIONS = {
    'APPLY': 'apply',
    'PLAN': 'plan',
    'SHOW': 'show',
    'SHOW_REMOTE': 'show_remote',
    'SHOW_LOCAL': 'show_local',
    'SHOW_NEW': 'show_new',
    'SHOW_DIFF': 'show_diff',
    'SYNC_PLAN': 'sync_plan',
    'SYNC_APPLY': 'sync_apply',
}

#  actions that support json output
JSON_ACTIONS = [
    ACTIONS['SHOW_REMOTE'],
    ACTIONS['SHOW_LOCAL'],
    ACTIONS['SHOW_NEW'],
    ACTIONS['PLAN']
]

# actions that act on all environments
ALL_ENV_ACTIONS = [
    ACTIONS['SYNC_PLAN'],
    ACTIONS['SYNC_APPLY'],
]

ENVIRONMENTS = [
    'development',
    'staging',
    'production',
]

ARGS = {
    'action': {
        'choices': ACTIONS.values(),
        'nargs': '?',
        'default': ACTIONS['SHOW'],
        'help': 'Action to take',
    },
    '--account_sid': {
        'required': False,
        'default': os.environ.get('TWILIO_ACCOUNT_SID'),
        'help': 'Twilio account SID',
    },
    '--helpline_code': {
        'required': False,
        'default': os.environ.get('HL'),
        'help': 'Helpline short code. Examples: as, e2e, th, etc',
        'type': lambda s: s.lower(),
    },
    '--environment': {
        'choices': ENVIRONMENTS,
        'required': False,
        'default': os.environ.get('HL_ENV'),
        'help': 'Helpline Environment',
    },
    '--prop': {
        'required': False,
        'default': None,
        'help': 'Property to update. Example: attributes.hrm_api_version',
    },
    '--dry_run': {
        'required': False,
        'default': False,
        'help': 'Enable dry run',
    },
    '--json': {
        'required': False,
        'action': 'store_true',
        'default': False,
        'help': 'Enable json only output',
    },
}



class ConfigDict(TypedDict):
    # WARNING: ConfigDict is used in the magic __getattr__ method, so keys
    # must not bet the same as any methods or attributes of the Config class
    action: str
    prop: NotRequired[str]
    helpline_code: str | None
    environment: NotRequired[str]
    account_sid: NotRequired[str]
    auth_token: NotRequired[str]
    dry_run: NotRequired[bool]
    service_configurations: dict[str, ServiceConfiguration]


class InitServiceConfigurationArgsDict(TypedDict):
    helpline_code: str
    environment: str
    account_sid: NotRequired[str | None]
    auth_token: NotRequired[str | None]


class Config():
    ssm_client: SSMClient
    _arg_parser: ArgumentParser
    _config: ConfigDict = {
        'helpline_code': None,
        'action': ACTIONS['SHOW'],
        'service_configurations': {},
    }

    def __init__(self):
        self.init_arg_parser()
        self.parse_args()
        self.validate_args()
        self.ssm_client = SSMClient(
            f'arn:aws:iam::712893914485:role/tf-twilio-iac-{self.environment}')
        self.init_service_configurations()

    def __getattr__(self, name: str):
        try:
            return self.get_value(name)
        except KeyError:
            raise AttributeError(f'No such attribute: {name}')

    def init_arg_parser(self) -> None:
        self._arg_parser = ArgumentParser()
        for arg, options in ARGS.items():
            self._arg_parser.add_argument(arg, **options)

    def parse_args(self):
        args = self._arg_parser.parse_args()
        self._config.update(vars(args))

        # we don't want to encourage anyone to pass auth_token as a command
        # line argument so we don't add it to the arg parser and instead just
        # check the environment variable
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        if auth_token:
            self._config['auth_token'] = auth_token

    def init_service_configurations(self):
        if (self.helpline_code or self.account_sid) and self.environment:
            if (not self.json):
                print(
                    f'Initializing service configuration for '
                    f'{self.helpline_code}'
                )

            self.init_service_configurations_for_helpline()
            return

        if self.environment:
            self.init_service_configurations_for_environment(self.environment)
            return

        if self.action not in ALL_ENV_ACTIONS:
            raise Exception('Something went wrong, you should never get here unless you are trying to sync remote state.')

        for env in ENVIRONMENTS:
            self.init_service_configurations_for_environment(env)

    def init_service_configuration(self, **kwargs: Unpack[InitServiceConfigurationArgsDict]):
        twilio_client = Twilio(ssm_client=self.ssm_client,  **kwargs)
        self._config['service_configurations'][twilio_client.account_sid] = ServiceConfiguration(
            twilio_client=twilio_client, ssm_client=self.ssm_client)

    def init_service_configurations_for_helpline(
        self,
        environment_arg: str | None = None,
        helpline_code_arg: str | None = None,
        account_sid_arg: str | None = None,
    ):
        helpline_code = helpline_code_arg or self.helpline_code
        environment = environment_arg or self.environment
        account_sid = account_sid_arg or self.account_sid

        if not (helpline_code and environment):
            raise Exception(
                'Could not find helpline code or environment. Please provide helpline code and environment')

        if not account_sid:
            account_sid, _ = self.ssm_client.get_twilio_creds_from_ssm(
                environment, helpline_code)

        self.init_service_configuration(
            account_sid=account_sid,
            auth_token=self.auth_token,
            environment=environment,
            helpline_code=helpline_code,
        )

    def init_service_configurations_for_environment(self, environment: str):
        print(f'Initializing service configurations for {environment}')
        for hl in self.ssm_client.get_helplines_for_env(environment):
            print(
                f'Initializing service configuration for '
                f'{hl["helpline_code"]}')
            self.init_service_configuration(
                environment=environment,
                account_sid=hl['account_sid'],
                helpline_code=hl['helpline_code'],
            )

    def get_value(self, key: str):
        return self._config.get(key)

    def get_service_configuration(self, account_sid: str) -> ServiceConfiguration:
        return self._config['service_configurations'][account_sid]

    def get_account_sids(self):
        return self._config['service_configurations'].keys()

    def validate_args(self):
        self.validate_json()
        self.validate_helpline_and_environment()

    def validate_json(self):
        if self.json and (self.action not in JSON_ACTIONS):
            print('ERROR: JSON output is only available for the following ' +
                  'actions: , '.join(JSON_ACTIONS))
            exit(1)

    def validate_action_requirements(self):
        if self.action in ALL_ENV_ACTIONS:
            self.validate_no_environment()
            return

        self.validate_helpline_and_environment()

    def validate_helpline_and_environment(self):
        if not (self.environment):
            print('ERROR: Please provide an environment argument '
                  '(--environment, HL_ENV)')
            exit(1)

    def validate_no_environment(self):
        if self.environment:
            print(f'ERROR: The {self.action} action does not support the '
                  f'environment argument.')
            exit(1)


config = Config()
