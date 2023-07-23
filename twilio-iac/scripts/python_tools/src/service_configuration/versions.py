import json
import hashlib
import requests
from ..aws import S3Client
from .config import AWS_ROLE_ARN

S3_BUCKET = 'tl-aselo-twilio-service-config'

class Versions():
    def __init__(self, service_config):
        self.service_config = service_config
        self.s3_client = S3Client(AWS_ROLE_ARN)
        self.init_sha()
        self.init_s3_paths()
        self.lock()

    def init_sha(self):
        self.sha = hashlib.sha256(json.dumps(self.service_config.remote_state).encode('utf-8')).hexdigest()

    def init_s3_paths(self):
        self.key_prefix = f'{self.service_config.environment}/{self.service_config.helpline_code}/'
        self.lock_key = f'{self.key_prefix}lock'
        self.version_key = f'{self.key_prefix}versions/{self.sha}'
        self.changelog_prefix = f'{self.service_config.environment}/{self.service_config.helpline_code}/changelog/'

        ip = requests.get('https://api.ipify.org').text
        self.lock_body = {
            'sha': self.sha,
            'ip': ip,
        }

    def lock(self):
        if (self.s3_client.object_exists(S3_BUCKET, self.lock_key)):
            print(json.dumps(json.loads(self.s3_client.get_object(S3_BUCKET, self.lock_key), indent=2)))
            print('Lock file exists, cannot proceed')
            exit(1)

        self.s3_client.put_object(
            S3_BUCKET,
            self.lock_key,
            self.service_config.lock_file_body
        )

    def unlock(self):
        self.s3_client.delete_object(S3_BUCKET, self.lock_key)
