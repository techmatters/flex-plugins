from collections import defaultdict
from hashlib import md5
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
        self.environments_duplicates: dict[str,
                                           dict[str, List[str]]] = defaultdict(dict)
        self.hash_value_lookup: dict[str, object] = {}

        self.helpline_code = kwargs['helpline_code']
        self.service_configs: dict[str,
                                   ServiceConfiguration] = kwargs['service_configs']
        self.env_count = len(self.service_configs.keys())
        self.init_configs()

    def process_change(self, env: str, change, change_type: str):
        """
        We keep track of each change to an environment's config. Since these
        plans should be relatively small and we will rarely re-run this tool,
        we dont' bother with a ton of optimization here.

        We build a dictionary that represents the config for each
        environment. We also build a dictionary that maps each path and
        hashed valued to the environments that it appears in. Later, if
        a path and hashed value appears in all environments, we know that
        it is a common value and can be moved to the common config.

        This isn't perfect, but it should work for most cases.
        """
        env_data: dict[str, object] = self.environments_data[env]
        path = get_dot_notation_path(change)

        print(
            f"Processing change: {change_type} {path} {change.t1} {change.t2}")

        if change_type == 'dictionary_item_added' and path.startswith('attributes.feature_flags'):
            value = False
        else:
            value = None if change_type == 'dictionary_item_added' else change.t1

        # The plan sometimes returns a dict as a value. If the value is a
        # dictionary. we need to hash it to compare it to other dictionaries.
        hashed_value = md5(str(value).encode('utf-8')).hexdigest()

        # Since we are using a hash to compare values, we need to keep track
        # of the original value so we can use it later. Are there better ways?
        # Probably, but this works for now.
        self.hash_value_lookup[hashed_value] = value

        if hashed_value not in self.environments_duplicates[path]:
            self.environments_duplicates[path][hashed_value] = [env]
        else:
            self.environments_duplicates[path][hashed_value].append(env)

        set_nested_key(env_data, path, value)

    def split_configs(self, env):
        for change_type, changes in self.service_configs[env].plan.items():
            for change in changes:
                self.process_change(env, change, change_type)

    def eliminate_duplicates(self):
        """
        If a path and hashed value appears in all environments, we know that
        it is a common value and can be moved to the common config.
        """
        for path, values in self.environments_duplicates.items():
            for hashed_value, envs in values.items():
                if len(envs) == self.env_count:
                    for env in envs:
                        delete_nested_key(self.environments_data[env], path)
                        set_nested_key(self.common_data, path,
                                       self.hash_value_lookup[hashed_value])

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
