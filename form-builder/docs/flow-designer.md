# Flow designer: design

A whiteboard, inside the form builder, for designing a helpline's contact flows with the helpline
team, replacing Miro. Phase 1 covers the **Studio flows** (pre-queue and post-queue); later phases
add chatbot scripts, TaskRouter routing and live collaboration.

Unlike Miro, every box knows what it is (a message, a decision, a queue...), so the board can be
exported as **JSON that a Claude agent turns into Studio flow templates**. Recordings are
uploaded in the builder too, so the board always knows which ones are still missing and the agent
knows their final URLs.

Status: proposal, for review before building.

## Decisions

| Topic | Decision |
|---|---|
| Where | Same site as the form builder (a **Flows** area next to **Forms**): same Okta app and groups, CloudFront, Lambda API. Boards in the existing drafts bucket; recordings in a new bucket (below). |
| Who | Helpline staff edit and comment on their helpline's boards, and upload recordings and scripts. Aselo staff see every helpline and the Aselo templates, publish recordings to production, and export the JSON. |
| Editing together | Saves automatically. If someone else saved in between, you're asked to reload (like drafts). Live editing is phase 4. |
| Outputs | JSON for Claude; recordings and scripts list (spreadsheet); import of an existing Studio flow. |
| Canvas | [React Flow](https://reactflow.dev) (`@xyflow/react`, MIT): drag, zoom, pan, minimap, and "step" connectors (straight lines, rounded corners, arrows) out of the box. |
| Shapes and icons | Standard flowchart shapes (ISO 5807), an icon inside each object ([Lucide](https://lucide.dev), ISC licence), and the name of the Studio widget it becomes. |

## The board

```text
Board (one per helpline topic, e.g. "USNM contact flows")
 ├─ Frames        named areas, e.g. "Voice: pre-queue", "SMS: post-queue (every 2 minutes)"
 │   ├─ Objects   typed boxes (below), with text, colour, icon and an optional Studio name
 │   └─ Connectors  arrow from one object (and one of its exits) to another
 ├─ Stickies     free notes, like the yellow/pink post-its ("TBD when the check happens")
 └─ Comments     threads pinned to an object or a spot, can be resolved
```

### Objects

Shapes follow the usual flowchart standard, so anyone who has read a flowchart recognises them:
diamonds decide, parallelograms say or ask something, double-sided boxes call something else,
cylinders are queues, pills start and end. Each object also has an icon, a default colour by
family (all can be changed), and a small caption with the Studio widget it becomes, so the board
reads the same way as Studio.

| Object | Shape | Icon | Exits | Studio widget (name) |
|---|---|---|---|---|
| Incoming call / message | pill (start) | phone, message, webchat or WhatsApp, by channel | 1 | Trigger |
| End | pill (end) | phone off / stop | none | end of flow |
| System down | double-sided box (subflow) | server off | 1 | Run Subflow (`run_subflow_system_down`) |
| Other subflow | double-sided box | layers | as defined | Run Subflow (`run_subflow_...`) |
| Check operating hours | double-sided box (function) | clock | open / closed / holiday | function (`f_...`) + Split |
| Check client profile | double-sided box | user search | blocked / not blocked | `f_getProfileFlagsForIdentifier` + Split |
| Skilled worker available? | double-sided box | users | available / not available / failed | `worker/isSkilledWorkerAvailable` (`f_isSkilledWorkerAvailable_<skills>`) + Split; settings: skills (typed, or added from the helpline's routing design), channel |
| Skilled worker logged in? | double-sided box | user check | logged in / not logged in / failed | `worker/isSkilledWorkerLoggedIn` (`f_isSkilledWorkerLoggedIn_<skills>`) + Split; settings: skills, activities not counted |
| Check country / phone code | diamond | globe | one per country, other | Split (`split_country...`) |
| Other function / HTTP request | double-sided box | braces / webhook | success / failed | Run Function or HTTP Request (`f_...`, `http_post_...`). Its settings: method, address (https://... or `${variable}/...`) and JSON body (Studio's `{{...}}` allowed), sent as `application/json` without Twilio auth; both checked. Imported from the live widget, and only written back when changed |
| Decision | diamond | branch | one per answer, plus "no match" | Split Based On (`split_...`) |
| Play message (voice) | parallelogram | speaker | 1 | Say/Play (`play_message_...`) |
| Send message | parallelogram | message | 1 | Send Message (`send_message_...`) |
| Send message and close | parallelogram | message with a cross | success / failed | `conversation/sendMessageAndRunJanitor` (`f_sendMessageAndRunJanitor_<what>`, from its text, e.g. “Blocked”): a last message, then the conversation is closed. Its message is its script (in `flow_vars`, `send_message_<what>`, approved like a message's); settings: who it's from, and Conversations or legacy Programmable Chat. Imported from the lambda's route and from the Serverless function (its parameters), with changes written where each keeps them |
| Menu / question (voice) | manual-input shape | dial pad | keypress, speech, timeout (Studio's) | Gather Input on Call (`gather_input_...`); a Decision after keypress tells the options apart. Boards made when the options were its ways out (1, 2, noMatch) still get a Split for them |
| Question (messaging) | manual-input shape | message reply | reply, timeout | Send and Wait for Reply (`send_wait_...`) |
| Record voicemail | parallelogram | voicemail | 1 | Record Voicemail (`record_voicemail_...`) |
| Chatbot | double-sided box | bot | success / failed | `channelCapture/captureChannelWithBot` (`f_captureChannelWithBot_<bot>`). Settings: the chatbot (offered from the helpline's chatbot designs; picking one fills in its language, `en_USCH` becoming `en-USCH`), how it starts, its message, what happens when it finishes, the release flag and where the answers are kept. On `success` the flow usually ends: the bot triggers the flow again when it finishes, so check the release flag at the top. Imported requests to that route open as chatbots |
| Pre-survey form | document shape | clipboard | finished | pre-survey chatbot or webchat form |
| Send to queue | cylinder | inbox | callComplete (the post-queue part continues), failedToEnqueue, callFailure (Studio's; callFailure is usually left unconnected; boards with the older "post-queue" and "failed to enqueue" open with these) | Send to Flex (`send_to_queue_<queue>`), with its **task attributes** (below). Settings: the queue it should end up in (offered from the helpline's routing design; the workflow's rules send it there), the workflow (`${workflow_sids.<key>}`) and the task channel (`${task_channel_sids.<key>}`); its timeout (3600 if not set); and what callers hear while waiting: Twilio's music, a recording uploaded here (named after the widget, like a message's), or an address (`waitUrl` and its method, e.g. usnm's `postQueueMonitor`). All read from imported widgets |
| Forward call | rounded box | phone forwarded | call completed, hung up | Connect Call To (`connect_to_...`) |
| Set variable / counter | box | variable | 1 | Set Variables (`set_var_...`) |
| Repeat (counter) | delay shape | repeat | repeat / max reached | Named `repeat_<name>` (e.g. `repeat_menu`); becomes a Set Variables (`set_var_<name>_counter`) adding one to `flow.variables.<name>_counter`, and a Split (`split_<name>`): back round (`repeat`) until it's greater than the times to repeat (2 if not set), then `max reached`. E.g. a menu's timeout → Repeat → back to the menu, or on to the queue. Boards with the old “Wait / repeat”, or Repeats named after their counter, open with the new kind and name |
| Go to frame | off-page arrow | link | none | jumps to another frame ("continues in SMS post-queue") |
| Notify the Aselo team | rounded box | bell | 1 | HTTP Request to `webhook_url_studio_errors` (`http_post_...`), where a flow posts to Slack; optional, since failures are followed in Datadog |
| Text | no border | text | none | a label or title, no Studio meaning |

Colours by family: green for start and end, yellow for decisions, blue for checks and functions,
white for messages and questions, red for voicemail, pink for queues. Twilio's own Studio icons
aren't published for reuse, so we match Studio by widget name and caption rather than by
copying its artwork.

**Messages and questions carry their content:** channel, language, the script, and a status that
is mostly worked out automatically (see [Recordings and scripts](#recordings-and-scripts)).

**What the helpline has elsewhere** is offered in objects' settings: its chatbots (Chatbot), and
its routing design's queues and workflows (Send to queue) and skills (the skilled worker checks).
Any other value can be typed. They're read again whenever the board is shown again, so a skill
added in Routing meanwhile is there.

**Studio names** are suggested from the object type, channel, language and what you type
(`play_message_voice_en_post_queue_closed`), and checked against the standards in
`twilio-iac/AGENTS.md`. The name is also the recording's filename.

**Messages, menus and questions** (Play message, Send message, Menu, Question, Record voicemail)
are named by parts: `<prefix><channel>_<language>_<service>_<what it is>`, e.g.
`gather_input_voice_en_childhelp_service_menu`. Every part but the prefix is optional.

- The flow's **channels, languages and services** are set in its settings (a frame's, or the
  board's with nothing selected, under **Names**). Left empty, the channels are the flow's channel
  (or its messages'), and the languages those its messages are in; there are no services.
- In a message's settings the prefix is fixed (it comes from the kind of widget, plus
  `postqueue_` after the queue); a part with one value is filled in by itself, one with several is
  chosen from; then what it is is typed.
- A name that doesn't follow it (usually imported) gets a warning with the standard one, and
  **Use the standard name** in its settings. Renaming keeps the widget playing its recording: the
  file is kept as its recording until it's copied to the new name, straight away for Aselo staff
  ("Use the standard name"), or later with **Use the standard name(s)** in the recordings. The old
  file stays.

### Editing

- Drag objects from a palette; drag between objects to connect them (connection points on each
  side). Connectors are straight with rounded corners and an arrow; a label shows which exit it is
  ("Yes", "2", "No or unrecognized").
- Edit text in place; change colour, icon and size.
- Frames: add, rename, resize, move everything in them together, jump to a frame from a list.
- Select several, copy, paste, duplicate (also between frames), delete, undo and redo.
- Snap to a grid, align and distribute, zoom, minimap, search by text or Studio name.
- Stickies in a few colours; comment threads that can be resolved.
- Connecting: let go anywhere over the target object (not only on a connection point); the line
  arrives on the side facing where it comes from. Each way out leads to one place, as in Studio:
  an object with one way out connects once, a decision once per answer. When a connection isn't
  allowed, a short note says why.
- Studio names are checked as they're typed (prefix, lower case, camelCase only after `f_`,
  `postqueue_` after the queue, no repeats in the same flow); see [Check the flow](#check-the-flow).
  Frames with the same channel count as one Studio flow.

### Status

Each board has a status, the same as routing designs and chatbots (`src/designStatus.ts`):
**Imported** (as it is live, nothing changed), **In progress**, **Ready for Claude** (finished and
agreed with the helpline: Claude can implement it) and **Implemented** (written into the config).
Boards imported from a live helpline start *Imported*; new boards (empty or from a template) start
*In progress* and show **New** (not in the live config). Any change to the design (frames, objects,
connections, texts and scripts, task attributes, which recording a message plays) sets it back to
*In progress*, so a board has to be marked ready again after a change; comments (and resolving
them), stickies and tasks, approving a script, renaming the board, and uploading, approving or
publishing recordings (they're kept apart from the board) don't. Aselo staff set it from the dropdown next to the board's title;
helpline staff see it. Boards saved before statuses existed read as *Imported* when their frames
came from Studio, otherwise *In progress*. The start page lists every board with its status, with
filters, and the export for Claude carries it (`board.status`): the skill only implements boards
marked *Ready for Claude*.

### Tasks

A sticky note can be made a task: who it's for, a status (*To do*, *In progress*, *Done*) and an
optional due date. "Who it's for" is picked from the helpline's people and the Aselo team's (see
[Storage and access](#storage-and-access)). The **Tasks** tab next to the settings lists them (open, mine, all); clicking
one shows its note. Done tasks stay on the board, greyed out and ticked, as a record. Assigning a
task doesn't notify anyone yet (a Slack message is a phase 4 idea).

### Check the flow

A **Check** panel lists problems, each one clickable to jump to the object. The rules come from
the Studio flow standards:

- **Names**
  - lower case with underscores, and the prefix for the widget type (`split_`, `set_var_`,
    `run_subflow_`, `gather_input_`, `connect_to_`, `play_message_`, `send_message_`,
    `send_wait_`, `http_get_` / `http_post_`, `send_to_queue_`);
  - functions are `f_` plus the function name in camelCase (`f_getProfileFlagsForIdentifier`);
  - everything after Send to queue starts with `postqueue_`;
  - the language in the name matches the message's language (`_es_` on Spanish messages);
  - no two objects in a flow share a name.
- **No open ends:** every exit goes somewhere, including "no match" on decisions and "timeout"
  on questions, unless it's marked as ending the flow on purpose (in the Check panel, or under
  "Where it goes" in the object's settings). "speech" is the exception: it's left unconnected as
  a rule (answers are pressed), so it isn't flagged.
- **One place per way out:** a way out leads to one place; connections only use ways out the
  object has (e.g. after a decision's answer was renamed); End has nothing after it.
- **System down first:** an incoming call or message goes to the system-down subflow before
  anything else.
- **Menus that repeat** have a Repeat (counter) or a Set variable on the way round, so a caller
  can't loop for ever.
- **Unreachable objects:** nothing leads to them (a post-queue frame may start from its queue).
- **Ignoring a warning:** a warning that doesn't apply to a board (e.g. "should go to the
  system-down subflow" on a post-survey flow) can be ignored in the Check panel by Aselo staff. It's
  then listed apart under "ignored", isn't counted or exported for Claude, and can be brought back.
  Errors can't be ignored. Kept on the board (`ignoredChecks`); it doesn't change its status.
- **Content:** messages and questions without a script. (Voice messages without a recording, and
  uploaded recordings no object uses, come with the recordings library in step 3.)
- **Frames** that hold objects say which channel they're for, so the export knows which Studio
  flow they're part of.

**Errors** are mistakes: names that break the standards or repeat, a way out leading to two
places, connections from ways out that don't exist. **Warnings** are what a design in progress
still lacks: open ends, missing names and scripts, system down first, unreachable
objects. Objects get a red badge for errors and an orange one for warnings; the panel can hide
warnings.

## Recordings and scripts

A voice message's recording is the file named after its Studio name: the widget
`play_message_voice_en_welcome` plays `play_message_voice_en_welcome.mp3` (or `.wav`). So a voice
message needs its Studio name before its recording can be uploaded.

**In the editor:**

- **The object's settings** have a **Recording** section for voice messages: its status, the file
  name it needs, players for the staging file (and for production, while production has an older
  one), who uploaded, approved and published it, and the buttons for what this person can do next
  (**Upload recording** / **Replace recording**; for Aselo staff, **Approve** and **Publish to
  production**).
- **The Recordings tab** lists every voice message on the board with its status and player,
  uploads **several files at once** (matched to widgets by file name; files that match no widget
  are listed, and can be uploaded anyway for another board), has **Publish all approved** for
  Aselo staff, and lists the helpline's recordings **no widget on this board uses** (another board,
  or a typo; staging-only ones can be removed).
- **The Recordings button** in the toolbar (↻) and **Refresh** in the tab reload the list, to see
  what others uploaded or published since the board opened. Your own changes refresh it by
  themselves.
- **Messaging scripts** get approved by Aselo staff in the object's settings (**Approve script**);
  the approval holds while the script stays the same.
- **The Check panel** says what's left: voice messages without a recording, recordings waiting
  for approval, approved ones not published yet, messaging scripts not approved.
- **The exports** carry it too: the spreadsheet's Status column, and in the JSON each message's
  `status`, `recordingFile` and `recordingUrls`, plus the board's `recordingsBaseUrl`.

**Status** is worked out, not typed:

| Voice | Messaging |
|---|---|
| *No script* → *Script ready* → *Recorded* → *Approved* → *Published* | *No script* → *Script ready* → *Approved* |

"Recorded" means the file is in the helpline's `staging` folder; "Approved" is set by Aselo
staff, for that file; "Published" means production has the same file. Uploading a new take sends
it back to *Recorded* (approvals hold only for the file approved), and production keeps the
published one until the new take is approved and published. Publishing needs an approval first.

Not built yet: sending the scripts spreadsheet back filled in (rows matched by Studio name).

### Where recordings are stored

| | |
|---|---|
| Bucket | new, private, versioned: `tl-aselo-recordings`, one folder per helpline |
| Paths | `<helpline code>/staging/<studio name>.mp3` and `<helpline code>/production/<studio name>.mp3`; a flow sharing its template with others keeps its own in `<helpline code>/<environment>/<flow>/` (e.g. `usvc/staging/post_call_survey_es/`), as the files are named the same |
| Public URL | through CloudFront, e.g. `https://recordings.tl.techmatters.org/usnm/production/play_message_voice_en_welcome.mp3` (the bucket itself stays private) |
| Who writes | helpline and Aselo staff upload to `staging` (the page sends the file straight to the bucket, through a link the API signs); only Aselo staff **Publish to production** (the API copies the file, and refreshes CloudFront so it's served straight away) |
| Who did what | who uploaded, approved and published each file, in the private drafts bucket (`recordings/<code>.json`): the recordings bucket is public |
| Terraform | `form-builder/terraform/modules/aws/recordings.tf` (see `form-builder/terraform/README.md`) |

The two folders matter because Studio plays the file at call time: replacing a file changes what
callers hear immediately. Uploads therefore reach staging first, and production only when Aselo
staff publish them.

In Studio, the flow variable that holds the recordings URL (today `flow_vars.usnm_recordings_url`,
pointing at Twilio Serverless) becomes the CloudFront folder for that environment, set in
`staging.hcl` / `production.hcl`. The import (below) copies an existing helpline's recordings, so
moving it is: import, check in staging, publish, then change that one variable per environment.

These are prompts recorded for the helpline, and are public like a website's audio. Callers'
voicemails are never stored here.

**Older names.** Some helplines' recordings aren't named after their widget (USCH's
`play_message_childhelp_voice_welcome` plays `childhelp_voice_welcome_message.mp3`). The import keeps
the name they play, and the Check panel flags it. Aselo staff can give them the standard name: on
import ("Give recordings with older names the standard one"), on a widget's Recording section
("Use the standard name"), or for the whole board in the Recordings tab ("Use the standard
names"). It copies each file under the new name (in each flow's folder), keeps the old one (live
flows still play it), and the generated template then plays the new name, with a TODO: the flow's
recordings URL has to be the Aselo bucket, where the new name exists.

### Flows sharing a template

Several `studio_flows` entries can use one template, each with its own `flow_vars` (USVC's
post-call survey: `post_call_survey_en` and `post_call_survey_es`, the same widgets, different
recordings and language). The import makes **one board** for them, the template drawn once, with a
tab per flow (English / Spanish) in the board's header:

- **Widgets and connections** are the template's: changing them changes every flow, and the export
  asks Claude to change the one template.
- **Each flow's own:** voice messages' scripts and recordings, and texts that come from its
  `flow_vars`, edited on its tab (the side panel says when a text is the shared template's instead).
  Its recordings are in its own folder (`<code>/<environment>/<flow>/`, so the same file names
  don't overwrite each other); the export gives each folder's URL, for the flow's recordings URL
  variable (e.g. `post_survey_assets_url`), and each text change with the flow it belongs to.
- **Make <language> its own flow** (on that flow's tab): when one flow really has to differ. It
  becomes a board of its own (its texts, the same recordings folder), flagged so the export asks for
  a template of its own (e.g. `post-call-survey-es.tftpl`) and to point its `studio_flows` entry at
  it; the other flows keep the shared template.

Checks: each flow's scripts are checked on its own ("Spanish: “Thanks” has no script yet"); the
"language in the Studio name" rule doesn't apply, as one widget plays each flow's language.

### Templates shared by helplines

Some templates under `twilio-iac/helplines/templates/studio-flows/` are used by several helplines
(`system-down.tftpl` by most; `messaging-blocking-conv-lambda.tftpl` by MT, MW, ZA, ZW...). Each
helpline still has its own board (helpline staff see only theirs); the import finds which other
helplines use the template, and the board says so in a bar under its toolbar:

- **By default**, a change to its widgets or connections gives the helpline a **copy of its own**
  (same name, under `<code>/templates/studio-flows/`, as USNC did with
  `messaging-blocking-preq-lambda-sd.tftpl`), and its config points at it. The other helplines
  don't change.
- **"Change the shared template for every helpline"** (Aselo staff, on the board): the change goes
  to the shared file, and every helpline using it changes; the export lists them, and the skill
  asks before writing and plans each one.
- **Texts** are always the helpline's own (`flow_vars`, `system_down_flow_vars`), so changing only
  texts never touches the template.

A template in the shared folder that no other helpline uses is changed where it is.

## Outputs

### JSON for Claude

**Export › Flows for Claude (JSON)**, Aselo staff only. One file per board
(`<helpline>-<board title>.flows.json`), versioned (`schemaVersion`) and readable without the
canvas: each **flow** is one Studio flow (frames with the same channel together), each object
lists its **exits** and where they lead, and `layout` (where things sit) is separate so an agent
can ignore it. `about` tells the agent what the file is and which standards to follow.

```json
{
  "schemaVersion": 1,
  "about": "A contact flow design from the Aselo flow designer. Each flow is one Twilio Studio flow ...",
  "board": { "helpline": "usnm", "id": "abcd1234", "title": "USNM contact flows", "status": "ready", "statusLabel": "Ready for Claude", "isNew": true, "updatedAt": "...", "updatedBy": "Ale" },
  "flows": [
    {
      "key": "channel:voice",
      "channel": "voice",
      "frames": [
        { "id": "f-pre", "title": "Voice: pre-queue", "stage": "prequeue" },
        { "id": "f-post", "title": "Voice: post-queue", "stage": "postqueue" }
      ],
      "objects": [
        {
          "id": "o-tya",
          "type": "checkQueueAvailability",
          "kind": "Skilled worker available?",
          "studioWidget": "HTTP Request + Split",
          "studioName": "f_isSkilledWorkerAvailable_tya_calls",
          "text": "TYA specialist free?",
          "frame": "f-pre",
          "stage": "prequeue",
          "call": {
            "route": "worker/isSkilledWorkerAvailable",
            "urlTemplate": "${lambda_twilio_account_scoped_url}/worker/isSkilledWorkerAvailable",
            "body": { "targetSkills": "TYA,Calls", "targetChannel": "voice" }
          },
          "exits": [
            { "name": "available", "to": "o-welcome", "toStudioName": "play_message_voice_en_welcome" },
            { "name": "not available" },
            { "name": "failed" }
          ]
        },
        {
          "id": "o-welcome",
          "type": "playMessage",
          "studioName": "play_message_voice_en_welcome",
          "message": {
            "channel": "voice", "language": "en", "script": "Thank you for calling.",
            "recordingFile": "play_message_voice_en_welcome.mp3"
          },
          "exits": [{ "name": "", "endsFlow": true }],
          "openComments": [{ "author": "Ale", "text": "Shorter?" }]
        }
      ]
    }
  ],
  "notes": [{ "text": "Record the welcome", "frame": "f-pre", "task": { "status": "todo", "assignee": "Ale" } }],
  "checks": [{ "severity": "warning", "message": "“Closed” has no Studio name yet.", "objectId": "o-closed" }],
  "layout": { "o-tya": { "x": 40, "y": 200, "width": 210, "height": 72, "frame": "f-pre" } }
}
```

An exit without `to` and without `endsFlow` is still open (and is in `checks`). Each voice
message has its `recordingFile`, its `status` and, once uploaded, its `recordingUrls`.

The file also carries **`studioTemplates`**: each frame already written as a Studio flow template
(`src/flows/studioTemplate.ts`), with the texts to set in the `.hcl` variables and what it couldn't
fill in:

```json
"studioTemplates": [
  {
    "title": "[voice] · voice",
    "template": "usnm/templates/studio-flows/voice.tftpl",
    "channels": ["voice"],
    "text": "${
  jsonencode({
    \"description\": \"${flow_description}\", ...",
    "variables": [{ "scope": "flow_vars", "name": "send_wait_sms_welcome", "value": "Welcome to ...", "widget": "send_wait_sms_welcome" }],
    "todo": ["“split_language”: set what it splits on (its input) and its conditions."]
  }
]
```

- **Widgets imported from a live flow** are rebuilt from what the import kept (their settings,
  position and transitions); only their connections and the texts or settings changed on the board
  change. An imported board nobody changed gives back exactly the live template: the tests do
  that for every flow of every helpline in the repo.
- **New objects** become widgets of their kind: a voice menu is a Gather (its keypress, speech
  and timeout), a Repeat is a counter and a Split on it, a chatbot is the captureChannelWithBot
  request, a route check is the HTTP request and a Split on its answer, a message reads its text
  from `flow_vars`. What the board can't know (a split's input, a workflow) is marked `TODO`.
- **Texts** that a widget reads from a variable (`${flow_vars.x}`, `${channel_flow_vars.x}`) stay
  there: the changes are listed in `variables`, for `staging.hcl` / `production.hcl`.

The Claude skill **studio-flow-from-board** (`.claude/skills/studio-flow-from-board/SKILL.md`)
takes this file from there: it writes the templates, fills in the TODOs (from STUDIO_ROUTES.md, the
helpline's config, or by asking), sets the texts in the `.hcl` files, checks, and runs a staging
`make plan` for the person to review and apply.

### Recordings and scripts list

**Export › Recordings and scripts (spreadsheet)**, for everyone: one row per message or question,
by frame and top to bottom, with the frame, Studio name, recording file (voice), kind, channel,
language, the text on the board, the script and a status (*No script* / *Script ready* for now;
the recording statuses come with step 3). Sending it back filled in comes with the library in
step 3.

### Task attributes (Send to queue)

A Send to queue object's settings show the **task attributes** the widget gives the task, as JSON:
what the TaskRouter workflows' rules read (`channelType`, `helpline`, `language`...) and what
Flex shows. `{{…}}` is filled in by Studio from the contact; `${helpline}` and
`${task_language}` come from the helpline's config. The attributes the routing rules usually read
are highlighted, and the check flags attributes that aren't valid JSON or are missing.

In twilio-iac the widget almost always says `${channel_attributes.default}`, and Terraform puts
there a channel-attributes template picked for the channel (`channel_attributes` in common.hcl, or
defaults.hcl): `<channel>-conversations` for Conversations channels, otherwise `<channel>`, falling
back to `default-conversations` / `default`. The board shows that template's JSON instead of the
reference, and where it's kept (and for which channels; a flow shared by channels with different
templates shows the others too). A new Send to queue starts from the standard template for its
frame's channel. Changes stay in the template, never inline in the flow: the export lists new and
changed attributes (`studioTemplates[].taskAttributes`) and the studio-flow-from-board skill writes
them to the helpline's own template (a shared one gets a copy of the helpline's own).

### Import an existing helpline

Builds boards for a helpline that's already live, one per Studio flow as in Studio, so its flows can be seen, checked and changed
later, and its recordings moved into the recordings bucket. On the boards page, Aselo staff pick
the helpline under **Import a live helpline** and click **Preview**; the builder reads everything
from `master` (as it does for form definitions) and shows what it found and what needs a
person. Each flow found shows where it's live (**Staging**, **Production**, and channels that are in one environment only, e.g. "chat: staging only") and has a checkbox (all ticked to start): **Create the boards** saves the ticked ones (e.g. "USNM · [voice] · voice", "USNM · [sms, sms_shortcode] · sms") and copies their recordings (optional; only those the ticked flows play), with progress.
Nothing in Twilio or the repo changes.

| What | Where it comes from | Becomes |
|---|---|---|
| Which flows exist | the `channels` in the helpline's `staging.hcl` / `production.hcl` (merged over `common.hcl`, as Terraform does), the system-down subflow, and the other `studio_flows` (e.g. post-call surveys) | one board per Studio flow, its objects straight on the board (no frame around them: the board itself says which flow it is, `flow` with its channel and template, shown in its header; frames can still be added); channels sharing a template are one flow ("[sms, sms_shortcode] · sms") |
| Objects and connectors | the `.tftpl` templates: widgets and their transitions | objects of the matching kind (e.g. `make-http-request` to `worker/isSkilledWorkerAvailable` becomes "Skilled worker available?" with its skills), keeping the widget's name, its settings ("In Studio today") and its events as ways out (`audioComplete`, `noMatch`, `failedToEnqueue`) |
| Layout | Studio's own widget positions (`offset`) | the same layout as in Studio, with heights halved (Studio's widgets are much taller than the board's objects); objects that would overlap are moved down |
| Messaging texts | `${flow_vars...}` / `${channel_flow_vars...}` resolved from the environment files (production's when they differ); texts written in the template | each message's script |
| Recordings | `play` URLs resolved from the same files (today Twilio Serverless, which is public) | copied into the recordings bucket: staging's files in `staging`, production's in `production`, under their current names |
| Task attributes | a Send to Flex widget's `attributes`: `${channel_attributes.default}` resolved to the channel's channel-attributes template as Terraform does, or the JSON written in the widget | the Send to queue object's task attributes |

The templates are read with a small HCL reader (`server/hcl.ts`) that keeps interpolations as
written; its tests read every helpline's files in the repo, and import every helpline.

The report lists what needs a person:

- texts that **differ between staging and production**;
- **names that don't follow the convention**: kept as they are, since they're live and monitoring
  may use them. Renaming one later is a planned change (widget, recording file and template
  together);
- recordings whose file isn't named after the widget (e.g. USCH's
  `childhelp_voice_welcome_message.mp3`): kept under their name, and the object points at it;
- recording addresses or variables that couldn't be resolved, widget types the designer has no
  kind for (kept as "Other", with their settings).

Recordings are only copied from Twilio Serverless (`*.twil.io`) or `*.techmatters.org` addresses,
by Aselo staff.

Not built yet:

- **importing again** into an existing board (updating its frames from the templates and keeping
  its stickies and comments); for now each import makes a new board;
- **transcribing** voice recordings into scripts (Amazon Transcribe), since voice scripts aren't
  stored anywhere as text.

## Storage and access

- Boards are JSON in the existing drafts bucket, under `boards/<helpline code>/<board id>.json`.
  The bucket is versioned, so earlier saves can be recovered.
- Recordings: see [Where recordings are stored](#where-recordings-are-stored).
- People lists (who tasks can be assigned to): `people/<helpline code>.json` and
  `people/_aselo.json` in the drafts bucket, each a list of names and emails. Whoever opens a board
  is added to their list (helpline staff to their helpline's, Aselo staff to the Aselo team's) with
  the name and email from Okta. The lists can also be edited on the boards page: helpline staff
  edit their own helpline's, Aselo staff all of them.
- Checks that call an account-scoped lambda route keep its parameters (e.g. the skills) on the
  object and are named after the route (`f_isSkilledWorkerAvailable_tya_calls`), as
  `lambdas/account-scoped/STUDIO_ROUTES.md` says.
- Aselo templates (e.g. "Standard pre-queue flow") are boards under `boards/_templates/`, visible
  to everyone, editable by Aselo staff; a new board can start as a copy of one.
- The API checks the helpline from the Okta groups, as for drafts: helpline staff only list and
  open their own helpline's boards and recordings.
- New infrastructure (Terraform, in `form-builder/terraform/modules/aws`): the recordings bucket,
  its CloudFront distribution and DNS name, and Lambda permissions on it.

## Phases

1. **Studio flows** (this), in this order (all four built; re-import and transcription later):
   1. boards, frames, objects, connectors, stickies, comments, autosave;
   2. checks, JSON and spreadsheet exports;
   3. recordings bucket and library (upload, status, publish to production);
   4. import of an existing helpline (templates, texts, recordings; transcription last).
2. **Chatbot scripts**: design a chatbot's questions, answers and branches; output for the Lex
   Terraform (slots, intents, messages).
3. **TaskRouter**: queues, workflows, priorities and timeouts as diagrams; output for the
   `twilio-iac` TaskRouter config.
4. **Improvements**
   - **Live cursors and live editing**: see who's on the board and their changes as they make
     them (WebSocket API and shared editing).
   - **Walkthrough mode**: play a contact through the flow. Pick the channel and language, answer
     the menus and decisions ("it's closed", "presses 2"); the path lights up with animated
     connectors, recordings play, and messages appear in a phone or chat mock-up. Good for
     reviewing a design with the helpline before anything is built.
   - **Compare with Studio**: show where the live Studio flow differs from the board.
   - Slack notification on new comments and assigned tasks; PNG/PDF export; board history
     (compare two saves).
   - **Ready to implement**: mark a board (or a frame) as ready, so the studio-flow-from-board skill
     reads it straight from the builder (the boards bucket) instead of someone exporting the JSON and
     handing it over; marking it again after changes shows Claude what changed since.
   - **Task attributes, improved** (pending task): the JSON editor works but is technical. Next:
     a guided editor (pick attributes from a list saying what each is for and who reads it: routing
     rules, Flex, Insights), the same attributes across a helpline's channels, and a check that what
     the routing rules read (Routing designer) is on the tasks.
   - **Studio failure notifications**: today failures (e.g. a contact that fails to enqueue) are
     followed in Datadog, from Twilio's events; improve how the team is told about them. The flow
     check doesn't ask for a notification widget on each failure.

## Importing from a branch

Imports read master (deployed; locally, this checkout) unless another flex-plugins branch is chosen
next to the import button, e.g. the branch a helpline's changes are being made in. The branch's
files are downloaded from GitHub (public) and kept as a snapshot until it moves on
(server/branches.ts); the preview says which branch and commit it read, and chatbot and routing
designs keep it as `importedFrom`.
