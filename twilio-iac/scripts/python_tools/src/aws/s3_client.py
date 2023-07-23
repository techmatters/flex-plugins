import boto3
from botocore.config import Config
from mypy_boto3_s3 import S3Client as BotoS3Client
from .sts_client import STSClient

class S3Client():
    client: BotoS3Client | None = None
    _config = Config(region_name='us-east-1')

    def __init__(self, role_arn: str | None = None):
        self.init_client(role_arn)

    def init_client(self, role_arn: str | None = None):
        if self.client:
            return

        if (not role_arn):
            self.client = boto3.client('s3', config=self._config)

        sts_client = STSClient(role_arn)

        self.client = sts_client.get_session_client('s3')

    def get_object(self, bucket: str, key: str):
        response = self.client.get_object(
            Bucket=bucket,
            Key=key\
        )

        return response['Body'].read().decode('utf-8')

    def put_object(self, bucket: str, key: str, body: str):
        response = self.client.put_object(
            Bucket=bucket,
            Key=key,
            Body=body
        )

        return response

    def delete_object(self, bucket: str, key: str):
        response = self.client.delete_object(
            Bucket=bucket,
            Key=key
        )

        return response

    def get_object_keys(self, bucket: str, prefix: str):
        paginator = self.client.get_paginator('list_objects_v2')

        pages = paginator.paginate(
            Bucket=bucket,
            Prefix=prefix
        )

        objects = []

        for page in pages:
            for obj in page['Contents']:
                objects.append(obj['Key'])

        return objects

    def object_exists(self, bucket: str, key: str):
        try:
            self.client.head_object(Bucket=bucket, Key=key)
            return True
        except self.client.exceptions.ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            raise e
