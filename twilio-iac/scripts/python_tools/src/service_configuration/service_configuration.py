import json
import re
from copy import deepcopy
from deepdiff import DeepDiff
from deepmerge import always_merger
from os.path import exists as path_exists
from typing import TypedDict, Unpack
from ..aws import SSMClient
from ..twilio import Twilio
from .constants import AWS_ROLE_ARNS, get_aws_role_arn
from .version import Version

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

# Placeholders that can be used anywhere (keys or values) in the service
# configuration JSON files, e.g. "${task_queues.en_std}" or "${workflow_sids.master}".
# Same names as the studio flow / workflow .tftpl interpolations. The SID maps
# are written to SSM by the configure stage (terraform-modules/stages/configure).
SID_PLACEHOLDER_SSM_KEYS = {
    "task_queues": "/{environment}/twilio/{account_sid}/task_queue_sids",
    "workflow_sids": "/{environment}/twilio/{account_sid}/workflow_sids",
}
SID_PLACEHOLDER_PATTERN = re.compile(
    r"\$\{(" + "|".join(SID_PLACEHOLDER_SSM_KEYS.keys()) + r")\.([A-Za-z0-9_]+)\}"
)

TEMPLATE_FIELDS = {
    "attributes.assets_bucket_url": "https://assets-{environment}.tl.techmatters.org",
    "attributes.hrm_base_url": "https://hrm-{environment}{region_url_postfix}.tl.techmatters.org",
    "attributes.environment": "{environment}",
    "attributes.helpline_code": "{helpline_code}",
    "attributes.aws_region": "{region}",
}

# These are fields that will be excluded from the payload sent to twilio
EXCLUDED_FIELDS = [
    "flex_instance_sid",
    "flex_service_instance_sid",
    "runtime_domain",
    "flex_insights_hr",
    "taskrouter_workspace_sid",
    "service_version",
    "taskrouter_offline_activity_sid",
    "status",
]

OVERRIDE_FIELDS = [
    'attributes',
    'ui_attributes.colorTheme',
]

# These are fields that will be kept from the remote state and added to the new state 
FORCE_KEEP_FIELDS = [
    'ui_attributes.appianApiKey',
    'ui_attributes.flexAddonKey',
]

REGION_URL_POSTFIX_MAP = {
    'us-east-1': '',
    'eu-west-1': '-eu',
    'ca-central-1': '-ca',
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
        if not isinstance(current, dict) or path_key not in current:
            return None
        current = current[path_key]

    return current


def delete_nested_key(data, key):
    """Delete a nested key in a dict if it exists"""
    path = key.split('.')
    if len(path) == 1:
        # base case: check if the key exists, then remove it
        if path[0] in data:
            del data[path[0]]
        return not bool(data)
    else:
        # recursive case: go one level deeper
        sub_key = '.'.join(path[1:])
        if path[0] in data and isinstance(data[path[0]], dict):
            if delete_nested_key(data[path[0]], sub_key):
                # if the sub-dictionary is empty after the deletion, remove it
                del data[path[0]]
        return not bool(data)


def get_dot_notation_path(change) -> str:
    return change.path().replace("root[", "").replace("][", ".").replace("]", "").replace("'", "")


def remove_empty(input_dict):
    """
    Remove keys with the value ``None`` in a dictionary, recursively.
    """
    output_dict = {}
    for k, v in input_dict.items():
        if isinstance(v, dict):
            v = remove_empty(v)
        if v is not None:
            output_dict[k] = v
    return output_dict


class InitArgsDict(TypedDict):
    twilio_client: Twilio
    skip_local_config: bool
    has_version: bool
    skip_lock: bool


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
        self.template_config: dict[str, object] = {}

        self._twilio_client = kwargs['twilio_client']
        self.skip_local_config = kwargs['skip_local_config']
        self.has_version = kwargs['has_version']
        self.skip_lock = kwargs['skip_lock']
        self.account_sid = self._twilio_client.account_sid
        self.helpline_code = self._twilio_client.helpline_code
        self.environment = self._twilio_client.environment
        self.aws_role_arn = get_aws_role_arn(self.environment)
        self.remote_state: dict[str, object] = self._twilio_client.get_flex_configuration()
        self.feature_flags = get_nested_key(self.remote_state, "attributes.feature_flags")
        self.init_version()
        self.init_region()
        self.init_local_state()
        self.init_new_state()
        self.init_plan()

    def get_ssm_client(self):
        return SSMClient(self.aws_role_arn)

    def init_region(self):
        try:
            self.region = self.get_ssm_client().get_parameter(
                f"/{self.environment}/aws/{self.account_sid}/region"
            )
        except Exception:
            # TODO: remove this once all helplines have the region parameter
            self.region = 'us-east-1'

    def init_local_state(self):
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

            self.local_state = remove_empty(self.local_state)

        # Only resolved in the merged state - local_configs keep the raw
        # placeholders because update_prop writes them back to disk
        self.local_state = self.resolve_sid_placeholders(self.local_state)

    def resolve_sid_placeholders(self, data):
        """
        Replace ${task_queues.<key>} / ${workflow_sids.<key>} placeholders
        (in keys or values) with the SIDs Terraform created for this account.
        The SID maps are only read from SSM if a placeholder is present.
        """
        sid_maps: dict[str, dict[str, str]] = {}

        def lookup(match):
            map_name, map_key = match.group(1), match.group(2)
            if map_name not in sid_maps:
                ssm_key_name = SID_PLACEHOLDER_SSM_KEYS[map_name].format(
                    environment=self.environment,
                    account_sid=self.account_sid,
                )
                try:
                    sid_maps[map_name] = json.loads(
                        self.get_ssm_client().get_parameter(ssm_key_name)
                    )
                except Exception as e:
                    raise Exception(
                        f"Could not load {ssm_key_name} to resolve {match.group(0)}. "
                        "Has the configure stage been applied for this helpline?"
                    ) from e

            sid = sid_maps[map_name].get(map_key)
            if not sid:
                raise Exception(
                    f"Could not resolve {match.group(0)}: '{map_key}' not found in {map_name}. "
                    f"Available keys: {sorted(sid_maps[map_name].keys())}"
                )
            return sid

        def resolve(value):
            if isinstance(value, dict):
                return {resolve(k): resolve(v) for k, v in value.items()}
            if isinstance(value, list):
                return [resolve(v) for v in value]
            if isinstance(value, str):
                return SID_PLACEHOLDER_PATTERN.sub(lookup, value)
            return value

        return resolve(data)

    def init_new_state(self):
        self.new_state = always_merger.merge(
            # deepcopy to avoid modifying remote_state even though the docs
            # say the function is non-destructive, it is
            deepcopy(self.remote_state),
            self.local_state,
        )

        # override fields in the new state with the local state
        for field in OVERRIDE_FIELDS:
            local_value = get_nested_key(self.local_state, field)
            if local_value:
                set_nested_key(self.new_state, field, local_value)

        self.init_ssm_fields()
        self.init_template_fields()
        # override fields in the new state with the remote state
        for field in FORCE_KEEP_FIELDS:
            remote_value = get_nested_key(self.remote_state, field)
            if remote_value:
                set_nested_key(self.new_state, field, remote_value)
        
        for key, value in self.template_config.items():
            local_value = get_nested_key(self.local_state, key)
            # We want to allow the user to override the template value with a
            # local value.
            if local_value:
                continue

            set_nested_key(self.new_state, key, value)

    def init_template_fields(self):
        for key, value in TEMPLATE_FIELDS.items():
            templated_value = value.format(
                environment=self.environment,
                account_sid=self.account_sid,
                helpline_code=self.helpline_code,
                region=self.region,
                region_url_postfix=REGION_URL_POSTFIX_MAP[self.region],
            )
            self.template_config[key] = templated_value

    def init_ssm_fields(self):
        for key, value in SSM_FIELDS.items():
            ssm_key_name: str = value.format(
                environment=self.environment,
                account_sid=self.account_sid,
                helpline_code=self.helpline_code
            )
            ssm_value = self.get_ssm_client().get_parameter(ssm_key_name)
            set_nested_key(self.new_state, key, ssm_value)

    def init_plan(self):
        self.plan = DeepDiff(
            self.remote_state,
            self.new_state,
            ignore_order=True,
            view="tree",
        )

    def init_version(self):
        if not self.has_version:
            self.version = None
            return

        self.version = Version(
            environment=self.environment,
            helpline_code=self.helpline_code,
            state=self.remote_state,
            skip_lock=self.skip_lock,
            aws_role_arn=self.aws_role_arn
        )

    def get_config_path(self, type: str) -> str:
        return self.local_configs[type].get('path')

    def apply(self):
        if not self.version:
            raise Exception(
                'Cannot apply changes without a version. Something went wrong.')

        new_state = deepcopy(self.new_state)
        # remove excluded fields from the new state, we ned to keep them in the
        # self.new_state for the changelog
        for field in EXCLUDED_FIELDS:
            delete_nested_key(new_state, field)

        self._twilio_client.update_flex_configuration(new_state)

        # add a new version for the new state
        Version(
            environment=self.environment,
            helpline_code=self.helpline_code,
            state=self.new_state,
            skip_lock=True,
            aws_role_arn=self.aws_role_arn
        )

    def cleanup(self):
        if self.version:
            self.version.unlock()
