#!/usr/bin/env python3

import json
from sys import argv
from twilio.rest import Client

twilio_account_sid = argv[1]
twilio_auth_token = argv[2]

client = Client(
    twilio_account_sid,
    twilio_auth_token
)

services = client.serverless.services.list()

for service in services:
    if service.unique_name == 'serverless':

        environments = client.serverless.v1.services(service.sid).environments.list()
        for environment in environments:
            if 'production' in environment.domain_name:
                print(json.dumps({'url': 'https://' + environment.domain_name}))
                exit()

raise Exception('Could not find production environment url')
