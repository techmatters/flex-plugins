import json
from collections import defaultdict
from copy import deepcopy
from deepdiff import DeepDiff
from typing import TypedDict, Dict, Any, Unpack

from .config import ENVIRONMENTS
from .service_configuration import ServiceConfiguration, delete_nested_key, get_dot_notation_path, get_nested_key, set_nested_key

def get_dup_value_keys(d):
  value_keys = {}

  for key, value in d.items():
    if value not in value_keys:
        value_keys[value] = [key]
    else:
        value_keys[value].append(key)

  results = []
  for value, keys in value_keys.items():
    if len(keys) > 1:
        results.append({'keys': keys, 'value': value})

  return results


class InitArgsDict(TypedDict):
    helpline_code: str
    service_configs: dict[str, ServiceConfiguration]


class RemoteSyncer():
    helpline_code: str
    _service_configs: dict[str, ServiceConfiguration]
    _diffs: dict[str, DeepDiff] = {}
    configs: dict[str, object] = {}
    default_config: dict[str, object]

    def __init__(self, **kwargs: Unpack[InitArgsDict]) -> None:
        self.helpline_code = kwargs['helpline_code']
        self._service_configs = kwargs['service_configs']
        self.init_configs()

    def init_configs(self):
        common_keys = defaultdict(set)
        common_data = {}
        environments = {}
        previous_envs = set()
        environments_duplicates = {}

        for env in self._service_configs.keys():
            env_data = {}
            environments[env] = env_data

            if env not in self._service_configs:
                continue

            for change_type, changes in self._service_configs[env].plan.items():
                if change_type == 'dictionary_item_added':
                    continue

                for change in changes:
                    path = get_dot_notation_path(change)
                    value = change.t1

                    if len(previous_envs) == 0:
                        common_keys[path]
                        set_nested_key(common_data, path, value)
                        continue

                    if path not in common_keys:
                        set_nested_key(env_data, path, value)
                        if (path not in environments_duplicates):
                            environments_duplicates[path] = {}
                        environments_duplicates[path][env] = value
                        continue

                    common_value = get_nested_key(common_data, path)

                    if value == common_value:
                        continue
                    else:
                        for prev_env in previous_envs:
                            set_nested_key(environments[prev_env], path, common_value)
                            delete_nested_key(common_data, path)
                            if (path not in environments_duplicates):
                                environments_duplicates[path] = {}
                            environments_duplicates[path][env] = value
                            set_nested_key(env_data, path, value)

            previous_envs.add(env)

        for path, envs in environments_duplicates.items():
            duplicates = get_dup_value_keys(envs)
            for duplicate in duplicates:
                for key in duplicate['keys']:
                    delete_nested_key(environments[key], path)
                    set_nested_key(common_data, path, duplicate['value'])


        ret = {
            "common": common_data,
            "environments": environments
        }

        self.configs['common'] = common_data
        for env, data in environments.items():
            self.configs[env] = data

        print(json.dumps(self.configs, indent=4))
