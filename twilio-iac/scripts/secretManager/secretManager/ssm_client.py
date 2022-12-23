import boto3


def get_ssm_client():
    return boto3.client('ssm')
