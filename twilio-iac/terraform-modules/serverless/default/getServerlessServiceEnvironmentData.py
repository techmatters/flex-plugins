#!/usr/bin/env python3

import json
import sys
from twilio.rest import Client

input_json = sys.stdin.read()
input = json.loads(input_json)

twilio_account_sid = input.get('twilio_account_sid')
twilio_auth_token = input.get('twilio_auth_token')
service_sid = input.get('service_sid')
environment_sid = input.get('environment_sid')

client = Client(
    twilio_account_sid,
    twilio_auth_token
)

environment = client.serverless.v1.services(service_sid).environments(environment_sid).fetch()

environment_data = {
    'sid': environment.sid,
    'account_sid': environment.account_sid,
    'service_sid': environment.service_sid,
    'build_sid': environment.build_sid,
    'domain_name': environment.domain_name,
    'domain_suffix': environment.domain_suffix,
    'unique_name': environment.unique_name,
}

print(json.dumps(environment_data))
