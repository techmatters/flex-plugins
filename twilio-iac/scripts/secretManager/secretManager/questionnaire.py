from botocore.exceptions import ClientError
import json
import re

from .config import questions
from .ssm_client import get_ssm_client


class Questionnaire():
    """Class to handle questionnaire for secret management"""

    _helpline = None

    _secrets = None

    ssm_key = None
    ssm_client = None
    ssm_key_exists = False

    def __init__(self, **kwargs):
        self._helpline = kwargs['helpline']
        self.ssm_key = '/terraform/twilio-iac/' + self._helpline + '/secrets.json'
        self.ssm_client = get_ssm_client()

    def start(self):
        self.load_secrets()
        if self._secrets:
            self.validate_existing_secrets()

        self.ask_questions()
        self.build_secrets()
        self.validate_new_secrets()
        self.send_secrets_to_ssm()

    def load_secrets(self):
        try:
            response = self.ssm_client.get_parameter(
                Name=self.ssm_key,
                WithDecryption=True
            )
            print('Parameter found, loading secrets for ' + self._helpline)
            self._secrets = json.loads(response['Parameter']['Value'])
            self.ssm_key_exists = True

        except ClientError as e:
            if e.response['Error']['Code'] == 'ParameterNotFound':
                print('Parameter not found, starting questionnaire for ' + self._helpline)
            else:
                raise e

    def validate_existing_secrets(self):
        print('These secrets currently exist in SSM:\n\n')
        print(json.dumps(self._secrets, indent=2))
        print('\n')

        confirm = input('Are the values correct for the ssm key: ' + self.ssm_key + '? (y/n): ')

        if confirm == 'y':
            print('Continuing...')
            exit()

    def ask_questions(self):
        for question in questions:
            question['value'] = self.ask_question(question)

    def ask_question(self, question):
        currentValue = self._secrets.get(question['tf_var'], None)

        questionText = question['question']
        if currentValue:
            questionText += ' [' + currentValue + ']'

        value = input(questionText + ']: ') or currentValue

        if not re.match(question['regex'], value):
            print('Invalid value')
            value = self.ask_question(question)

        return value

    def build_secrets(self):
        secrets = {}

        for question in questions:
            secrets[question['tf_var']] = question['value']

        self._secrets = secrets

    def validate_new_secrets(self):
        print('You entered the following values:\n\n')
        print(json.dumps(self._secrets, indent=2))
        print('\n')

        confirm = input('Are these values correct for the ssm key: ' + self.ssm_key + '? (y/n): ')

        if confirm != 'y':
            print('Please re-run the script to try again')
            print('Exiting...')
            exit(1)

    def send_secrets_to_ssm(self):
        print('Sending secrets to SSM')
        self.ssm_client.put_parameter(
            Name=self.ssm_key,
            Value=json.dumps(self._secrets),
            Type='SecureString',
            Overwrite=True,
        )
