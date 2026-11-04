/** @jest-environment ./jest/jsdomEnvironment.cjs */
/**
 * Copyright (C) 2021-2026 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { afterEach, describe, expect, test, jest } from '@jest/globals';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HELP_ARTICLES, parseArticle } from './articles';
import type { HelpArea } from './articles';
import { blocksOf } from './HelpMarkdown';
import { HelpPanel } from './HelpPanel';
import type { HelpClient } from './helpClient';
import { searchHelp } from './search';
import { expectAt } from '../testing/expectAt';

afterEach(cleanup);

describe('the help articles', () => {
  test('each has a title, the ways people ask for it, a short answer, and links that lead somewhere', () => {
    const slugs = new Set(HELP_ARTICLES.map((article) => article.slug));
    expect(HELP_ARTICLES.filter((article) => article.area === 'forms').length).toBeGreaterThanOrEqual(15);
    HELP_ARTICLES.forEach((article) => {
      expectAt(article.slug, article.title).not.toBe('');
      expectAt(article.slug, article.questions.length).toBeGreaterThanOrEqual(2);
      expectAt(article.slug, article.summary.length).toBeGreaterThan(30);
      expectAt(article.slug, ['helpline', 'aselo', 'everyone']).toContain(article.audience);
      expectAt(article.slug, ['guide', 'answer', 'section']).toContain(article.kind);
      [...article.body.matchAll(/\]\(help:([^)]+)\)/g)].forEach(([, slug]) =>
        expectAt(`${article.slug} links to ${slug}`, slugs.has(slug)).toBe(true),
      );
    });
  });

  test('its header is read: lists, kind, audience and order', () => {
    const article = parseArticle(
      './content/forms/x.md',
      '---\ntitle: X\nkind: guide\naudience: aselo\norder: 3\nquestions:\n  - one\n  - two\nkeywords: a, b\n---\nFirst.\n\nSecond.',
    );
    expect(article).toMatchObject({
      slug: 'x',
      area: 'forms',
      kind: 'guide',
      audience: 'aselo',
      order: 3,
      questions: ['one', 'two'],
      keywords: ['a', 'b'],
      summary: 'First.',
    });
  });

  test('steps can have a list under them', () => {
    expect(blocksOf('1. Choose:\n   - one\n   - two\n2. Then')).toEqual([
      {
        kind: 'list',
        ordered: true,
        items: [
          { text: 'Choose:', sub: ['one', 'two'] },
          { text: 'Then', sub: [] },
        ],
      },
    ]);
  });
});

describe('asking in your own words', () => {
  const best = (question: string, isAseloStaff = false) => {
    const { results, confident } = searchHelp(question, { area: 'forms', isAseloStaff });
    return confident ? results[0]?.article.slug : undefined;
  };

  test.each([
    ['how do I send my changes to Aselo?', 'submit-for-review'],
    ["I'm done, what now", 'submit-for-review'],
    ['where can I leave a comment for the Aselo team', 'flag-or-comment'],
    ['how do I ask aselo something about a field', 'flag-or-comment'],
    ['reply to a question', 'flag-or-comment'],
    ['how to add a new question to the contact form', 'add-a-question'],
    ['make a field mandatory required', 'add-a-question'],
    ['province district dropdowns', 'linked-dropdowns'],
    ['paste options from a spreadsheet into a dropdown', 'dropdown-answers'],
    ['did I lose my work?', 'drafts-and-saving'],
    ['why is this greyed out', 'locked-settings'],
    ['when will counsellors see this', 'when-counselors-see-it'],
    ['aprove a form', 'approve-for-your-helpline'],
    ['what does the grey dot mean', 'approve-for-your-helpline'],
    ['delete a question', 'remove-a-field'],
    ['I made a mistake', 'undo-a-mistake'],
    ['what is the process', 'how-forms-changes-work'],
    ["I can't sign in", 'getting-access'],
    ['something is broken, who do I email', 'contact-the-aselo-team'],
    ['what does 2 changes needed mean', 'when-changes-are-asked'],
    ['what does in progress mean on the forms page', 'status-in-the-list'],
    ['what is the caller information tab', 'section-help-seeker-information'],
    ['where do the details of the person we help go', 'section-service-user-information'],
    ['what are canned responses', 'section-canned-responses'],
    ['change the welcome message', 'section-automatic-messages'],
    ['how long is someone blocked', 'section-client-profiles'],
  ])('“%s” finds %s', (question, slug) => expect(best(question)).toBe(slug));

  test("a question it can't answer says so", () => {
    expect(searchHelp('banana smoothie recipe', { area: 'forms', isAseloStaff: false }).confident).toBe(false);
    expect(searchHelp('the the of', { area: 'forms', isAseloStaff: false }).results).toEqual([]);
  });

  test("helpline staff don't get what's written for Aselo staff", () => {
    expect(best('download the zip and publish the draft', true)).toBe('aselo-publish-a-draft');
    const { results } = searchHelp('download the zip and publish the draft', { area: 'forms', isAseloStaff: false });
    expect(results.map((result) => result.article.audience)).not.toContain('aselo');
  });
});

describe('the help panel', () => {
  const client = (): HelpClient & { sent: unknown[] } => {
    const sent: unknown[] = [];
    return {
      sent,
      send: async (question) => {
        sent.push(question);
      },
      list: async () => [
        {
          id: '1',
          question: 'how do I add a logo',
          area: 'forms',
          reason: 'unanswered',
          askedBy: 'Ana',
          role: 'helpline-staff',
          at: '2026-11-04T10:00:00.000Z',
        },
      ],
    };
  };
  const ask = (text: string) => {
    fireEvent.change(screen.getByRole('searchbox', { name: 'Ask a question' }), { target: { value: text } });
    act(() => jest.advanceTimersByTime(300));
  };

  test("opens on the area's guides, then answers a question and opens the guide", () => {
    jest.useFakeTimers();
    try {
      render(<HelpPanel area="forms" isAseloStaff={false} onClose={() => undefined} client={client()} />);
      expect(screen.getByText('Guides, step by step')).toBeTruthy();
      expect(screen.getByRole('button', { name: /Send your changes for review/ })).toBeTruthy();
      expect(screen.queryByText('Publish a draft')).toBeNull();

      ask('how do I send my changes?');
      expect(screen.getByText('Best answer')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Open the guide' }));
      expect(screen.getByRole('heading', { name: 'Send your changes for review' })).toBeTruthy();
      expect(screen.getByText('Did this help?')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  test('a question without an answer can be sent to the Aselo team', async () => {
    jest.useFakeTimers();
    const helpClient = client();
    try {
      render(<HelpPanel area="forms" isAseloStaff={false} onClose={() => undefined} client={helpClient} />);
      ask('banana smoothie recipe');
      expect(screen.getByText(/couldn’t find an answer/)).toBeTruthy();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send it to the Aselo team/ }));
      });
      expect(helpClient.sent).toEqual([{ question: 'banana smoothie recipe', area: 'forms', reason: 'unanswered' }]);
      expect(screen.getByText(/it’s been sent/)).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  test('Aselo staff see the questions sent', async () => {
    render(<HelpPanel area="forms" isAseloStaff onClose={() => undefined} client={client()} />);
    fireEvent.click(screen.getByRole('button', { name: /Questions sent to the Aselo team/ }));
    expect(await screen.findByText('how do I add a logo')).toBeTruthy();
  });

  test.each([
    ['flows', /How designing your contact flows works/],
    ['chatbots', /Change what a chatbot says and asks/],
    ['routing', /Check where a contact would go/],
  ] as [HelpArea, RegExp][])('%s opens on its own help, with the general articles', (area, guide) => {
    render(<HelpPanel area={area} isAseloStaff={false} onClose={() => undefined} client={client()} />);
    expect(screen.getByRole('button', { name: guide })).toBeTruthy();
    expect(screen.getByRole('button', { name: /What do Imported, In progress/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Send your changes for review/ })).toBeNull();
  });

  test('an area without help yet says so, and still offers the general articles', () => {
    const general = HELP_ARTICLES.filter((article) => article.area === 'general');
    render(
      <HelpPanel area="routing" isAseloStaff={false} onClose={() => undefined} client={client()} articles={general} />,
    );
    expect(screen.getByText(/Help for Routing is on its way/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Signing in and getting access/ })).toBeTruthy();
  });
});

describe('“Need help?” on a section', () => {
  test('opens the help at the article about that section', async () => {
    const { HelpContext, NeedHelp } = await import('./HelpContext');
    const opened: (string | undefined)[] = [];
    render(
      <HelpContext.Provider value={(slug) => opened.push(slug)}>
        <NeedHelp slug="section-service-user-information" what="service user information" />
        <NeedHelp slug="no-such-article" what="nothing" />
      </HelpContext.Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Need help with service user information?' }));
    expect(opened).toEqual(['section-service-user-information']);
    // An article that doesn't exist has no link
    expect(screen.queryByRole('button', { name: 'Need help with nothing?' })).toBeNull();
  });

  test('the panel opens on the article asked for, with a way back to the rest', () => {
    render(
      <HelpPanel
        area="forms"
        isAseloStaff={false}
        onClose={() => undefined}
        request={{ slug: 'section-help-seeker-information', at: 1 }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Help seeker information' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /All help/ }));
    expect(screen.getByText('About each section')).toBeTruthy();
  });

  test('without the panel (a screen on its own), there is no link', async () => {
    const { NeedHelp } = await import('./HelpContext');
    render(<NeedHelp slug="section-service-user-information" what="service user information" />);
    expect(screen.queryByRole('button', { name: /Need help/ })).toBeNull();
  });
});

describe('“Show me” tours', () => {
  test('each tour step points at something, says something, and its kind is one Tour knows', () => {
    const tours = HELP_ARTICLES.filter((article) => article.tour);
    expect(tours.map((article) => article.slug).sort()).toEqual(
      ['add-a-question', 'flag-or-comment', 'flows-add-and-connect-steps', 'submit-for-review'].sort(),
    );
    tours.forEach((article) =>
      article.tour!.forEach((step) => {
        expectAt(article.slug, step.target).toMatch(/^(button|text|label|css):\S/);
        expectAt(article.slug, step.text.length).toBeGreaterThan(10);
      }),
    );
  });

  test('finds a button by its text, an element by its whole text, a label or a selector', async () => {
    const { findTarget } = await import('./Tour');
    // jsdom has no layout: everything counts as on screen for this test
    const rects = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ width: 10, height: 10, top: 0, left: 0, bottom: 10, right: 10, x: 0, y: 0 } as DOMRect);
    try {
      render(
        <div>
          <button type="button">Review &amp; submit</button>
          <button type="button">+ Add a field here</button>
          <label>
            <span>Kind</span>
            <select aria-label="Kind of flag" />
          </label>
          <textarea aria-label="New comment" />
          <div className="flow-palette" />
        </div>,
      );
      expect(findTarget('button:Review & submit')?.textContent).toBe('Review & submit');
      expect(findTarget('button:+ Add a field')?.textContent).toBe('+ Add a field here');
      expect(findTarget('text:Kind')?.tagName).toBe('SPAN');
      expect(findTarget('label:New comment')?.tagName).toBe('TEXTAREA');
      expect(findTarget('css:.flow-palette')).toBeTruthy();
      expect(findTarget('button:Nothing like it')).toBeUndefined();
    } finally {
      rects.mockRestore();
    }
  });

  test('goes step by step, says when something isn’t on screen, moves on when what’s highlighted is clicked', async () => {
    const { Tour } = await import('./Tour');
    jest.useFakeTimers();
    const rects = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ width: 10, height: 10, top: 0, left: 0, bottom: 10, right: 10, x: 0, y: 0 } as DOMRect);
    let ended = false;
    try {
      render(
        <>
          <button type="button">Review &amp; submit</button>
          <Tour
            title="Send your changes"
            steps={[
              { target: 'button:Review & submit', text: 'Click **Review & submit**.' },
              { target: 'text:Fix these first', text: 'Fix these.', missing: 'Nothing needs fixing.' },
              { target: 'button:Submit for review', text: 'Then submit.' },
            ]}
            onEnd={() => {
              ended = true;
            }}
          />
        </>,
      );
      const card = () => screen.getByRole('dialog', { name: 'Show me: Send your changes' });
      expect(card().textContent).toContain('Step 1 of 3');
      fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
      act(() => jest.advanceTimersByTime(400));
      expect(card().textContent).toContain('Step 2 of 3');
      expect(card().textContent).toContain('Nothing needs fixing.');
      fireEvent.click(screen.getByRole('button', { name: /Back/ }));
      expect(card().textContent).toContain('Step 1 of 3');
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(ended).toBe(true);
    } finally {
      rects.mockRestore();
      jest.useRealTimers();
    }
  });

  test('a guide with a tour offers “Show me”; it never starts by itself', () => {
    const started: string[] = [];
    render(
      <HelpPanel
        area="forms"
        isAseloStaff={false}
        onClose={() => undefined}
        request={{ slug: 'submit-for-review', at: 1 }}
        onStartTour={(article) => started.push(article.slug)}
      />,
    );
    expect(started).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: /Show me on the page/ }));
    expect(started).toEqual(['submit-for-review']);
  });
});

describe('questions sent, for Aselo staff', () => {
  test('the same question is counted once, asked most first, with who asked and what didn’t help', async () => {
    const { groupQuestions } = await import('./SentQuestions');
    const sent = (question: string, askedBy: string, at: string, article?: string) => ({
      id: `${question}${at}`,
      question,
      area: 'forms',
      reason: (article ? 'notHelpful' : 'unanswered') as 'notHelpful' | 'unanswered',
      ...(article ? { article } : {}),
      askedBy,
      role: 'helpline-staff' as const,
      at,
    });
    const groups = groupQuestions([
      sent('How do I add a logo?', 'Ana', '2026-11-01T10:00:00Z'),
      sent('Where is the export', 'Ana', '2026-11-04T10:00:00Z'),
      sent('how do I add a logo', 'Bo', '2026-11-03T10:00:00Z', 'what-can-i-change'),
    ]);
    expect(groups).toEqual([
      {
        question: 'how do I add a logo',
        count: 2,
        people: 2,
        areas: ['forms'],
        notHelpful: ['what-can-i-change'],
        latest: '2026-11-03T10:00:00Z',
      },
      expect.objectContaining({ question: 'Where is the export', count: 1 }),
    ]);
  });
});

describe('asking in the other areas', () => {
  test.each([
    ['flows', 'how do I upload a recording', 'flows-scripts-and-recordings'],
    ['flows', 'how do I connect two steps', 'flows-add-and-connect-steps'],
    ['flows', 'how do I assign a task to someone', 'flows-comments-and-tasks'],
    ['flows', 'can I try the flow', 'flows-test-a-flow'],
    ['flows', 'what does ready for claude mean', 'design-statuses'],
    ['chatbots', 'the chatbot does not understand yes', 'chatbot-answers'],
    ['chatbots', 'change the chatbot question', 'change-a-chatbot'],
    ['routing', 'which queue does a spanish chat go to', 'routing-test-a-contact'],
    ['routing', 'what are skills', 'what-routing-is'],
  ] as [HelpArea, string, string][])('in %s, “%s” finds %s', (area, question, slug) => {
    const { results, confident } = searchHelp(question, { area, isAseloStaff: false });
    expect(confident ? results[0]?.article.slug : undefined).toBe(slug);
  });
});
