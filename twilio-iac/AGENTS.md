# AGENTS.md: twilio-iac

Guidance for coding agents (and people) working on the Terragrunt/Terraform configuration of the
Aselo helplines. This is **configuration, not application code**: treat it as such.

Start here:

- [docs/new-account-provisioning.md](docs/new-account-provisioning.md): bringing up a new helpline account (who does what)
- [docs/terragrunt.md](docs/terragrunt.md): how stages, generate blocks and state work in this repo
- [docs/okta.md](docs/okta.md): Okta ⇄ Flex SSO (okta-org / okta-app stages, scripts)
- [helplines/README.md](helplines/README.md): the configuration hierarchy
- Claude Code skills: `new-helpline` (provision a helpline end to end) and `okta-flex-sso` (Okta part)

## Operating rules for agents

- Only run `make plan` (and read-only commands). Never `apply`, `destroy`, `import`, `state` commands
  or `-refresh-only` applies; a person applies. Never trigger deploy workflows.
- This repository is **public**: never commit account SIDs, auth tokens, API keys, Okta ids or
  internal URLs. Terraform reads secrets from SSM at run time.
- Smallest practical change; preserve existing resource structure.
- Never assume two helplines are equivalent because they look similar: compare `common.hcl`, both
  environment files and `configs/service-configuration/*.json`.
- When changing routing, queues, concurrency or business hours, say what users will actually observe.
- `enable_*` flags in `defaults.hcl` default to `false`: a feature is off unless a helpline turns it on.

## Configuration hierarchy

Loaded and merged in this order, later overriding earlier:

```text
helplines/defaults.hcl                    -> global defaults, all helplines
helplines/<short_code>/common.hcl         -> all environments of one helpline
helplines/<short_code>/<environment>.hcl  -> staging.hcl | production.hcl | development.hcl
```

Every `common.hcl` merges with `config = merge(local.defaults_config, local.local_config)`; every
environment file with `config = merge(local.common_config, local.local_config)`. The merge is
**shallow**: setting `task_queues` in a helpline replaces the whole default map.

Put a value at the **lowest level that makes it true**: helpline-wide values go in `common.hcl`,
never duplicated into both environment files. The whole merged config is passed to every stage; each
stage uses only the variables it declares.

## Directory layout per helpline

```text
helplines/<short_code>/
  common.hcl
  staging.hcl
  production.hcl
  configs/
    service-configuration/{common,staging,production}.json   -> Flex service configuration
    lex_v2/<locale>/{bots,intents,slots,slot_types}/*.json
    lex_v2/common/slot_types/*.json                          -> shared across locales
  templates/
    studio-flows/*.tftpl
    workflows/*.tftpl
  files/additional.{provision,configure,lex,chatbot}.tf      -> escape hatch, avoid
```

- `helplines/baseline/` is the copy-me starting point for a new helpline: 1 queue, 1 workflow
  (`master-basic.tftpl`), a webchat channel and a voice channel, plus the Okta blocks.
- `helplines/templates/` and `helplines/configs/` are the **shared** versions. Prefer a shared template;
  only fork into `<short_code>/templates/` when behavior genuinely diverges.
- `files/additional.*.tf` is described in its own README as a "dirty hack" / "temporary band-aid".
  Don't use it unless the module genuinely cannot be driven by configuration.

## Template paths are absolute container paths

Stages run inside Docker with the repo mounted at `/app`, so template paths are always absolute:

```hcl
templatefile = "/app/twilio-iac/helplines/usnm/templates/studio-flows/voice.tftpl"
```

## .tftpl files: two different formats

**Studio flows** are HCL wrapping `jsonencode`:

```hcl
${
  jsonencode({
  "description": "${flow_description}",
  "states": [ ... ]
})
}
```

**Workflows** are plain JSON with `${}` interpolation, no `jsonencode` wrapper.

When editing a Studio flow:

- The file is **not** valid JSON on its own. Don't run a JSON parser over it without stubbing out
  the `${...}` interpolations first.
- Widget `body` fields are **JSON-escaped strings** (`\"` for quotes, `\n` for newlines). Editing
  them with `sed` is dangerous: a replacement containing `\n` injects a real newline and silently
  breaks the string. Use literal string replacement in Python/Node, then check every body still
  parses as JSON.
- Always use variables **inside a string** (`"${workflow_sids.master}"`), so the flow stays valid
  JSON and can be formatted and checked with a JSON validator.

## Variables available to Studio flow templates

| Kind | Where defined | Examples |
|---|---|---|
| Defaults (constants) | passed by the channels module | `flow_description`, `channel_name`, `helpline`, `environment`, `short_helpline`, `short_environment`, `task_language`, `serverless_service_sid`, `serverless_environment_sid`, `serverless_url`, `lambda_twilio_account_scoped_url`, `get_profile_flags_for_identifier_base_url`, `workflow_sids.*`, `task_channel_sids.*`, `task_queues.*`, `webhook_url_studio_errors`, `channel_attributes.default` |
| Global (`flow_vars`) | environment file | function/service SIDs, outbound numbers, user-facing message copy shared by all flows |
| Local (`channel_flow_vars`) | `channels.<name>` block | values for that one channel's flow |

`flow_vars` and `channel_flow_vars` hold **environment-specific SIDs**, so they legitimately differ
between staging and production. They are the biggest source of drift: when something works in
staging but not production, diff these two blocks first.

## Studio flow standards

**Premise:** a contact always reaches a counsellor unless we specifically don't want it to, and
every failure is notified.

- Share one template between channels only if their behavior is equal or very similar; otherwise
  use separate templates to keep each simple.
- Variables shared across channels go in `flow_vars`; channel-specific ones in `channel_flow_vars`.
- No open or disconnected widget ends (especially `noMatch` on split widgets) unless ending the flow
  there is intentional.
- Notify every failure with an HTTP request to `webhook_url_studio_errors` (posts to Slack), in
  particular when a contact **fails to be enqueued** after Send to Flex.
- Format and validate the template structure with a JSON validator (after stubbing interpolations).

### Widget naming

Lower case with underscores, action first, then what makes the widget specific
(`split_contact_routing`).

| Widget (type) | Prefix |
|---|---|
| Split Based On (`split-based-on`) | `split_` |
| Set Variables (`set-variables`) | `set_var_` |
| Run Subflow (`run-subflow`) | `run_subflow_` |
| Gather Input on Call (`gather-input-on-call`) | `gather_input_` |
| Connect Call To (`connect-call-to`) | `connect_to_` |
| Say/Play (`say-play`) | `play_message_` |
| Send Message (`send-message`) | `send_message_` |
| Send and Wait for Reply (`send-and-wait-for-reply`) | `send_wait_` |
| HTTP Request, not a function (`make-http-request`) | `http_get_` / `http_post_` |
| Send to Flex (`send-to-flex`) | `send_to_queue` (one queue) or `send_to_queue_<queue name>` |

- **Functions / HTTP requests calling functions:** `f_` + the function name in camelCase, plus a
  suffix when called more than once: `f_getProfileFlagsForIdentifier`,
  `f_sendMessageAndRunJanitor_blocked`.
- **After the contact is queued:** prefix `postqueue_` (`postqueue_split_if_pending_users`).

Older shared templates (e.g. `voice-basic.tftpl`) predate these names; don't rename widgets in
templates other helplines already use without checking the impact on monitoring.

## Naming conventions

- Helpline directories are the lowercase short code: `usnm`, `usch`, `nz`, `mt`.
- Shared Studio flow template filenames encode their features:
  `messaging-blocking-preq-conv-lambda-sd.tftpl` = messaging + blocking + pre-queue + Conversations +
  lambda + system-down. Suffix `-sd` = system-down support, `-conv` = Conversations messaging mode.
- Task queue / workflow keys are snake_case (`en_std`, `es_tya_voicemail`, `queue_transfers`);
  `friendly_name` is human-readable Title Case.

## Channels: things to know

- `channel_type = "web"` with the default `messaging_mode` (`programmable-chat`) is how every webchat
  is set up today (it creates a Flex Flow, which the webchat config needs).
- `messaging_mode = "conversations"` is used for `chat` / SMS / WhatsApp style channels; accounts with
  Conversations channels also need the `queue_transfers` workflow.
- The voice Studio flow still has to be attached to the Twilio phone number.
