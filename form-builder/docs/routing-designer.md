# Routing designer: design

A **Routing** section in the form builder for designing how a helpline's contacts reach
counselors: Twilio TaskRouter's workflows (the rules a new task goes through), queues, skills and
capacity. It replaces the Miro boards used for this today, for people with little or no technical
background, and turns the design into the helpline's `twilio-iac` config.

**Status:** first version built (import, editor, diagram, test a task, check, export, skill `routing-from-design`);
second round (2026-10-28): alternative condition groups, a JSON tab per rule, typed-in task
attributes, skill levels, the offline-contact check, and a simpler "test a task".

Same approach as [Contact flows](flow-designer.md): import a live helpline, change it, check it,
export it, and a Claude skill applies it with a plan.

## What it covers

| Part | In TaskRouter / twilio-iac | In the designer |
|---|---|---|
| **Workflows** | `workflows` in `common.hcl` and their templates (`templates/workflows/*.tftpl`): an ordered list of filters, each with targets | One page per workflow: rules in order (drag to reorder), each with its *task conditions* and *worker conditions* (targets in order) |
| **Rules** (filters) | `filter_friendly_name`, `expression` (task attributes) | A name, and task conditions picked from lists: channel, service, language... ("Voice · Spanish · TYA"). A top-level `(…) OR (…)` becomes alternative groups ("or another set of conditions") |
| **Targets** | `queue`, `expression` (who), `priority`, `timeout` / `skip_if`, `order_by`, `known_worker_sid` | "Offer to *queue*: counselors with *skills*", who to prefer (a skill's level), then what happens if nobody takes it ("move on at once", "after 2 minutes", "wait") |
| **Queues** | `task_queues` in `common.hcl`: `friendly_name`, `target_workers` | Name, and who can work in it (skills) |
| **Skills** | In each Flex account's settings (not in the repo) | The helpline's list, as coloured chips; kept in the designer, listed in the export to check in Flex. A skill can have **levels**: steps can then prefer counselors by level (`order_by: worker.routing.levels.<skill> DESC` or `ASC`; USCH already does this) |
| **Capacity** | Target expression blocks; `maxMessageCapacity` worker attribute | Plain settings: "never a call and a chat at the same time", "one voicemail at a time", "max chats at once" |

## How TaskRouter expressions are read

A target's `expression` says which workers can get the task. Across the helplines, almost all of
them are combinations of the same blocks, which the designer shows in plain language:

| Block | Shown as |
|---|---|
| `worker.waitingOfflineContact != true` | Not busy with an offline contact |
| transfers (`transferTargetType`, `targetSid`, `ignoreAgent`) | Transfers go to the chosen counselor, and nobody gets back a contact they transferred |
| `worker.channel.chat.assigned_tasks == 0` (for voice) / `...voice...` (for chat) | Never a call and a chat at the same time |
| `worker.channel.voicemail.assigned_tasks == 0` | One voicemail at a time |
| `'X' IN worker.routing.skills` | Has the skills X, Y... |
| `worker.roles HAS 'agent'` / `... OR ... 'supervisor'` | Counselors / counselors or supervisors |
| `(…) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)` | …or the offline contact the counselor is recording. Only expected in the Offline Contacts rule: anywhere else Check warns (offline contacts should be caught before) |

Anything else is a **custom condition**, shown as written. Queues' `target_workers` are read the
same way (skills, with "any of" groups: "Calls or SMS, and TYA").

Moving on to the next target:

| TaskRouter | Shown as |
|---|---|
| `skip_if` (e.g. `1==1`) | If nobody can take it right away, move on at once |
| `timeout: 120` | Move on after 2 minutes |
| neither | Wait here until someone takes it |

**Round trip:** whatever isn't changed in the designer is written back exactly as it is live (the
expressions as written, the order, the formatting of values); only what's edited is rewritten from
the blocks. Tests import every helpline and check that an unchanged design gives back its live
workflows and queues.

## The editor

- **Helpline › Routing**: the workflows as tabs, the queues, the skills and capacity settings.
- **A workflow**: its rules as cards in order. Each card: *Task conditions* (which tasks it takes:
  one or more groups of conditions, any group can match) and *Worker conditions* (its targets in
  order: queue, skill chips, who, who to prefer, priority, what if nobody takes it). A **JSON** tab
  on each card shows the filter as it will be written. Drag a card to change the order; drag skill
  chips onto a target or a queue.
- **Task attributes**: the list offers the generic ones (channel, service, language, voicemail
  service and language, transfers, offline contact) plus those the helpline's rules already use;
  "Other (type it)…" adds any other (e.g. NZ's `clinical`), shown as the helpline's own.
- **The diagram** next to it, drawn automatically like the Miro boards: *New task arrives* →
  rule → *match* → queue, *No match* ↓ next rule, *Next target* ↓. Clicking something in the
  diagram opens its card.
- **Test a task**: click what the contact looks like (channel, service, language; transfers and
  offline contacts under "More details") and read what happens: the rule that takes it, each step
  (queue, who, what if nobody takes it), and why the rules before it didn't.
- **Check**: rules that can never match (an earlier rule catches everything they would), queues
  nobody can work in, skills no queue uses, targets missing a queue, the offline-contact
  alternative outside the Offline Contacts rule, preferring by the level of a skill without levels,
  and the like.

## Storage and access

One routing design per helpline, `routing/<code>.json` in the drafts bucket, saved automatically
with the same conflict check as boards. Helpline staff see and edit their own helpline's; Aselo
staff all of them. Importing from the live config (Aselo staff) creates or replaces it.

## Output

- **JSON for Claude**: the design, the workflow templates and the `task_queues` block already
  written, and the skills to check in Flex.
- The Claude skill **routing-from-design** (`.claude/skills/routing-from-design/SKILL.md`) writes
  them into `twilio-iac`, and runs a staging `make plan` for the person to review and apply.

Not built yet: renaming a queue's key in the designer (new queues get one from their name), and
the "Ready to implement" idea from Contact flows (Claude reading the design from the builder).

## Status

A routing design has a status, the same as boards and chatbots (src/designStatus.ts): **Imported**
(read from the live config, unchanged) → **In progress** (any change) → **Ready for Claude** →
**Implemented**, plus **New** for a design started empty. Aselo staff set it in the toolbar; the
start page lists every helpline's design with its status, and the routing-from-design skill only
implements a design marked ready.

## Pending tasks

Lower priority, in the live config (each on its own branch, with a staging plan):

- **ZA: typo in a target expression.** `za/templates/workflows/master.tftpl` line 60 says
  `worker.waitingOfflineContact! = true`; it should be `worker.waitingOfflineContact != true`. As
  written, TaskRouter reads an attribute called `waitingOfflineContact!`, so that step likely doesn't
  keep tasks away from a counselor recording an offline contact.
- **USNM: garbled "EN STD Voicemail" expression** in `usnm/templates/workflows/calls-voicemails.tftpl`
  (its first target, a copy-paste mix-up).
- **Offline-contact leftovers** (Check lists them): `OR (worker.waitingOfflineContact == true AND …)`
  alternatives outside the Offline Contacts rule, e.g. USCH's ChatText rules; harmless but misleading.

## Importing from a branch

Imports read master (deployed; locally, this checkout) unless another flex-plugins branch is chosen
next to the import button, e.g. the branch a helpline's changes are being made in. The branch's
files are downloaded from GitHub (public) and kept as a snapshot until it moves on
(server/branches.ts); the preview says which branch and commit it read, and chatbot and routing
designs keep it as `importedFrom`.
