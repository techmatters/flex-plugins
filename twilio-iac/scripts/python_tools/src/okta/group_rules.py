# Group rules: configured in helplines/<code>/common.hcl (okta.group_rule) but created by a person
# in Okta, because only Super Admins / Org Admins can edit rules. These helpers check that what is in
# Okta matches the configuration.

from .helpline_config import get_helpline_okta
from .okta_client import okta_get
from .results import result


def render_rule_expression(rule: dict) -> str:
    '''Okta expression for a structured rule. Same output as terraform-modules/stages/okta-org/main.tf.'''
    if rule.get('expression'):
        return rule['expression']
    if rule.get('organizations'):
        return ' OR '.join(f'user.organization=="{org}"' for org in rule['organizations'])
    return ' OR '.join(f'String.stringContains(user.email,"{domain}")' for domain in rule['email_domains'])


def get_expected_group_rule(code: str) -> dict | None:
    '''{ code, rule_name, group_name, expression } for a helpline with okta.group_rule, otherwise None.'''
    okta = get_helpline_okta(code)
    if not okta or not okta.get('group_rule'):
        return None
    rule = okta['group_rule']
    kinds = [k for k in ('email_domains', 'organizations', 'expression') if k in rule]
    if len(kinds) != 1:
        raise Exception(
            f'{code}: okta.group_rule must set exactly one of email_domains, organizations or expression')
    return {
        'code': code,
        'rule_name': (rule.get('name') or okta['group_name'])[:50],
        'group_name': okta['group_name'],
        'expression': render_rule_expression(rule),
    }


def fetch_group_rules() -> list[dict]:
    '''All group rules in the org with their target group names resolved.'''
    rules = okta_get('/api/v1/groups/rules?limit=200')

    def group_ids(rule: dict) -> list[str]:
        return ((rule.get('actions') or {}).get('assignUserToGroups') or {}).get('groupIds') or []

    group_name_by_id = {}
    for group_id in {group_id for rule in rules for group_id in group_ids(rule)}:
        try:
            group_name_by_id[group_id] = okta_get(f'/api/v1/groups/{group_id}')['profile']['name']
        except Exception:
            group_name_by_id[group_id] = f'(deleted group {group_id})'

    return [{
        'id': rule['id'],
        'name': rule['name'],
        'status': rule['status'],
        'expression': (((rule.get('conditions') or {}).get('expression') or {}).get('value')) or '',
        'group_names': [group_name_by_id[group_id] for group_id in group_ids(rule)],
    } for rule in rules]


def _manual_steps(expected: dict) -> str:
    return (
        f'create it in Okta Admin › Directory › Groups › Rules › Add rule: name "{expected["rule_name"]}", '
        f'"Use Okta Expression Language": {expected["expression"]} , assign to "{expected["group_name"]}", then Activate'
    )


def check_group_rule(expected: dict, rules: list[dict]) -> list[dict]:
    '''Check one helpline's expected rule against the rules in Okta. Returns a list of results.'''
    targeting = [r for r in rules if expected['group_name'] in r['group_names']]
    if not targeting:
        return [result('Group rule exists in Okta', False,
                       f'no rule assigns to "{expected["group_name"]}": {_manual_steps(expected)}')]

    matching = next((r for r in targeting if r['expression'] == expected['expression']), None)
    if not matching:
        found = '; '.join(f'"{r["name"]}": {r["expression"]}' for r in targeting)
        return [result('Group rule expression matches the configuration', False,
                       f'Okta has {found}; config expects {expected["expression"]}')]

    results = [result('Group rule exists and matches the configuration', True, matching['name'])]
    if matching['status'] != 'ACTIVE':
        results.append(result('Group rule is active', False,
                              f'"{matching["name"]}" is {matching["status"]}: activate it in Okta'))
    if matching['name'] != expected['rule_name']:
        results.append(result('Group rule name matches', False,
                              f'"{matching["name"]}" (config: "{expected["rule_name"]}")', 'warning'))
    return results
