# Check results shared by the okta scripts: { check, ok, detail, severity } with severity ok | warning | error.

ICONS = {'ok': '✅', 'warning': '⚠️ ', 'error': '❌'}


def result(check: str, ok: bool, detail: str = '', severity: str = 'error') -> dict:
    return {'check': check, 'ok': ok, 'detail': detail, 'severity': 'ok' if ok else severity}


def worst_severity(results: list[dict]) -> str:
    severities = {r['severity'] for r in results}
    return 'error' if 'error' in severities else 'warning' if 'warning' in severities else 'ok'


def has_errors(results: list[dict]) -> bool:
    return any(r['severity'] == 'error' for r in results)


def print_results(results: list[dict]):
    for r in results:
        if r['detail'] and r['severity'] != 'ok':
            print(f'{ICONS[r["severity"]]} {r["check"]}\n     {r["detail"]}')
        elif r['detail']:
            print(f'{ICONS[r["severity"]]} {r["check"]}  ({r["detail"]})')
        else:
            print(f'{ICONS[r["severity"]]} {r["check"]}')
