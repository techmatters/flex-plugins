#!/usr/bin/env python3

from os import environ
from sys import argv, exit
from secretManager import Questionnaire

if environ.get('PROVISION_SKIP_MIGRATION'):
    print('Skipping secret management because PROVISION_SKIP_MIGRATION is set')
    exit(0)

helpline = str(argv[1])

Questionnaire(helpline=helpline).start()
