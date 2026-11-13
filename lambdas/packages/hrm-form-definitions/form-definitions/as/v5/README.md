# as-v5: Mental Health Support Line

A generic adult mental-health support line (warmline / support line), modelled on how
mental-health organisations use Aselo but with nothing specific to any one organisation.
Activate it with `"definitionVersion": "as-v5"` (see the [demo index](../README.md)).

**Best for:** mental health support lines and warmlines, peer-support lines, family and
caregiver support lines, student wellbeing services, and suicide prevention
organisations that do follow-up calls.

## Helpline terms

This version shows how far terminology can be customised. With no code changes, the
whole UI uses:

| Default word | In v5 |
| --- | --- |
| Child | **Help Seeker** |
| Caller | **Supporter** (family member or friend contacting on someone's behalf) |
| Counsellor | **Specialist** |
| Case | **Support Plan** |
| Client profile | **Help Seeker Profile** |
| Categories tab / Summary tab | **Needs** / **Summary** |

## What is configured

| Area | Highlights |
| --- | --- |
| Call types | About self, About a loved one, plus Silent, Hang up, Wrong Number, Prank, Frequent Contact - Brief Check-in, Voicemail Completed, Test |
| Supporter tab | Name, relationship, gender, age group, region, how the supporter is coping |
| Help Seeker tab | Name/nickname, age group, gender, region, language, populations, currently in care, 6-question risk screening, assessed risk level |
| Needs (categories) | 8 categories (emotional wellbeing, conditions, suicide & self-harm, substance use, relationships, treatment & services, practical needs, information); max 5 |
| Summary tab | Support provided, crisis-line transfer, emergency services, felt supported, follow-up requested, how they heard about us, resources shared, summary |
| Support Plan sections | Safety Plan, Support Network, Crisis Episode (lists); Follow-up Call, Referral, Note (timeline); Document (not printed) |
| Statuses | Open → Active Follow-up ↔ Paused → Closed |
| Overview & filters | Help seeker at risk, next check-in, check-in frequency (filterable), summary |
| Profile | Summary, What Helps, Things to Avoid, Contact Agreement; 24 h and 30 day blocks |
| Pre-survey prefill | Off (the demo chatbot asks child-helpline questions) |
| Insights | None |
