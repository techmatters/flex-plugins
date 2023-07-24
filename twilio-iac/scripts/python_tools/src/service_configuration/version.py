import json
import hashlib
import requests
from datetime import datetime
from typing import NotRequired, TypedDict, Unpack
from ..aws import S3Client
from .constants import AWS_ROLE_ARN

S3_BUCKET = 'tl-aselo-twilio-service-config'


class InitArgsDict(TypedDict):
    environment: str
    helpline_code: str
    state: dict[str, str]
    skip_lock: NotRequired[bool | None]


class Version():
    def __init__(self, **kwargs: Unpack[InitArgsDict]):
        self.environment = kwargs['environment']
        self.helpline_code = kwargs['helpline_code']
        self.state = kwargs['state']
        self.skip_lock = kwargs.get('skip_lock') or False
        self.s3_client = S3Client(AWS_ROLE_ARN)
        self.init_ip()
        self.init_sha()
        self.init_s3_paths()
        self.lock()
        self.init_version()

    def init_ip(self):
        self.ip = requests.get('https://api.ipify.org').text

    def init_sha(self):
        self.sha = hashlib.sha256(json.dumps(self.state).encode('utf-8')).hexdigest()

    def init_s3_paths(self):
        self.key_prefix = f'{self.environment}/{self.helpline_code}'
        self.lock_key = f'{self.key_prefix}/lock'
        self.version_prefix = f'{self.key_prefix}/versions'
        self.changelog_prefix = f'{self.key_prefix}/changelog'

    def add_changelog(self):
        self.s3_client.put_object(
            S3_BUCKET,
            f'{self.version_prefix}/{self.sha}',
            json.dumps(self.state)
        )

        self.s3_client.put_object(
            S3_BUCKET,
            f'{self.changelog_prefix}/{datetime.utcnow()}',
            json.dumps({
                'sha': self.sha,
                'ip': self.ip,
            })
        )

    def init_version(self):
        if (self.s3_client.object_exists(S3_BUCKET, f'{self.version_prefix}/{self.sha}')):
            return

        self.add_changelog()

    def lock(self):
        if self.skip_lock:
            return

        if (self.s3_client.object_exists(S3_BUCKET, self.lock_key)):
            print(json.dumps(json.loads(self.s3_client.get_object(S3_BUCKET, self.lock_key)), indent=2))
            print('Lock file exists, cannot proceed')
            exit(1)

        self.s3_client.put_object(
            S3_BUCKET,
            self.lock_key,
            json.dumps({
                'sha': self.sha,
                'ip': self.ip,
            })
        )

    def unlock(self):
        self.s3_client.delete_object(S3_BUCKET, self.lock_key)
