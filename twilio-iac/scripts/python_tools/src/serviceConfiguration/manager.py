from pprint import pprint
from .config import config


class Manager():
    def __init__(self):
        pprint(config._config)
