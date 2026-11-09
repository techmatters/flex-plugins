from typing import TypedDict


class Question(TypedDict):
    tfvar: str
    question: str
    value: str
    regex: str
    obfuscate: bool


class Secrets(TypedDict):
    twilio_account_sid: str
    twilio_auth_token: str


questions: list[Question] = [
    {
        'tfvar': 'twilio_account_sid',
        'question': 'Twilio Account SID',
        'value': None,
        'regex': r'^AC[a-z0-9]{32}$',
        'obfuscate': False
    },
    {
        'tfvar': 'twilio_auth_token',
        'question': 'Twilio Auth Token',
        'value': None,
        'regex': r'^[a-z0-9]{32}$',
        'obfuscate': True
    },
]
