# as-v5: Crisis & Emergency Response Line

A generic crisis and emergency response line: a line that has to triage quickly, find out
where the person is, get help to them (emergency services, mobile crisis team, welfare
check) and follow up afterwards. Activate it with `"definitionVersion": "as-v5"` (see
the [demo index](../README.md)).

**Best for:** crisis lines that dispatch help, mobile crisis teams, disaster and
emergency hotlines, public-safety or emergency-service partners, and violence
response lines that work closely with police.

## Helpline terms

| Default word | In v5 |
| --- | --- |
| Child | **Person at Risk** |
| Caller | **Reporting Party** |
| Counsellor | **Responder** |
| Case | **Incident** |
| Client profile | **Caller History** |
| Categories tab / Summary tab | **Emergency Type** / **Response** |

## What is configured

| Area | Highlights |
| --- | --- |
| Call types | Person at risk about self, Reporting on behalf of someone, plus Silent / Open Line, Hang up, Wrong Number, Hoax / Prank, Duplicate Report, Information Only, Test |
| Reporting Party tab | Name, callback number, relationship, on scene?, wants to stay anonymous |
| Person at Risk tab | Name, age group, gender, current location, location type, region, emergency type (with follow-up questions for overdose and disaster), immediate danger, access to means, substances, injuries |
| Emergency Type (categories) | 8 categories (suicide & self-harm, mental health crisis, medical, violence & safety, missing persons, disaster, basic needs, information); max 3 |
| Response tab | Triage priority P1–P4, response actions, emergency service contacted, dispatch reference, outcome, follow-up required, supervisor notified, resources shared, call summary |
| Incident sections | Emergency Dispatch (table in the PDF), Welfare Check (lists); Situation Update, Follow-up, Referral, Note (timeline); Document (not printed) |
| Statuses | Open → Responding ↔ Monitoring → Closed |
| Overview & filters | Person at immediate risk, priority, response area (both filterable), follow-up date, summary |
| Profile | Summary, Safety Alerts, Known Locations, Emergency Contacts; 2 h and 24 h blocks (for hoax callers) |
| Pre-survey prefill | Off |
| Insights | None |
