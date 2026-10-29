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

// @vitest-environment jsdom

import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ApiContext, ApiUser } from '../../server/api';
import { handleApiRequest } from '../../server/api';
import { MemoryDraftStore } from '../../server/drafts';
import { MemoryChatbotStore } from '../../server/chatbotApi';
import { chatbotClientFor } from './chatbotClient';
import { ChatbotsArea } from './ChatbotsArea';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const uschStaff: ApiUser = { name: 'Childhelp person', role: 'helpline-staff', helplines: ['usch'] };

let store: MemoryChatbotStore;
let context: ApiContext;
const clientAs = (user: ApiUser) =>
  chatbotClientFor((method, apiPath, body) =>
    handleApiRequest(context, { method, path: apiPath, body: structuredClone(body), user }),
  );

beforeEach(() => {
  store = new MemoryChatbotStore();
  context = {
    formDefinitionsDir: path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../lambdas/packages/hrm-form-definitions/form-definitions',
    ),
    drafts: new MemoryDraftStore(),
    chatbots: store,
    helplinesConfigDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../twilio-iac/helplines'),
    notifier: { draftSubmitted: async () => {} },
  };
});

afterEach(cleanup);

describe('chatbot designer', () => {
  test('Aselo staff import the chatbots, change a question, and play the conversation', async () => {
    render(<ChatbotsArea client={clientAs(staff)} helplineCodes={['usch', 'usnm']} staffMode userName="Alex" />);
    expect(await screen.findByText('No chatbot designs yet.')).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox', { name: 'Helpline' }), { target: { value: 'usch' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import them from the live config' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Use these as the chatbots design' }));

    // The pre-survey, as a conversation
    const question = (await screen.findByRole('textbox', { name: 'Question 3' })) as HTMLTextAreaElement;
    expect(question.value).toBe('How old are you?');
    fireEvent.change(question, { target: { value: 'What is your age?' } });
    await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy(), { timeout: 4000 });
    const saved = (await store.get('usch'))!.design.bots[0].intents[0].questions[2];
    expect(saved.question).toBe('What is your age?');
    expect(screen.getByText('1 change since the import')).toBeTruthy();
    // Changed, so it's in progress again
    expect((screen.getByRole('combobox', { name: 'Status of Pre-survey' }) as HTMLSelectElement).value).toBe(
      'in-progress',
    );

    // The contact form fields the answers fill in
    // genderInput fills in the first of the caller's and the child's field: rebuilt by hand, it's the same
    expect(await screen.findAllByText('CallerInformationTab.genderInput')).toHaveLength(1);
    const gender = (await store.get('usch'))!.design.bots[0].intents[0].questions[1];
    const card = within(document.getElementById(`question-${gender.id}`)!);
    fireEvent.click(
      card.getByRole('button', {
        name: 'Stop filling in CallerInformationTab.genderInput or ChildInformationTab.genderInput',
      }),
    );
    // Once the contact form is loaded
    fireEvent.change(await card.findByRole('combobox', { name: 'Fill in a contact form field' }), {
      target: { value: 'CallerInformationTab.genderInput' },
    });
    fireEvent.change(card.getByRole('combobox', { name: "Or, if CallerInformationTab.genderInput isn't there" }), {
      target: { value: 'ChildInformationTab.genderInput' },
    });
    expect(card.getByText('first of')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy(), { timeout: 4000 });
    expect((await store.get('usch'))!.design.formMappings?.genderInput).toEqual([
      ['CallerInformationTab.genderInput', 'ChildInformationTab.genderInput'],
    ]);

    // The phone plays it with the answers as they're saved, then the next question
    const phone = within(screen.getByLabelText('Preview'));
    expect(phone.getByText(/press 1/)).toBeTruthy();
    fireEvent.click(phone.getByRole('button', { name: 'Yes' }));
    expect(phone.getAllByText('Yes').some((element) => element.className.includes('contact'))).toBe(true);
    expect(phone.getByText('What is your gender identity?')).toBeTruthy();
    // A typed answer that doesn't match the pattern (letters only) is asked again
    fireEvent.change(phone.getByRole('textbox', { name: 'Type an answer' }), { target: { value: '123' } });
    fireEvent.submit(phone.getByRole('textbox', { name: 'Type an answer' }));
    expect(phone.getAllByText('What is your gender identity?')).toHaveLength(2);
    // Not understood: asked again
    fireEvent.click(phone.getByRole('button', { name: /doesn't understand/ }));
    expect(phone.getByText(/The chatbot stops here/)).toBeTruthy();

    // The answers it understands
    fireEvent.click(screen.getByRole('tab', { name: 'Answers' }));
    expect(screen.getByRole('region', { name: 'Answers' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Export for Claude/ })).toBeTruthy();
  });

  test('Aselo staff start from scratch: a new chatbot, a pattern question, a comment, ready for Claude', async () => {
    render(<ChatbotsArea client={clientAs(staff)} helplineCodes={['usch', 'usnm']} staffMode userName="Alex" />);
    fireEvent.change(await screen.findByRole('combobox', { name: 'Helpline' }), { target: { value: 'usnm' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Start from scratch' }));
    fireEvent.click(await screen.findByRole('button', { name: /New chatbot/ }));
    const form = within(screen.getByRole('form', { name: 'New chatbot' }));
    fireEvent.change(form.getByRole('combobox', { name: 'Chatbot language' }), { target: { value: 'en_USNM' } });
    fireEvent.click(form.getByRole('button', { name: 'Create' }));

    fireEvent.click(await screen.findByRole('button', { name: '+ Add a question' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Question 1' }), {
      target: { value: 'What is your zip code?' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Saved as' }), { target: { value: 'zipCode' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Answers it takes' }), {
      target: { value: '__new-pattern' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('[A-Za-z0-9 ]{1,30}')).toBeTruthy();

    // A comment on the question
    fireEvent.click(screen.getByRole('button', { name: 'Comments on question 1' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'New comment' }), {
      target: { value: 'Only US zip codes?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Comment' }));
    expect(screen.getByText('Only US zip codes?')).toBeTruthy();

    fireEvent.change(screen.getByRole('combobox', { name: 'Status of Pre-survey' }), { target: { value: 'ready' } });
    await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy(), { timeout: 4000 });
    const saved = (await store.get('usnm'))!.design;
    expect(saved.bots[0]).toMatchObject({ name: 'pre_survey', language: 'en_USNM', status: 'ready' });
    expect(saved.bots[0].intents[0].questions[0]).toMatchObject({
      slot: 'zipCode',
      answerType: 'zipCode',
      comments: [expect.objectContaining({ text: 'Only US zip codes?', author: 'Alex' })],
    });
    expect(saved.answerTypes.en_USNM.zipCode).toMatchObject({ parent: 'AMAZON.AlphaNumeric' });

    // Back on the start page it's listed, ready
    fireEvent.click(screen.getByRole('button', { name: /All chatbots/ }));
    const row = (await screen.findByRole('button', { name: 'Open USNM Pre-survey (en_USNM)' })).closest('tr')!;
    expect(within(row).getByText('Ready for Claude')).toBeTruthy();
    expect(within(row).getByText('New')).toBeTruthy();
  });

  test('helpline staff see the chatbots without changing them', async () => {
    const imported = await clientAs(staff).previewImport('usch');
    await clientAs(staff).save('usch', 0, imported.design);
    render(<ChatbotsArea client={clientAs(uschStaff)} helplineCodes={['usch']} staffMode={false} />);
    const question = (await screen.findByRole('textbox', { name: 'Question 1' })) as HTMLTextAreaElement;
    expect(question.disabled).toBe(true);
    expect(screen.getByText('View only')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Import/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Export for Claude/ })).toBeNull();
    expect(screen.queryByRole('button', { name: '+ Add a question' })).toBeNull();
  });
});
