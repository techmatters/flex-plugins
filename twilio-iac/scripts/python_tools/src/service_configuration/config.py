from argparse import ArgumentParser
from collections import defaultdict
import os
from typing import NotRequired, TypedDict, Unpack
from ..aws import SSMClient
from ..twilio import Twilio
from .constants import AWS_ROLE_ARNS, get_aws_role_arn
from .service_configuration import ServiceConfiguration
from .remote_syncer import RemoteSyncer

ACTIONS = {
    'APPLY': 'apply',
    'PLAN': 'plan',
    'SHOW': 'show',
    'SHOW_REMOTE': 'show_remote',
    'show_flags': 'show_flags',
    'SHOW_LOCAL': 'show_local',
    'SHOW_NEW': 'show_new',
    'SHOW_DIFF': 'show_diff',
    'SYNC_PLAN': 'sync_plan',
    'SYNC_APPLY': 'sync_apply',
    'UNLOCK': 'unlock',
    'UPDATE_PROP': 'update_prop',
}


class ActionConfigsDict(TypedDict):
    argument: NotRequired[str]
    has_sync: NotRequired[bool]
    json_available: NotRequired[bool]
    skip_local_config: NotRequired[bool]
    has_version: NotRequired[bool]
    skip_lock: NotRequired[bool]


ACTION_CONFIGS: dict[str, ActionConfigsDict] = {
    ACTIONS['APPLY']: {
        'has_version': True,
    },
    ACTIONS['PLAN']: {
        'json_available': True,
    },
    ACTIONS['SHOW']: {
        'json_available': True,
    },
    ACTIONS['SHOW_REMOTE']: {
        'json_available': True,
        'skip_local_config': True,
    },
    ACTIONS['show_flags']: {
        'json_available': True,
        'skip_local_config': True,
    },
    ACTIONS['SHOW_LOCAL']: {
        'json_available': True,
    },
    ACTIONS['SHOW_NEW']: {
        'json_available': True,
    },
    ACTIONS['SHOW_DIFF']: {
        'json_available': True,
    },
    ACTIONS['SYNC_PLAN']: {
        'argument': 'syncer',
        'json_available': True,
        'has_sync': True,
        'skip_local_config': True,
    },
    ACTIONS['SYNC_APPLY']: {
        'argument': 'syncer',
        'json_available': True,
        'has_sync': True,
        'skip_local_config': True,
    },
    ACTIONS['UNLOCK']: {
        'json_available': True,
        'skip_local_config': True,
        'has_version': True,
        'skip_lock': True,
    },
    ACTIONS['UPDATE_PROP']: {},
}

ENVIRONMENTS = [
    'production',
    'staging',
    'development',
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
    '--value': {
        'required': False,
        'default': None,
        'help': 'Value to set for property',
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
    service_configs: dict[str, ServiceConfiguration]
    helplines: dict[str, dict[str, ServiceConfiguration]]
    syncers: list[RemoteSyncer]
    skip_local_config: bool
    json_available: bool
    has_version: bool
    skip_lock: bool
    sync_action: bool
    argument: str
    aws_role_arn: str


class InitServiceConfigurationArgsDict(TypedDict):
    helpline_code: str
    environment: str
    account_sid: NotRequired[str | None]
    auth_token: NotRequired[str | None]


class Config():
    _arg_parser: ArgumentParser

    def __init__(self):
        self._config: ConfigDict = {
            'helpline_code': None,
            'action': ACTIONS['SHOW'],
            'argument': 'service_config',
            'service_configs': {},
            'helplines': defaultdict(dict),
            'has_version': False,
            'skip_lock': False,
            'skip_local_config': False,
            'json_available': False,
            'sync_action': False,
            'syncers': [],
            'aws_role_arn': None
        }

        self.init_arg_parser()
        self.parse_args()
        self.validate_args()
        self.init_service_configs()
        self.init_syncers()

    def __getattr__(self, name: str):
        try:
            return self.get_value(name)
        except KeyError:
            raise AttributeError(f'No such attribute: {name}')

    def get_ssm_client(self, environment: str):
        aws_role_arn = get_aws_role_arn(environment)
        return SSMClient(aws_role_arn)

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

        self._config['sync_action'] = ACTION_CONFIGS[self.action].get(
            'has_sync') or False
        self._config['skip_local_config'] = ACTION_CONFIGS[self.action].get(
            'skip_local_config') or False
        self._config['has_version'] = ACTION_CONFIGS[self.action].get(
            'has_version') or False
        self._config['skip_lock'] = ACTION_CONFIGS[self.action].get(
            'skip_lock') or False
        self._config['argument'] = ACTION_CONFIGS[self.action].get(
            'argument') or self._config['argument']
        self._config['json_available'] = ACTION_CONFIGS[self.action].get(
            'json_available') or False

    def init_service_configs(self):
        if (self.helpline_code and self.environment) or self.account_sid:
            if (not self.json):
                print(
                    f'Initializing service configuration for '
                    f'{self.helpline_code}'
                )

            self.init_service_configs_for_helpline()
            return

        if self.environment:
            self.init_service_configs_for_environment(self.environment)
            return

        for env in ENVIRONMENTS:
            self.init_service_configs_for_environment(env)

    def add_helpline(
        self,
        helpline_code: str,
        environment: str,
        service_config: ServiceConfiguration
    ):
        helpline_code_lower = helpline_code.lower()
        self._config['helplines'][helpline_code_lower][environment] = service_config

    def init_service_config(self, **kwargs: Unpack[InitServiceConfigurationArgsDict]):
        environment = kwargs['environment']
        ssm_client = None if self.auth_token else self.get_ssm_client(environment)
        twilio_client = Twilio(ssm_client=ssm_client,  **kwargs)
        service_config = ServiceConfiguration(
            twilio_client=twilio_client,
            skip_local_config=self.skip_local_config,
            has_version=self.has_version,
            skip_lock=self.skip_lock,
        )
        self._config['service_configs'][twilio_client.account_sid] = service_config

        self.add_helpline(
            helpline_code=twilio_client.helpline_code,
            environment=twilio_client.environment,
            service_config=service_config,
        )

    def init_service_configs_for_helpline(
        self,
        environment_arg: str | None = None,
        helpline_code_arg: str | None = None,
        account_sid_arg: str | None = None,
    ):
        helpline_code = helpline_code_arg or self.helpline_code
        environment = environment_arg or self.environment
        account_sid = account_sid_arg or self.account_sid

        if not (helpline_code and environment) and not account_sid:
            raise Exception(
                'Could not find helpline code or environment. Please provide helpline code and environment')

        if not account_sid:
            account_sid, _ = self.get_ssm_client(environment).get_twilio_creds_from_ssm(
                environment, helpline_code)

        self.init_service_config(
            account_sid=account_sid,
            auth_token=self.auth_token,
            environment=environment,
            helpline_code=helpline_code,
        )

    def init_syncers(self):
        if not self.sync_action:
            return

        if self.helplines is None:
            raise Exception('No helplines found')

        for helpline_code, service_configs in self.helplines.items():
            syncer = RemoteSyncer(
                helpline_code=helpline_code,
                service_configs=service_configs,
            )
            self.syncers.append(syncer)

    def init_service_configs_for_environment(self, environment: str):
        print(f'Initializing service configurations for {environment}')
        for hl in self.get_ssm_client(environment).get_helplines_for_env(environment):
            # if helpline_code is set, only initialize service configs for that helpline across all environments
            if (self.helpline_code and hl['helpline_code'].lower() != self.helpline_code.lower()):
                continue

            print(
                f'Initializing service configuration for '
                f'{hl["helpline_code"]}')
            self.init_service_config(
                environment=environment,
                account_sid=hl['account_sid'],
                helpline_code=hl['helpline_code'].lower(),
            )

    def get_value(self, key: str):
        return self._config.get(key)

    def get_service_config(self, account_sid: str) -> ServiceConfiguration:
        return self._config['service_configs'][account_sid]

    def get_account_sids(self):
        return self._config['service_configs'].keys()

    def validate_args(self):
        self.validate_json()
        self.validate_action_requirements()

    def validate_json(self):
        if self.json and (not self.json_available):
            print(
                f'ERROR: JSON output is not available for the {self.action} action.')
            exit(1)

    def validate_action_requirements(self):
        if self.argument == 'syncer':
            self.validate_no_environment()

        self.validate_all_helplines()

    def validate_no_environment(self):
        if self.environment:
            print(
                f'ERROR: The {self.action} action does not accept an environment argument.')
            exit(1)

    def validate_all_helplines(self):
        if not (self.environment or self.helpline_code or self.account_sid):
            confirm = input(
                'No environment or helpline provided. '
                'Do you want to run this command for ALL helplines in ALL environments? (y/N): '
            )
            if confirm != 'y':
                print('Please re-run the script to try again')
                exit(1)

    def cleanup(self):
        for service_config in self.service_configs.values():
            service_config.cleanup()


config = Config()
