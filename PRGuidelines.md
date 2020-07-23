# Guidelines for everyone

We are dedicated to open source and openness.  This means that everything here lives in the public record.  Be civil in your conversations.  Be careful not to share unnecessary private information or credentials.  When in doubt, send a personal message instead.

# Guidelines for submitters

As a submitter, you want to strive for zero comments from the reviewer on problems -- bugs, poor styling or factoring, etc.  Do your best to spot and address issues before you submit a PR for review.  However, we all overlook things sometimes and there is no shame in a reviewer find mistakes.  We are all part of one team.

Here is a checklist of things to check before asking for a review:
* Is this PR a good size for review?  Should it be separated out into separate PRs to make review easier?
* The title of your PR should be succinct but clear.  PR titles are an important part of the commit history.  If someone looked at that title in a year, would it make sense to them?
* Write a description that elaborates on the title and helps anyone looking at this know what's going on.  That includes your reviewer -- what should they know when looking at this?  How can you help them understand the high level of what the code is doing, so they don't have to deduce it entirely from the code itself?  It also includes people who will look back at this in six months, one year, two years -- maybe you will be one of those people.  Help your future self to understand what you are thinking now.
* If you are making UI changes, have you made them accessible?  Have you added appropriate `axe` unit testing?  Have you tested it out with a screen reader?
* If you have updated any APIs, did you update swagger as well and document them?
* If you added new strings in the UI, did you make them templates for localization?
* Have you removed any commented-out code, unnecessary commenting or anything else that doesn't need to live in the final production version?
* Have you added appropriate unit testing?
* Have you double-checked the mockups, specs or issues to see that you've implemented what is expected?


# Guidelines for reviewers

* Part of the goal is knowledge sharing.  If the author of the code went on vacation, would you understand this code enough to debug issues or explain it to someone else?  It is entirely okay to have a conversation back and forth with the author to understand it.
* Reviews take time.  Depending on the size of the change, it can easily take an hour or more to do a good review.  If you're crunched for time, raise that with others on the team so we can prioritize.
* If this is a PR that affects the UI, run it locally and test out some interactions.
* You may disagree with design or code factoring choices.  Raise those as suggestions.  Conversation and debate is welcome.  Try to come to a consensus, though the final decision lies with the submitter.
* Look at the checklist of items above, and run over the same checklist.  Is it accessible?  Is there API documentation?  Is the code clean?


