# Creates the form definitions of a new helpline from the baseline (form-definitions/as/v3):
# copies it to form-definitions/<code>/v1, renames the helpline in HelplineInformation and
# IssueCategorizationTab, and registers <code>-v1 in the validation tests. Local files only.

import json
import re
import shutil
from pathlib import Path

from .paths import FORM_DEFINITIONS_PACKAGE_DIR, REPO_ROOT

BASELINE_NAME = 'Baseline Helpline'
BASELINE_DIR = FORM_DEFINITIONS_PACKAGE_DIR / 'form-definitions' / 'as' / 'v3'
DEFINITION_VERSION_ID_FILE = FORM_DEFINITIONS_PACKAGE_DIR / 'src' / '__tests__' / 'definitionVersionId.ts'


def _read_json(file: Path):
    return json.loads(file.read_text(encoding='utf-8'))


def _write_json(file: Path, data):
    file.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8', newline='\n')


def _register_definition_version(code: str, helpline: str):
    '''Adds <code>-v1 to the DefinitionVersionId enum so `npm test` validates the new definitions.'''
    source = DEFINITION_VERSION_ID_FILE.read_bytes().decode('utf-8')
    if f"'{code}-v1'" in source:
        return
    eol = '\r\n' if '\r\n' in source else '\n'
    enum_key = f'{re.sub(r"[^a-z0-9]", "", code)}V1'
    updated = re.sub(r'\n}\s*$', f"\n  {enum_key} = '{code}-v1', // {helpline} v1{eol}}}{eol}", source)
    DEFINITION_VERSION_ID_FILE.write_bytes(updated.encode('utf-8'))


def new_helpline_forms(code: str, helpline: str) -> int:
    target_dir = FORM_DEFINITIONS_PACKAGE_DIR / 'form-definitions' / code / 'v1'
    relative_target = target_dir.relative_to(REPO_ROOT).as_posix()
    if target_dir.exists():
        print(f'{relative_target} already exists, not overwriting it.')
        return 1

    shutil.copytree(BASELINE_DIR, target_dir)
    (target_dir / 'README.md').unlink(missing_ok=True)

    # Helpline name: HelplineInformation + the categories key
    info_file = target_dir / 'HelplineInformation.json'
    info = _read_json(info_file)
    info['helplines'] = [
        {**h, 'label': helpline, 'value': helpline} if h.get('value') == BASELINE_NAME else h
        for h in info['helplines']
    ]
    _write_json(info_file, info)

    categories_file = target_dir / 'tabbedForms' / 'IssueCategorizationTab.json'
    _write_json(categories_file, {helpline: _read_json(categories_file)[BASELINE_NAME]})

    _register_definition_version(code, helpline)

    print(f'''Created {relative_target} from the baseline (as/v3) for "{helpline}".

Next:
  1. Set "definitionVersion": "{code}-v1" in twilio-iac/helplines/{code}/configs/service-configuration/common.json
  2. Fill in HelplineInformation.json (manager name, phone, email) and adapt the forms to the helpline
  3. cd lambdas/packages/hrm-form-definitions && npm test -- validateDefinitions   (must pass)
  4. Deploy: GitHub Actions › "Deploy form-definitions to S3" with helpline_code={code}''')
    return 0
