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

    def __init__(self, **kwargs):
        self._helpline = kwargs['helpline']
        self.ssm_key = f'/terraform/twilio-iac/{self._helpline}/secrets.json'
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
        print (f'Loading secrets for {self._helpline} from SSM key: {self.ssm_key}')
        try:
            response = self.ssm_client.get_parameter(
                Name=self.ssm_key,
                WithDecryption=True
            )
            print(f'Parameter found, loading secrets for {self._helpline}')
            self._secrets = json.loads(response['Parameter']['Value'])

        except ClientError as e:
            if e.response['Error']['Code'] == 'ParameterNotFound':
                print(f'Parameter not found, starting questionnaire for {self._helpline}')
            else:
                raise e

    def validate_existing_secrets(self):
        print('These secrets currently exist in SSM:\n\n')
        self.print_secrets()
        print('\n')

        confirm = input(f'Are the values correct for the ssm key: {self.ssm_key}? (Y/n): ')
        if confirm == 'y' or confirm == '':
            print('Continuing...')
            exit()

    def ask_questions(self):
        for question in questions:
            question['value'] = self.ask_question(question)

    def ask_question(self, question):
        currentValue = None

        if self._secrets:
            currentValue = self._secrets.get(question['tfvar'], None)

        questionText = question['question']
        if currentValue:
            obfuscatedValue = self.obfuscate_secret(question['tfvar'], currentValue)
            questionText += f' [{obfuscatedValue}]'

        value = input(f'{questionText}: ') or currentValue
        if not re.match(question['regex'], value):
            print('Invalid value')
            value = self.ask_question(question)

        return value

    def build_secrets(self):
        secrets = {}

        for question in questions:
            secrets[question['tfvar']] = question['value']

        self._secrets = secrets

    def validate_new_secrets(self):
        print('You entered the following values:\n\n')
        self.print_secrets()
        print('\n')

        confirm = input(f'Are these values correct for the ssm key: {self.ssm_key}? (y/N): ')
        if confirm != 'y':
            print('Please re-run the script to try again')
            print('Exiting...')
            exit(1)

    def print_secrets(self):
        for key, value in self._secrets.items():
            print(key + ': ' + self.obfuscate_secret(key, value))

    def obfuscate_secret(self, tfvar, value):
        if not self.should_obfuscate_secret_by_tfvar(tfvar):
            return value

        return value[:3] + '*' * (len(value)-6) + value[-3:]

    def should_obfuscate_secret_by_tfvar(self, tfvar):
        return any(x for x in questions if x.get('tfvar') == tfvar and x.get('obfuscate'))

    def send_secrets_to_ssm(self):
        print('Sending secrets to SSM')
        self.ssm_client.put_parameter(
            Name=self.ssm_key,
            Value=json.dumps(self._secrets),
            Type='SecureString',
            Overwrite=True,
        )
