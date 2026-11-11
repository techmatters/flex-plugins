import json
import sys
from argparse import ArgumentParser, ArgumentTypeError

from .forms import new_helpline_forms
from .status import onboarding_status, print_status

ENVIRONMENTS = {'stg': 'staging', 'prod': 'production', 'staging': 'staging', 'production': 'production'}


def _environment(env: str) -> str:
    if env.lower() not in ENVIRONMENTS:
        raise ArgumentTypeError(f'unknown environment "{env}" (staging or production)')
    return ENVIRONMENTS[env.lower()]


def _build_parser() -> ArgumentParser:
    parser = ArgumentParser(
        prog='onboarding.py',
        description='New helpline onboarding helpers (twilio-iac/docs/new-account-provisioning.md).',
    )
    subparsers = parser.add_subparsers(dest='command', required=True)

    forms = subparsers.add_parser(
        'new-forms',
        help='create form-definitions/<code>/v1 from the as/v3 baseline',
        description='Copies the form definitions baseline (as/v3) to form-definitions/<code>/v1, renames the '
                    'helpline and registers <code>-v1 in the validation tests. Local files only.',
    )
    forms.add_argument('--hl', required=True, type=str.lower, help='helpline short code, e.g. jm')
    forms.add_argument('--helpline', required=True,
                       help='display name: the same value as "helpline" in twilio-iac/helplines/<code>/common.hcl '
                            '(the categories are looked up by that name)')

    status = subparsers.add_parser(
        'status',
        help='report each provisioning step as done, missing or to confirm by hand',
        description='Checks the repo (and AWS SSM, when credentials are available) and reports each step of '
                    'docs/new-account-provisioning.md as done, missing, or to be confirmed by a person. Read-only.',
    )
    status.add_argument('--hl', required=True, type=str.lower, help='helpline short code, e.g. jm')
    status.add_argument('--env', required=True, type=_environment,
                        help='staging | production (stg / prod also accepted)')
    status.add_argument('--account-sid', help='Twilio account SID (otherwise --accounts-file or AWS SSM)')
    status.add_argument('--accounts-file',
                        help='private JSON { "<code>": { "staging": "AC...", "production": "AC..." } }')
    status.add_argument('--hrm-repo', help='local checkout of techmatters/hrm, to check the permissions file')
    status.add_argument('--json', action='store_true', help='machine-readable output')

    return parser


def main():
    # The output uses emoji; don't crash on consoles/pipes with a legacy default encoding
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    args = _build_parser().parse_args()

    if args.command == 'new-forms':
        sys.exit(new_helpline_forms(args.hl, args.helpline))

    steps = onboarding_status(args.hl, args.env, args.account_sid, args.accounts_file, args.hrm_repo)
    if args.json:
        print(json.dumps({'helpline': args.hl, 'environment': args.env, 'steps': steps}, indent=2, ensure_ascii=False))
    else:
        print_status(args.hl, args.env, steps)
