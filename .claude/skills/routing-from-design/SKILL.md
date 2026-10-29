---
name: routing-from-design
description: Apply a routing design from the form builder's Routing designer (the "Export for Claude" JSON) to a helpline's TaskRouter config in twilio-iac - its workflow templates and the workflows and task_queues in common.hcl - and run a plan. Use when asked to apply, implement or update a helpline's routing, workflows, queues or skills from a routing design.
---

# Routing from a routing design

Turns a helpline's routing design (form builder › **Routing**, see
[form-builder/docs/routing-designer.md](../../../form-builder/docs/routing-designer.md)) into its
TaskRouter config in `twilio-iac`, then shows a plan.

## Hard rules

- **Only implement a design marked "Ready for Claude"** (`status` is `ready` in the export). If
  it's `in-progress`, `imported` or `implemented`, say so and ask before going on. After implementing,
  remind the person to mark it **Implemented** in the designer.
- **Never** run `apply`, `destroy`, `import` or state commands. Read-only `plan` is fine; the person
  applies.
- Staging first; production only when the person says so.
- Never change a **shared** workflow template (`twilio-iac/helplines/templates/workflows/*`):
  other helplines use it. A shared workflow that changed gets a template of this helpline's own.
- Don't invent SIDs or values; the repo is public (templates use `${...}` variables).
- Renaming a queue's key or removing a queue changes TaskRouter queues that may hold tasks and that
  reports use: ask first.

## The export

`<helpline>-routing.json`:

| Field | What it is |
|---|---|
| `helpline` | The helpline code |
| `generated.workflows[]` | Each workflow's template (`text`), where it lives (`template`), and `shared` |
| `generated.workflowsBlock` | The `workflows = { ... }` block for `common.hcl` |
| `generated.queuesBlock` | The `task_queues = { ... }` block for `common.hcl` |
| `generated.skills` | The skills the design uses: each Flex account needs them |
| `generated.skillsWithLevels` | The ones whose levels steps sort by (`order_by: worker.routing.levels.<skill> DESC/ASC`): levels must be on in Flex |
| `design` | The design itself (rules, steps, queues, skills, capacity with `maxChats`) |
| `checks` | Mistakes and gaps the designer found |

Anything not changed in the designer comes out **exactly** as it is live (the form builder tests
this for every helpline), so `git diff` only shows what was designed.

## Workflow

### 1. Read the export

Ask for the file if you don't have it. Tell the person: the workflows, how many rules each, which
ones changed (compare with the files), and the `checks` **errors**. Errors are fixed in the
designer, not here: stop and say so. List the warnings for the person to decide on.

### 2. Workflow templates

For each `generated.workflows` entry:

- Not shared: write `text` to `twilio-iac/helplines/<template>`.
- Shared and unchanged (its text equals the shared file): leave it.
- Shared and changed: write `text` to `twilio-iac/helplines/<helpline>/templates/workflows/<file>`,
  and point that workflow's `templatefile` at it in the block (step 3).
- Templates built by template code (`%{ for ... }`, e.g. queue transfers) come out as they are:
  nothing to do.

### 3. common.hcl

Replace the helpline's `workflows = {...}` and `task_queues = {...}` in
`twilio-iac/helplines/<helpline>/common.hcl` with `generated.workflowsBlock` and
`generated.queuesBlock` (adjusting a `templatefile` from step 2). Keep the comments that were there
when they still apply. If the helpline sets `workflows` or `task_queues` in `staging.hcl` /
`production.hcl` instead, change them there.

### 4. Check

```bash
cd form-builder && npx vitest run server/hcl.test.ts server/routing.test.ts
git diff --stat
```

Explain the diff in plain terms: which rules moved, what each changed step now asks for (skills,
roles, priority, when it moves on), new or changed queues.

### 5. Plan (staging)

On the devops node (stages at `~/flex-plugins.git/twilio-iac/stages`), on the branch with these
changes pushed:

```bash
cd ~/flex-plugins.git/twilio-iac/stages/configure && make HL=<code> HL_ENV=staging plan
```

Read it back: which workflows and queues change, and that nothing is destroyed except what the
design removed.

## Hand-off

End with the files changed, what the plan shows, and what's left for the person:

- apply, open the PR, test a contact in staging;
- **in Flex** (each account): the skills in `generated.skills` exist (Teams view), the ones in
  `generated.skillsWithLevels` have levels turned on and counselors have a level set, and the
  counselors' chat capacity (`design.capacity.maxChats`, the `maxMessageCapacity` attribute) if it
  changed;
- production, when they're ready.
