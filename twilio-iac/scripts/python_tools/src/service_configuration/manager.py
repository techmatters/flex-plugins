import json
from .config import config


class Manager():
    def __init__(self):
        pass

    def main(self):
        action = config.get_value('action')
        getattr(self, action)()

    def show(self):
        for account_sid in config.get_value('twilio_clients'):
            client = config.get_twilio_client(account_sid)
            flex_configuration = client.get_flex_configuration()
            print(json.dumps(flex_configuration, indent=4))

    def update(self):
        print("Updating flex configuration")
