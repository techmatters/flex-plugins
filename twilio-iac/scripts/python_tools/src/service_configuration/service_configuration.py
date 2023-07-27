import json
from deepdiff import DeepDiff
from deepmerge import always_merger
from os.path import exists as path_exists
from ..twilio import Twilio

JSON_PATH_ROOT = "/app/twilio-iac/helplines"
JSON_CONFIG_PATH_PARTIAL = "configs/service-configuration"

SSM_FIELDS = {
    "attributes.serverless_base_url": "/${environment}/serverless/${twilio_account_sid}/base_url",
}

TEMPLATE_FIELDS = {
    "attributes.assets_bucket_url": "https://assets-${environment}.tl.techmatters.org",
    "attributes.hrm_base_url": "https://hrm-${environment}.tl.techmatters.org",
    "attributes.logo_url": "https://aselo-logo.s3.amazonaws.com/145+transparent+background+no+TM.png",
    "attributes.monitoringEnv": "production",
    "attributes.seenOnboarding": True,
    "attributes.hrm_api_version": "v0",
    "account_sid": "${twilio_account_sid}",
}


class ServiceConfiguration():
    _twilio_client: Twilio
    remote_state: dict
    local_state: dict = {}
    new_state: dict = {}
    plan: DeepDiff
    account_sid: str
    helpline_code: str
    environment: str

    def __init__(self, twilio_client: Twilio) -> None:
        self._twilio_client = twilio_client
        self.account_sid = twilio_client.account_sid
        self.helpline_code = twilio_client.helpline_code
        self.environment = twilio_client.environment
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
                    self.local_state, json.load(f))

    def init_new_state(self):
        self.new_state = always_merger.merge(
            self.new_state, self.local_state)

    def init_plan(self):
        self.plan = DeepDiff(
            self.remote_state, self.new_state, ignore_order=True)
