---
name: studio-flow-from-board
description: Build or update a helpline's Twilio Studio flow templates in twilio-iac from a flow designer export (the "Flows for Claude (JSON)" file exported from the form builder's Contact flows). Use when asked to turn a board or flow design into Studio, apply a flow designer export, or update a helpline's Studio templates (.tftpl) and their texts from a design.
---

# Studio flow from a flow designer board

Turns a board designed in the form builder's **Contact flows** into the helpline's Studio flow
templates (`twilio-iac/helplines/<code>/templates/studio-flows/*.tftpl`) and the texts they read
(`flow_vars` / `channel_flow_vars` in `staging.hcl` and `production.hcl`), then shows a plan.

The design and its export format: [form-builder/docs/flow-designer.md](../../../form-builder/docs/flow-designer.md).
Studio conventions: the "Studio flow standards" in `twilio-iac/AGENTS.md` (when it's on the
branch), and the account-scoped lambda routes in
[lambdas/account-scoped/STUDIO_ROUTES.md](../../../lambdas/account-scoped/STUDIO_ROUTES.md).

## Hard rules

- **Never** run `apply`, `destroy`, `import` or state commands. Read-only `plan` is fine; the person
  applies.
- One helpline and environment at a time, **staging first**. Production only when the person says so.
- Don't rename a widget that's live without asking: monitoring and recordings use the names.
- Never leave `TODO` in a template, and never invent SIDs, numbers or URLs: find them in the
  helpline's config or ask.
- The repo is public: no account SIDs, tokens or internal URLs in what you write (templates use
  `${...}` variables for those).

## The export

A `<helpline>-<board>.flows.json` file. What matters here:

| Field | What it is |
|---|---|
| `board.helpline` | The helpline code (`usnm`) |
| `studioTemplates[]` | One per frame: `text` is the `.tftpl` already written; `template` is where it lives (when the frame was imported from a live helpline); `channels` the channels using it; `variables` the texts to set in the `.hcl` files; `todo` what it couldn't fill in |
| `flows[].objects[]` | Each widget as designed: `studioName`, `kind`, `message` (script, language, `recordingFile`, `status`), `call` (route and body), `exits` (where each way out leads), `currentStudioWidget` (the widget as it is live, for imported ones) |
| `checks` | What the design still lacks (errors first) |
| `recordingsBaseUrl` | The recordings bucket folders for staging and production |
| `notes` | Sticky notes and tasks from the board |

Widgets imported from the live flow and not changed on the board come out **exactly** as they are
in the template today (the form builder tests this for every helpline), so a diff only shows what
was changed on the board.

## Workflow

### 1. Read the export

Ask for the file's path if you don't have it. Check `schemaVersion` is 1. Tell the person, briefly:
the helpline, each entry in `studioTemplates` (title, template or "new", number of TODOs and
variable changes), and the `checks` **errors**. If there are errors (names that break the
standards or repeat, a way out leading to two places), stop: they're fixed on the board, not here.
Warnings (open ends, missing recordings) are for the person to decide on; list them.

### 2. Write each template

For each `studioTemplates` entry:

- **With `template`** (imported): write `text` to `twilio-iac/helplines/<template>`. Show
  `git diff` and explain it in plain terms: connections that moved, texts, new or removed widgets.
- **Without `template`** (designed from scratch): ask which channels it's for and in which
  environment. Write it to `twilio-iac/helplines/<code>/templates/studio-flows/<name>.tftpl`
  (name after what it does, e.g. `voice.tftpl`, `sms.tftpl`) and point the channels' `templatefile`
  at `/app/twilio-iac/helplines/<code>/templates/studio-flows/<name>.tftpl` in `staging.hcl`.
  Follow the channel conventions in `twilio-iac/AGENTS.md` (e.g. conversations messaging mode).
- The system-down subflow's template is shared (`templates/studio-flows/system-down.tftpl`):
  changing it changes every helpline. Ask first; usually the helpline's `system_down_flow_vars`
  are what should change instead.

### 3. Fill in the TODOs

Each entry in `todo` says what's missing; then search the written template for `TODO` until there
are none.

| TODO | Where to find it |
|---|---|
| A split's input and conditions | What the design says (the decision's text and its ways out), and the widget before it (e.g. `{{widgets.<name>.parsed.<field>}}`, `{{trigger.call.From}}`) |
| A route's request body / response field | `lambdas/account-scoped/STUDIO_ROUTES.md` for that route |
| Send to queue: workflow, task channel, attributes | The helpline's other templates and `common.hcl`: `${workflow_sids.<key>}`, `${task_channel_sids.<channel>}`, `${channel_attributes.<name>}` |
| A subflow's `flow_sid` | `${system_down_studio_subflow_sid}`, or the variable the helpline's other templates use |
| A number to forward to, an HTTP address | Ask the person (put real values in variables, not the template) |
| Set variables | What the design's text says the counter or variable is for |

When a template already has a widget like the one needed, copy its settings. Ask the person about
anything you can't find; don't guess.

### 4. Set the texts

For each entry in `variables` (`scope`, `name`, `value`):

- `flow_vars`: set `name` in `flow_vars` in `staging.hcl` (and in `production.hcl` only when the
  person is doing production).
- `channel_flow_vars`: set it in the channel's `channel_flow_vars`, for each channel using the
  template.
- Write HCL strings with `\n` for line breaks and `\"` for quotes. Keep the existing order; add new
  keys next to related ones.

### 5. Recordings

Voice widgets play `${flow_vars.<something>_recordings_url}/<file>`. If the export's objects
show recordings that aren't `Published` yet (`message.status`), say so: production callers would
hear the old recording, or nothing for a new file. Moving the helpline to the recordings bucket
means setting that variable to `recordingsBaseUrl.staging` / `.production` in each environment's
file, only once its recordings are published there; offer it, don't do it unasked.

### 6. Check

```bash
cd form-builder && npx vitest run server/hcl.test.ts   # reads every helpline's templates and .hcl files
grep -rn "TODO" twilio-iac/helplines/<code>/templates/studio-flows/
git diff --stat
```

### 7. Plan (staging)

Plans run on the devops node (stages at `~/flex-plugins.git/twilio-iac/stages`), on the branch with
these changes pushed:

```bash
cd ~/flex-plugins.git/twilio-iac/stages/configure && make HL=<code> HL_ENV=staging plan
```

(`stages/system-down` for the system-down subflow.) Read the plan back to the person: which Studio
flows change, and that nothing else does. Then hand over: they review, open the PR, apply, and test
a call or message in staging.

## Hand-off

End with what was changed (files), what the plan shows, what's left for the person (apply, PR,
publishing recordings, production), and any design warnings they chose to keep.
