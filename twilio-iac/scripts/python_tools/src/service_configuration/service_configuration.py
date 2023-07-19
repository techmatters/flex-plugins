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

SSM_FIELDS = {
    "attributes.serverless_base_url": "/{environment}/serverless/{account_sid}/base_url",
}

TEMPLATE_FIELDS = {
    "attributes.assets_bucket_url": "https://assets-{environment}.tl.techmatters.org",
    "attributes.hrm_base_url": "https://hrm-{environment}.tl.techmatters.org",
    "account_sid": "{account_sid}",
}


def set_nested_key(data: dict, keys: List[str], value: object):
    if len(keys) > 1:
        key = keys.pop(0)
        if key not in data:
            data[key] = {}

        set_nested_key(data[key], keys, value)
    else:
        data[keys[0]] = value

class InitArgsDict(TypedDict):
    twilio_client: Twilio
    ssm_client: SSMClient

class ServiceConfiguration():
    _ssm_client: SSMClient
    _twilio_client: Twilio
    remote_state: dict
    local_state: dict = {}
    new_state: dict = {}
    plan: DeepDiff
    account_sid: str
    helpline_code: str
    environment: str

    def __init__(self, **kwargs: Unpack[InitArgsDict]) -> None:
        self._twilio_client = kwargs['twilio_client']
        self._ssm_client = kwargs['ssm_client']
        self.account_sid = self._twilio_client.account_sid
        self.helpline_code = self._twilio_client.helpline_code
        self.environment = self._twilio_client.environment
        self.remote_state = self._twilio_client.get_flex_configuration()
        self.init_local_state()
        self.init_new_state()
        self.init_plan()

    def init_local_state(self):
        paths: list[str] = [
            f"{JSON_PATH_ROOT}/{JSON_CONFIG_PATH_PARTIAL}/defaults.json",
            f"{JSON_PATH_ROOT}/{self.helpline_code.lower()}/{JSON_CONFIG_PATH_PARTIAL}/common.json",
            f"{JSON_PATH_ROOT}/{self.helpline_code.lower()}/{JSON_CONFIG_PATH_PARTIAL}/{self.environment}.json"
        ]

        for path in paths:
            if not path_exists(path):
                print(f"Could not load {path}... skipping")
                continue

            with open(path, 'r') as f:
                self.local_state = always_merger.merge(
                    self.local_state,
                    json.load(f)
                )

        self.init_template_fields()
        self.init_ssm_fields()

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
            keys = key.split('.')
            set_nested_key(self.local_state, keys, templated_value)

    def init_ssm_fields(self):
        for key, value in SSM_FIELDS.items():
            ssm_key_name: str = value.format(
                environment=self.environment,
                account_sid=self.account_sid,
                helpline_code=self.helpline_code
            )
            ssm_value = self._ssm_client.get_parameter(ssm_key_name)
            keys = key.split('.')
            set_nested_key(self.local_state, keys, ssm_value)

    def init_plan(self):
        self.plan = DeepDiff(
            self.remote_state,
            self.new_state,
            ignore_order=True,
            view="tree",
        )

    def init_local_json(self):
        pass