import json
from copy import deepcopy
from deepdiff import DeepDiff
from deepmerge import always_merger
from os.path import exists as path_exists
from typing import List, TypedDict
from typing_extensions import Unpack
from ..aws import SSMClient
from ..twilio import Twilio

JSON_PATH_ROOT = "/app/twilio-iac/helplines"
JSON_CONFIG_PATH_PARTIAL = "configs/service-configuration"
JSON_CONFIGS = [
    {
        "key": "defaults",
        "path_tpl": f"{JSON_PATH_ROOT}/{JSON_CONFIG_PATH_PARTIAL}/defaults.json",
    },
    {
        "key": "common",
        "path_tpl": f"{JSON_PATH_ROOT}/{{helpline_code}}/{JSON_CONFIG_PATH_PARTIAL}/common.json",
    },
    {
        "key": "environment",
        "path_tpl": f"{JSON_PATH_ROOT}/{{helpline_code}}/{JSON_CONFIG_PATH_PARTIAL}/{{environment}}.json",
    },
]

SSM_FIELDS = {
    "attributes.serverless_base_url": "/{environment}/serverless/{account_sid}/base_url",
}

TEMPLATE_FIELDS = {
    "attributes.assets_bucket_url": "https://assets-{environment}.tl.techmatters.org",
    # TODO: this needs to deal with region
    "attributes.hrm_base_url": "https://hrm-{environment}.tl.techmatters.org",
    "account_sid": "{account_sid}",
}


def set_nested_key(data, key, value):
    """Set a nested key in a dict"""

    path = key.split('.')

    current = data
    for path_key in path[:-1]:
        if path_key not in current:
            current[path_key] = {}
        current = current[path_key]

    current[path[-1]] = value


def get_nested_key(data, key):
    """Get a nested key in a dict"""

    path = key.split('.')
    current = data

    for path_key in path:
        if path_key not in current:
            return None
        current = current[path_key]

    return current


def delete_nested_key(data, key):
    """Delete a nested key in a dict"""

    path = key.split('.')
    if len(path) == 1:
        # base case: remove the key from the dictionary and check if it's empty
        del data[path[0]]
        return not bool(data)
    else:
        # recursive case: go one level deeper
        sub_key = '.'.join(path[1:])
        if path[0] in data and delete_nested_key(data[path[0]], sub_key):
            # if the sub-dictionary is empty after the deletion, remove it
            del data[path[0]]
        return not bool(data)


def get_dot_notation_path(change) -> str:
    return change.path().replace("root[", "").replace("][", ".").replace("]", "").replace("'", "")


class InitArgsDict(TypedDict):
    twilio_client: Twilio
    ssm_client: SSMClient
    skip_local_config: bool


class LocalConfigsItemDict(TypedDict):
    path: str
    data: dict[str, object]


class LocalConfigsDict(TypedDict):
    defaults: LocalConfigsItemDict
    common: LocalConfigsItemDict
    environment: LocalConfigsItemDict


class ServiceConfiguration():

    def __init__(self, **kwargs: Unpack[InitArgsDict]) -> None:
        self.local_state: dict[str, object] = {}
        self.new_state: dict[str, object] = {}
        self.local_configs: dict[str, object] = {}

        self._twilio_client = kwargs['twilio_client']
        self._ssm_client = kwargs['ssm_client']
        self.skip_local_config = kwargs['skip_local_config']
        self.account_sid = self._twilio_client.account_sid
        self.helpline_code = self._twilio_client.helpline_code
        self.environment = self._twilio_client.environment
        self.remote_state: dict[str, object] = self._twilio_client.get_flex_configuration()
        self.init_local_state()
        self.init_new_state()
        self.init_plan()

    def init_local_state(self):
        self.init_template_fields()
        self.init_ssm_fields()

        for conf in JSON_CONFIGS:
            key = conf['key']
            path = conf['path_tpl'].format(
                environment=self.environment,
                helpline_code=self.helpline_code.lower()
            )
            self.local_configs[key] = {
                'path': path,
                'data': {}
            }

            if not path_exists(path):
                print(f"Could not load {path}... skipping")
                continue

            # we don't want to load helpline local configs for migration
            if self.skip_local_config and key != 'defaults':
                continue

            with open(path, 'r') as f:
                self.local_configs[key]['data'] = json.load(f)
                self.local_state = always_merger.merge(
                    deepcopy(self.local_state),
                    self.local_configs[key]['data'],
                )

    def init_new_state(self):
        self.new_state = always_merger.merge(
            # deepcopy to avoid modifying remote_state even though the docs
            # say the function is non-destructive, it is
            deepcopy(self.remote_state),
            self.local_state,
        )

    def init_template_fields(self):
        for key, value in TEMPLATE_FIELDS.items():
            templated_value = value.format(
                environment=self.environment,
                account_sid=self.account_sid,
                helpline_code=self.helpline_code
            )
            set_nested_key(self.local_state, key, templated_value)

    def init_ssm_fields(self):
        for key, value in SSM_FIELDS.items():
            ssm_key_name: str = value.format(
                environment=self.environment,
                account_sid=self.account_sid,
                helpline_code=self.helpline_code
            )
            ssm_value = self._ssm_client.get_parameter(ssm_key_name)
            set_nested_key(self.local_state, key, ssm_value)

    def init_plan(self):
        self.plan = DeepDiff(
            self.remote_state,
            self.new_state,
            ignore_order=True,
            view="tree",
        )

    def get_config_path(self, type: str) -> str:
        return self.local_configs[type].get('path')
