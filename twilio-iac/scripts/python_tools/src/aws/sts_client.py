import boto3
import time
from botocore.config import Config
from mypy_boto3_sts import STSClient as BotoSTSClient


class STSClient():
    client: BotoSTSClient | None = None
    session: boto3.session.Session | None = None
    _config = Config(region_name='us-east-1')

    def __init__(
        self,
        role_arn: str
    ):
        self.init_client()
        self.init_session(role_arn)

    def init_client(self):
        if self.client:
            return

        self.client = boto3.client('sts', config=self._config)

    def init_session(self, role_arn: str):
        if self.session:
            return

        ts = time.time()

        response = self.client.assume_role(
            RoleArn=role_arn,
            RoleSessionName='python-tools' + str(ts),
        )

        self.session = boto3.session.Session(
            aws_access_key_id=response['Credentials']['AccessKeyId'],
            aws_secret_access_key=response['Credentials']['SecretAccessKey'],
            aws_session_token=response['Credentials']['SessionToken'],
        )

    def get_session_client(self, service_name: str):
        return self.session.client(service_name)