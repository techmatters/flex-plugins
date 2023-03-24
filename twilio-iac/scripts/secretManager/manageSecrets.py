#!/usr/bin/env python3

from sys import argv
from secretManager import Questionnaire

helpline = argv[1]

Questionnaire(helpline=helpline, blah="blah").start()
