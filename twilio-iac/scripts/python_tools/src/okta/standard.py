# Checks an Okta app (as returned by GET /api/v1/apps/{id}) against the Aselo Flex SAML standard.
# The attribute list comes from the same JSON file the flex-saml-app Terraform module uses.

import json
import re

from .flex import flex_audience, flex_callback_url
from .helpline_config import TWILIO_IAC_DIR
from .results import result

STANDARD_FILE = TWILIO_IAC_DIR / 'terraform-modules' / 'okta' / 'flex-saml-app' / 'attribute-statements.json'
STANDARD_ATTRIBUTES: list[dict] = json.loads(STANDARD_FILE.read_text(encoding='utf-8'))['attributes']

NAMESPACE_URNS = {
    'basic': 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
    'uri': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
    'unspecified': 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
}

# Fixed SAML settings every Flex app must have (same values as terraform-modules/okta/flex-saml-app/main.tf)
REQUIRED_SIGN_ON = {
    'signatureAlgorithm': 'RSA_SHA256',
    'digestAlgorithm': 'SHA256',
    'responseSigned': True,
    'assertionSigned': True,
    'subjectNameIdFormat': 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    'subjectNameIdTemplate': '${user.userName}',
    'idpIssuer': 'http://www.okta.com/${org.externalKey}',
    'authnContextClassRef': 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
    'honorForceAuthn': True,
}


def expected_attributes(expected: dict) -> list[dict]:
    '''Attributes an app should send, in order: standard (+ optional sets) then helpline extras.'''
    optional_sets = expected.get('optional_attribute_sets') or []
    return [
        a for a in STANDARD_ATTRIBUTES if not a.get('optional_set') or a['optional_set'] in optional_sets
    ] + [{'namespace': 'basic', **a} for a in expected.get('extra_attribute_statements') or []]


def find_connection_sid(url: str | None) -> str | None:
    match = re.search(r'connection=(JQ[0-9a-f]{32})', url or '')
    return match.group(1) if match else None


def _join(*parts) -> str:
    return '; '.join(p for p in parts if p)


def check_app(
    app: dict,
    expected: dict,
    flex_connection_sid: str | None = None,
    assigned_group_names: list[str] | None = None,
    federated_claims: list[dict] | None = None,
) -> list[dict]:
    '''
    app       Okta app object
    expected  { attribute_statements_mode, optional_attribute_sets, extra_attribute_statements, group_names (optional) }
    Returns a list of { check, ok, detail, severity }.
    '''
    federated_claims = federated_claims or []
    results = []
    sign_on = (app.get('settings') or {}).get('signOn') or {}

    results.append(result('App is an active SAML 2.0 app',
                          app['status'] == 'ACTIVE' and app['signOnMode'] == 'SAML_2_0',
                          f'{app["status"]} {app["signOnMode"]}'))

    wrong_settings = [
        f'{key}={json.dumps(sign_on.get(key))} (expected {json.dumps(value)})'
        for key, value in REQUIRED_SIGN_ON.items() if sign_on.get(key) != value
    ]
    if (sign_on.get('assertionEncryption') or {}).get('enabled'):
        wrong_settings.append('assertionEncryption enabled (Flex does not support it)')
    results.append(result('SAML security settings (SHA-256, signed response + assertion)',
                          not wrong_settings, '; '.join(wrong_settings)))

    # Flex connection: the app must point at the Flex SSO connection of its Twilio account
    url_connection = find_connection_sid(sign_on.get('ssoAcsUrl'))
    if flex_connection_sid:
        urls_ok = all(sign_on.get(k) == flex_callback_url(flex_connection_sid)
                      for k in ('ssoAcsUrl', 'recipient', 'destination'))
        audience_ok = sign_on.get('audience') == flex_audience(flex_connection_sid)
        results.append(result(
            'Points at the Flex SSO connection of its Twilio account',
            urls_ok and audience_ok,
            flex_connection_sid if urls_ok and audience_ok
            else f'app uses {url_connection or sign_on.get("ssoAcsUrl")}, Flex account has {flex_connection_sid}',
        ))
    else:
        results.append(result('Points at the Flex SSO connection of its Twilio account', False,
                              f'not checked (no account SID); app uses {url_connection or sign_on.get("ssoAcsUrl")}',
                              'warning'))

    # Attributes
    wanted = expected_attributes(expected)
    wanted_names = [a['name'] for a in wanted]
    legacy = sign_on.get('attributeStatements') or []
    mode = expected.get('attribute_statements_mode') or 'legacy'

    bad_names = [n for n in [a['name'] for a in legacy] + [c['name'] for c in federated_claims] if n != n.strip()]
    results.append(result('No leading/trailing spaces in attribute names', not bad_names,
                          ', '.join(json.dumps(n) for n in bad_names)))

    if mode == 'legacy':
        # Compare by trimmed name; whitespace in names is reported by the check above
        by_name = {a['name'].strip(): a for a in legacy}
        errors = []
        warnings = []
        for want in wanted:
            actual = by_name.get(want['name'])
            if not actual:
                errors.append(f'missing {want["name"]}')
                continue
            value = ','.join(actual.get('values') or [])
            if value.strip() != want['legacy']:
                errors.append(f'{want["name"]} = {json.dumps(value)} (expected {json.dumps(want["legacy"])})')
            elif value != want['legacy']:
                warnings.append(f'{want["name"]} value has extra whitespace {json.dumps(value)}')
            if actual.get('namespace') != NAMESPACE_URNS[want['namespace']]:
                warnings.append(
                    f'{want["name"]} name format {(actual.get("namespace") or "").split(":")[-1]} (expected {want["namespace"]})')
        unexpected = [name for name in by_name if name not in wanted_names]
        if unexpected:
            errors.append(f'not in config: {", ".join(unexpected)}')
        results.append(result('Attribute statements (legacy) match the standard', not errors, '; '.join(errors)))
        results.append(result('Attribute values and name formats are clean', not warnings, '; '.join(warnings),
                              'warning'))

        # Only meaningful when the set matches
        order_ok = bool(errors) or list(by_name) == wanted_names
        results.append(result('Attribute statements in standard order', order_ok,
                              '' if order_ok else 'order differs (cosmetic)', 'warning'))
        results.append(result('No new-style attribute statements (federated claims)', not federated_claims,
                              ', '.join(c['name'] for c in federated_claims), 'warning'))
    else:
        actual = {c['name']: c.get('expression') for c in federated_claims}
        missing = [a['name'] for a in wanted if actual.get(a['name']) != a['federated']]
        unexpected = [name for name in actual if name not in wanted_names]
        results.append(result(
            'Attribute statements (federated claims) match the standard',
            not missing and not unexpected,
            _join(missing and f'missing/different: {", ".join(missing)}',
                  unexpected and f'not in config: {", ".join(unexpected)}'),
        ))
        results.append(result('No legacy attribute statements left (would be sent twice)', not legacy,
                              ', '.join(a['name'] for a in legacy)))

    # Groups
    if expected.get('group_names') and assigned_group_names is not None:
        missing = [g for g in expected['group_names'] if g not in assigned_group_names]
        unexpected = [g for g in assigned_group_names if g not in expected['group_names']]
        results.append(result(
            'Group assignments match the configuration',
            not missing and not unexpected,
            _join(missing and f'missing: {", ".join(missing)}', unexpected and f'unexpected: {", ".join(unexpected)}'),
        ))

    return results
