import boto3
from mypy_boto3_ssm import SSMClient
import time

client: SSMClient = None


def get_ssm_client():
    global client

    if client:
        return client

    ts = time.time()
    stsClient = boto3.client("sts")
    response = stsClient.assume_role(
        RoleArn="arn:aws:iam::712893914485:role/tf-twilio-iac-ssm-admin",
        RoleSessionName="secret-manager" + str(ts),
    )

    session = boto3.session.Session(
        aws_access_key_id=response['Credentials']['AccessKeyId'],
        aws_secret_access_key=response['Credentials']['SecretAccessKey'],
        aws_session_token=response['Credentials']['SessionToken'],
    )
    client = session.client("ssm")

    return client
