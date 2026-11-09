---
title: Test a flow
kind: guide
audience: helpline
order: 5
questions:
  - how do I test a flow
  - how do I try the flow
  - can I see what a caller would hear
  - what does marked as tested mean
  - green paths
keywords: test, try, simulate, run, path, tested, green, dialpad, reply, walk through
tour:
  - css:.flow-mode [role="tab"]:nth-child(3) | Click **Test**. The board can't be changed while testing. | Open a board first, from the Contact flows page.
  - button:Play | Click **Play** to start the flow from its beginning. | Click **Test** first.
  - label:What happens next | At each question, choose or type the answer, as the contact would. | Click **Play** first.
  - button:Back | **Back** goes back one answer, e.g. to take another way at a split. | It shows once you've answered something.
  - button:Mark path as tested | When the run ends well, click **Mark path as tested**. | It shows when a run reaches the end of the flow.
  - text:Show tested paths (green) | Tick this to see the paths already tested in green, and what's left to test. | Click **Test** first.
---

**Test** mode walks through a flow as a contact would, without calling or texting anyone. It checks the flow's paths, not its live messages.

1. Click **Test** in the toolbar. The board can't be changed while testing.
2. The **Test** panel starts the flow from its beginning. At each question, choose or type the answer: a reply in a chat, or keys on a dialpad for calls. Where Aselo would check something (opening hours, the client profile...), choose what it finds.
3. The board shows the way taken in blue, with step numbers. **Back** goes back one answer; **Test another path** starts again.
4. When a run ends well, click **Mark path as tested**. With **Show tested paths (green)**, the paths already tested are green, and the panel lists the ways out nobody has tested yet.

A tested path goes back to untested if a step on it changes, so you always know what's been checked since.
