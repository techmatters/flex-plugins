# Onboarding status for a helpline + environment: checks the repo and, when credentials are available,
# AWS SSM, and reports each step of twilio-iac/docs/new-account-provisioning.md as done, missing, or
# to be confirmed by a person. Read-only.

import json
import re
from pathlib import Path

import boto3
from botocore.config import Config

from .paths import HELPLINES_DIR, REPO_ROOT

ICONS = {'done': '✅', 'missing': '❌', 'manual': '🧑', 'unknown': '❔'}

_ssm_client = None


def _ssm():
    global _ssm_client
    if not _ssm_client:
        _ssm_client = boto3.client('ssm', config=Config(region_name='us-east-1'))
    return _ssm_client


def _secret_name(code: str, environment: str) -> str:
    return f'/terraform/twilio-iac/{environment}/{code}/secrets.json'


def ssm_parameter_status(name: str) -> str:
    '''done | missing | unknown (no AWS credentials). Checks existence only; the value is never read.'''
    try:
        parameters = _ssm().describe_parameters(
            ParameterFilters=[{'Key': 'Name', 'Values': [name]}],
        )['Parameters']
        return 'done' if parameters else 'missing'
    except Exception:
        return 'unknown'


def ssm_secret_status(code: str, environment: str) -> str:
    return ssm_parameter_status(_secret_name(code, environment))


def resolve_account_sid(code: str, environment: str, account_sid: str | None, accounts_file: str | None) -> str | None:
    '''--account-sid, then --accounts-file, then twilio_account_sid from the SSM secret Terraform reads.'''
    if account_sid:
        return account_sid
    if accounts_file:
        with open(accounts_file, encoding='utf-8') as f:
            sid = json.load(f).get(code, {}).get(environment)
        if sid:
            return sid
    try:
        raw = _ssm().get_parameter(Name=_secret_name(code, environment), WithDecryption=True)['Parameter']['Value']
        return json.loads(raw).get('twilio_account_sid')
    except Exception:
        return None


def _read_attributes(file: Path) -> dict:
    if not file.exists():
        return {}
    return json.loads(file.read_text(encoding='utf-8')).get('attributes') or {}


def onboarding_status(
    code: str,
    environment: str,
    account_sid: str | None = None,
    accounts_file: str | None = None,
    hrm_repo: str | None = None,
) -> list[dict]:
    steps = []

    # status: done | missing | manual (a person must confirm) | unknown (could not check here)
    def add(step: str, title: str, status: str, detail: str = ''):
        steps.append({'step': step, 'title': title, 'status': status, 'detail': detail})

    def exists(path: str) -> bool:
        return (REPO_ROOT / path).exists()

    # 1.1 Helpline configuration
    helpline_dir = HELPLINES_DIR / code
    config_files = [f for f in ('common.hcl', f'{environment}.hcl') if (helpline_dir / f).exists()]
    # The files alone aren't enough: look for the Twilio blocks too
    config_text = '\n'.join((helpline_dir / f).read_text(encoding='utf-8') for f in config_files)
    missing_blocks = [key for key in ('workflows', 'task_queues', 'channels')
                      if not re.search(rf'^\s*{key}\s*[=:]', config_text, re.MULTILINE)]
    if len(config_files) != 2:
        add('1.1', 'Helpline config (common + environment file)', 'missing', f'missing in helplines/{code}/')
    elif missing_blocks:
        add('1.1', 'Helpline config (common + environment file)', 'missing',
            f'no {", ".join(missing_blocks)} in helplines/{code}/')
    else:
        add('1.1', 'Helpline config (common + environment file)', 'done')

    # 1.2 Secrets in SSM
    ssm_status = ssm_secret_status(code, environment)
    add('1.2', f'SSM secret {_secret_name(code, environment)}', ssm_status,
        'no AWS credentials here' if ssm_status == 'unknown' else '')

    # Account SID (needed by the Twilio checks)
    sid = resolve_account_sid(code, environment, account_sid, accounts_file)

    # 1.3 Terraform stages: plans can only be confirmed on the devops node
    lex_step = 'lex (not for development yet)' if environment == 'development' else 'lex (if used)'
    add('1.3', f'provision / {lex_step} / system-down / configure applied '
        '(re-plan shows only the known whitespace drift)', 'manual',
        f'make plan HL={code} HL_ENV={environment} in each stage')
    add('1.3', 'Phone number points at the voice Studio flow', 'manual', 'Twilio Console › Phone Numbers')

    # 1.4 Error reporting: TwilioErrorReporter finds the account from this parameter (written by provision)
    if sid:
        reporter_parameter = f'/{environment}/twilio/{sid}/short_helpline'
        reporter_status = ssm_parameter_status(reporter_parameter)
        add('1.4', f'SSM {reporter_parameter} (TwilioErrorReporter)', reporter_status,
            'no AWS credentials here' if reporter_status == 'unknown' else '')
    else:
        add('1.4', 'SSM short_helpline parameter (TwilioErrorReporter)', 'unknown', 'account SID unknown')
    add('1.4', 'Errors webhook set in the Twilio console', 'manual')

    # 1.5 Okta SSO
    add('1.5', 'Okta SSO set up and SSO login tested', 'manual')
    add('1.6', 'Engineers invited to the Twilio console', 'manual')

    # Phase 2
    forms_dir = f'lambdas/packages/hrm-form-definitions/form-definitions/{code}/v1'
    add('2.1', 'Form definitions', 'done' if exists(forms_dir) else 'missing', '' if exists(forms_dir) else forms_dir)
    service_config_file = helpline_dir / 'configs' / 'service-configuration' / 'common.json'
    common_attributes = _read_attributes(service_config_file)
    definition_version = common_attributes.get('definitionVersion')
    # The environment file can override permissionConfig (as/staging uses "demo")
    permission_config = {
        **common_attributes,
        **_read_attributes(helpline_dir / 'configs' / 'service-configuration' / f'{environment}.json'),
    }.get('permissionConfig')
    add('2.1', f'definitionVersion is {code}-v1 in service-configuration/common.json',
        'done' if definition_version == f'{code}-v1' else 'missing',
        f'currently "{definition_version}"' if definition_version and definition_version != f'{code}-v1' else '')
    add('2.1', 'Form definitions deployed to S3', 'manual',
        'GitHub Actions › Deploy form-definitions to S3 (from the helpline branch until merged)')
    add('2.2', 'Twilio lambdas deployed', 'manual',
        'GitHub Actions › Deploy All Twilio Lambdas (environment), from master')
    add('2.3', 'Flex plugin deployed', 'manual', 'Flex Deploy workflow')
    webchat_config = f'aselo-webchat-react-app/configSrc/{code}'
    add('2.4', 'Webchat config (if the helpline uses webchat)', 'done' if exists(webchat_config) else 'missing',
        '' if exists(webchat_config) else webchat_config)
    add('2.4', 'Webchat config + app deployed (if the helpline uses webchat)', 'manual',
        'Deploy Aselo Webchat React App - single helpline (also deploys the forms)')

    # permissionConfig can point at another helpline's rules (e.g. "demo" for a test helpline)
    rules_name = permission_config if permission_config and not permission_config.startswith('<') else code
    borrowed_rules = f' (permissionConfig "{rules_name}": reuses that helpline\'s rules)' if rules_name != code else ''
    if hrm_repo:
        rules = Path(hrm_repo).resolve() / 'hrm-domain' / 'hrm-core' / 'permission-rules' / f'{rules_name}.json'
        add('2.5', f'HRM permissions file{borrowed_rules}', 'done' if rules.exists() else 'missing',
            '' if rules.exists() else str(rules))
    else:
        add('2.5', 'HRM permissions file', 'unknown', 'pass --hrm-repo <path to hrm checkout>')
    add('2.6', 'FullStory segment', 'manual')
    if environment == 'production':
        add('2.7', 'docs bucket in CloudTrail access logging', 'manual')

    return steps


def print_status(code: str, environment: str, steps: list[dict]):
    print(f'Onboarding status: {code}/{environment}  '
          '(✅ done · ❌ missing · 🧑 confirm by hand · ❔ not checked here)\n')
    for s in steps:
        print(f'{ICONS[s["status"]]} {s["step"]:<4} {s["title"]}' + (f'\n          {s["detail"]}' if s['detail'] else ''))
    counts = {k: len([s for s in steps if s['status'] == k]) for k in ICONS}
    print(f'\n{counts["done"]} done · {counts["missing"]} missing · {counts["manual"]} to confirm by hand · '
          f'{counts["unknown"]} not checked')
