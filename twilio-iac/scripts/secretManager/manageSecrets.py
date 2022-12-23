#!/usr/bin/env python3

from sys import argv
from secretManager import Questionnaire

helpline = argv[1]

questionnaire = Questionnaire(helpline=helpline)

questionnaire.start()

try:
    questionnaire.ssm_client.get_parameter(
        Name=questionnaire.ssm_key,
        WithDecryption=True
    )

except ClientError as e:
    if e.response['Error']['Code'] == 'ParameterNotFound':
        print('Parameter not found, starting questionnaire for ' + helpline)


    else:
        print('Parameter found. continuing...')
