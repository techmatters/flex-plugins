---
name: new-helpline
description: Provision a new Aselo helpline environment end to end (Twilio Flex account config in twilio-iac, Okta SSO, deployments) from the baseline, working together with a person who does the console and apply steps. Use when asked to set up, onboard or provision a new helpline or a new environment (staging/production) of an existing one, to continue an onboarding in progress, or to report its status.
---

# New helpline provisioning

Runs [twilio-iac/docs/new-account-provisioning.md](../../../twilio-iac/docs/new-account-provisioning.md)
step by step with a person. That guide is the source of truth: read it first, and follow its step
numbers (0, 1.1 … 3). Configuration conventions: [twilio-iac/AGENTS.md](../../../twilio-iac/AGENTS.md).

## Hard rules

- **Never** run `apply`, `destroy`, `import` or state commands, trigger deploy workflows, or open the
  Twilio/Okta/AWS consoles. Those are the person's steps: stop, say exactly what to do, and wait.
- Read-only Terraform/Terragrunt `plan` can be run freely; any other command on the devops node needs
  the person's OK first.
- Never ask for, print or commit secrets (auth tokens, keys). The repo is public: no account SIDs,
  Okta ids or internal URLs in committed files.
- One helpline + environment at a time. Staging first; production only when the person says the
  helpline is close to launch.
- Don't guess missing information: ask.

## Workflow

### 1. Find out where things stand

Ask for the helpline short code and environment, then run:

```bash
node twilio-iac/scripts/onboarding/onboardingStatus.mjs --hl <code> --env <env> [--accounts-file <file>] [--hrm-repo <path>]
```

It marks each guide step ✅ done / ❌ missing / 🧑 confirm with the person / ❔ not checked. Resume
from the first step that is not done; confirm the 🧑 items with the person before skipping them.

### 2. Tracking (Asana)

If the Asana tools are available: look for this helpline's onboarding project
(`<Name> (<CODE>) <environment>` onboarding). If there is none, offer to create it from the
**"New helpline onboarding"** project template (search `project_template`). After each step, tick the
matching task (task names start with the guide's step number) and add a short comment with what was
done. Never assign or reassign tasks without asking.

### 3. Intake (step 0)

Collect, asking only for what is missing:

- helpline display name, short code (lower case), environment
- Twilio account name follows `STG_<Name> (<CODE>)` / `<Name> (<CODE>)` (the person creates the account)
- helpline region (`us-east-1` / `eu-west-1`)
- channels and phone numbers (baseline: webchat + voice)
- Okta group name (`<Name> (<CODE>)`), group rule (organization / email domain with `@` / none),
  optional SAML attributes (`labels`, `team`)
- webchat needed? greeting text for voice? blocked-contact message?
- forms: who contacts the helpline (wording instead of "help seeker"), service area (states/counties),
  categories, anything to add or remove from the baseline forms (`as/v3`)

Later on this information may come from a tool that collects it from meetings; use it if provided.

### 4. Configuration (step 1.1)

- Branch from master (person's naming convention, e.g. `<prefix>/<code>/<task>`).
- Copy `twilio-iac/helplines/baseline/` to `twilio-iac/helplines/<code>/` and fill in the
  placeholders: `common.hcl` (helpline, region, queue name, channels, `okta`), `staging.hcl`
  (`flow_vars`, `okta_app`), service configuration JSON. Keep the baseline shape (1 queue, 1 workflow,
  webchat + voice) unless the intake asks for more; follow AGENTS.md for anything extra
  (e.g. Conversations channels need the `queue_transfers` workflow).
- Show the diff, commit, and ask the person to push / open the PR.

### 5. Twilio infrastructure (steps 1.2–1.4)

- 1.2 🧑 SSM secrets: give the person the `make manage-ssm-secrets` command; the Datadog answers can
  be dummy values (see the guide).
- 1.3 Run `make plan HL=<code> HL_ENV=<env>` in `stages/provision`, then `stages/lex`, then
  `stages/configure` (first time: the person runs `setup-new-environment` in provision). Summarize
  each plan (what gets created) and wait for the person's apply before the next stage.
- 1.3 🧑 Phone number → voice Studio flow (Terraform doesn't manage numbers).
- 1.4 Edit `lambdas/TwilioErrorReporter/index.ts` (alphabetical order) when the person gives the
  account SID; 🧑 errors webhook in the console.

### 6. Okta SSO (step 1.5)

Follow the **okta-flex-sso** skill ("New helpline"). Remind the person about the manual group rule
when `okta.group_rule` is set. Finish with `verifySso.mjs` all ✅ and the person's SSO login test.

### 7. Deployment (Phase 2)

- 2.1 Create the forms from the baseline with
  `node twilio-iac/scripts/onboarding/newHelplineForms.mjs --hl <code> --helpline "<helpline from common.hcl>"`,
  set `definitionVersion` to `<code>-v1`, fill the manager details, replace the example
  states/counties, adapt fields and categories to the intake (rules in `as/v3/README.md`), then run
  `npm test -- validateDefinitions` in `lambdas/packages/hrm-form-definitions`. 🧑 The person runs
  the "Deploy form-definitions to S3" workflow.
- 2.3 Webchat config in `aselo-webchat-react-app/configSrc/<code>/` (ask for the values you need).
- 2.4 HRM permissions in the hrm repo, if the person has it checked out.
- 🧑 2.2 Flex, 2.3 webchat deploys, 2.5 FullStory, 2.6 CloudTrail: tell the person
  what to run or ask for, and wait.

### 8. Verification (Phase 3)

Re-run `onboardingStatus.mjs` (no ❌), re-plan every stage (No changes), and ask the person for the
end-to-end test. Report what is done, what the person still has to confirm, and anything that
deviates from the baseline.

## Talking to the person

Each time you stop, say in plain terms: what was done, what they need to do next (exact console
path or command), and what they will see. Explain user-facing consequences, e.g. "after this,
counsellors in the helpline group can log in to staging Flex".
