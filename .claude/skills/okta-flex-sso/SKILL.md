---
name: okta-flex-sso
description: Set up, adopt, verify or audit the Okta SAML apps that log Aselo helplines into Twilio Flex (techmatters.okta.com). Use when asked to create Okta/SSO for a new helpline or environment, bring an existing helpline's Okta app under Terraform, check an app against the standard, migrate to the new attribute statements, or audit Okta/Flex SSO drift.
---

# Okta ⇄ Flex SSO

Full design and runbooks: `twilio-iac/docs/okta.md`. Read it before changing anything.
Scripts: `twilio-iac/scripts/okta/` (README there). Terraform: `twilio-iac/stages/okta-org` (Layer 1,
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

## Workflows

### New helpline (staging first, production near launch)

1. Add `okta = { group_name = "<Name> (<CODE>)" }` to `helplines/<code>/common.hcl` (copy from
   `helplines/baseline/`) and `okta_app = {}` to `staging.hcl`. Ask whether the helpline wants a
   group rule and which optional attributes (`labels`, `team`) it needs.
2. `cd twilio-iac/stages/okta-org && make plan`. Show it; it must only add this helpline's group and rule.
3. After the person applies: `cd ../okta-app && make plan HL=<code> HL_ENV=staging`. Show it.
4. After the person applies: run `node twilio-iac/scripts/okta/flexSsoHandoff.mjs --hl <code> --env staging`
   and give the person the 3 values. **Stop and wait**: they enter them in Twilio Console › Flex ›
   Users and access › Single sign-on (SSO). There is no API for this step.
5. When they confirm: `node twilio-iac/scripts/okta/verifySso.mjs --hl <code> --env staging --login`
   (needs `OKTA_TEST_USERNAME`/`OKTA_TEST_PASSWORD`; without them, run it without `--login`).
6. Production repeats 1 and 3–5 with `production.hcl` / `HL_ENV=production`, only when the person
   says the helpline is close to launch.

### Adopt an existing helpline

1. Check the current state: `node twilio-iac/scripts/okta/verifySso.mjs --hl <code> --env <env> --label "<label>"`.
2. Add `okta`/`okta_app` blocks with `import_existing = true`. Match reality: `label` if it doesn't
   follow the convention, `include_helpline_group = false` if the helpline group is intentionally not
   on staging, `optional_attribute_sets`, `extra_attribute_statements`.
3. Plan both stages. The goal is `N to import, 0 to change`. Explain every remaining change as either
   a real fix (trailing spaces, wrong groups) or config to adjust, and let the person decide.

### Verify / audit

- One app: `verifySso.mjs --hl <code> --env <env>`. Exit code 1 means errors.
- Whole org: `auditSsoDrift.mjs --out <file>.md`. Summarize errors first (wrong values, trailing
  spaces in names, groups, wrong Flex connection), then warnings.

### Move to the new attribute statements (federated claims)

Follow runbook D in `twilio-iac/docs/okta.md`: staging only, capture the assertion before and after,
and keep `attribute_statements_mode = "legacy"` as the rollback.

## What the person sees

Explain routing and access consequences in plain terms, e.g. "removing the helpline group from the
staging app means counsellors can no longer open Flex staging; only the people in the Tech Matters
groups can".
