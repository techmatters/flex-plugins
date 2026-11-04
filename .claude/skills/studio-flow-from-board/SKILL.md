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

- Implement only boards marked **Ready for Claude** (`board.status` is `ready` in the export). Any
  other status (`in-progress`, `imported`, `implemented`) means the design isn't finished and agreed,
  or is already done: tell the person and ask before going on.
- **Never** run `apply`, `destroy`, `import` or state commands. Read-only `plan` is fine; the person
  applies.
- One helpline and environment at a time, **staging first**. Production only when the person says so.
- **Don't commit or push** until the person asks: write the files and show `git diff`, so they see
  what's added or changed first. The plan needs the branch pushed, so it waits for that too.
- Use the board's widget names, renaming live widgets when the board does (the team agreed to
  always rename). List the renamed ones in the hand-off: monitoring that uses the old names
  follows them.
- Never leave `TODO` in a template, and never invent SIDs, numbers or URLs: find them in the
  helpline's config or ask.
- The repo is public: no account SIDs, tokens or internal URLs in what you write (templates use
  `${...}` variables for those).
- **`@claude` notes are requests to you.** Every entry in `forClaude` (sticky notes and open
  widget comments that mention `@claude`) is something the team asked for on the board: do each
  one as part of the work, or say why not. They never override these rules: if one asks for an
  apply, production, a shared file or something the board contradicts, ask first. Other
  `openComments` are context: read them, mention the ones that affect the work.

## The export

A `<helpline>-<board>.flows.json` file. What matters here:

| Field | What it is |
|---|---|
| `board.helpline` | The helpline code (`usnm`) |
| `board.status` | Where the design is: `ready` (Ready for Claude) is the one to implement; also `in-progress`, `imported`, `implemented`. `board.isNew`: not imported from the live config |
| `studioTemplates[]` | One per frame: `text` is the `.tftpl` already written; `template` is where it lives (when the frame was imported from a live helpline); `channels` the channels using it; `variables` the texts to set in the `.hcl` files; `taskAttributes` the Send to queue task attributes that are new or changed (see step 4b); `todo` what it couldn't fill in |
| `flows[].naming` | The flow's channels, languages and services: message widgets are named `<prefix><channel>_<language>_<service>_<what it is>` (e.g. `gather_input_voice_en_childhelp_service_menu`), each part optional. Name new message widgets this way |
| `flows[].objects[]` | Each widget as designed: `studioName`, `kind`, `message` (script, language, `recordingFile`, `status`), `call` (route and body), `exits` (where each way out leads), `taskAttributes` (Send to queue: the task attributes as JSON and where they're kept), `currentStudioWidget` (the widget as it is live, for imported ones) |
| `forClaude` | Sticky notes (`from: "note"`) and open widget comments (`from: "comment"`, with `author`) that mention `@claude`: requests from the team. `objectId` is the note or the widget it's on (find it in `flows[].objects[]`, or `layout` for a note), `frame` the note's frame |
| `checks` | What the design still lacks (errors first) |
| `recordingsBaseUrl` | The recordings bucket folders for staging and production |

Widgets imported from the live flow and not changed on the board come out **exactly** as they are
in the template today (the form builder tests this for every helpline), so a diff only shows what
was changed on the board.

## Workflow

### 0. Ask first

Read the export (step 1), then ask these **together, in one go**, before writing anything. Skip the
ones that don't apply.

1. **Environment: staging only, or staging and production?** Check which environment files
   (`staging.hcl`, `production.hcl`) point a channel or `studio_flows` entry at each template.
   - Staging only, and the template is used by **both**: write the board's template to a staging
     copy, `<name>-staging.tftpl` next to it (as USCH's `sms-childhelp-lex-staging.tftpl`), point
     only `staging.hcl` at it, and set texts only in `staging.hcl`. Production keeps the original.
     When production follows later: write the staging copy over the original, point `staging.hcl`
     back at it and delete the copy.
   - Staging only, and only staging uses it: write it in place.
   - Both: write it in place, texts in both files (production values: question 4).
2. **Branch: a new one from master, or carry on with an existing one?** And: **is there an
   unmerged branch already applied to that environment?** A branch from master would undo it on
   the next apply (USCH staging once ran a builder test branch, not master). New branches follow
   the person's naming (`alejandro-c/<helpline>/<task>`), from an up-to-date master.
3. **Texts not approved yet** (`checks` "isn't approved", `message.status` other than `Approved`):
   put them in anyway or wait? For production they must be approved: stop and say which.
4. **Production values** (production only): each `variables` entry with `environmentSpecific` has
   the staging value only (a SID or an address typed into a widget, e.g. an hrm-staging URL). Ask
   for each production value; never guess it.

**Before the Studio flows: provision and chatbots.** A flow sends to workflows and queues
(provision stage) and hands contacts to chatbots (lex stage) that must exist first. Check the
config on the branch: each `${workflow_sids.<key>}` is in `workflows`, each queue the board names
is in `task_queues` and a workflow rule sends to it (with the widget's task attributes), and each
chatbot it calls (`captureChannelWithBot` `botName`) is in `lex_v2_bot_languages` with its
`configs/lex_v2` files. Ask whether those have been applied to the environment. If anything is
missing or not applied, stop and say what: those steps come first (routing-from-design,
chatbot-from-design). Go on only if the person says to anyway, and repeat it in the hand-off.

### 1. Read the export

Ask for the file's path if you don't have it. Check `schemaVersion` is 1, then `board.status`: if
it isn't `ready`, say what it is (e.g. "this board is still In progress", "it's marked Implemented
already") and ask whether to go on; stop if they say no. Tell the person, briefly:
the helpline, each entry in `studioTemplates` (title, template or "new", number of TODOs and
variable changes), every `forClaude` request (quoted, with the widget or frame it's on), and the
`checks` **errors**. If there are errors (names that break the
standards or repeat, a way out leading to two places), stop: they're fixed on the board, not here.
Warnings (open ends, missing recordings) are for the person to decide on; list them.

### 1b. Review the board

The board's `checks` don't catch everything. Before writing anything, go through this list for
every frame and report what you find with the step 1 summary, one line each: what, where (widget or
file), and why it matters. The person decides whether to fix the board first. Something the builder
should have flagged itself (like an open end it missed), say so too, so a check gets added.

1. **Form fields the flow reads.** For each Decision on a form field
   (`pre_engagement_data.<field>`, `memory.<field>`...), the field and each value its conditions
   compare with exist in the form the environment will run:
   `lambdas/packages/hrm-form-definitions/form-definitions/<code>/<version>/` on the branch, or the
   builder's draft of it. Compare option **values**, not labels. If only the draft has it, the form
   and the flow must be deployed together, per environment.
2. **Fields and texts the board stops using.** Before removing a form field, a `flow_vars` /
   `channel_flow_vars` entry or a widget, search what else reads it: the other environment's
   templates (production often points at a different `.tftpl`), other channels' flows,
   `PrepopulateMappings.json`, channel-attributes templates, the workflows and the lambdas. Remove it
   only from the files whose templates no longer read it.
3. **Who messages are from.** The flow's messages (live and new, Send message and close included)
   say the same From unless the board says why not. A mix (live `Bot`, new `${helpline}`) shows the
   contact two senders.
4. **Task attributes across Send to queue widgets.** In one flow, every Send to queue sends the same
   keys (`channelType` and its fallback, `customChannelType`, `helpline`, `language`...) unless the
   board says why. A key missing from one queue's attributes changes what the workflow's filters and
   Flex see for those contacts. `twilioNumber` only matters for SMS and voice: don't flag it missing
   in webchat flows.
5. **Open ends.** Every way out of every widget leads somewhere or is marked "ends here". Look
   hardest at the failure ones (`callFailure`, `failed`, `deliveryFailure`, `timeout`, a route's
   `failed`): a contact on an open end is dropped without a word. Exception: a voice Menu's
   `speech` is left unconnected on purpose (callers aren't cut off by speaking): don't flag it.
6. **Renamed live widgets.** Each renamed one (old → new name) can break Datadog monitors,
   dashboards and saved queries that use the old name: list them for the person to check.
7. **Decisions.** Each condition compares with what the widget before it really gives (an option's
   value, a key pressed, the chatbot's release flag), with the right case and operator, and
   `noMatch` goes somewhere that makes sense for an unexpected answer.

**Keep adding to this list**: when a review (yours or the team's) finds a kind of problem that isn't
here, add it as a new item, one short paragraph: what to check, where, and why it matters.

### 2. Write each template

For each `studioTemplates` entry:

- **With `template`** (imported): write `text` to `twilio-iac/helplines/<writeTo>`. Show
  `git diff` and explain it in plain terms: connections that moved, texts, new or removed widgets.
  If `text` is the same as the current file (only widget positions differ, or nothing), write nothing.
- **Without `template`** (designed from scratch): ask which channels it's for (the environment is
  question 1 in step 0). Write it to `twilio-iac/helplines/<code>/templates/studio-flows/<name>.tftpl`
  (name after what it does, e.g. `voice.tftpl`, `sms.tftpl`) and point the channels' `templatefile`
  at `/app/twilio-iac/helplines/<code>/templates/studio-flows/<name>.tftpl` in `staging.hcl`.
  Follow the channel conventions in `twilio-iac/AGENTS.md` (e.g. conversations messaging mode).
- **Templates shared by helplines** (`template` under `templates/`, with `sharedWith`: the other
  helplines using it, e.g. `templates/studio-flows/system-down.tftpl`):
  - Without `changeShared` (the default): never edit the shared file. `writeTo` is a copy of this
    helpline's own with the same name (`<code>/templates/studio-flows/<name>.tftpl`, as USNC did with
    `messaging-blocking-preq-lambda-sd.tftpl`). Write it there and point this helpline's
    `templatefile` entries (channels, `studio_flows`, `system_down_templatefile`) at
    `/app/twilio-iac/helplines/<writeTo>`, in the environment being done. The other helplines
    keep the shared template.
  - With `changeShared` (Aselo staff chose it on the board): `writeTo` is the shared file. Tell
    the person every helpline in `sharedWith` changes too and ask before writing; then plan
    staging for each of them (one at a time), not only this one.
  - Texts (`variables`) are always the helpline's own `flow_vars` / `system_down_flow_vars`:
    changing only texts never touches the template. For system down, that's usually all that
    should change.

### 3. Fill in the TODOs

Each entry in `todo` says what's missing; then search the written template for `TODO` until there
are none.

| TODO | Where to find it |
|---|---|
| A split's input and conditions | The board's "Splits on" when set; otherwise what the design says (the decision's text and its ways out), and the widget before it (e.g. `{{widgets.<name>.parsed.<field>}}`, `{{trigger.call.From}}`) |
| A route's request body / response field | `lambdas/account-scoped/STUDIO_ROUTES.md` for that route. Check client profile (`getProfileFlagsForIdentifier`, split on `parsed.flags` contains `blocked`), Check operating hours (`parsed.status`) and Notify the Aselo team come with the helplines' standard bodies already: only check them (operating hours: the channel is in the helpline's operating info, and its language and office) |
| A split's conditions | Already written from the board: each way out is compared with the operator chosen for it, or `matches_any_of` for a comma-separated list (`Si,si,ok`), `equal_to` otherwise. Don't change them unless the design says otherwise |
| Send to queue: workflow, task channel | Set on the board when chosen; otherwise the helpline's other templates and `common.hcl`: `${workflow_sids.<key>}`, `${task_channel_sids.<channel>}` (attributes: step 4b). The task channel is `voice`, `chat` or `voicemail` (messaging channels all use `chat`, never `sms` or `default`); the export already picks it from the flow's channel when it wasn't chosen. When the board names the queue it should end up in, check the workflow's rules (and the task attributes) send it there |
| A subflow's `flow_sid` | `${system_down_studio_subflow_sid}`, or the variable the helpline's other templates use |
| A number to forward to, an HTTP address | Ask the person (put real values in variables, not the template) |
| `“<widget>” had <value> written in it: it reads ${flow_vars.<name>} now` | Already done in `text`: the value differs between staging and production (a SID, a staging or Twilio Functions address), so it's a variable (`environmentSpecific` in `variables`). Set it in step 4; ask for the production value |
| Set variables | Set on the board (`variables`: key and value) when given; otherwise what the design's text says the counter or variable is for |
| A Repeat's times to repeat | The board leaves it at 2: ask the person if the design doesn't say |
| Skilled worker available?: channel | Already in `text`: the board's, otherwise `voice` in a voice flow and `chat` in any other (the route needs `targetChannel`). Skilled worker logged in? has no channel |
| A chatbot's settings (language, message, release type...) | `STUDIO_ROUTES.md` (`channelCapture/captureChannelWithBot`) and the helpline's other templates calling it; the bot's name is in `lex_v2_bot_languages` |

Kinds that become more than one widget, as the board writes them:

- **Menu (voice)**: a `gather-input-on-call` whose `keypress` and `timeout` go where the
  board's ways out go. The options pressed are told apart by the Decision (Split on
  `{{widgets.<gather>.Digits}}`) after `keypress`. `speech` stays **unconnected** (no `next`), even
  if the board connects it: Aselo menus are keypress only, and speaking doesn't cut the caller off.
- **Repeat (counter)**, named `repeat_<name>` on the board: a `set-variables`
  (`set_var_<name>_counter`) whose value is
  `{% if flow.variables.<name>_counter %}{{flow.variables.<name>_counter | plus: 1}}{% else %}1{% endif %}`,
  then a `split-based-on` (`split_<name>`) on `{{flow.variables.<name>_counter}}`: `noMatch` goes
  back round (`repeat`), `greater_than` the times to repeat goes on (`max reached`). Used for
  unrecognised input and timeouts (usnm's older `set_var_en_service_counter` / `split_end_cycle_en_service`).
- **Messages' `from`** (Send message, Question, Send message and close): the board's From, always
  set (`${helpline}`, `Bot` or the text chosen; `message.from` in the export, and `text` already
  writes it). An empty one is an error in `checks`: fixed on the board, not here. Send Message /
  Send and Wait for Reply also get `message_type: "custom"`, and Send Message
  `to: "{{contact.channel.address}}"`.
- **Messages' ways out**: a Send Message's `failed` goes where `sent` goes; a Send and Wait for
  Reply's `deliveryFailure` goes where `timeout` goes. The Decision after a Question splits on
  `{{widgets.<name>.inbound.Body}}`. `text` already has all of this: don't change it.
- **Messages' `service` and `channel`** (Send Message, Send and Wait for Reply): always
  `{{trigger.conversation.InstanceSid}}` / `{{trigger.conversation.ChannelSid}}` (all new flows are
  Conversations). `text` already does this for new widgets and for imported ones changed on the
  board; imported ones nobody changed keep what they have live, legacy
  `{{trigger.message.InstanceSid}}` / `{{trigger.message.ChannelSid}}` included. Don't rewrite
  those by hand: it only makes the diff noisy.
- **Send message and close**: a `make-http-request` to
  `${lambda_twilio_account_scoped_url}/conversation/sendMessageAndRunJanitor` named
  `f_sendMessageAndRunJanitor_<what>`, form `parameters` (as USNM's, `application/x-www-form-urlencoded`):
  `conversationSid` = `{{flow.channel.address}}`, `message` (`${flow_vars.send_message_<what>}`, set in
  `variables`) and `from` (the board's From, `${helpline}` when not set). Imported ones keep theirs
  (legacy Programmable Chat ones their `channelSid`); imported ones
  calling the Serverless function keep it; changes are written in its `parameters`.
- **Send to queue**: `send-to-flex` with the board's workflow, task channel, `timeout` (3600 by
  default) and, when set, `waitUrl` / `waitUrlMethod`: a recording is `<widget name>.mp3` in the
  flow's recordings folder (it's in the recordings library under that name), an address is as written.
- **Chatbot**: a `make-http-request` to `${lambda_twilio_account_scoped_url}/channelCapture/captureChannelWithBot`,
  named `f_captureChannelWithBot_<bot>`, its body from the board's settings. If the chatbot is
  new, it's built with the chatbot-from-design skill.
- **Set flow memory**: a `make-http-request` to `${lambda_twilio_account_scoped_url}/conversation/setFlowMemory`,
  named `f_setFlowMemory_<what>`, body `{"conversationSid": "{{flow.channel.address}}", "flowMemory":
  {<key>: <value>, ...}}` from the board's values (STUDIO_ROUTES.md). Values are kept on the
  conversation: use it for anything a later execution needs, e.g. before a chatbot hands the
  conversation back (`releaseType: triggerStudioFlow` starts a new execution, and `flow.variables`
  are gone). Later executions read `{{trigger.conversation.ChannelAttributes.flowMemory.<key>}}`;
  don't use `flowMemory` as a chatbot's `memoryAttribute`. The execution that sets it still has the
  trigger it started with: it reads `{{widgets.<f_setFlowMemory_...>.parsed.flowMemory.<key>}}`.
  Each call adds to what's kept (a key set again takes the new value).
- **Release from chatbot**: a `make-http-request` to
  `${lambda_twilio_account_scoped_url}/channelCapture/chatbotCallbackCleanup`, body
  `{"channelSid": "{{flow.channel.address}}"}`; usually on `captureChannelWithBot`'s `failed`.
- **Decision**: its `input` is the board's "Splits on" when set, otherwise the answer of the widget
  before it (`{{widgets.<send_wait_...>.inbound.Body}}`, `{{widgets.<gather_input_...>.Digits}}`) (each way out but `noMatch` is an
  `equal_to` condition on it). After a chatbot, the usual first split reads its release flag
  (`{{trigger.conversation.ChannelAttributes.<releaseFlag>}}` equal to `true`).

When a template already has a widget like the one needed, copy its settings. Ask the person about
anything you can't find; don't guess.

### 3b. Lay out the widgets

The board's positions become each widget's `offset`, and widgets the board turns into several
(Repeat, Menu) get positions it works out. They can land on top of each other or touch. Studio
shows each widget as a card about 280 wide and 150–200 tall (more with many ways out), so after
writing the template, move the new or changed widgets' `offset` until:

- **No two widgets overlap or touch.** Side by side (less than 150 apart vertically): at least
  **290** apart horizontally. One above the other (less than 150 apart horizontally): at least
  **210** apart vertically. Diagonal neighbours: at least 150 apart both ways.
- **Repeat (counter)**: the loop sits **beside its Question, to its left**, so the loop is a short
  circle and doesn't cross the main path. Relative to the Question's offset:
  - `split_<name>` about **350 left, at the Question's height** (−120 to +30), so `noMatch`
    goes straight back into the Question;
  - `set_var_<name>_counter` about **220–320 left and 120–200 below**, under the split;
  - the Question's own Decision (what the answer means) goes **below the Question** (about
    100 right, 230–390 down), on the main path;
  - the split's `max reached` way out (e.g. a "Send message and close") goes further left or below,
    away from the main path.
  If the left is taken, mirror it to the right; never stack the loop on the main path.
- Keep the flow reading **top to bottom**, branches spreading sideways; leave a widget where it is
  when it already fits these rules (imported widgets keep the position they have live).

Only offsets change here: never names, ways out or properties. The check in step 6 lists what
still overlaps.

### 4. Set the texts

For each entry in `variables` (`scope`, `name`, `value`, and `flow` for shared templates). Every
`${flow_vars.*}` / `${channel_flow_vars.*}` that `text` reads and the config doesn't have yet is in
this list; `addTo` says the file and block for each (`<code>/staging.hcl: flow_vars.<name>`). A few
helplines keep `flow_vars` or `channels` in `common.hcl`: put it where the helpline has the others.
`environmentSpecific: true` means `value` is for staging only: ask for the production one before
production.

- `flow_vars`: set `name` in `flow_vars` in `staging.hcl` (and in `production.hcl` only when the
  person is doing production). With `flow`, it's that `studio_flows` entry's own `flow_vars`
  (`studio_flows.<flow>.flow_vars`), not the helpline-wide ones.
- `channel_flow_vars`: set it in the channel's `channel_flow_vars`, for each channel using the
  template.
- Write HCL strings with `\n` for line breaks and `\"` for quotes. Keep the existing order; add new
  keys next to related ones.

### 4b. Task attributes (Send to queue)

A `send-to-flex` widget's `attributes` are the task's attributes: what the TaskRouter workflows'
filters read (`channelType`, `helpline`, `language`, `transferTargetType`...) and what Flex
shows. The board shows and edits them as JSON (`taskAttributes.json`), as Studio sends them:

- `{{…}}` / `{% … %}` is Liquid, filled in by Studio from the contact
  (`{{trigger.conversation.ChannelAttributes.from}}`, `{{trigger.call.From}}`);
- `${helpline}` and `${task_language}` are filled in by Terraform from the helpline's config
  (`helpline`, `task_language` in common.hcl).

Where they're kept (`taskAttributes.source`):

- **`channelAttributes`** (almost every flow): the widget says
  `"attributes": "${channel_attributes.default}"` (or `channel_attributes["default"]` in
  jsonencode-style templates); **keep it that way**. Terraform (terraform-modules/channels/v1)
  fills it in with a template from the `channel_attributes` map in the helpline's common.hcl, or
  `helplines/defaults.hcl` when the helpline has none (the helpline's map replaces the whole
  default map): the key `<channel>-conversations` for channels with
  `messaging_mode = "conversations"`, otherwise `<channel>`, falling back to
  `default-conversations` / `default`. The values are paths like
  `/app/twilio-iac/helplines/<path>.tftpl`; `source.template` is `<path>`, and
  `source.channels` the channels it applies to.
- **`inline`**: the JSON is written in the widget itself (some voice flows); `text` already has it.
  With `source.movedFrom`, the widget used that channel-attributes template before and has
  attributes of its own now (unticked "Use the channel's task attributes", or edited on the board).

The board decides: a widget that uses the channel's task attributes says
`${channel_attributes.default}` and gets the template unchanged; attributes set or edited on the
board are the widget's own, and the export writes them **in the widget** (`text` already has them).
So a board export never changes a channel-attributes template: **don't edit those templates** for
it. Every Send to queue in the flow reads the template, and other flows and helplines may too.

For each entry in a template's `taskAttributes` (`change`: `new` or `changed`):

1. `source.kind` `inline`: nothing to do beyond `text`. Say which widgets now carry their own
   attributes, and how they differ from the channel's (e.g. `service`, `counselingLanguage`).
2. `source.kind` `channelAttributes` (a new widget using the channel's): check that the flow's
   channels resolve to `source.template` (work it out as above from common.hcl / defaults.hcl;
   don't trust a guess). If they resolve to another file, say so and ask; don't change the mapping
   or the files on your own.

Keep the JSON as written (Liquid, spacing, `"memory": {{… | to_json}}` unquoted): it isn't
strict JSON until Studio fills it in. When `objects[].taskAttributes.otherChannels` is there, the
flow's channels get different templates: say so, and that a widget's own attributes go to all of
those channels. Changing attributes the workflows' filters read changes routing: point out
any attribute a filter reads (`twilio-iac/helplines/<code>/templates/workflows/*.tftpl`) that was
renamed or removed.

### 4c. Studio flows sharing a template (`sharedTemplate`, `ownTemplate`)

Several `studio_flows` entries can use one template, each with its own `flow_vars` (e.g. a
post-call survey in English and Spanish). The board shows them as one, with a tab per flow.

- **`sharedTemplate`**: the template stays **one file**. Changes to widgets and connections go in it
  once and affect every flow listed; never copy it per flow. Each flow's texts are `variables` with
  its `flow`. Each flow keeps its recordings in its own folder: set `recordingsUrlVariable` in each
  flow's `flow_vars` to its `recordingsUrls.staging` / `.production` (replacing placeholders like
  `<ADD_SPANISH_RECORDINGS_URL>`), in the environment being done.
- A flow with **`added: true`** is a language added on the board: it has no `studio_flows` entry
  yet. Add one in the environment being done (staging first), keyed `key`, with the same
  `templatefile` as the others and `flowVars` for that environment (already the first flow's with
  its language and recordings folder changed). Its texts come from `variables` with its `flow`; any
  text left out is still in the first flow's language: say so in the hand-off. Its recordings have
  to be uploaded (and published, for production) before callers can hear it.
- **A new board shared by several languages** (no `template`, every flow `added`): write the
  template once (step 2, "Without `template`"), then a `studio_flows` entry per flow in the
  environment being done, keyed `key`, all with that `templatefile` and each with its own
  `flow_vars` (its texts: `variables` with its `flow`). Ask which channel or flow starts each one
  if the board doesn't say (a post-call survey is started by the voice flow, not a channel).
- **`ownTemplate`**: this flow was split off a shared template on purpose. Write a new template
  (`ownTemplate.suggested`, e.g. `post-call-survey-es.tftpl`), a copy of `ownTemplate.from` with
  the board's changes; point `studio_flows.<ownTemplate.studioFlow>.templatefile` at it. Leave the
  shared template and the other flows as they are. Say so in the hand-off.

### 5. Recordings

**All recordings come from the Aselo recordings bucket**; Twilio Serverless is being retired. The
template already plays every recording it writes or changes (new widgets, renamed ones, recordings
given their standard name) from `${flow_vars.recordings_url}/<file>` (or the flow's own variable
when it already points at the bucket). `recordings_url` is in `variables` with `values` for staging
and production: set it in each environment's `flow_vars` from those; no need to ask. Don't touch
the Serverless variable: widgets nobody changed still play from it, and Send to queue `waitUrl`s
(hold music) are Twilio Functions, not files.

Renamed recordings were copied under the widget's name in the bucket only, so the bucket is the only
place they exist. If the export shows recordings that aren't `Published` yet (`message.status`),
say which: callers would hear nothing for them until they're published in the bucket (for
production, before it's applied).

A voice message with a script but **no recording uploaded** (no `recordingUrls`) is written with
`say: ${flow_vars.<widget>}` (its script in `variables`) and a `language` (TODO: "says its script
until its recording is uploaded"). That's on purpose: list them in the hand-off. When the recording
is uploaded, the board is exported again and it plays the recording; then remove the script
variable from the `.hcl` files.

### 6. Check

```bash
cd form-builder && npx vitest run server/hcl.test.ts   # reads every helpline's templates and .hcl files
grep -rn "TODO" twilio-iac/helplines/<code>/templates/studio-flows/
git diff --stat
```

Widgets too close (step 3b), for the template just written:

```bash
python -I - <path-to>.tftpl <<'EOF'
import itertools, re, sys
text = open(sys.argv[1], encoding='utf-8').read()
pos = {}
for state in re.split(r'\n\s*\{\s*\n\s*"name": ', text)[1:]:
    name = re.match(r'"([^"]+)"', state).group(1)
    o = re.search(r'"offset": \{\s*"x": (-?\d+),\s*"y": (-?\d+)', state)
    if o: pos[name] = (int(o.group(1)), int(o.group(2)))
for (a, (ax, ay)), (b, (bx, by)) in itertools.combinations(pos.items(), 2):
    dx, dy = abs(ax - bx), abs(ay - by)
    if (dy < 150 and dx < 290) or (dx < 150 and dy < 210):
        print(f'too close: {a} <-> {b} (dx={dx}, dy={dy})')
EOF
```

### 7. Plan (staging)

Only after the person has seen the diff and asked you to commit and push (the plan reads the
pushed branch). Switching the devops node to the branch needs their OK each time: say the exact
`git fetch` / `checkout` / `pull` first. Plans run on the devops node (stages at
`~/flex-plugins.git/twilio-iac/stages`):

```bash
cd ~/flex-plugins.git/twilio-iac/stages/configure && make HL=<code> HL_ENV=staging plan
```

(`stages/system-down` for the system-down subflow.) Read the plan back to the person: which Studio
flows change, and that nothing else does. If it changes more than the board did (widgets the board
didn't touch, a whole flow being replaced), the environment is running something else (question 2):
stop and tell them before they apply. Then hand over: they review, open the PR, apply, and test
a call or message in staging.

## Hand-off

End with what was changed (files, uncommitted unless they asked), what the plan shows, what the
review (step 1b) found and what was done about each, the live widgets renamed, a staging copy made (question 1), anything done before provision or chatbots were
ready, what was done for each `forClaude` request (or why not), what's left for the person
(commit and push, apply, PR, publishing recordings, production),
and any design warnings they chose to keep. Remind them to resolve the comments and remove the
`@claude` notes that were done, so the next export doesn't ask again. Remind them to mark
the board **Implemented** in the builder (the status next to the board's title), so the team knows
it's been done; once it's live, importing the helpline again brings the board back as it is.
