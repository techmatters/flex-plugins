---
title: Permissions
kind: section
audience: everyone
order: 54
questions:
  - who can see a case
  - who can see contacts
  - can counselors see other counselors' contacts
  - hide a field from counselors
  - who can listen to recordings
  - who can read transcripts
  - who can flag a profile
  - change permissions
  - why can't a counselor see a case
  - what does supervisor mean in permissions
keywords: permissions, permission, access, who can, supervisor, owner, creator, case, contact, profile, flag, transcript, recording, identifiers, masked, field, hrm, permission_config, rules
---

**Permissions** (under **Helpline**) say who can do what with the helpline's contacts, cases and client profiles. The Aselo team changes them; helpline staff see them, approve them, and ask questions or leave comments in the review panel at the top.

**How a rule reads.** Each action (see a case, edit a contact, listen to a recording...) has one or more **ways to be allowed**. Any one way is enough, and everything in a way must hold. So "Supervisors; or the contact's owner" lets supervisors and the counselor who took the contact; "Supervisors and created less than 24 hours ago" lets supervisors only in the first day. An action with no ways is **Nobody**.

**Who's who.**

- **Supervisors**: people with the supervisor role in Flex.
- **The contact's owner**: the counselor who took the contact.
- **The case's creator**: the counselor who opened the case. **Owns a contact in the case**: took one of its contacts.
- **Created less than … hours/days ago**: counted from when the contact, case or profile was created.

**Groups the helpline doesn't use** are folded away: **Cases**, when nobody can do anything with them, and **Client profiles**, when they're switched off in **Features**. The Aselo team can still open them.

**Contact fields** work the other way round: fields not named are seen and edited by whoever can see or edit the contact. A named field is hidden (or can't be edited) for anyone its ways don't allow, e.g. a last name only supervisors see. These only take effect where HRM has contact field permissions turned on.

**See identifiers** decides who sees phone numbers, emails and other identifiers in Flex; everyone else sees them masked.

**Where they live.** In the hrm repo (`hrm-domain/hrm-core/permission-rules/<name>.json`), not with the forms: the file is named by `permission_config` in the helpline's settings, usually its code. Some helplines share a file (e.g. `demo`), and the page says so: a change to a shared file changes every helpline using it. Changes reach counselors once the file is committed to the hrm repo and HRM is deployed, staging first. **Download for the hrm repo** gives the file; the changes' zip has it too, under `hrm/`. A PR opened from the builder leaves it out and the draft keeps it until it's downloaded.

**Checks.** HRM won't start if an action is missing or uses a condition it doesn't take (e.g. "the contact's owner" on a case), so the page flags these and download waits until they're fixed. A way with no conditions never allows anyone, and a field rule names one field per way.
