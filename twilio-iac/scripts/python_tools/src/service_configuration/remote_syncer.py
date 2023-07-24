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


class InitArgsDict(TypedDict):
    helpline_code: str
    service_configs: dict[str, ServiceConfiguration]


class RemoteSyncer():
    def __init__(self, **kwargs: Unpack[InitArgsDict]) -> None:
        self.configs: dict[str, object] = {}
        self.common_data: dict[str, object] = {}
        self.environments_data = {}
        self.environments_duplicates: dict[str, dict[str, List[str]]] = defaultdict(dict)

        self.helpline_code = kwargs['helpline_code']
        self.service_configs: dict[str, ServiceConfiguration] = kwargs['service_configs']
        self.env_count = len(self.service_configs.keys())
        self.init_configs()

    def process_change(self, env: str, change, change_type: str):
        env_data: dict[str, object] = self.environments_data[env]
        path = get_dot_notation_path(change)

        if change_type == 'dictionary_item_added' and path.startswith('attributes.feature_flags'):
            value = False
        else:
            value = None if change_type == 'dictionary_item_added' else change.t1

        if value not in self.environments_duplicates[path]:
            self.environments_duplicates[path][value] = [env]
        else:
            self.environments_duplicates[path][value].append(env)

        set_nested_key(env_data, path, value)

    def split_configs(self, env):
        for change_type, changes in self.service_configs[env].plan.items():
            for change in changes:
                self.process_change(env, change, change_type)

    def eliminate_duplicates(self):
        for path, values in self.environments_duplicates.items():
            for value, envs in values.items():
                if len(envs) == self.env_count:
                    for env in envs:
                        delete_nested_key(self.environments_data[env], path)
                        set_nested_key(self.common_data, path, value)

    def init_configs(self):
        for env in self.service_configs.keys():
            self.environments_data[env] = {}

            if env not in self.service_configs:
                continue

            self.split_configs(env)

        self.eliminate_duplicates()

        self.configs['common'] = self.common_data
        for env, data in self.environments_data.items():
            self.configs[env] = data

