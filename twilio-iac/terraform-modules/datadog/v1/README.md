# datadog/v1: helpline tags for Datadog logs, known limitations

How the helpline tags work is described in the comments in `main.tf`. In short: each helpline's
configure apply writes its own rows (account SID, Studio flow SIDs) to its environment's S3 bucket and
rebuilds the environment's merged files. Datadog Reference Tables sync from the merged files, and a
global log pipeline uses them to set `account_short_code`, `account_env` and `flow_name`.

This page lists what the design does not handle, and what to do about it.

## 1. Applies run at the same time can lose rows (race condition)

The merged files are rebuilt with a read-modify-write and there is no lock between helplines.
Terraform state locks are per helpline, environment and stage, so two helplines of the **same
environment** can apply at the same time.

How rows get lost:

1. Helpline A and helpline B (same environment) both plan. Each plan reads every per-helpline file and
   computes the merged file from what is in the bucket **at that moment**.
2. A applies: it writes its own file and a merged file with A's new rows and B's old rows.
3. B applies: it writes its own file and a merged file with B's new rows and **A's old rows**, because
   its plan was computed before A's apply.
4. The merged file now holds A's old rows. Last write wins: A's changes are gone from the merged file.

What it looks like: the changed SIDs of A show `MISSING_ACCOUNT_SHORT_CODE` / `MISSING_ENV` /
`MISSING_FLOW_NAME` in Datadog (or an old flow label), although A's apply succeeded.

What it does **not** affect:

- Each helpline's own file (`helpline-tags/<folder>/<code>_<env>.csv`): every helpline writes only its
  own key, so those are always right.
- Other environments: each environment has its own bucket and merged files.

It fixes itself: the next configure apply of **any** helpline in that environment rebuilds the merged
files from all the own files.

To avoid or fix it:

- Run configure applies of the same environment one after the other, not in parallel (including
  batch rollouts across many helplines).
- Apply soon after planning. The merged content is computed at plan time, so a plan that sat for a
  while (or a saved plan file) can overwrite rows another helpline wrote since.
- If it happened: re-apply any helpline of that environment (a plan shows the merged-file change), or
  restore the previous object version in S3 (versioning is on).

## 2. Plans show changes to the merged files that aren't yours

Every helpline's state manages the same two merged files, so a plan shows an update to
`aws_s3_object.datadog_helpline_tags_merged` whenever another helpline changed its rows since this
helpline's last apply. That's expected: applying it writes the current content of all helplines.
Check that the diff only adds or changes rows; a plan that removes another helpline's rows means that
helpline's own file is missing.

## 3. Changes take a few minutes to reach the logs, and aren't retroactive

The Reference Tables sync from S3 about every 5 minutes. Logs ingested between an apply and the next
sync get the old tags (or the `MISSING_*` fallback for new SIDs). Datadog sets tags when a log is
ingested, so those logs keep the wrong tags. The same happens while the pipeline itself is being
edited.

## 4. Rows only change when a helpline applies

- A helpline's SIDs are only written by its own configure apply. Until a helpline applies with this
  module, its rows come from the seed files (`_seed.csv`, a snapshot of the old hand-kept lists from
  2026-11-09); SIDs that changed after that show `MISSING_*`.
- Rows in the seed files are never removed automatically. A helpline's apply overrides its SIDs, but
  a SID that only exists in the seed (for example a flow deleted since) stays in the table. Harmless,
  but clean the seed files by hand from time to time.
- Only the flows this module receives are listed: `channel_studio_flow_sids` and `studio_flow_sids`.
  Flows created another way (by hand in the console, or by a stage that doesn't pass its SIDs here)
  get `MISSING_FLOW_NAME`.

## 5. One environment's helplines can overwrite each other's merged files

The bucket policy is per environment (each environment's Terraform role can only write to its own
bucket), not per helpline. Any helpline of that environment can write the whole merged file. That's
by design, and it's why the bucket has versioning on.

## 6. A SID must exist in only one environment

The pipeline looks each SID up in the production, staging and development tables in that order, and
all three lookups write the same target. A lookup that finds nothing leaves the target alone
(verified 2026-11-24), so this works because a Twilio SID belongs to one account in one environment.
If the same SID were in two environments' tables, the last lookup that matches (development, then
staging) would win.

## 7. Silently off when the inputs are empty

If `twilio_account_sid` or `datadog_tags_bucket` is empty, the module writes nothing and the plan shows
nothing for it. A helpline missing either one is never tagged, and nothing fails.

## 8. `-target=module.datadog` doesn't isolate the tags

The module reads the Studio flow SIDs, so a targeted plan or apply also pulls in the flows (and
anything they depend on). Review the whole plan.

## 9. Plain CSV, no quoting

Values are joined with commas without quoting. Short codes, environments and flow names
(`<code>_<env>_<flow key>`) never contain commas or line breaks today; a value that did would break the
row and the Reference Table sync.

## 10. Parts that live outside this repo

The three buckets and their policies, the six Reference Tables and the pipeline "Aselo helpline tags
(reference tables)" were set up by hand. A change there (a renamed table, a processor moved below the
remappers, a bucket policy edit) isn't visible in any plan here. The plan is to manage them as code
later.

## 11. Decommissioning a helpline

The merged files have `prevent_destroy`, so destroying a helpline's configure stage fails. First add a
`removed { lifecycle { destroy = false } }` block for `aws_s3_object.datadog_helpline_tags_merged`, let the
destroy remove the helpline's own files, then re-apply any other helpline of that environment so the
merged files drop its rows.
