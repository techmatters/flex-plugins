#!/usr/bin/env python3

from sys import argv
from secretManager import Questionnaire

helpline = argv[1]

questionnaire = Questionnaire(helpline=helpline)
questionnaire.start()
