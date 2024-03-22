## Description
<!--
- What this pull request does.
- Bug fix, new feature, documentation change, etc.
-->

### Checklist
- [ ] Corresponding issue has been opened
- [ ] New tests added
- [ ] Feature flags added
- [ ] Strings are localized
- [ ] Tested for chat contacts
- [ ] Tested for call contacts

### Other Related Issues
<!--
- The primary issue this PR addresses should be part of the PR title.
- If there are other tickets related to this PR, reference them here with context of how they are relevant.
-->
None

### Verification steps
<!--
Describe how to validate your changes.
- Include screen shots if applicable.
- Note if migrations are required.
-->

### AFTER YOU MERGE

1. Cut a release tag using the Github workflow. Wait for it to complete and notify in the #aselo-deploys Slack channel.
2. Comment on the ticket with the release tag version AND any additional instructions required to configure an environment to test the changes.
3. Only then move the ticket into the QA column in JIRA

You are responsible for ensuring the above steps are completed. If you move a ticket into QA without advising what version to test, the QA team will assume the latest tag has the changes. If it does not, the following confusion is on you! :-P