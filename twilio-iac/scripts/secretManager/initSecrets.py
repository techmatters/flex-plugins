#!/usr/bin/env python3

from botocore.exceptions import ClientError
from sys import argv
from secretManager import Questionnaire

helpline = argv[1]

questionnaire = Questionnaire(helpline=helpline)

try:
    questionnaire.ssm_client.get_parameter(
        Name=questionnaire.ssm_key,
        WithDecryption=True
    )

except ClientError as e:
    if e.response['Error']['Code'] == 'ParameterNotFound':
        print('Parameter not found, starting questionnaire for ' + helpline)
        questionnaire.start()

    else:
        print('Parameter found. continuing...')
