# TODO: remove typing_extensions dependency
import json
from copy import deepcopy
from deepdiff import DeepDiff
from typing import TypedDict, Unpack

from .config import ENVIRONMENTS
from .service_configuration import ServiceConfiguration


def extract_dict(partial_dict: dict[str, object], large_dict: dict[str, object]):
    extracted_dict: dict[str, object] = {}
    for key, value in partial_dict.items():
        if key in large_dict:
            if isinstance(value, dict):
                extracted_dict[key] = extract_dict(value, large_dict[key])
            else:
                extracted_dict[key] = large_dict[key]
    return extracted_dict


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
        self.default_config = self._service_configs['production'].local_configs['defaults']['data']
        self.init_configs()
        print(json.dumps(self.configs, indent=4))
        for env, diff in self._diffs.items():
            print(f'Changes for {env}:')
            print(diff.to_json())

    def init_configs(self):
        for env in ENVIRONMENTS:
            self.init_diff_for_environment(env)

    def init_diff_for_environment(self, env: str):
        print(self._service_configs)
        self.configs[env] = extract_dict(
            self.default_config,
            self._service_configs[env].remote_state
        )
        self._diffs[env] = DeepDiff(
            deepcopy(self.default_config),
            self.configs[env],
            ignore_order=True
        )
