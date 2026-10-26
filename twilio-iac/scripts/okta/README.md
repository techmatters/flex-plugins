# Okta / Flex SSO scripts

Read-only helpers for the Okta ⇄ Twilio Flex single sign-on process described in
[twilio-iac/docs/okta.md](../../docs/okta.md). Usable by a person or by an agent; every script
prints `--help`.

| Script | Step | What it does |
|---|---|---|
| `flexSsoConnection.mjs` | 1 | Shows the Flex SSO connection (`JQ...`) of a helpline's Twilio account and the URLs the Okta app must use |
| `flexSsoHandoff.mjs` | 3 | Prints the 4 values (friendly name = Okta app label, issuer, SSO URL, certificate) to paste into **Twilio Console › Flex › Single sign-on (SSO)** (the only manual step) |
| `verifySso.mjs` | 4–6 | Checks the Okta app against the standard and the helpline config, checks it points at the right Flex connection, optionally logs in a test user and checks the real SAML assertion |
| `auditSsoDrift.mjs` | — | Runs the same checks for every Flex app in Okta and writes a Markdown report |

Step 2 (creating/adopting the Okta app) is Terraform: the `okta-org` and `okta-app` stages.

No `npm install` needed: Node 18+ only (built-in `fetch` and `crypto`).

## Credentials

Never put credentials in this repo (it is public).

**Okta** — a read-only Okta API Services app (private key JWT + DPoP). Ask the Okta admins for one,
or use your own:

```bash
export OKTA_ORG_URL=https://techmatters.okta.com          # default
export OKTA_CLIENT_ID=<client id>                          # not a secret
export OKTA_PRIVATE_KEY_PATH=~/.okta/<app>.json            # PEM or JWK, kept outside any repo
```

Required scopes: `okta.apps.read`, `okta.groups.read`, `okta.policies.read`. Admin role: Read-Only Administrator.

**Twilio account SIDs** (for the Flex connection check), first match wins:

1. `--account-sid AC...`
2. `--accounts-file <file>`: a private JSON file `{ "<code>": { "staging": "AC...", "production": "AC..." } }`
3. AWS SSM `/terraform/twilio-iac/<env>/<code>/secrets.json`, the same secret Terraform reads (needs AWS credentials; only `twilio_account_sid` is used)

**Test user** (only for `verifySso.mjs --login`): `OKTA_TEST_USERNAME` / `OKTA_TEST_PASSWORD`, an
Okta user without MFA that is assigned to the app (e.g. through *Tech Matters - Test Accounts*). The
script stops before posting the assertion to Twilio, so no Flex worker is created or changed.

## Examples

```bash
cd twilio-iac/scripts/okta

node flexSsoConnection.mjs --hl jm --env staging
node flexSsoHandoff.mjs   --hl jm --env staging
node verifySso.mjs        --hl jm --env staging --login
node auditSsoDrift.mjs    --out /tmp/okta-sso-audit.md
```

Helplines without `okta` / `okta_app` config yet can still be checked: `--label "<Okta app label>"`
and, if they send the optional attributes, `--optional-sets labels,team`.

## Shared standard

The SAML attributes are defined once, in
[terraform-modules/okta/flex-saml-app/attribute-statements.json](../../terraform-modules/okta/flex-saml-app/attribute-statements.json),
and read by both the Terraform module and these scripts. Change attributes there.
