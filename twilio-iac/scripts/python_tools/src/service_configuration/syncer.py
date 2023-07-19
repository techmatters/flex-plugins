# TODO: remove typing_extensions dependency
from deepdiff import DeepDiff
from typing import TypedDict, Unpack

from .service_configuration import ENVIRONMENTS, ServiceConfiguration


class InitArgsDict(TypedDict):
    helpline_code: str
    service_configs: dict[str, ServiceConfiguration]

class Syncer():
    helpline_code: str
    _service_configs: dict[str, ServiceConfiguration]
    diffs: dict[str, DeepDiff] = {}

    def __init__(self, **kwargs: Unpack[InitArgsDict]) -> None:
        self.helpline_code = kwargs['helpline_code']
        self._service_configs = kwargs['service_configs']

    def init_diffs(self):
        for env in ENVIRONMENTS:
            self.init_diff_for_environment(env)