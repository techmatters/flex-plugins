# The okta subcommands: read-only helpers for the Okta ⇄ Twilio Flex SSO process (twilio-iac/docs/okta.md).

import json
import re
import sys
from argparse import ArgumentParser, Namespace, RawDescriptionHelpFormatter
from datetime import datetime, timezone

from ..environments import ENVIRONMENT_HELP, parse_environment
from .flex import flex_audience, flex_callback_url, get_flex_sso_connection
from .group_rules import check_group_rule, fetch_group_rules, get_expected_group_rule
from .helpline_config import (get_expected_app, get_helpline_okta, list_helpline_codes, parse_app_label,
                              resolve_account_sid)
from .okta_client import find_app_by_label, okta_get
from .results import ICONS, has_errors, print_results, result, worst_severity
from .saml_login import capture_saml_assertion
from .standard import STANDARD_ATTRIBUTES, check_app, expected_attributes, find_connection_sid

def _codes_filter(hl: str | None) -> list[str] | None:
    return hl.lower().split(',') if hl else None


def _escape_markdown(text) -> str:
    return str(text).replace('|', '\\|')


def _write_report(path: str, lines: list[str]):
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'\n📄 {path}')


def _group_names(app_id: str) -> list[str]:
    assignments = okta_get(f'/api/v1/apps/{app_id}/groups?limit=200')
    return [okta_get(f'/api/v1/groups/{a["id"]}')['profile']['name'] for a in assignments]


def load_app_context(args: Namespace) -> dict:
    '''Expected settings (helpline config), the live Okta app, its groups and claims, and the Flex SSO connection.'''
    configured = get_expected_app(args.hl, args.env)
    expected = configured or {
        'code': args.hl,
        'environment': args.env,
        'label': args.label,
        'attribute_statements_mode': 'legacy',
        'optional_attribute_sets': args.optional_sets.split(',') if args.optional_sets else [],
        'extra_attribute_statements': [],
    }
    if not expected['label']:
        raise Exception(
            f'{args.hl}/{args.env} has no okta_app config in twilio-iac/helplines; pass --label "<Okta app label>"')

    app = find_app_by_label(expected['label'])
    account_sid = resolve_account_sid(args.hl, args.env, args.account_sid, args.accounts_file)
    flex_connection = get_flex_sso_connection(account_sid) if account_sid else None

    assigned_group_names = None
    federated_claims = []
    if app:
        assigned_group_names = _group_names(app['id'])
        federated_claims = okta_get(f'/api/v1/apps/{app["id"]}/federated-claims')

    return {
        'configured': configured is not None,
        'expected': expected,
        'app': app,
        'account_sid': account_sid,
        'flex_connection': flex_connection,
        'assigned_group_names': assigned_group_names,
        'federated_claims': federated_claims,
    }


# ---- flex-sso-connection (step 1) ----------------------------------------------------------

def flex_sso_connection(args: Namespace) -> int:
    account_sid = resolve_account_sid(args.hl, args.env, args.account_sid, args.accounts_file)
    if not account_sid:
        print('❌ Could not resolve the account SID (pass --account-sid, --accounts-file, or run with AWS credentials)',
              file=sys.stderr)
        return 1

    connection = get_flex_sso_connection(account_sid)
    if not connection:
        print(f'❌ No Flex SSO connection for {args.hl}/{args.env}. '
              'Open Twilio Console > Flex > Users and access > Single sign-on (SSO) once.', file=sys.stderr)
        return 1

    sid = connection['connection_sid']
    print(f'Flex SSO connection for {args.hl}/{args.env}: {sid} ({"active" if connection["active"] else "INACTIVE"})')
    print(f'  Okta "Single sign-on URL" / recipient / destination: {flex_callback_url(sid)}')
    print(f'  Okta "Audience URI (SP Entity ID)":                  {flex_audience(sid)}')
    return 0


# ---- flex-sso-handoff (step 3, the manual step) --------------------------------------------

def flex_sso_handoff(args: Namespace) -> int:
    ctx = load_app_context(args)
    app = ctx['app']
    if not app:
        print(f'❌ No active Okta app labelled "{ctx["expected"]["label"]}". Run the okta-app stage first.',
              file=sys.stderr)
        return 1

    metadata = okta_get(f'/api/v1/apps/{app["id"]}/sso/saml/metadata', accept='application/xml')
    issuer = re.search(r'entityID="([^"]+)"', metadata).group(1)
    sso_url = re.search(
        r'SingleSignOnService[^>]*Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"[^>]*Location="([^"]+)"',
        metadata).group(1)
    certificate = re.sub(r'\s+', '', re.search(r'<ds:X509Certificate>([\s\S]*?)</ds:X509Certificate>', metadata).group(1))
    pem = '\n'.join(['-----BEGIN CERTIFICATE-----']
                    + [certificate[i:i + 64] for i in range(0, len(certificate), 64)]
                    + ['-----END CERTIFICATE-----'])

    print(f'''
Okta app: {app["label"]}
Twilio account: {ctx["account_sid"] or "(unknown: pass --account-sid)"}

In Twilio Console for that account: Flex > Users and access > Single sign-on (SSO), enter:

  Friendly name:
    {app["label"]}

  Identity Provider Issuer:
    {issuer}

  Single Sign-on URL:
    {sso_url}

  X.509 Certificate (public, safe to copy):
{pem}
''')

    if ctx['flex_connection']:
        app_connection = find_connection_sid(app['settings']['signOn'].get('ssoAcsUrl'))
        account_connection = ctx['flex_connection']['connection_sid']
        print(f'{"✅" if app_connection == account_connection else "❌"} Okta app points at Flex connection '
              f'{app_connection}; the account\'s connection is {account_connection}')
    print(f'Afterwards run: ./oktaSso.py verify-sso --hl {args.hl} --env {args.env} [--login]')
    return 0


# ---- verify-sso (steps 4-6) ----------------------------------------------------------------

def verify_sso(args: Namespace) -> int:
    ctx = load_app_context(args)
    app = ctx['app']

    if not app:
        results = [result(f'Okta app "{ctx["expected"]["label"]}" exists and is active', False, 'not found')]
    else:
        results = check_app(
            app,
            ctx['expected'],
            flex_connection_sid=(ctx['flex_connection'] or {}).get('connection_sid'),
            assigned_group_names=ctx['assigned_group_names'] if ctx['configured'] else None,
            federated_claims=ctx['federated_claims'],
        )
        if ctx['flex_connection'] and not ctx['flex_connection']['active']:
            results.append(result('Flex SSO connection is active', False, ctx['flex_connection']['connection_sid']))
        if not ctx['configured']:
            results.append(result('Helpline has okta/okta_app config in twilio-iac', False, 'groups not checked',
                                  'warning'))

    # Group rules are created by hand (only Super/Org Admins can), so this is the reminder that it was done
    expected_rule = get_expected_group_rule(args.hl)
    if expected_rule:
        results.extend(check_group_rule(expected_rule, fetch_group_rules()))

    assertion = None
    if args.login and app:
        try:
            assertion = capture_saml_assertion(ctx['account_sid'])
            wanted = [a['name'] for a in expected_attributes(ctx['expected'])]
            received = list(assertion['attributes'])
            missing = [n for n in wanted if n not in received]
            extra = [n for n in received if n not in wanted]
            results.append(result(
                'Real SAML assertion carries the expected attributes',
                not missing and not extra,
                '; '.join(p for p in [missing and f'missing (or empty for this user): {", ".join(missing)}',
                                      extra and f'unexpected: {", ".join(extra)}'] if p),
            ))
        except Exception as e:
            results.append(result('Real SAML assertion captured', False, str(e)))

    if args.json:
        print(json.dumps({
            'helpline': args.hl,
            'environment': args.env,
            'label': ctx['expected']['label'],
            'results': results,
            'assertion': assertion,
        }, indent=2, ensure_ascii=False))
    else:
        print(f'Okta app {ctx["expected"]["label"]} ({args.hl}/{args.env})\n')
        print_results(results)
        if assertion:
            print('\nSAML assertion attributes for the test user:')
            for name, values in assertion['attributes'].items():
                print(f'  {json.dumps(name, ensure_ascii=False)}: {json.dumps(values, ensure_ascii=False)}')
    return 1 if has_errors(results) else 0


# ---- audit-sso-drift -----------------------------------------------------------------------

def audit_sso_drift(args: Namespace) -> int:
    only = _codes_filter(args.hl)
    known_codes = set(list_helpline_codes())
    apps = [a for a in okta_get('/api/v1/apps?limit=200') if a['status'] == 'ACTIVE' and a['signOnMode'] == 'SAML_2_0']

    rows = []
    for app in apps:
        sign_on = (app.get('settings') or {}).get('signOn') or {}
        parsed = parse_app_label(app['label'])
        is_flex_app = re.search(r'login\.flex\.\w+\.twilio\.com|iam\.twilio\.com', sign_on.get('ssoAcsUrl') or '')
        if not parsed or not is_flex_app or (only and parsed['code'] not in only):
            continue

        code, environment = parsed['code'], parsed['environment']
        configured = get_expected_app(code, environment) if code in known_codes else None
        # Not in Terraform yet: accept whichever optional attributes the app already sends
        sent_statements = sign_on.get('attributeStatements') or []
        sent_names = [a['name'].strip() for a in sent_statements]
        standard_names = [s['name'] for s in STANDARD_ATTRIBUTES]
        expected = configured or {
            'attribute_statements_mode': 'legacy',
            'optional_attribute_sets': [
                s['optional_set'] for s in STANDARD_ATTRIBUTES if s.get('optional_set') and s['name'] in sent_names],
            'extra_attribute_statements': [{
                'name': a['name'],
                'legacy': ','.join(a.get('values') or []),
                'namespace': a['namespace'].split(':')[-1],
            } for a in sent_statements if a['name'].strip() not in standard_names],
        }

        account_sid = resolve_account_sid(code, environment, None, args.accounts_file) if code in known_codes else None
        try:
            flex_connection = get_flex_sso_connection(account_sid) if account_sid else None
        except Exception:
            flex_connection = None
        try:
            federated_claims = okta_get(f'/api/v1/apps/{app["id"]}/federated-claims')
        except Exception:
            federated_claims = []

        results = check_app(
            app,
            expected,
            flex_connection_sid=(flex_connection or {}).get('connection_sid'),
            assigned_group_names=_group_names(app['id']) if configured else None,
            federated_claims=federated_claims,
        )
        if 'iam.twilio.com' in (sign_on.get('ssoAcsUrl') or ''):
            results.append(result('Uses Enhanced (login.flex) SSO', False, 'legacy iam.twilio.com SSO', 'warning'))
        rows.append({'app': app, 'code': code, 'environment': environment, 'configured': configured is not None,
                     'results': results})
        print('.', end='', flush=True)
    print('\n')

    def describe(results: list[dict], severity: str) -> str:
        text = '<br>'.join(f'{r["check"]}{": " + r["detail"] if r["detail"] else ""}'
                           for r in results if r['severity'] == severity)
        return _escape_markdown(text) or '—'

    rows.sort(key=lambda row: (row['code'], row['environment']))
    if args.out:
        without_errors = len([row for row in rows if not has_errors(row['results'])])
        _write_report(args.out, [
            '# Okta Flex SSO audit',
            '',
            f'Generated {datetime.now(timezone.utc).isoformat()} · {len(rows)} apps · {without_errors} without errors',
            '',
            '| Helpline | Env | Okta app | In Terraform config | Errors | Warnings |',
            '|---|---|---|---|---|---|',
        ] + [
            f'| {row["code"]} | {row["environment"]} | {row["app"]["label"]} | {"yes" if row["configured"] else "no"} '
            f'| {describe(row["results"], "error")} | {describe(row["results"], "warning")} |'
            for row in rows
        ])

    for row in rows:
        bad = [r for r in row['results'] if r['severity'] != 'ok']
        print(f'{ICONS[worst_severity(bad)]} {row["code"]}/{row["environment"]} {row["app"]["label"]}')
        for r in bad:
            print(f'     {ICONS[r["severity"]]} {r["check"]}{": " + r["detail"] if r["detail"] else ""}')
    return 0


# ---- audit-group-rules ---------------------------------------------------------------------

def audit_group_rules(args: Namespace) -> int:
    only = _codes_filter(args.hl)
    codes = [c for c in list_helpline_codes() if c != 'baseline' and (not only or c in only)]
    rules = fetch_group_rules()

    rows = []
    configured_groups = set()
    for code in codes:
        okta = get_helpline_okta(code)
        if not okta:
            continue
        group = okta['group_name']
        configured_groups.add(group)
        expected = get_expected_group_rule(code)

        if expected:
            results = check_group_rule(expected, rules)
        else:
            # No rule configured: warn if Okta has one for this group anyway (it would be invisible in config)
            extra = [r for r in rules if group in r['group_names']]
            if extra:
                found = '; '.join(f'"{r["name"]}" ({r["status"]}): {r["expression"]}' for r in extra)
                results = [result('No group rule configured', False, f'but Okta has {found}. Add it to okta.group_rule',
                                  'warning')]
            else:
                results = [result('No group rule configured or in Okta (members added by hand)', True)]
        rows.append({'code': code, 'group': group, 'results': results})

    # Rules in Okta that target helpline groups not (yet) configured in twilio-iac
    unconfigured = [] if only else [
        r for r in rules
        if any(re.search(r'\([A-Z]+\)\s*$', g) and g not in configured_groups for g in r['group_names'])]

    for row in rows:
        print(f'{ICONS[worst_severity(row["results"])]} {row["code"]} ({row["group"]})')
        for r in row['results']:
            if r['severity'] != 'ok':
                print(f'     {ICONS[r["severity"]]} {r["check"]}: {r["detail"]}')
    if unconfigured:
        print('\nRules in Okta for helpline groups without okta config in twilio-iac (adopt them with runbook B):')
        for r in unconfigured:
            print(f'  - "{r["name"]}" ({r["status"]}) → {", ".join(r["group_names"])}: {r["expression"]}')

    if args.out:
        def status_cell(bad: list[dict]) -> str:
            return ' '.join(ICONS[r['severity']].strip() for r in bad) if bad else '✅'

        lines = [
            '# Okta group rules audit',
            '',
            f'Generated {datetime.now(timezone.utc).isoformat()}',
            '',
            '| Helpline | Group | Status | Details |',
            '|---|---|---|---|',
        ]
        for row in rows:
            bad = [r for r in row['results'] if r['severity'] != 'ok']
            details = '<br>'.join(f'{r["check"]}: {r["detail"]}' for r in bad) or '—'
            lines.append(f'| {row["code"]} | {_escape_markdown(row["group"])} | {status_cell(bad)} '
                         f'| {_escape_markdown(details)} |')
        lines += ['', '## Rules for helpline groups not configured in twilio-iac', '']
        if unconfigured:
            lines += ['| Rule | Status | Group | Expression |', '|---|---|---|---|'] + [
                f'| {_escape_markdown(r["name"])} | {r["status"]} | {_escape_markdown(", ".join(r["group_names"]))} '
                f'| `{_escape_markdown(r["expression"])}` |' for r in unconfigured]
        else:
            lines.append('None.')
        _write_report(args.out, lines)

    return 1 if any(has_errors(row['results']) for row in rows) else 0


# ---- argument parsing ----------------------------------------------------------------------

ACCOUNT_SID_HELP = 'The account SID comes from --account-sid, --accounts-file or AWS SSM (/terraform/twilio-iac/<env>/<hl>/secrets.json).'


def _add_helpline_args(parser: ArgumentParser):
    parser.add_argument('--hl', required=True, type=str.lower, help='helpline short code, e.g. jm')
    parser.add_argument('--env', required=True, type=parse_environment,
                        help=ENVIRONMENT_HELP)
    parser.add_argument('--account-sid', help='Twilio account SID (otherwise --accounts-file or AWS SSM)')
    _add_accounts_file_arg(parser)


def _add_accounts_file_arg(parser: ArgumentParser):
    parser.add_argument('--accounts-file',
                        help='private JSON { "<code>": { "development": "AC...", "staging": "AC...", "production": "AC..." } }')


def _add_label_args(parser: ArgumentParser):
    parser.add_argument('--label', help='Okta app label, for helplines without okta config in twilio-iac/helplines')
    parser.add_argument('--optional-sets',
                        help='optional standard attributes (e.g. labels,team), for helplines without okta config')


def _build_parser() -> ArgumentParser:
    parser = ArgumentParser(
        prog='oktaSso.py',
        description='Read-only helpers for the Okta ⇄ Twilio Flex SSO process (twilio-iac/docs/okta.md).',
    )
    subparsers = parser.add_subparsers(dest='command', required=True)

    def add_command(name: str, handler, description: str) -> ArgumentParser:
        command = subparsers.add_parser(name, description=description, help=description.split('\n')[0],
                                        formatter_class=RawDescriptionHelpFormatter)
        command.set_defaults(handler=handler)
        return command

    command = add_command('flex-sso-connection', flex_sso_connection,
                          'Step 1: print the Flex SSO connection id of the helpline\'s Twilio account and the URLs '
                          'the Okta app must use.\n' + ACCOUNT_SID_HELP)
    _add_helpline_args(command)

    command = add_command('flex-sso-handoff', flex_sso_handoff,
                          'Step 3: print the Friendly name, Identity Provider Issuer, Single Sign-on URL and X.509 '
                          'certificate of the helpline\'s Okta app,\nready to paste into the Flex SSO page, plus the '
                          'Flex connection check.\nFriendly name standard: the Okta app label (e.g. "STG_SafeSpot (JM)"), '
                          'which also matches the Twilio account name.')
    _add_helpline_args(command)
    _add_label_args(command)

    command = add_command('verify-sso', verify_sso,
                          'Steps 4-6: check the helpline\'s Okta app against the standard and its configuration, check '
                          'it points at the right Flex connection,\nand optionally capture the real SAML assertion for '
                          'a test user. Exit code 1 when any check fails.')
    _add_helpline_args(command)
    _add_label_args(command)
    command.add_argument('--login', action='store_true',
                         help='also log in as OKTA_TEST_USERNAME / OKTA_TEST_PASSWORD (no MFA) and check the attributes '
                              'in the real SAML assertion. Does not complete the Flex login.')
    command.add_argument('--json', action='store_true', help='machine-readable output')

    command = add_command('audit-sso-drift', audit_sso_drift,
                          'Check every active Okta SAML app labelled "<name> (<CODE>)" / "STG_<name> (<CODE>)" / "DEV_<name> (<CODE>)".\n'
                          'Account SIDs (for the Flex connection check) come from --accounts-file or AWS SSM; without '
                          'them that check is skipped.')
    command.add_argument('--hl', help='only these helplines, comma separated (e.g. jm,mt)')
    _add_accounts_file_arg(command)
    command.add_argument('--out', help='also write a Markdown report to this file')

    command = add_command('audit-group-rules', audit_group_rules,
                          'Check every helpline with okta.group_rule in twilio-iac/helplines/<code>/common.hcl against '
                          'Okta, and list rules in Okta\nthat assign to a helpline group but are not in the configuration. '
                          'Exit code 1 when a configured rule is missing, different or inactive.')
    command.add_argument('--hl', help='only these helplines, comma separated (e.g. jm,asop)')
    command.add_argument('--out', help='also write a Markdown report to this file')

    return parser


def main():
    # The output uses emoji; don't crash on consoles/pipes with a legacy default encoding
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    args = _build_parser().parse_args()
    sys.exit(args.handler(args))
