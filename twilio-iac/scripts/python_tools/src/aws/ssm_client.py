import boto3
from botocore.config import Config
from mypy_boto3_ssm import SSMClient as BotoSSMClient
from mypy_boto3_ssm.literals import ParameterTypeType
from mypy_boto3_ssm.type_defs import ParameterTypeDef
from mypy_boto3_sts import STSClient
import time
from typing import List, TypedDict
import re


class GetHelplinesForEnvArgsDict(TypedDict):
    helpline: str
    account_sid: str


class SSMClient():
    client: BotoSSMClient | None = None
    _config = Config(region_name='us-east-1')

    def __init__(
        self,
        role_arn: str = 'arn:aws:iam::712893914485:role/tf-twilio-iac-ssm-admin'
    ):
        self.client = self.get_ssm_client(role_arn)

    def get_ssm_client(self, role_arn: str):
        if self.client:
            return self.client

        ts = time.time()
        sts_client: STSClient = boto3.client("sts", config=self._config)
        response = sts_client.assume_role(
            RoleArn=role_arn,
            RoleSessionName="secret-manager" + str(ts),
        )

        session = boto3.session.Session(
            aws_access_key_id=response['Credentials']['AccessKeyId'],
            aws_secret_access_key=response['Credentials']['SecretAccessKey'],
            aws_session_token=response['Credentials']['SessionToken'],
        )

        return session.client("ssm")

    def get_parameter(self, name: str, with_decryption: bool = True):
        response = self.client.get_parameter(
            Name=name,
            WithDecryption=with_decryption
        )

        return response['Parameter']['Value']

    def get_parameters_by_path(
        self,
        path: str,
        with_decryption: bool = True,
        recursive: bool = True,
        next_token: str = ''
    ):

        response = self.client.get_parameters_by_path(
            Path=path,
            WithDecryption=with_decryption,
            Recursive=recursive,
            NextToken=next_token
        )

        return response['Parameters']

    def get_all_parameters_by_path(
        self,
        path: str,
        with_decryption: bool = True,
        recursive: bool = True
    ) -> list[ParameterTypeDef]:
        parameters: List[ParameterTypeDef] = []
        next_token = ''
        while True:
            response = self.client.get_parameters_by_path(
                Path=path,
                WithDecryption=with_decryption,
                Recursive=recursive,
                NextToken=next_token
            )
            parameters.extend(response['Parameters'])
            if 'NextToken' in response:
                next_token = response['NextToken']
            else:
                break

        return parameters

    def put_parameter(
        self,
        name: str,
        value: str,
        overwrite: bool = True,
        type: ParameterTypeType = 'SecureString'
    ):
        return self.client.put_parameter(
            Name=name,
            Value=value,
            Type=type,
            Overwrite=overwrite
        )

    def get_twilio_creds_from_ssm(
        self,
        environment: str,
        helpline: str | None = None,
        account_sid: str | None = None
    ):
        if not account_sid:
            if not helpline:
                raise Exception(
                    "Please provide either helpline or account_sid")

            account_sid = self.get_parameter(
                name=f"/{environment}/twilio/{helpline.upper()}/account_sid"
            )

        if not account_sid:
            raise Exception(
                f"Could not find account_sid for {helpline} in {environment}")

        auth_token = self.get_parameter(
            name=f"/{environment}/twilio/{account_sid}/auth_token"
        )
        if not auth_token:
            raise Exception(
                f"Could not find auth_token for {account_sid} in {environment}")

        return account_sid, auth_token

    def get_helplines_for_env(self, environment: str):
        helplines: List[GetHelplinesForEnvArgsDict] = []
        pattern = re.compile(
            rf'^/{environment}/twilio/(?P<helpline>\w+)/account_sid$')

        parameters = self.get_all_parameters_by_path(f"/{environment}/twilio")
        for parameter in parameters:
            match = pattern.match(parameter['Name'])
            if match:
                helplines.append({
                    'helpline': match.group('helpline'),
                    'account_sid': parameter['Value']
                })

        return helplines
