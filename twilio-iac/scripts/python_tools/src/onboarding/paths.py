from pathlib import Path

# src/onboarding -> src -> python_tools -> scripts -> twilio-iac -> repository root
TWILIO_IAC_DIR = Path(__file__).resolve().parents[4]
REPO_ROOT = TWILIO_IAC_DIR.parent
HELPLINES_DIR = TWILIO_IAC_DIR / 'helplines'
FORM_DEFINITIONS_PACKAGE_DIR = REPO_ROOT / 'lambdas' / 'packages' / 'hrm-form-definitions'
