# Okta / Flex SSO scripts

Read-only helpers for the Okta ⇄ Twilio Flex single sign-on process described in
[twilio-iac/docs/okta.md](../../../../docs/okta.md). Usable by a person or by an agent; every command
prints `--help`.

```bash
python3 twilio-iac/scripts/python_tools/oktaSso.py <command> --help
```

| Command | Step | What it does |
|---|---|---|
| `flex-sso-connection` | 1 | Shows the Flex SSO connection (`JQ...`) of a helpline's Twilio account and the URLs the Okta app must use |
| `flex-sso-handoff` | 3 | Prints the 4 values (friendly name = Okta app label, issuer, SSO URL, certificate) to paste into **Twilio Console › Flex › Single sign-on (SSO)** (the only manual step) |
| `verify-sso` | 4–6 | Checks the Okta app against the standard and the helpline config, checks it points at the right Flex connection, optionally logs in a test user and checks the real SAML assertion |
| `audit-sso-drift` | — | Runs the same checks for every Flex app in Okta and writes a Markdown report |
| `audit-group-rules` | — | Checks the group rules configured in `okta.group_rule` exist in Okta and match (they are created by hand: only Super/Org Admins can edit rules), and lists rules in Okta that are not in config |

Step 2 (creating/adopting the Okta app) is Terraform: the `okta-org` and `okta-app` stages.

Nothing runs these automatically (no CI, make target or stage). A person, or an agent following
the `okta-flex-sso` skill, runs them on their own machine during the steps above, because they use
that person's Okta and AWS credentials. They are not set up to run on the devops node or in the
Terraform container.

Python 3.11+ with the packages in [requirements.txt](../../requirements.txt) (`cryptography` signs the
Okta client assertion and DPoP proofs, `boto3` reads the account SID from SSM):

```bash
pip install -r twilio-iac/scripts/python_tools/requirements.txt
```

## Credentials

Never put credentials in this repo (it is public).

**Okta** — a read-only Okta API Services app (private key JWT + DPoP). Ask the Okta admins for one,
or use your own:

```bash
export OKTA_ORG_URL=https://techmatters.okta.com          # default
export OKTA_CLIENT_ID=<client id>                          # not a secret
export OKTA_PRIVATE_KEY_PATH=~/.okta/<app>.json            # RSA key, PEM or JWK, kept outside any repo
```

Required scopes: `okta.apps.read`, `okta.groups.read`, `okta.policies.read`. Admin role: Read-Only Administrator.

**Twilio account SIDs** (for the Flex connection check), first match wins:

1. `--account-sid AC...`
2. `--accounts-file <file>`: a private JSON file `{ "<code>": { "staging": "AC...", "production": "AC..." } }`
3. AWS SSM `/terraform/twilio-iac/<env>/<code>/secrets.json`, the same secret Terraform reads (needs AWS credentials; only `twilio_account_sid` is used)

**Test user** (only for `verify-sso --login`): `OKTA_TEST_USERNAME` / `OKTA_TEST_PASSWORD`, an
Okta user without MFA that is assigned to the app (e.g. through *Tech Matters - Test Accounts*). The
script stops before posting the assertion to Twilio, so no Flex worker is created or changed.

## Examples

```bash
cd twilio-iac/scripts/python_tools

./oktaSso.py flex-sso-connection --hl jm --env staging
./oktaSso.py flex-sso-handoff    --hl jm --env staging
./oktaSso.py verify-sso          --hl jm --env staging --login
./oktaSso.py audit-sso-drift     --out /tmp/okta-sso-audit.md
./oktaSso.py audit-group-rules   --hl jm,mt
```

Helplines without `okta` / `okta_app` config yet can still be checked: `--label "<Okta app label>"`
and, if they send the optional attributes, `--optional-sets labels,team`.

## Shared standard

The SAML attributes are defined once, in
[terraform-modules/okta/flex-saml-app/attribute-statements.json](../../../../terraform-modules/okta/flex-saml-app/attribute-statements.json),
and read by both the Terraform module and these scripts. Change attributes there.

## Code

| Module | |
|---|---|
| `commands.py` | The subcommands and their arguments |
| `okta_client.py` | Read-only Okta Management API client (private key JWT + DPoP, pagination, rate limits) |
| `helpline_config.py` | Reads `okta` / `okta_app` from `helplines/<code>/*.hcl` with the same rules as the `okta-app` stage; resolves account SIDs |
| `standard.py` | Checks an Okta app against the Flex SAML standard |
| `group_rules.py` | Renders and checks group rules (same expressions as the `okta-org` stage) |
| `saml_login.py` | Captures the SAML assertion for a test user without completing the Flex login |
| `flex.py` | Public Flex SSO connection lookup |
