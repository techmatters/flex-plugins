import json
from collections import defaultdict
from typing import List, Set, TypedDict, Unpack
from .service_configuration import (
    ServiceConfiguration,
    delete_nested_key,
    get_dot_notation_path,
    get_nested_key,
    set_nested_key
)


class GetDupValueKeysArgsDict(TypedDict):
    keys: List[str]
    value: object


def get_duplicate_value_keys(
    d: dict[str, object]
) -> List[GetDupValueKeysArgsDict]:
    value_keys: dict[object, List[str]] = {}

    for key, value in d.items():
        if value not in value_keys:
            value_keys[value] = [key]
        else:
            value_keys[value].append(key)

    results: List[GetDupValueKeysArgsDict] = []
    for value, keys in value_keys.items():
        if len(keys) > 1:
            results.append({'keys': keys, 'value': value})

    return results


class InitArgsDict(TypedDict):
    helpline_code: str
    service_configs: dict[str, ServiceConfiguration]


class RemoteSyncer():
    def __init__(self, **kwargs: Unpack[InitArgsDict]) -> None:
        self.configs: dict[str, object] = {}
        self.common_keys: Set[str] = set()
        self.common_data: dict[str, object] = {}
        self.environments_data = {}
        self.previous_envs: Set[str] = set()
        self.environments_duplicates: dict[str, GetDupValueKeysArgsDict] = defaultdict(dict)

        self.helpline_code = kwargs['helpline_code']
        self._service_configs: dict[str, ServiceConfiguration] = kwargs['service_configs']
        self.init_configs()

    def process_change(self, env, change):
        env_data: dict[str, object] = self.environments_data[env]
        path = get_dot_notation_path(change)
        value = change.t1

        if len(self.previous_envs) == 0:
            self.common_keys.add(path)
            set_nested_key(self.common_data, path, value)
            return

        if path not in self.common_keys:
            set_nested_key(env_data, path, value)
            self.environments_duplicates[path][env] = value
            return

        common_value = get_nested_key(self.common_data, path)

        if value == common_value:
            return
        else:
            for prev_env in self.previous_envs:
                set_nested_key(self.environments_data[prev_env], path, common_value)
                delete_nested_key(self.common_data, path)
                self.environments_duplicates[path][env] = value
                set_nested_key(env_data, path, value)

    def split_configs(self, env):
        env_data = self.environments_data[env]
        for change_type, changes in self._service_configs[env].plan.items():
            if change_type == 'dictionary_item_added':
                continue

            for change in changes:
                self.process_change(env, change)

    def eliminate_duplicates(self):
        for path, envs in self.environments_duplicates.items():
            duplicates = get_duplicate_value_keys(envs)
            for duplicate in duplicates:
                for key in duplicate['keys']:
                    delete_nested_key(self.environments_data[key], path)
                    set_nested_key(self.common_data, path, duplicate['value'])

    def init_configs(self):
        for env in self._service_configs.keys():
            self.environments_data[env] = {}

            if env not in self._service_configs:
                continue

            self.split_configs(env)
            self.previous_envs.add(env)

        self.eliminate_duplicates()

        self.configs['common'] = self.common_data
        for env, data in self.environments_data.items():
            self.configs[env] = data

