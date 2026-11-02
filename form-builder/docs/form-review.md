# Reviewing forms: design

How the helpline and the Aselo team review a draft's forms together in the builder. How to use
it is in the [user guide](user-guide.md#reviewing-forms).

## What it does

Two reviews run side by side on every contact form tab and case section form:

- **Helpline**: is this what we want counselors to see? Anyone with access to the helpline
  approves for it.
- **Aselo**: is it technically right (saved names, PII, reporting, prepopulation)? Aselo staff
  approve for it.

Both can be given to a whole form or to one field. Anyone can **flag** a form or field with a
question, something needing attention, a change needed or a note, say who it's for, and discuss
it in a thread until someone resolves it. Other sections (call types, messages, case statuses,
service configuration...) aren't reviewed.

## Decisions

| Decision | Choice |
|---|---|
| Who approves for the helpline | Anyone with access to it; every action is logged with who and when |
| Section (form) approval | Given by hand, not worked out from its fields |
| Gates on Submit or Apply | None for now |
| What gets reviewed | Forms only: the contact tabs and the case sections' forms |

## Data

Kept in the draft's metadata (`server/drafts.ts`), so it's shared by everyone who opens the
draft and goes away when the draft is discarded or applied. The rules are in `server/reviews.ts`;
the builder's side in `src/formReviews.ts`.

- **Targets**: a form (`contactTab:CallerInformationTab`, `caseSection:note`) or one of its fields
  (`contactTab:CallerInformationTab#firstName`, by the field's saved name).
- **Approvals**: one per side and target, with who, when and a fingerprint of what was approved
  (the form's or the field's JSON). When that changes, the approval shows as "changed since".
- **Threads**: a flag (`question`, `attention`, `changes`, `note`) on a target, with its text,
  author and side, who it's for, replies, and who resolved it and when. Open threads show an icon
  on the field and on the form in the menu.
- **Review log**: every approval, flag, reply, resolve, reopen and delete, with who, which side
  and when.

Approving or flagging isn't a change to the draft's content: it doesn't bump the revision, so
nobody editing at the same time gets a conflict. It can start a draft (a question asked before
anything changed), and a draft that holds a review isn't removed when its file changes are
undone.

API: `POST /api/drafts/:code/:version/approve` and `.../threads` (`server/api.ts`).

## Potential improvements

Next, as agreed:

1. **"Needs me" filter**: show only what's waiting on me (flags for me, and what my side hasn't
   approved), and a **My items** list on the Forms start page across helplines.
2. **Audit trail in the PR**: put the approvals and the resolved questions with their answers
   (from the review log) in `CHANGES.md`, so the PR records who signed off on what.

Later:

3. **Review only what changed**: approvals for the fields the draft added or changed; unchanged
   fields only when someone flags them.
4. **Gates**: warn, or block, Submit while the helpline's own questions are open, and Apply or
   Download while flags are open or changed fields lack either approval.
5. **Notifications**: email or Slack when something is assigned to you or your question is
   answered (submissions are already posted to Slack).
6. **@mentions** in comments, to bring someone in without assigning the flag to them.
7. **An approver role for helplines**: only supervisors approve for the helpline, from an Okta
   group like the existing ones (e.g. `form-builder-<code>-approvers`).
8. **Approvals worked out from fields**: a form counts as approved once all its (changed) fields
   are, instead of by hand.
9. **More of the builder**: the webchat form and client profiles, then the flow designer, routing
   and chatbots (chatbots already have comments), so the same review works everywhere.
10. **Open flag counts in the menu**, next to the icons.
11. **Renamed fields**: approvals and flags follow a field's saved name, so renaming one (Aselo
    staff only) leaves them behind; they could move with it.
12. **Discarding a review-only draft**: a draft with flags but no changes has no **Discard draft**
    button yet.
