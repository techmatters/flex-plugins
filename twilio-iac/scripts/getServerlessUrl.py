#!/usr/bin/env python3

import boto3
import json
from sys import argv
from twilio.rest import Client

helpline = argv[1]


def get_twilio_client():
    ssm_key = '/terraform/twilio-iac/' + helpline + '/secrets.json'
    ssm_client = boto3.client('ssm')

    response = ssm_client.get_parameter(
                Name=ssm_key,
                WithDecryption=True
            )

    secrets = json.loads(response['Parameter']['Value'])

    return Client(
        secrets.get('twilio_account_sid'),
        secrets.get('twilio_auth_token')
    )


def print_serverless_urls():
    client = get_twilio_client()
    services = client.serverless.services.list()

    for service in services:
        if service.unique_name == 'serverless':
            environments = client.serverless.v1.services(service.sid).environments.list()
            for environment in environments:
                print('https://' + environment.domain_name)

    return None


print_serverless_urls()
