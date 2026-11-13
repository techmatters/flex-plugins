# Environment names accepted by the python_tools CLIs (onboarding.py, oktaSso.py), shared so they can't drift.

from argparse import ArgumentTypeError

# Accepted --env values (short or full name) -> full environment name used in twilio-iac (HL_ENV)
ENVIRONMENTS = {
    'dev': 'development', 'stg': 'staging', 'prod': 'production',
    'development': 'development', 'staging': 'staging', 'production': 'production',
}

ENVIRONMENT_HELP = 'development | staging | production (dev / stg / prod also accepted)'


def parse_environment(env: str) -> str:
    '''argparse `type` for --env: returns the full environment name, or fails with the accepted values.'''
    if env.lower() not in ENVIRONMENTS:
        raise ArgumentTypeError(f'unknown environment "{env}" (development, staging or production)')
    return ENVIRONMENTS[env.lower()]
