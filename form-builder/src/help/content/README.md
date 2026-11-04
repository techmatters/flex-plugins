# Help articles

What the **Help** panel shows (top bar, every area). One Markdown file per article, in the
folder of the area it's about: `forms/`, `flows/`, `routing/`, `chatbots/`, or `general/` (shown
in every area). The file's name is its id: links to it are `[text](help:<file name>)`.

Written for **helpline staff** first: plain words, the buttons' names as they appear on screen,
what they'll see happen. Aselo-only articles say `audience: aselo` and are hidden from helpline
staff.

## The header

```markdown
---
title: Send your changes for review     # as a task or a question
kind: guide                            # guide (steps) or answer (one question)
audience: helpline                     # helpline, aselo or everyone
order: 22                              # its place in the area's list (lower first)
questions:                             # how people ask for it: the more, the better it's found
  - how do I submit my changes
  - I'm done, what now
keywords: submit, send, review, finish # other words people might use
---
```

`questions` and `keywords` are what make the search find an article: add the ways people really
ask (the Help panel's **Questions sent to the Aselo team**, for Aselo staff, lists those it
couldn't answer). Synonyms the search already knows (send = submit, comment = flag...) are in
`../search.ts`.

## The text

The first paragraph is the short answer shown in search results: make it answer the question on
its own. Then:

- `1.` numbered lists: a guide's steps (shown as numbered circles)
- `-` lists, and `   -` indented under a step
- `**bold**` for buttons and what's on screen, `` `code` `` for values typed
- `> ` a tip
- `## ` a heading
- links: `[text](help:<article>)`, or `[text](https://...)`

`npm test` checks every article: its header, and that its links lead to an article.
