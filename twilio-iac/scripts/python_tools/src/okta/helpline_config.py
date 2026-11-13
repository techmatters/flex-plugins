# Reads the Okta settings of a helpline from twilio-iac/helplines/<code>/{common,<env>}.hcl and derives
# what its Okta app should look like, using the SAME rules as terraform-modules/stages/okta-app.
# Only the flat `okta` / `okta_app` blocks are parsed (strings, bools, string lists, lists of flat objects).

import json
import re
from pathlib import Path

import boto3
from botocore.config import Config

# src/okta -> src -> python_tools -> scripts -> twilio-iac
TWILIO_IAC_DIR = Path(__file__).resolve().parents[4]
HELPLINES_DIR = TWILIO_IAC_DIR / 'helplines'
# Okta app label prefix per environment (same as terraform-modules/stages/okta-app/main.tf)
LABEL_PREFIXES = {'development': 'DEV_', 'staging': 'STG_', 'production': ''}


# ---- minimal HCL subset parser -------------------------------------------------------------

def _strip_comments(text: str) -> str:
    return '\n'.join(re.sub(r'(^|\s)(#|//).*$', '', line) for line in text.split('\n'))


def _extract_block(text: str, name: str) -> str | None:
    '''Returns the text between the braces of `<name> = { ... }`, or None.'''
    match = re.search(rf'(^|\n)\s*{name}\s*=\s*\{{', text)
    if not match:
        return None
    start = match.end()
    depth = 0
    i = start - 1
    while i < len(text):
        char = text[i]
        if char == '"':
            i += 1
            while i < len(text) and text[i] != '"':
                if text[i] == '\\':
                    i += 1
                i += 1
        elif char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0:
                return text[start:i]
        i += 1
    raise Exception(f'Unbalanced braces in {name} block')


_STRING = re.compile(r'"((?:[^"\\]|\\.)*)"')
# values: "string", true/false, [list] or { inline object } (e.g. group_rule = { organizations = ["X"] })
_ASSIGNMENT = re.compile(r'(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|true|false|\{[^{}]*\}|\[[\s\S]*?\](?=\s*(?:\n|$)))')


def _parse_string(raw: str) -> str:
    return json.loads(f'"{raw}"')


def _parse_flat_object(body: str) -> dict:
    result = {}
    for match in _ASSIGNMENT.finditer(body):
        key, value = match.group(1), match.group(2)
        if value in ('true', 'false'):
            result[key] = value == 'true'
        elif value.startswith('"'):
            result[key] = _parse_string(value[1:-1])
        elif value.startswith('{'):
            result[key] = _parse_flat_object(value[1:-1])
        elif '{' in value:
            result[key] = [_parse_flat_object(inner) for inner in re.findall(r'\{([^{}]*)\}', value)]
        else:
            result[key] = [_parse_string(s) for s in _STRING.findall(value)]
    return result


def _read_block(file: Path, name: str) -> dict | None:
    if not file.exists():
        return None
    body = _extract_block(_strip_comments(file.read_text(encoding='utf-8')), name)
    return None if body is None else _parse_flat_object(body)


def _read_string(file: Path, key: str) -> str | None:
    match = re.search(rf'(^|\n)\s*{key}\s*=\s*"((?:[^"\\]|\\.)*)"', file.read_text(encoding='utf-8'))
    return _parse_string(match.group(2)) if match else None


# ---- helpline settings ---------------------------------------------------------------------

def list_helpline_codes() -> list[str]:
    return sorted(d.name for d in HELPLINES_DIR.iterdir() if d.is_dir() and (d / 'common.hcl').exists())


def get_expected_app(code: str, environment: str) -> dict | None:
    '''
    Expected Okta app for a helpline + environment, or None when the helpline has no okta config.
    Mirrors terraform-modules/stages/okta-app/main.tf.
    '''
    common_file = HELPLINES_DIR / code / 'common.hcl'
    if not common_file.exists():
        raise Exception(f"Unknown helpline '{code}' (no {common_file})")

    okta = _read_block(common_file, 'okta')
    okta_app = _read_block(HELPLINES_DIR / code / f'{environment}.hcl', 'okta_app')
    if not okta or not okta_app:
        return None

    helpline = _read_string(common_file, 'helpline')
    app_name = okta.get('app_name') or helpline
    upper_code = code.upper()
    label = okta_app.get('label') or f'{LABEL_PREFIXES.get(environment, "STG_")}{app_name} ({upper_code})'
    tech_matters_groups = okta_app.get('tech_matters_groups') or (
        ['Tech Matters - Production'] if environment == 'production'
        else ['Tech Matters - Staff', 'Tech Matters - Test Accounts'])
    include_helpline_group = okta_app.get('include_helpline_group') is not False

    return {
        'code': code,
        'environment': environment,
        'label': label,
        'helpline_group': okta['group_name'],
        'include_helpline_group': include_helpline_group,
        'group_names': ([okta['group_name']] if include_helpline_group else []) + tech_matters_groups,
        'attribute_statements_mode': okta_app.get('attribute_statements_mode') or 'legacy',
        'optional_attribute_sets': okta_app.get('optional_attribute_sets') or [],
        'extra_attribute_statements': [
            {'namespace': 'basic', **a} for a in okta_app.get('extra_attribute_statements') or []],
    }


def get_helpline_okta(code: str) -> dict | None:
    '''The helpline-level `okta` block from common.hcl ({ group_name, group_rule, ... }), or None.'''
    return _read_block(HELPLINES_DIR / code / 'common.hcl', 'okta')


def parse_app_label(label: str) -> dict | None:
    '''Defaults for helplines not yet configured in Terraform: parsed from the Okta app label itself.'''
    match = re.match(r'^(DEV_|STG_)?(.*?)\s*\(([^)]+)\)\s*$', label)
    if not match:
        return None
    return {
        'environment': {'DEV_': 'development', 'STG_': 'staging'}.get(match.group(1), 'production'),
        'app_name': match.group(2),
        'code': match.group(3).lower(),
    }


# ---- Twilio account SID --------------------------------------------------------------------

def resolve_account_sid(
    code: str,
    environment: str,
    account_sid: str | None = None,
    accounts_file: str | None = None,
) -> str | None:
    '''
    Account SID for a helpline + environment. Order: --account-sid, --accounts-file (private JSON
    { "<code>": { "staging": "AC...", "production": "AC..." } }), then AWS SSM (same secret Terraform reads).
    Only twilio_account_sid is taken from the SSM secret; nothing else is kept or printed.
    '''
    if account_sid:
        return account_sid
    if accounts_file:
        with open(accounts_file, encoding='utf-8') as f:
            sid = json.load(f).get(code, {}).get(environment)
        if sid:
            return sid
    try:
        ssm = boto3.client('ssm', config=Config(region_name='us-east-1'))
        raw = ssm.get_parameter(
            Name=f'/terraform/twilio-iac/{environment}/{code}/secrets.json',
            WithDecryption=True,
        )['Parameter']['Value']
        return json.loads(raw).get('twilio_account_sid')
    except Exception:
        return None
