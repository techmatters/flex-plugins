# Okta ⇄ Twilio Flex SSO as code

**Status: proposal for review.** The Terraform below has only been run as read-only `plan`s against
the live Okta org. Nothing has been applied, and the one-time setup in
[Before the first apply](#before-the-first-apply-decisions-for-review) is not done yet.

## Why

Every Aselo helpline signs in to Flex through Okta (`techmatters.okta.com`), using one SAML app per
helpline per environment. Today those apps are created by hand in the Okta console. Comparing them
showed the cost of that:

- Attribute names with stray trailing spaces (e.g. `"maxMessageCapacity "`) on about 10 apps. Flex
  then stores the worker attribute under the misspelt name, so features that read it silently get nothing.
- Group assignments that don't follow the agreed pattern (e.g. the production group on a staging app).
- Attribute order and optional attributes that vary from app to app for no reason.

The goal is that every Flex app is created from one definition, can be checked automatically, and
that any drift shows up in a `plan`.

## Design: two layers

Okta has helpline-level objects (shared by both environments) and environment-level objects (one per
Twilio account). Each kind is managed at its own level:

```text
Layer 1: okta-org stage            one run for the whole Okta org (no HL / HL_ENV)
  helpline groups, e.g. "SafeSpot (JM)"     ← helplines/<code>/common.hcl  okta = { ... }
  optional group rules (auto-membership)
  protected with prevent_destroy

Layer 2: okta-app stage            per helpline + environment (HL + HL_ENV, like every other stage)
  the Flex SAML app ("STG_SafeSpot (JM)")   ← helplines/<code>/<env>.hcl    okta_app = { ... }
  its group assignments
  helpline group looked up by name, never created or deleted here
```

The helpline group outlives either app. Rebuilding or removing the staging app can never touch the
group that production uses.

### End-to-end flow for one environment

| # | Step | How | Who |
|---|---|---|---|
| 1 | Find the account's Flex SSO connection (`JQ...`) | Automatic during `plan` (public Flex endpoint) · `scripts/okta/flexSsoConnection.mjs` | Terraform / script |
| 2 | Create or adopt the Okta app and its groups | `okta-org` and `okta-app` stages | Terraform |
| 3 | Enter Okta's issuer, SSO URL and certificate in **Twilio Console › Flex › Users and access › Single sign-on (SSO)** | `scripts/okta/flexSsoHandoff.mjs` prints the 3 values | **Person**: Twilio has no documented API for this page |
| 4 | Check the app against the standard and config | `scripts/okta/verifySso.mjs` | Script |
| 5 | Check Okta and Flex point at each other | `verifySso.mjs` (Flex connection check) | Script |
| 6 | Log a test user in and inspect the real SAML assertion | `verifySso.mjs --login` | Script |

The audit script (`auditSsoDrift.mjs`) runs steps 4 and 5 for every Flex app in the org.

Nothing account-specific is committed. The Twilio account SID comes from the existing SSM secret
(`/terraform/twilio-iac/<env>/<code>/secrets.json`), the Flex connection is looked up live, and
existing Okta apps and groups are found by name.

## The standard

### Labels

| Environment | Label |
|---|---|
| staging | `STG_<app_name> (<CODE>)` |
| production | `<app_name> (<CODE>)` |

`app_name` defaults to the helpline's `helpline` value. Override it in `okta.app_name`, or the whole
label in `okta_app.label`, for older apps whose label differs.

### Group assignments

| App | Groups |
|---|---|
| production | `<helpline group>` + `Tech Matters - Production` |
| staging | `<helpline group>` + `Tech Matters - Staff` + `Tech Matters - Test Accounts` |

**Helpline lifecycle.** A new helpline gets its group and **staging** app first, and those are used
to configure and test everything. The **production** app is configured close to launch. After launch
the helpline chooses:

- everyone keeps access to both environments, or
- the helpline group gets production only (`include_helpline_group = false` on the staging app), and
  a smaller set of people keeps staging access.

Restricting access this way stops counsellors logging into the wrong environment, so a staging app
without the helpline group is a valid setup.

### SAML settings

These are fixed in the module: SHA-256 signing and digest, signed response and assertion, no
assertion encryption (Flex does not support it), name ID `unspecified` / `${user.userName}`, ACS,
recipient and destination set to the Flex callback, and audience `urn:flex:<JQ...>`.

### Attributes sent to Flex

There is one source of truth,
[`terraform-modules/okta/flex-saml-app/attribute-statements.json`](../terraform-modules/okta/flex-saml-app/attribute-statements.json),
read by the Terraform module and by the scripts.

| Attribute | Value (legacy) | Required |
|---|---|---|
| `full_name` | `String.join(" ", user.firstName, user.lastName)` | yes |
| `email` | `user.email` | yes |
| `image_url` (uri) | `user.profileUrl` | yes |
| `helpline` | `user.helpline` | yes |
| `roles` | `user.userType` | yes |
| `maxMessageCapacity` | `user.maxMessageCapacity` | yes |
| `waitingOfflineContact.boolean` | `user.waitingOfflineContact` | yes |
| `channel.default.capacity` | `user.maxMessageCapacity` | yes |
| `labels.stringarray` | `user.labels` | optional (`optional_attribute_sets = ["labels"]`) |
| `team` | `user.labels` | optional (`optional_attribute_sets = ["team"]`) |

Helpline-specific attributes (e.g. `location`, `counselorLanguage`) go in
`okta_app.extra_attribute_statements`. The module rejects names with leading or trailing spaces.

#### Legacy vs new attribute statements

Okta now calls the classic per-app attribute statements the *legacy configuration* and offers new
**attribute statements** (federated claims, written in Expression Language for Identity Engine). The
module supports both through `okta_app.attribute_statements_mode`:

- `legacy` (default): matches every existing app, so imports are no-ops.
- `federated`: creates one `okta_app_federated_claim` per attribute and removes the legacy statements
  **in the same apply**.

**Federated mode has not been tried on a real login yet.** Before using it for real, test it on one
staging app (see [runbook D](#d-move-an-app-to-the-new-attribute-statements)) and compare the
assertion. Known differences:

- New statements have no name format, so `image_url` loses its `uri` format.
- Okta leaves out a statement whose value is empty. A user with no labels may then keep a stale
  `team` value in Flex instead of having it cleared.
- During the switch apply, the app update runs first, so for a few seconds the app sends no
  attributes. Do production during a quiet period.

## Configuration reference

```hcl
# helplines/<code>/common.hcl, inside local_config
okta = {
  group_name            = "SafeSpot (JM)"                       # required
  app_name              = "SafeSpot"                            # optional, defaults to helpline
  group_rule_expression = "user.organization==\"SafeSpot\""     # optional auto-membership rule
  group_rule_name       = "SafeSpot (JM)"                       # optional, defaults to group_name
  import_existing       = true                                  # adopt the existing group/rule
}

# helplines/<code>/staging.hcl or production.hcl, inside local_config
okta_app = {
  import_existing            = true          # adopt the existing app (default false = create)
  label                      = "STG_..."     # optional label override
  include_helpline_group     = true          # false = keep counsellors out of this environment
  tech_matters_groups        = [...]         # optional override of the Tech Matters groups
  attribute_statements_mode  = "legacy"      # or "federated"
  optional_attribute_sets    = ["labels", "team"]
  extra_attribute_statements = [
    { name = "location", legacy = "user.location", federated = "user.profile.location" },
  ]
}
```

Pilot config is in place for **jm, mt, usch, usvc** (all with `import_existing = true`), and
`baseline/` has blocks to copy for new helplines.

## Runbooks

All `make` targets run on the devops node as for any other stage.

### A. New helpline

1. Add `okta = { group_name = ... }` to `common.hcl` and `okta_app = {}` to `staging.hcl`.
2. `cd twilio-iac/stages/okta-org && make plan`, review it (it should only add the new group and
   rule), then `make apply`.
3. Open **Twilio Console › Flex › Users and access › Single sign-on (SSO)** for the staging account
   once, so the Flex SSO connection exists. *(Unverified: whether this is needed. The plan fails
   with a clear message if the connection is missing.)*
4. `cd ../okta-app && make plan HL=<code> HL_ENV=staging`, review, then `make apply ...`.
5. `node twilio-iac/scripts/okta/flexSsoHandoff.mjs --hl <code> --env staging`, then paste the 3
   values into the Flex SSO page and save.
6. `node twilio-iac/scripts/okta/verifySso.mjs --hl <code> --env staging --login`
7. Near launch, repeat steps 3–6 with `okta_app = {}` in `production.hcl` and `HL_ENV=production`.
8. After launch, if the helpline chooses production only, set `include_helpline_group = false` in
   `staging.hcl` and apply.

### B. Adopt an existing helpline

1. Add the `okta` and `okta_app` blocks with `import_existing = true`. Use `verifySso.mjs --label ...`
   and `auditSsoDrift.mjs` to see its current state first.
2. Plan `okta-org`, then `okta-app` for each environment. A clean adoption shows only
   `N to import, 0 to change`. Anything else is a real difference from the standard: fix the config
   or accept the change.
3. Apply. The import blocks are no-ops from then on.

The `okta-app` plan refuses to create a second app when one with the same label already exists and
`import_existing` is false.

### C. Check for drift

- Managed helplines: `make plan` shows changes. A `check` block also warns about group assignments
  added by hand, which Terraform does not remove on its own.
- Whole org: `node twilio-iac/scripts/okta/auditSsoDrift.mjs --out report.md`

### D. Move an app to the new attribute statements

1. Capture the current assertion: `verifySso.mjs --hl <code> --env staging --login --json > before.json`
2. Set `attribute_statements_mode = "federated"` in `staging.hcl`, then plan (expect N claims to be
   created and the legacy statements removed) and apply.
3. Capture again (`after.json`) and compare. Log in to Flex staging and check the worker attributes in
   TaskRouter, especially for a user with empty labels.
4. If anything differs, set the mode back to `legacy` and apply (this is the rollback).

## Before the first apply (decisions for review)

1. **A Terraform service app in Okta.** Create a separate API Services app, e.g. `aselo-terraform`,
   with private-key JWT and DPoP. Scopes: `okta.apps.read`, `okta.apps.manage`, `okta.groups.read`,
   `okta.groups.manage`, `okta.policies.read`. Admin roles: App Admin + Group Admin, or a custom
   role. Keep it separate from any read-only app used by the scripts.
2. **SSM parameters** (us-east-1), one per value so they can be entered in the AWS console:
   `/terraform/okta/terraform_service_app/client_id` (String),
   `/terraform/okta/terraform_service_app/private_key_id` (String, the key's KID) and
   `/terraform/okta/terraform_service_app/private_key` (SecureString, the PEM exactly as Okta shows
   it). Keep the private key only in SSM.
3. **IAM**: `tf-twilio-iac-staging` and `tf-twilio-iac-production` need `ssm:GetParameter` on
   `/terraform/okta/*`.
4. **Where okta-org state lives.** Proposed: the production state bucket, key `okta/org/terraform.tfstate`,
   using the production role, because the Okta org is shared by both environments. Alternative: a
   dedicated bucket.
5. **Provider pin**: `okta/okta 7.0.0`, `hashicorp/http 3.6.3`, in `stages/okta-backend.tftpl`.
   The Okta stages generate their own backend file, because a root module can have only one
   `required_providers` block and the shared template declares twilio and datadog.

## What has been verified

Read-only `terraform plan`s against the live org, using a read-only service app, with SSM inputs
replaced by test values because there are no AWS credentials locally:

| Check | Result |
|---|---|
| Okta provider 7.0.0 authenticates with a DPoP-required service app (private key JWT) | ✅ |
| Flex connection lookup inside Terraform (`http` data source) returns the same `JQ...` the apps use | ✅ |
| Import IDs from data sources (nothing hard-coded) | ✅ |
| `okta-app` stage on all 8 pilot apps | 6 × `0 to change`. USCH stg: attribute reorder only. USVC stg: adds the missing *Staff* group, and the check block flags *Production* + *VPN* |
| `okta-org` stage on the 4 pilot groups + 2 rules | ✅ `6 to import, 0 to change` |
| Federated mode on JM stg (plan only) | ✅ 8 claims created, legacy statements removed |
| Terragrunt collection of `okta` blocks across all 32 `common.hcl` | ✅ |
| Scripts: connection, handoff, verify (without `--login`), audit | ✅ |
| `verifySso --login` | ⚠️ Only the public half was tested (Flex → Okta redirect). Needs a no-MFA test user |
| Runs inside the pipeline container (Terraform 1.14.3) | ⚠️ Not run. Tested locally with Terraform 1.16.5; uses no features newer than 1.7 |

## Limitations and open questions

- **The Flex SSO page is manual.** There is no documented Twilio API for it; worth asking Twilio support.
- **Manually added group assignments are only warned about**, not removed, because Terraform manages
  assignments one group at a time.
- **Out of scope for now:** app sign-in/access policies (all pilot apps use *Classic Migrated*),
  external IdPs, network zones, helpline "Group Admins" sub-groups, Okta user profile attribute
  definitions. They are candidates for Layer 1 later.
- One org app still uses legacy `iam.twilio.com` SSO; the audit flags it.
- `okta-org` covers every helpline in one state. Review its plan carefully. Groups are protected by
  `prevent_destroy`.
