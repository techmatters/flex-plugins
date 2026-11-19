---
name: okta-flex-sso
description: Set up, adopt, verify or audit the Okta SAML apps that log Aselo helplines into Twilio Flex (techmatters.okta.com). Use when asked to create Okta/SSO for a new helpline or environment, bring an existing helpline's Okta app under Terraform, check an app against the standard, migrate to the new attribute statements, or audit Okta/Flex SSO drift.
---

# Okta ⇄ Flex SSO

Full design and runbooks: `twilio-iac/docs/okta.md`. Read it before changing anything.
Scripts: `twilio-iac/scripts/python_tools/oktaSso.py` (README in `src/okta/`). Terraform: `twilio-iac/stages/okta-org` (Layer 1,
helpline groups) and `twilio-iac/stages/okta-app` (Layer 2, one app per helpline + environment).

## Hard rules

- **Never run `apply`, `import`, `destroy` or state commands.** Only `make plan`. The person applies.
- Okta and Twilio access from scripts is read-only. Never print private keys, tokens or passwords;
  refer to key files by path only.
- This repo is public: never commit account SIDs, Okta app/group ids, client ids or `JQ...` ids.
  Terraform and the scripts look these up at run time.
- Run one `make plan` at a time and show the result before running the next.
- Helpline-level settings go in `common.hcl` (`okta = {...}`), environment-level ones in
  `<env>.hcl` (`okta_app = {...}`). Never duplicate them into both environment files.

## Running the scripts

`oktaSso.py` runs locally (not on the devops node, not in the Terraform container): it needs the
person's Okta and AWS credentials. Before the first command:

1. Install once: `pip install -r twilio-iac/scripts/python_tools/requirements.txt` (Python 3.11+).
2. Check the variables are set, by name only (never print values): `OKTA_CLIENT_ID`,
   `OKTA_PRIVATE_KEY_PATH` (optional `OKTA_ORG_URL`, `OKTA_KEY_ID`). If missing, stop and ask the
   person; setup is in the scripts README "Credentials".
3. The account SID comes from AWS SSM; without AWS credentials pass `--account-sid AC...` (ask the
   person) or the Flex connection check is skipped with a warning.

`python3 twilio-iac/scripts/python_tools/oktaSso.py <command> --help` lists every option.

## Workflows

### New helpline (staging first, production near launch)

1. Add `okta = { group_name = "<Name> (<CODE>)" }` to `helplines/<code>/common.hcl` (copy from
   `helplines/baseline/`) and `okta_app = {}` to `staging.hcl`. Ask whether the helpline wants a
   group rule (`group_rule = { organizations = [...] }`, `{ email_domains = ["@..."] }` or
   `{ expression = "..." }`) and which optional attributes (`labels`, `team`) it needs.
2. `cd twilio-iac/stages/okta-org && make plan`. Show it; it must only add this helpline's group.
   **If there is a group rule, remind the person**: Terraform does not create rules (only Super/Org
   Admins can). Give them the name, group and expression from the `group_rules` output and the steps
   in docs/okta.md "Group rules"; `oktaSso.py verify-sso` fails until the rule exists.
3. After the person applies: `cd ../okta-app && make plan HL=<code> HL_ENV=staging`. Show it.
4. After the person applies: run `python3 twilio-iac/scripts/python_tools/oktaSso.py flex-sso-handoff --hl <code> --env staging`
   and give the person the 4 values (friendly name = Okta app label, issuer, SSO URL, certificate). **Stop and wait**: they enter them in Twilio Console › Flex ›
   Users and access › Single sign-on (SSO). There is no API for this step.
5. When they confirm: `python3 twilio-iac/scripts/python_tools/oktaSso.py verify-sso --hl <code> --env staging --login`
   (needs `OKTA_TEST_USERNAME`/`OKTA_TEST_PASSWORD`; without them, run it without `--login`).
6. Production repeats 1 and 3–5 with `production.hcl` / `HL_ENV=production`, only when the person
   says the helpline is close to launch.
7. A development environment (internal dev account) repeats 1 and 3–5 with `development.hcl` /
   `HL_ENV=development` / `--env development`: the app is labelled `DEV_<app_name> (<CODE>)` and gets
   the staging groups.

### Adopt an existing helpline

1. Check the current state: `python3 twilio-iac/scripts/python_tools/oktaSso.py verify-sso --hl <code> --env <env> --label "<label>"`.
2. Add `okta`/`okta_app` blocks with `import_existing = true`. Match reality: `label` if it doesn't
   follow the convention, `include_helpline_group = false` if the helpline group is intentionally not
   on staging, `optional_attribute_sets`, `extra_attribute_statements`.
3. Plan both stages. The goal is `N to import, 0 to change`. Explain every remaining change as either
   a real fix (trailing spaces, wrong groups) or config to adjust, and let the person decide.

### Verify / audit

- One app: `oktaSso.py verify-sso --hl <code> --env <env>`. Exit code 1 means errors.
- Whole org: `oktaSso.py audit-sso-drift --out <file>.md`. Summarize errors first (wrong values, trailing
  spaces in names, groups, wrong Flex connection), then warnings.
- Group rules: `oktaSso.py audit-group-rules [--hl <codes>] [--out <file>.md]`. Missing/different/inactive
  configured rules are errors; rules in Okta that are not in config are listed for adoption.

### Move to the new attribute statements (federated claims)

Follow runbook D in `twilio-iac/docs/okta.md`: staging only, capture the assertion before and after,
and keep `attribute_statements_mode = "legacy"` as the rollback.

## What the person sees

Explain routing and access consequences in plain terms, e.g. "removing the helpline group from the
staging app means counsellors can no longer open Flex staging; only the people in the Tech Matters
groups can".
