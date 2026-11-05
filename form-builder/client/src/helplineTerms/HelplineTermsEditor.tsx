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

/**
 * Helpline terms: the helpline's own words for what Aselo calls a child, a caller, a case, a
 * client profile, a counselor and a contact. A question per term, with the usual answers to pick
 * from or "Something else", and how Aselo will read with them. State and logic live in
 * helplineTermsSlice.ts and terms.ts.
 */
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { selectWorkspace } from '../workspace/workspaceSlice';
import { SectionTitle } from '../help/HelpContext';
import {
  fillTemplate,
  HelplineTerms,
  pluralOf,
  TERM_DEFINITIONS,
  TermDefinition,
  termsUsedBy,
  TermWords,
} from './terms';
import {
  adoptGuessedTerms,
  chooseTerm,
  guessDismissed,
  openCustomTerm,
  openHelplineTerms,
  replaceHandWritten,
  selectGuessedTerms,
  selectHandWrittenByTerm,
  selectHelplineTerms,
  selectHelplineTermsEditor,
  selectTermCatalogue,
} from './helplineTermsSlice';
import './helplineTerms.css';

// A few strings counselors see often, to show each term in place
const SAMPLE_KEYS: Record<TermDefinition['id'], string[]> = {
  child: ['CallType-child', 'TabbedForms-AddChildInfoTab', 'ContactDetails-GeneralDetails-ChildHearAboutUs'],
  caller: ['TabbedForms-AddCallerInfoTab', 'ContactDetails-GeneralDetails-RepeatCaller', 'ConnectDialog-Caller'],
  case: ['BottomBar-AddContactToNewCase', 'SearchResultsIndex-SearchAgainForCase', 'CaseList-Filters-CaseCount-Plural'],
  profile: ['Profile-Title', 'SideNavProfileList', 'Profile-EditHeader'],
  counselor: ['CaseList-Filters-SearchForCounselor', 'Conference-Wrapping-HangupBy/Agent', 'TeamsView-Counsellors'],
  contact: ['CallTypeButtons-Categorize', 'QueueIndex-ContactsWaiting', 'BottomBar-SaveCaseContact'],
};

const sameWords = (a: TermWords | undefined, b: TermWords) =>
  Boolean(a) &&
  a!.singular === b.singular &&
  a!.plural === b.plural &&
  (a!.shortSingular ?? '') === (b.shortSingular ?? '') &&
  (a!.shortPlural ?? '') === (b.shortPlural ?? '');

const describeWords = (words: TermWords) =>
  words.shortSingular ? `${words.singular} (${words.shortSingular})` : words.singular;

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
const TermCard = ({ definition }: { definition: TermDefinition }) => {
  const dispatch = useAppDispatch();
  const terms = useAppSelector(selectHelplineTerms);
  const catalogue = useAppSelector(selectTermCatalogue);
  const handWritten = useAppSelector(selectHandWrittenByTerm)[definition.id] ?? [];
  const staffMode = useAppSelector(selectActingAsStaff);
  const { customOpen } = useAppSelector(selectHelplineTermsEditor);
  const { id, question, hint, aselo, presets } = definition;
  const current = terms[id];
  const preset = presets.find(candidate => sameWords(current, candidate));
  const isCustom = customOpen.includes(id) || Boolean(current && !preset);
  const usedIn = catalogue.filter(({ template }) => termsUsedBy(template).has(id));
  const samples = SAMPLE_KEYS[id]
    .map(key => catalogue.find(entry => entry.key === key))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const isProfile = id === 'profile';

  const choose = (words: TermWords | undefined) => {
    dispatch(openCustomTerm(id, false));
    dispatch(chooseTerm(id, words));
  };
  // Typing a singular keeps the plural following it, until the plural is changed by hand
  const typed = (change: Partial<TermWords>) => {
    const base = current ?? { singular: '', plural: '', ...(isProfile ? { shortSingular: '', shortPlural: '' } : {}) };
    const next = { ...base, ...change };
    if (change.singular !== undefined && base.plural === pluralOf(base.singular))
      next.plural = pluralOf(change.singular);
    if (change.shortSingular !== undefined && base.shortPlural === pluralOf(base.shortSingular ?? '')) {
      next.shortPlural = pluralOf(change.shortSingular);
    }
    dispatch(chooseTerm(id, next));
  };

  return (
    <section className="panel term-card" aria-labelledby={`term-${id}`}>
      <h3 id={`term-${id}`}>{question}</h3>
      <p className="muted term-hint">{hint}</p>
      <div className="term-choices" role="group" aria-label={question}>
        <button
          type="button"
          className={!current && !isCustom ? 'term-choice active' : 'term-choice'}
          aria-pressed={!current && !isCustom}
          onClick={() => choose(undefined)}
        >
          {describeWords(aselo)} <span className="muted">(Aselo’s word)</span>
        </button>
        {presets.map(candidate => (
          <button
            key={candidate.singular}
            type="button"
            className={preset === candidate && !customOpen.includes(id) ? 'term-choice active' : 'term-choice'}
            aria-pressed={preset === candidate && !customOpen.includes(id)}
            onClick={() => choose(candidate)}
          >
            {describeWords(candidate)}
          </button>
        ))}
        <button
          type="button"
          className={isCustom ? 'term-choice active' : 'term-choice'}
          aria-pressed={isCustom}
          onClick={() => dispatch(openCustomTerm(id, true))}
        >
          Something else
        </button>
      </div>

      {(isCustom || current) && (
        <div className="term-words">
          <label>
            {isProfile ? 'Full name, one' : 'One'}
            <input
              type="text"
              value={current?.singular ?? ''}
              placeholder={aselo.singular}
              onChange={e => typed({ singular: e.target.value })}
            />
          </label>
          <label>
            {isProfile ? 'Full name, several' : 'Several'}
            <input
              type="text"
              value={current?.plural ?? ''}
              placeholder={aselo.plural}
              onChange={e => typed({ plural: e.target.value })}
            />
          </label>
          {isProfile && (
            <>
              <label>
                Short name, one
                <input
                  type="text"
                  value={current?.shortSingular ?? ''}
                  placeholder={aselo.shortSingular}
                  onChange={e => typed({ shortSingular: e.target.value })}
                />
              </label>
              <label>
                Short name, several
                <input
                  type="text"
                  value={current?.shortPlural ?? ''}
                  placeholder={aselo.shortPlural}
                  onChange={e => typed({ shortPlural: e.target.value })}
                />
              </label>
            </>
          )}
          <p className="field-hint term-words-hint">
            Write it as in the middle of a sentence (“help seeker”): capitals are added where Aselo needs them.
          </p>
        </div>
      )}

      {samples.length > 0 && (
        <div className="term-samples">
          <p className="term-samples-title">
            How counselors will see it <span className="muted">(used in {usedIn.length} places in Aselo)</span>
          </p>
          <ul>
            {samples.map(({ key, english, template }) => {
              const text = fillTemplate(template, terms);
              return (
                <li key={key}>
                  <span className={text === english ? '' : 'term-sample-new'}>{text}</span>
                  {text !== english && <span className="muted term-sample-was">was “{english}”</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {handWritten.length > 0 && (
        <p className="field-hint term-hand-written">
          {handWritten.length} of these {handWritten.length === 1 ? 'was' : 'were'} already written for your helpline
          and
          {handWritten.length === 1 ? ' keeps its' : ' keep their'} own wording.
          {staffMode && (
            <>
              {' '}
              <button type="button" className="link-button" onClick={() => dispatch(replaceHandWritten(id))}>
                Make {handWritten.length === 1 ? 'it' : 'them'} from the terms too
              </button>{' '}
              <span className="muted">(words not chosen go back to Aselo’s)</span>
            </>
          )}
        </p>
      )}
    </section>
  );
};

const GuessedTerms = ({ guessed }: { guessed: HelplineTerms }) => {
  const dispatch = useAppDispatch();
  const found = TERM_DEFINITIONS.filter(({ id }) => guessed[id]);
  return (
    <div className="alert alert-info term-guessed">
      <p>Your helpline’s text in Aselo already uses these words:</p>
      <ul>
        {found.map(({ id, aselo }) => (
          <li key={id}>
            <strong>{guessed[id]!.singular}</strong> <span className="muted">for Aselo’s “{aselo.singular}”</span>
          </li>
        ))}
      </ul>
      <button type="button" className="primary-button" onClick={() => dispatch(adoptGuessedTerms())}>
        Use these words
      </button>{' '}
      <button type="button" className="link-button" onClick={() => dispatch(guessDismissed())}>
        Not now
      </button>
    </div>
  );
};

export const HelplineTermsEditor = () => {
  const dispatch = useAppDispatch();
  const { editorRevision } = useAppSelector(selectWorkspace);
  const { english } = useAppSelector(selectHelplineTermsEditor);
  const guessed = useAppSelector(selectGuessedTerms);

  // Afresh when it opens, and when the draft's files are replaced
  useEffect(() => {
    dispatch(openHelplineTerms());
  }, [dispatch, editorRevision]);

  return (
    <div className="helpline-terms">
      <section className="panel">
        <SectionTitle>Helpline terms</SectionTitle>
        <p className="muted">
          The words Aselo uses for the people and things your counselors work with. Choose your helpline’s and Aselo
          uses them everywhere: tabs, buttons, lists and messages. Your forms’ own questions and answers keep the
          wording you give them in each section.
        </p>
      </section>
      {english ? (
        <>
          {Object.keys(guessed).length > 0 && <GuessedTerms guessed={guessed} />}
          {TERM_DEFINITIONS.map(definition => (
            <TermCard key={definition.id} definition={definition} />
          ))}
        </>
      ) : (
        <p className="muted">Loading Aselo’s text…</p>
      )}
    </div>
  );
};
