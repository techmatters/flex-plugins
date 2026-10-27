# Provisioning a new helpline account

End-to-end steps to bring up a new Aselo helpline environment (Twilio Flex account + Okta SSO +
deployments). Written to be followed by a **person**, a **Claude agent**, or both together.

Each step is marked with who does it:

| Mark | Meaning |
|---|---|
| 🧑 | **Person**: needs a console, a decision, credentials or an approval only a person has |
| 🤖 | **Agent**: can be done by a coding agent (edit files, run `make plan`, run read-only scripts) |
| 🤝 | **Agent prepares, person executes**: the agent writes the change / prints the values, a person applies, deploys or pastes them |

A person can do every 🤖 step too. Claude Code agents run this guide through the **`new-helpline`**
skill (`.claude/skills/new-helpline/`), which uses the **`okta-flex-sso`** skill for step 1.5.

> **Rules for agents.** Never run `apply`, `destroy`, `import` or state commands; never trigger
> deploy workflows; never print or commit secrets. This repo is **public**: no account SIDs, tokens,
> Okta ids or internal URLs in committed files. On the devops node only `make plan` runs without
> asking; anything else needs the person's OK. Stop and wait at every 🧑 step.

Related docs: [Terragrunt in this repo](terragrunt.md) · [Okta ⇄ Flex SSO](okta.md) ·
[Okta scripts](../scripts/okta/README.md) · [Service configuration](service_configuration.md)

---

## 0. Intake: what to decide before starting

🧑 Collect these first. An agent should ask for anything missing instead of guessing.

| Item | Example | Used for |
|---|---|---|
| Helpline display name | `SafeSpot` | `helpline` in `common.hcl`, Okta app label |
| Short code (lower case) | `jm` | folder name, `HL=` |
| Environment | `staging` first; `production` near launch | `HL_ENV=` |
| Twilio account | created by an account owner, named `STG_<Name> (<CODE>)` / `<Name> (<CODE>)` | everything |
| Helpline region | `us-east-1` / `eu-west-1` | `helpline_region` |
| Channels and numbers | webchat, SMS, voice, WhatsApp… | `common.hcl` / env files |
| Okta group name | `SafeSpot (JM)` | `okta.group_name` |
| Okta group rule? | organization `SafeSpot`, or email domain `@example.org`, or none | `okta.group_rule` |
| Optional SAML attributes | `labels`, `team` | `okta_app.optional_attribute_sets` |
| Webchat needed? | yes/no | Phase 2 |

## Prerequisites (person)

- Admin/developer access to the new Twilio account and an existing one.
- AWS credentials (see [README](../README.md#environment-variables)) and the `GITHUB_TOKEN`.
- SSH to the devops node (agent forwarding for git).
- For Okta: the Terraform service app is already set up (one-off, see [okta.md](okta.md#before-the-first-apply-decisions-for-review));
  a **Super Admin or Org Admin** only if the helpline has a group rule.
- For agents running the read-only Okta scripts: the `OKTA_*` variables for a read-only service app
  ([scripts README](../scripts/okta/README.md#credentials)).

---

## Phase 1: Provisioning

### 1.1 Helpline configuration 🤖

1. Branch from master: `alejandro-c/<code>/<task>` (or your own prefix).
2. Create `twilio-iac/helplines/<code>/` by copying `helplines/baseline/` (`common.hcl`,
   `staging.hcl`, `production.hcl`, `configs/`).
3. Fill in `common.hcl`: `helpline`, `helpline_region`, channels, queues, workflows, and the
   **`okta`** block (`group_name`, optional `group_rule`).
4. Fill in `staging.hcl`: `flow_vars`, channel settings, and **`okta_app = {}`** (baseline already
   sets `attribute_statements_mode = "federated"`; add `optional_attribute_sets` if needed).
5. Commit; the person pushes or opens the PR.

### 1.2 Secrets in SSM 🧑

On the devops node, from any stage folder:

```bash
make manage-ssm-secrets HL=<code> HL_ENV=staging
```

It asks for the Twilio account SID and auth token, plus Datadog app id / access token. The Datadog
values are currently unused; if you don't have them, enter values that pass validation
(`00000000-0000-0000-0000-000000000000` and `pub` + 32 zeros). Never paste the auth token into a
chat with an agent.

### 1.3 Twilio infrastructure (Terraform) 🤝

From `twilio-iac/stages/provision` on the devops node:

1. 🧑 `make HL=<code> HL_ENV=staging setup-new-environment` (first run only; see the
   [README](../README.md#running-on-a-new-environment)).
2. 🤖 `make HL=<code> HL_ENV=staging plan` and review. Adjust the helpline config if needed.
3. 🧑 `make HL=<code> HL_ENV=staging apply`
4. Repeat 2–3 in `stages/lex` and then `stages/configure`.
5. 🧑 Buy/assign the phone number in Twilio and point its **A call comes in** to the voice Studio
   flow (Terraform does not manage phone numbers; it only uses `phone_numbers` in routing expressions).

### 1.4 Error reporting 🤝

1. 🧑 Twilio Console › **Monitor › Errors › Webhooks & alerts**: set the webhook to the
   TwilioErrorReporter URL (copy it from an existing account).
2. 🤖 Add the account to `lambdas/TwilioErrorReporter/index.ts` (`stagingAccountMap` or
   `productionAccountMap`, **alphabetical order**). The person opens the PR. (The SID is committed
   there today; it is an existing exception.)

### 1.5 Okta SSO 🤝

Full detail: [okta.md runbook A](okta.md#a-new-helpline).

| # | Step | Who |
|---|---|---|
| 1 | `cd twilio-iac/stages/okta-org && make plan`: must only **add the helpline group** | 🤖 |
| 2 | `make apply` (okta-org uses the production role: needs `twilio-iac-production` access) | 🧑 |
| 3 | **If `okta.group_rule` is set:** create the rule by hand from the plan's `group_rules` output (Okta › Directory › Groups › Rules › Add rule › Okta Expression Language › Save › **Activate**). Needs Super/Org Admin | 🧑 |
| 4 | Twilio Console › **Flex › Users and access › Single sign-on**: open the page once so the Flex SSO connection exists | 🧑 |
| 5 | `node twilio-iac/scripts/okta/flexSsoConnection.mjs --hl <code> --env staging`: connection `JQ...` exists | 🤖 |
| 6 | `cd twilio-iac/stages/okta-app && make plan HL=<code> HL_ENV=staging`: **creates 1 app + its claims + group assignments** | 🤖 |
| 7 | `make apply HL=<code> HL_ENV=staging` | 🧑 |
| 8 | `node twilio-iac/scripts/okta/flexSsoHandoff.mjs --hl <code> --env staging`: prints the 4 values | 🤖 |
| 9 | On the Flex SSO page: tick "I confirm the Flex application Entity ID and ACS URL have been updated", paste **Friendly name** (= Okta app label, e.g. `STG_SafeSpot (JM)`), **Certificate**, **Single sign-on URL** (and issuer if asked), **Save**, **Validate the connection** | 🧑 |
| 10 | `node twilio-iac/scripts/okta/verifySso.mjs --hl <code> --env staging`: all ✅ (includes the group rule check) | 🤖 |
| 11 | Log in to Flex with **Login with SSO** as a member of the helpline group or *Tech Matters - Staff*; check the worker attributes in TaskRouter | 🧑 |

Users get access through **groups**, not individual assignments: the helpline group (by hand or by
the group rule) and the Tech Matters groups that Terraform assigns.

### 1.6 Twilio console users 🧑

Twilio Console › Account › **Manage users**: invite the engineers and solutions engineers as
**Developers**.

---

## Phase 2: Deployment

### 2.1 Form definitions 🤝

1. 🤖 Create the helpline's forms from the baseline
   ([`as/v3`](../../lambdas/packages/hrm-form-definitions/form-definitions/as/v3/README.md), a
   general "help seeker" set of contact and case forms):

   ```bash
   node twilio-iac/scripts/onboarding/newHelplineForms.mjs --hl <code> --helpline "<display name>"
   ```

   `--helpline` must equal `helpline` in `common.hcl` (the categories are looked up by it). The
   script copies `as/v3` to `form-definitions/<code>/v1` and registers `<code>-v1` in the tests.
2. 🤖 Set `definitionVersion` to `<code>-v1` in the helpline's `service-configuration/common.json`
   (the baseline already has it as `<helpline shortcode>-v1`), fill in the manager details in
   `HelplineInformation.json`, replace the example states/counties, and adapt fields and
   categories to what the helpline asked for.
3. 🤖 `cd lambdas/packages/hrm-form-definitions && npm test -- validateDefinitions`: must pass.
   Include the files in the helpline's PR.
4. 🧑 GitHub Actions › **Deploy form-definitions to S3** with `helpline_code=<code>` and the environment.
   (The webchat deploy in 2.4 also deploys the forms; this step is still needed without webchat or
   when only the forms change.)

### 2.2 Twilio lambdas 🧑

Run *Deploy All Twilio Lambdas* ([twilio-lambda-deploy-all.yml](../../.github/workflows/twilio-lambda-deploy-all.yml))
in this repo's GitHub Actions for the environment (`staging` / `production`). It deploys every
Twilio lambda (account-scoped, TwilioErrorReporter, …) for all helplines of that environment, so it
also picks up the new account in TwilioErrorReporter (step 1.4) once that PR is merged.

### 2.3 Flex plugin 🧑

Run *Flex Deploy* in this repo's GitHub Actions for the new account.

### 2.4 Webchat (only if the helpline uses it) 🤝

1. 🤖 Add `aselo-webchat-react-app/configSrc/<code>/` (`common.json`, `staging.json`, and later
   `production.json`) by following an existing helpline; production files reuse staging values.
   Needs the account SID and the chat channel's Conversations address from Twilio (ask the person).
2. 🧑 Run *Deploy Aselo Webchat React App - single helpline*
   ([aselo-webchat-react-app-deploy.yml](../../.github/workflows/aselo-webchat-react-app-deploy.yml))
   with `helpline_code=<CODE>` and the environment. It deploys the app together with the helpline's
   `config.json` and then the helpline's form definitions.
   - Run it **on a branch or tag that contains `configSrc/<code>/` and that CI has already built**:
     the workflow uses that build, where the configuration was merged at build time.
   - *Deploy webchat configuration to S3* is not needed: it writes to the old webchat location
     (`webchat/<code>/`), which the React webchat doesn't read.

### 2.5 HRM permissions (hrm repo) 🤝

1. 🤖 In `techmatters/hrm`: add `permission-rules/<code>.json` (one file per helpline; actions and
   targets as in the existing files), a `process.env.PERMISSIONS_AC<code> = '<code>';` line in
   `setTestEnvVars.js`, and in `rulesMap.ts` a `const <code>Rules = require('../../permission-rules/<code>.json');`
   plus `<code>: <code>Rules,` in `rulesMapDef`.
2. 🧑 PR, review and HRM deploy by an engineer.

### 2.6 FullStory 🧑

FullStory › Create › Segment: name `<code> <HL_ENV> (<Helpline name>)`, filter `accountSid` = the
account. Add the account SID to the **All Staging** (or **All Production**) segment filter.

### 2.7 CloudTrail (production only) 🧑

Ask an AWS admin to add the `tl-aselo-docs-<code>-production` bucket to CloudTrail access logging.

---

## Phase 3: Verification 🤝

- 🤖 `node twilio-iac/scripts/okta/verifySso.mjs --hl <code> --env <env>`: all ✅
- 🤖 `node twilio-iac/scripts/okta/auditGroupRules.mjs --hl <code>`: ✅
- 🤖 Re-plan `okta-org`, `okta-app`, `provision`, `lex`, `configure`: **No changes**
- 🧑 Log in through SSO, open a test contact, check the forms load and a webchat/SMS/call reaches a counsellor.

## Production (near launch)

Repeat with `HL_ENV=production`: 1.1 (`production.hcl`), 1.2, 1.3, 1.4, 1.5 steps 4–11 (the Okta
group already exists), 1.6, 2.2–2.4, 2.6, 2.7, Phase 3. After launch, if the helpline wants
counsellors in production only, set `include_helpline_group = false` in `staging.hcl` and apply
`okta-app` for staging ([okta.md](okta.md#group-assignments)).

---

## Tracking checklist

**Automatic status:** `node twilio-iac/scripts/onboarding/onboardingStatus.mjs --hl <code> --env <env>`
checks the real systems (repo, SSM, Twilio, Okta) and marks each step ✅ done, ❌ missing, 🧑 to
confirm by hand or ❔ not checked (options: `--account-sid`, `--accounts-file`, `--hrm-repo`, `--json`).
Read-only; agents and people can run it at any time. The Asana project template mirrors the steps below.


Copy into the helpline's tracking issue / task and tick as you go.

```markdown
### <Helpline name> (<CODE>): <environment>
- [ ] 0 Intake complete
- [ ] 1.1 Helpline config (incl. okta / okta_app) committed
- [ ] 1.2 SSM secrets
- [ ] 1.3 provision / lex / configure applied · phone number → voice flow
- [ ] 1.4 Error webhook + TwilioErrorReporter PR
- [ ] 1.5 Okta: group (okta-org) · group rule (manual, if any) · Flex SSO page opened · app (okta-app) · Flex SSO values pasted · verifySso ✅ · SSO login ✅
- [ ] 1.6 Twilio console users invited
- [ ] 2.1 Form definitions
- [ ] 2.2 Twilio lambdas deployed
- [ ] 2.3 Flex plugin deployed
- [ ] 2.4 Webchat config + app deployed (if needed)
- [ ] 2.5 HRM permissions merged + deployed
- [ ] 2.6 FullStory segment
- [ ] 2.7 CloudTrail (production)
- [ ] 3 Verification
```
