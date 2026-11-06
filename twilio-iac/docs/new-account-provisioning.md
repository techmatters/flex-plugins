# Provisioning a new helpline account

End-to-end steps to bring up a new Aselo helpline environment (Twilio Flex account, Okta SSO,
deployments). Written to be followed by a **person**, a **Claude agent**, or both together.

Each step is marked with who does it:

| Mark | Meaning |
|---|---|
| 🧑 | **Person**: needs a console, a decision, credentials or an approval only a person has |
| 🤖 | **Agent**: can be done by a coding agent (edit files, run `make plan`, run read-only scripts) |
| 🤝 | **Agent prepares, person executes**: the agent writes the change / prints the values, a person applies, deploys or pastes them |

A person can do every 🤖 step too. Claude Code agents run this guide through the **`new-helpline`**
skill (`.claude/skills/new-helpline/`).

> **Rules for agents.** Never run `apply`, `destroy`, `import` or state commands; never trigger
> deploy workflows; never print or commit secrets. This repo is **public**: no account SIDs, tokens,
> Okta ids or internal URLs in committed files. On the devops node only `make plan` runs without
> asking; anything else needs the person's OK. Stop and wait at every 🧑 step.

Related docs: [Terragrunt in this repo](terragrunt.md) · [Service configuration](service_configuration.md)

---

## 0. Intake: what to decide before starting

🧑 Collect these first. An agent should ask for anything missing instead of guessing.

| Item | Example | Used for |
|---|---|---|
| Helpline display name | `SafeSpot` | `helpline` in `common.hcl`, form categories |
| Short code (lower case) | `jm` | folder name, `HL=` |
| Environment | `staging` first; `production` near launch | `HL_ENV=` |
| Twilio account | created by an account owner, named `STG_<Name> (<CODE>)` / `<Name> (<CODE>)` | everything |
| Helpline region | `us-east-1` / `eu-west-1` | `helpline_region` |
| Channels and numbers | webchat, SMS, voice, WhatsApp… | `common.hcl` / env files |
| Who should log in to Flex | helpline staff, by organization or email domain | step 1.5 (Okta SSO) |
| Webchat needed? | yes/no | Phase 2 |

## Prerequisites (person)

- Admin/developer access to the new Twilio account and an existing one.
- AWS credentials (see [README](../README.md#environment-variables)) and the `GITHUB_TOKEN`.
- SSH to the devops node (agent forwarding for git).
- An Okta admin for step 1.5.
- For whoever runs the onboarding script (person or agent, on their own machine): Python 3.11+ with
  `pip install -r twilio-iac/scripts/python_tools/requirements.txt`. AWS credentials are optional:
  without them the SSM check is reported as not checked.

---

## Phase 1: Provisioning

### 1.1 Helpline configuration 🤖

1. Branch from master: `alejandro-c/<code>/<task>` (or your own prefix).
2. Create `twilio-iac/helplines/<code>/` by copying `helplines/baseline/` (`common.hcl`,
   `staging.hcl`, `production.hcl`, `configs/`).
3. Fill in `common.hcl`: `helpline`, `helpline_region`, channels, queues and workflows.
4. Fill in `staging.hcl`: `flow_vars` and channel settings.
5. Commit; the person pushes or opens the PR.

### 1.2 Secrets in SSM 🧑

On the devops node, from any stage folder:

```bash
make manage-ssm-secrets HL=<code> HL_ENV=staging
```

It asks for the Twilio account SID and auth token. Never paste the auth token into a chat with an
agent.

### 1.3 Twilio infrastructure (Terraform) 🤝

From `twilio-iac/stages/provision` on the devops node:

1. 🧑 `make HL=<code> HL_ENV=staging setup-new-environment` (first run only; see the
   [README](../README.md#running-on-a-new-environment)).
2. 🤖 `make HL=<code> HL_ENV=staging plan` and review. Adjust the helpline config if needed.
3. 🧑 `make HL=<code> HL_ENV=staging apply`
4. Repeat 2–3 in `stages/lex` (only if the helpline uses Lex chatbots or a post-survey bot; the
   other stages don't depend on it, so skip it otherwise), then `stages/system-down` (the system-down subflow every Studio flow
   runs first; the baseline has `enable_system_down = true`), and then `stages/configure`, which reads
   the subflow from the system-down state, so it must come after it.
5. 🧑 Buy/assign the phone number in Twilio and point its **A call comes in** to the voice Studio
   flow (Terraform does not manage phone numbers; it only uses `phone_numbers` in routing expressions).

### 1.4 Error reporting 🤝

1. 🧑 Twilio Console › **Monitor › Errors › Webhooks & alerts**: set the webhook to the
   TwilioErrorReporter URL (copy it from an existing account).
2. 🤖 Add the account to `lambdas/TwilioErrorReporter/index.ts` (`stagingAccountMap` or
   `productionAccountMap`, **alphabetical order**). The person opens the PR. (The SID is committed
   there today; it is an existing exception.)

### 1.5 Okta SSO 🧑

Okta single sign-on is set up by hand in Okta and the Twilio Console, as for existing helplines:
the helpline's Okta group and Flex SAML app (label `STG_<Name> (<CODE>)` / `<Name> (<CODE>)`), then
the app's values on Twilio Console › **Flex › Users and access › Single sign-on (SSO)**. Finish by
logging in to Flex with **Login with SSO** and checking the worker attributes in TaskRouter.

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
   python3 twilio-iac/scripts/python_tools/onboarding.py new-forms --hl <code> --helpline "<display name>"
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
   Until the forms are merged, set **Use workflow from** to the helpline's branch (or
   `gh workflow run <workflow file> --ref <branch> -f ...`): on master the folder doesn't exist yet and
   the sync fails with "The user-provided path ... does not exist".
   (The webchat deploy in 2.4 also deploys the forms; this step is still needed without webchat or
   when only the forms change.)

### 2.2 Twilio lambdas 🧑

Run *Deploy All Twilio Lambdas* ([twilio-lambda-deploy-all.yml](../../.github/workflows/twilio-lambda-deploy-all.yml))
in this repo's GitHub Actions for the environment (`staging` / `production`). It deploys every
Twilio lambda (account-scoped, TwilioErrorReporter, …) for all helplines of that environment, so it
also picks up the new account in TwilioErrorReporter (step 1.4) once that PR is merged. Run it
from master only: running it from the helpline's branch would deploy that branch's lambdas to every
helpline.

### 2.3 Flex plugin 🧑

Run *Flex Deploy* in this repo's GitHub Actions for the new account.

### 2.4 Webchat (only if the helpline uses it) 🤝

1. 🤖 Add `aselo-webchat-react-app/configSrc/<code>/` (`common.json`, `staging.json`, later
   `production.json`, and `translations/en-US.json`, which the build requires) by following a
   Conversations helpline such as `usvt`: `helplineCode`, `aseloBackendUrl` and `definitionVersion`
   (`<code>-v1`). No Twilio SIDs or addresses are needed. Set `contactIdentifierField` to a field the
   pre-engagement form has (`ip` with `captureIp: true` for the baseline form, which has no email).
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

A test helpline can skip this and reuse existing rules instead: set `permission_config` in
`common.hcl` and `permissionConfig` in `service-configuration/common.json` to that helpline's code
(e.g. `demo`).

### 2.6 FullStory 🧑

FullStory › Create › Segment: name `<code> <HL_ENV> (<Helpline name>)`, filter `accountSid` = the
account. Add the account SID to the **All Staging** (or **All Production**) segment filter.

### 2.7 CloudTrail (production only) 🧑

Ask an AWS admin to add the `tl-aselo-docs-<code>-production` bucket to CloudTrail access logging.

---

## Phase 3: Verification 🤝

- 🤖 `python3 twilio-iac/scripts/python_tools/onboarding.py status --hl <code> --env <env>`: no ❌
- 🤖 Re-plan `provision`, `lex` (if used), `system-down`, `configure`: **No
  changes**, except the known perpetual drift every helpline shows: "whitespace changes" on the
  workflow `configuration` and the Studio flow `definition`
- 🧑 Log in through SSO, open a test contact, check the forms load and a webchat/SMS/call reaches a counsellor.

## Production (near launch)

Repeat with `HL_ENV=production`: 1.1 (`production.hcl`), 1.2, 1.3, 1.4, 1.5 (a production Okta
app; the helpline group already exists), 1.6, 2.2–2.4, 2.6, 2.7, Phase 3.

---

## Tracking checklist

**Automatic status:** `python3 twilio-iac/scripts/python_tools/onboarding.py status --hl <code> --env <env>`
checks the repo (and the SSM secret, with AWS credentials) and marks each step ✅ done, ❌ missing, 🧑 to
confirm by hand or ❔ not checked (options: `--account-sid`, `--accounts-file`, `--hrm-repo`, `--json`).
Read-only; agents and people run it on their own machine at any time. The Asana project template
mirrors the steps below.


Copy into the helpline's tracking issue / task and tick as you go.

```markdown
### <Helpline name> (<CODE>): <environment>
- [ ] 0 Intake complete
- [ ] 1.1 Helpline config committed
- [ ] 1.2 SSM secrets
- [ ] 1.3 provision / lex (if used) / system-down / configure applied · phone number → voice flow
- [ ] 1.4 Error webhook + TwilioErrorReporter PR
- [ ] 1.5 Okta: group · app · Flex SSO values entered · SSO login ✅
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
