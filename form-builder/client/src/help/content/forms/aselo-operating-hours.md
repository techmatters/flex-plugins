---
title: Operating hours
kind: section
audience: everyone
order: 53
questions:
  - how do I set operating hours
  - change the opening hours
  - add a holiday
  - add public holidays
  - what is an office in operating hours
  - why does check operating hours fail
  - the helpline is closed when it should be open
  - change the time zone
  - preClosing
keywords: operating hours, opening hours, open, closed, holiday, holidays, time zone, timezone, office, offices, shift, channel, operatingInfo, account-scoped, lambda, preClosing, closed message
---

**Operating hours** (under **Helpline**; the Aselo team changes them, helpline staff review and comment on them) is when the helpline is open, as the **Check operating hours** step of its Studio flows asks: it's told **open**, **closed** or **holiday**, and closed or on a holiday the flow says so with the closed messages (**Automatic chat messages**: `ClosedOutOfShift`, `ClosedHolidays`).

The hours are in `lambdas/account-scoped/src/operatingInfo/<code>.json`, inside the account-scoped Lambda, so a change reaches flows after the PR is merged **and the account-scoped Lambda is deployed** (the change list says so). Hours are only checked **in production**, unless the `operating_hours_enforced_override` SSM parameter turns them on for an account. A helpline without the file is always open.

**Schedules.** The main schedule, and **offices**: other schedules a flow can ask for by name (the `office` it sends). Each has its own time zone, holidays and hours. An office the flow asks for that isn't there, or that doesn't have the channel, uses the main schedule. USNM's `preClosing` is the main hours ending 15 minutes early, for a "we're closing soon" message.

**Hours.** Per channel (the `channel` the flow sends: voice, sms, webchat, whatsapp...), per day, one or more shifts: open from, until (not including) the closing time. A channel the **main** schedule doesn't have makes the check fail, and the contact takes the flow's failure path. **Use these hours for every channel** copies the channel shown to the others. Nothing can go past midnight: a shift like 22:00 to 02:00 is split into 22:00–midnight and 00:00–02:00 the next day (**Split across midnight**).

**Holidays** close the whole day, every channel, in the schedule's time zone. **Add public holidays** adds a country's (or region's) public holidays for a year; **Remove past holidays** tidies the list.

**Checks** at the top, before it's saved:

- a day missing, a time that isn't one, a shift past midnight, overlapping hours;
- a time zone Aselo doesn't know;
- what the helpline's Studio flows check (its templates and the shared ones it uses): a channel the main schedule doesn't have (the check would fail), an office that isn't there or doesn't have the channel (the main schedule is used).

**Check a time** answers as the Lambda would for a date and time where the schedule is, a channel and an office.

The **Check operating hours** step in **Contact flows** offers the channels and offices from here.
