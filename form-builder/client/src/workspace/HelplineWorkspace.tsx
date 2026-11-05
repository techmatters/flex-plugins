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
 * Everything for one loaded helpline: navigation, the draft, editing, previews and export.
 * Rendered with a code/version key so switching helpline starts fresh.
 */
import { useEffect, useRef } from 'react';
import type { FlagKind, ReviewSide } from '@tech-matters/form-builder-shared';

import { SectionHelpContext } from '../help/HelpContext';
import { ImportedFrom } from '../common/BranchPicker';
import { Loading } from '../common/Loading';
import {
  CATEGORIES_FILE,
  CONTACT_TABS,
  getCaseSections,
  getCaseSectionSplitFormAt,
  getForm,
} from '../common/definitions';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { noticeDismissed, retrySave, SaveState, selectChangedPaths, selectDraft } from '../drafts/draftSlice';
import {
  discardWorkspaceDraft,
  reloadHelpline,
  reviewOpened,
  sameView,
  sectionPreviewClosed,
  sectionPreviewOpened,
  selectCaseTargets,
  selectDefinitions,
  selectIssuesByTab,
  selectSectionIssues,
  selectWorkspace,
  tryItOutOpened,
  View,
  viewSelected,
} from './workspaceSlice';
import { useReviewContext } from './useReviewContext';
import { FlexDesktopPreview, PreviewFocus } from '../aseloPreview/FlexDesktopPreview';
import { AseloSectionPreview } from '../aseloPreview/AseloSectionPreview';
import { ContactFormEditor } from '../forms/ContactFormEditor';
import { ReviewChanges } from '../drafts/ReviewChanges';
import { CallTypesEditor } from '../chatsAndCalls/CallTypesEditor';
import { CategoriesEditor } from '../categories/CategoriesEditor';
import { CaseStatusEditor } from '../cases/CaseStatusEditor';
import { CaseSectionsEditor } from '../cases/CaseSectionsEditor';
import { FeaturesEditor } from '../serviceConfig/FeaturesEditor';
import { ServiceConfigEditor } from '../serviceConfig/ServiceConfigEditor';
import { TranslationsEditor } from '../translations/TranslationsEditor';
import { HelplineTermsEditor } from '../helplineTerms/HelplineTermsEditor';
import { selectHelplineTerms } from '../helplineTerms/helplineTermsSlice';
import { contactTabTitle } from '../helplineTerms/terms';
import { ProfilesEditor } from '../profiles/ProfilesEditor';
import { hasProfiles } from '../profiles/profiles';
import { CannedResponsesEditor } from '../chatsAndCalls/CannedResponsesEditor';
import { MessagesEditor } from '../chatsAndCalls/MessagesEditor';
import { WebchatFormEditor } from '../webchat/WebchatFormEditor';
import { PRE_ENGAGEMENT_FILE } from '../webchat/webchat';
import { FormSelectorEditor } from '../formSelector/FormSelectorEditor';
import { FORM_SELECTOR_PREFIX } from '../formSelector/formSelector';
import {
  ApprovalState,
  approvalState,
  flagKinds,
  formFingerprint,
  formTargetOf,
  FormView,
  isFormView,
  isOpen,
  openThreadsInForm,
  SIDE_LABELS,
  SIDES,
} from '../reviews/formReviews';
import { ReviewPanel } from '../reviews/ReviewPanel';
import { ApprovalIcon, FlagIcon } from '../reviews/ReviewIcons';

// What the menu shows of a form's review
type NavReview = { approvals: Partial<Record<ReviewSide, ApprovalState>>; flags: FlagKind[] };

// The help article about each section, and what it's called there ("Need help?"); none for the
// Aselo-only settings
const SECTION_HELP: Partial<Record<View['kind'], { slug: string; what: string }>> = {
  categories: { slug: 'issue-categories', what: 'issue categories' },
  callTypes: { slug: 'section-call-types', what: 'call types' },
  cannedResponses: { slug: 'section-canned-responses', what: 'canned responses' },
  messages: { slug: 'section-automatic-messages', what: 'automatic messages' },
  webchat: { slug: 'section-webchat-form', what: 'the webchat form' },
  formSelector: { slug: 'section-filling-in-the-contact', what: 'filling in the contact' },
  caseStatus: { slug: 'section-case-statuses', what: 'case statuses' },
  caseSections: { slug: 'section-case-sections', what: 'case sections' },
  helplineTerms: { slug: 'section-helpline-terms', what: 'helpline terms' },
  translations: { slug: 'aselo-translations', what: 'translations' },
  caseSection: { slug: 'section-case-section-forms', what: 'this case section’s form' },
  profiles: { slug: 'section-client-profiles', what: 'client profiles' },
};
const CONTACT_TAB_HELP: Record<string, { slug: string; what: string }> = {
  CallerInformationTab: { slug: 'section-help-seeker-information', what: 'help seeker information' },
  ChildInformationTab: { slug: 'section-service-user-information', what: 'service user information' },
  CaseInformationTab: { slug: 'section-case-information', what: 'case information' },
};
const sectionHelpOf = (view: View) =>
  view.kind === 'contactTab' ? CONTACT_TAB_HELP[view.tabKey] : SECTION_HELP[view.kind];

// Defined outside the workspace so its buttons survive re-renders (e.g. when the draft loads)
const NavItem = ({
  current,
  onSelect,
  target,
  label,
  errors,
  reviewOf,
}: {
  current: View;
  onSelect: (view: View) => void;
  target: View;
  label: string;
  errors?: number;
  // Forms only: their approvals and open flags
  reviewOf: (target: View) => NavReview | undefined;
}) => {
  const review = reviewOf(target);
  return (
    <li>
      <button
        type="button"
        className={sameView(current, target) ? 'nav-item active' : 'nav-item'}
        onClick={() => onSelect(target)}
      >
        {review && (
          <span className="nav-review">
            {SIDES.map(side => (
              <ApprovalIcon key={side} side={side} state={review.approvals[side]} size={13} />
            ))}
            {review.flags.map(kind => (
              <FlagIcon key={kind} kind={kind} size={13} />
            ))}
          </span>
        )}
        {label}
        {Boolean(errors) && <span className="nav-error-count">{errors}</span>}
      </button>
    </li>
  );
};

const SAVE_STATE_TEXT: Record<SaveState, string> = {
  loading: 'Loading the draft…',
  saved: 'All changes saved',
  pending: 'Unsaved changes…',
  saving: 'Saving…',
  retrying: 'Couldn’t save, trying again…',
  conflict: 'Not saved',
  error: "Couldn't save",
};

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export const HelplineWorkspace = () => {
  const dispatch = useAppDispatch();
  const definitions = useAppSelector(selectDefinitions)!;
  const draft = useAppSelector(selectDraft);
  // Closing or reloading the page with changes not saved yet asks first (e.g. while a save is failing)
  const unsaved = useRef(false);
  unsaved.current = ['pending', 'saving', 'retrying', 'error'].includes(draft.saveState) && !draft.conflict;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (unsaved.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const changedPaths = useAppSelector(selectChangedPaths);
  const { view, tryItOut, reviewing, previewingSection, editorRevision } = useAppSelector(selectWorkspace);
  const issuesByTab = useAppSelector(selectIssuesByTab);
  const sectionIssues = useAppSelector(selectSectionIssues);
  const caseTargets = useAppSelector(selectCaseTargets);
  // Show the settings only Aselo staff may change; Aselo staff apply, helpline staff submit
  const staffMode = useAppSelector(selectActingAsStaff);
  const canApply = staffMode;
  // Reviewing the forms (formReviews.ts), kept in the draft: both sides see it, and each
  // approves for their own side. Undefined until the saved draft has loaded.
  const reviewContext = useReviewContext();

  const { files, original: originalFiles, source } = draft;
  const { code, version } = definitions;
  const setView = (target: View) => dispatch(viewSelected(target));
  const setTryItOut = (preview: { focus: PreviewFocus; tab?: string }) => dispatch(tryItOutOpened(preview));

  const sectionErrorCount = (prefix: string) =>
    sectionIssues.filter(issue => issue.severity === 'error' && issue.message.startsWith(prefix)).length;
  const errorCount = (tabKey: string) => issuesByTab[tabKey]?.filter(issue => issue.severity === 'error').length ?? 0;

  const caseSections = getCaseSections(files);
  const changeCount = changedPaths.length;

  const formTargetFor = (formView: FormView) =>
    formView.kind === 'contactTab'
      ? CONTACT_TABS.find(tab => tab.key === formView.tabKey)
      : caseTargets.find(target => target.key === formView.sectionKey);
  const formFingerprintOf = (formView: FormView) => {
    const target = formTargetFor(formView);
    return formFingerprint(target ? getForm(files, target.filePath) : undefined);
  };
  // What the menu shows for a form: each side's approval, and the open flags on it or its fields
  const reviewOf = (target: View): NavReview | undefined => {
    if (!reviewContext || !isFormView(target)) return undefined;
    const formTarget = formTargetOf(target);
    const fingerprint = formFingerprintOf(target);
    return {
      approvals: Object.fromEntries(
        SIDES.map(reviewSide => [
          reviewSide,
          approvalState(draft.meta?.approvals, reviewSide, formTarget, fingerprint),
        ]),
      ),
      flags: flagKinds(openThreadsInForm(draft.meta?.threads, formTarget)),
    };
  };
  const formViews: FormView[] = [
    ...CONTACT_TABS.filter(tab => files[tab.filePath]).map(
      (tab): FormView => ({ kind: 'contactTab', tabKey: tab.key }),
    ),
    ...caseSections.map((section): FormView => ({ kind: 'caseSection', sectionKey: section.key })),
  ];
  const approvedForms = (reviewSide: ReviewSide) =>
    formViews.filter(formView => reviewOf(formView)?.approvals[reviewSide] === 'approved').length;
  const openFlags = (draft.meta?.threads ?? []).filter(thread => isOpen(thread) && thread.kind !== 'note').length;

  // The form's own review, above its editor; its fields' reviews are in the editor
  const renderFormReview = (formView: FormView, title: string) =>
    reviewContext && (
      <ReviewPanel
        key={formTargetOf(formView)}
        review={reviewContext}
        target={formTargetOf(formView)}
        fingerprint={formFingerprintOf(formView)}
        what="form"
        title={`Review: ${title}`}
      />
    );

  const discard = async () => {
    if (window.confirm('Discard all the draft changes for this helpline? This can’t be undone.')) {
      await dispatch(discardWorkspaceDraft());
    }
  };

  const renderContactTab = (tabKey: string) => {
    const tab = CONTACT_TABS.find(contactTab => contactTab.key === tabKey)!;
    const form = getForm(files, tab.filePath);
    if (!form) return <p className="muted">This helpline has no {tab.title} form.</p>;
    return (
      <>
        {renderFormReview({ kind: 'contactTab', tabKey: tab.key }, tab.title)}
        <div className="try-it-out-row">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setTryItOut({ focus: 'form', tab: tab.key })}
          >
            Try it out in Aselo
          </button>
          <span className="muted">See the draft form in the counselor&apos;s screen and fill it in.</span>
        </div>
        <ContactFormEditor key={`${tab.key}-${editorRevision}`} tab={tab} />
      </>
    );
  };

  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  const renderMain = () => {
    // Editors build their state from the files when they open, so wait for the saved draft
    if (draft.saveState === 'loading') return <Loading text="Loading the draft…" />;
    if (view.kind === 'contactTab') return renderContactTab(view.tabKey);
    const editorKey = `${view.kind}-${editorRevision}`;
    if (view.kind === 'callTypes') {
      return <CallTypesEditor key={editorKey} />;
    }
    if (view.kind === 'cannedResponses') {
      return <CannedResponsesEditor key={editorKey} />;
    }
    if (view.kind === 'messages') {
      return <MessagesEditor key={editorKey} />;
    }
    if (view.kind === 'webchat') {
      return <WebchatFormEditor key={editorKey} />;
    }
    if (view.kind === 'formSelector') {
      return <FormSelectorEditor key={editorKey} />;
    }
    if (view.kind === 'categories') {
      return <CategoriesEditor key={editorKey} />;
    }
    if (view.kind === 'profiles') {
      return <ProfilesEditor key={editorKey} />;
    }
    if (view.kind === 'features' && canApply) {
      return <FeaturesEditor key={editorKey} />;
    }
    if (view.kind === 'serviceConfig' && canApply) {
      return <ServiceConfigEditor key={editorKey} />;
    }
    if (view.kind === 'translations' && canApply) {
      return <TranslationsEditor key={editorKey} />;
    }
    if (view.kind === 'helplineTerms') {
      return <HelplineTermsEditor key={editorKey} />;
    }
    if (view.kind === 'caseSections') {
      return <CaseSectionsEditor key={editorKey} />;
    }
    if (view.kind === 'caseStatus') {
      return <CaseStatusEditor key={editorKey} />;
    }
    // e.g. Features after switching to "View as helpline staff"
    if (view.kind !== 'caseSection') return renderContactTab(CONTACT_TABS[0].key);
    const target = caseTargets.find(caseTarget => caseTarget.key === view.sectionKey);
    const form = target && getForm(files, target.filePath);
    if (!target || !form) return <p className="muted">This case section has no form.</p>;
    return (
      <>
        {renderFormReview({ kind: 'caseSection', sectionKey: target.key }, target.title)}
        <div className="try-it-out-row">
          <button type="button" className="secondary-button" onClick={() => dispatch(sectionPreviewOpened(target.key))}>
            Preview in Aselo
          </button>
          <span className="muted">
            See the draft form as counselors see it when they add a {target.title} to a case.
          </span>
        </div>
        <ContactFormEditor key={`case-${target.key}-${editorRevision}`} tab={target} />
        {previewingSection === target.key && (
          <div className="modal-backdrop" role="presentation" onClick={() => dispatch(sectionPreviewClosed())}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- only keeps clicks inside the dialog from closing it */}
            <div
              className="modal modal-wide"
              role="dialog"
              aria-modal="true"
              aria-label={`${target.title} in Aselo`}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{target.title} in Aselo</h2>
                <button type="button" className="link-button" onClick={() => dispatch(sectionPreviewClosed())}>
                  Close
                </button>
              </div>
              <AseloSectionPreview
                title={target.title}
                form={form}
                files={files}
                helplineLanguage={definitions.helplineLanguage}
                splitFormAt={getCaseSectionSplitFormAt(files, target.key)}
              />
            </div>
          </div>
        )}
      </>
    );
  };

  const sectionHelp = sectionHelpOf(view);
  const helplineTerms = useAppSelector(selectHelplineTerms);

  return (
    <>
      <div className="action-bar">
        <span className={changeCount ? 'change-count has-changes' : 'change-count'}>
          {/* eslint-disable-next-line no-nested-ternary */}
          {changeCount
            ? `Draft: ${changeCount} file${changeCount === 1 ? '' : 's'} changed · ${SAVE_STATE_TEXT[draft.saveState]}`
            : draft.saveState === 'loading'
            ? SAVE_STATE_TEXT.loading
            : 'No changes yet'}
        </span>
        {draft.meta?.status === 'submitted' && changeCount > 0 && (
          <span className="badge badge-new draft-status">
            Submitted for review
            {draft.meta.submittedBy ? ` by ${draft.meta.submittedBy}` : ''}
          </span>
        )}
        {draft.meta?.updatedBy && changeCount > 0 && (
          <span className="muted draft-updated">
            Last change by {draft.meta.updatedBy}
            {draft.meta.updatedAt ? `, ${new Date(draft.meta.updatedAt).toLocaleString()}` : ''}
          </span>
        )}
        {reviewContext && formViews.length > 0 && (
          <span className="review-progress">
            Forms approved:{' '}
            {SIDES.map(
              reviewSide => `${SIDE_LABELS[reviewSide]} ${approvedForms(reviewSide)}/${formViews.length}`,
            ).join(' · ')}
            {openFlags > 0 ? ` · ${openFlags} open flag${openFlags === 1 ? '' : 's'}` : ''}
          </span>
        )}
        {changeCount > 0 && (
          <button type="button" className="link-button" onClick={discard}>
            Discard draft
          </button>
        )}
        {/* Where the forms were read from, next to what's done with them */}
        <ImportedFrom source={source} inline />
        <button
          type="button"
          className="primary-button"
          disabled={changeCount === 0 || draft.saveState === 'conflict'}
          onClick={() => dispatch(reviewOpened())}
        >
          {canApply ? 'Review & apply' : 'Review & submit'}
        </button>
      </div>

      {draft.conflict?.branch && (
        <div className="alert alert-error">
          There&apos;s already a draft of {code.toUpperCase()} {version} started from{' '}
          <code>{draft.conflict.branch}</code>
          {draft.conflict.updatedBy ? ` (last changed by ${draft.conflict.updatedBy})` : ''}, so changes made here
          aren&apos;t saved. Open it from that branch to keep working on it, or discard it there first.
        </div>
      )}

      {draft.conflict && !draft.conflict.branch && (
        <div className="alert alert-error">
          {draft.conflict.updatedBy ?? 'Someone else'} changed this draft
          {draft.conflict.updatedAt ? ` at ${new Date(draft.conflict.updatedAt).toLocaleString()}` : ''} while you were
          editing, so your latest changes weren&apos;t saved. Reload to see their version, then make your changes again.
          <button type="button" className="link-button" onClick={() => dispatch(reloadHelpline())}>
            Reload
          </button>
        </div>
      )}

      {draft.saveState === 'error' && draft.saveError && (
        <div className="alert alert-error" role="alert">
          <strong>Your changes couldn’t be saved</strong> ({draft.saveError}). They’re still here in this page: don’t
          close or reload it until they’re saved.{' '}
          <button type="button" className="link-button" onClick={() => dispatch(retrySave())}>
            Try again
          </button>
          <span className="muted">
            {' '}
            If it keeps happening, check your internet connection or contact the Aselo team.
          </span>
        </div>
      )}
      {draft.notice && (
        <div className="alert alert-info">
          {draft.notice}
          <button type="button" className="link-button" onClick={() => dispatch(noticeDismissed())}>
            Dismiss
          </button>
        </div>
      )}

      <div className="workspace">
        <nav className="sidebar">
          <h3>Helpline</h3>
          <ul>
            <NavItem
              current={view}
              onSelect={setView}
              reviewOf={reviewOf}
              target={{ kind: 'helplineTerms' }}
              label="Helpline terms"
            />
            {/* Features, the service configuration and translations are for Aselo staff only (not when viewing as helpline staff) */}
            {canApply && (
              <>
                <NavItem
                  current={view}
                  onSelect={setView}
                  reviewOf={reviewOf}
                  target={{ kind: 'features' }}
                  label="Features"
                />
                <NavItem
                  current={view}
                  onSelect={setView}
                  reviewOf={reviewOf}
                  target={{ kind: 'serviceConfig' }}
                  label="Service configuration"
                />
                <NavItem
                  current={view}
                  onSelect={setView}
                  reviewOf={reviewOf}
                  target={{ kind: 'translations' }}
                  label="Translations"
                />
              </>
            )}
          </ul>
          <h3>Contact forms</h3>
          <ul>
            {CONTACT_TABS.filter(tab => files[tab.filePath]).map(tab => (
              <NavItem
                current={view}
                onSelect={setView}
                reviewOf={reviewOf}
                key={tab.key}
                target={{ kind: 'contactTab', tabKey: tab.key }}
                label={contactTabTitle(tab, helplineTerms)}
                errors={errorCount(tab.key)}
              />
            ))}
            {files[CATEGORIES_FILE] !== undefined && (
              <NavItem
                current={view}
                onSelect={setView}
                reviewOf={reviewOf}
                target={{ kind: 'categories' }}
                label="Issue categories"
                errors={sectionErrorCount('Issue categories')}
              />
            )}
            <NavItem
              current={view}
              onSelect={setView}
              reviewOf={reviewOf}
              target={{ kind: 'formSelector' }}
              label={FORM_SELECTOR_PREFIX}
              errors={sectionErrorCount(FORM_SELECTOR_PREFIX)}
            />
          </ul>
          <h3>Chats and calls</h3>
          <ul>
            <NavItem
              current={view}
              onSelect={setView}
              reviewOf={reviewOf}
              target={{ kind: 'callTypes' }}
              label="Call types"
              errors={sectionErrorCount('Call types')}
            />
            <NavItem
              current={view}
              onSelect={setView}
              reviewOf={reviewOf}
              target={{ kind: 'cannedResponses' }}
              label="Canned responses"
              errors={sectionErrorCount('Canned responses')}
            />
            <NavItem
              current={view}
              onSelect={setView}
              reviewOf={reviewOf}
              target={{ kind: 'messages' }}
              label="Automatic messages"
            />
            {originalFiles[PRE_ENGAGEMENT_FILE] !== undefined && (
              <NavItem
                current={view}
                onSelect={setView}
                reviewOf={reviewOf}
                target={{ kind: 'webchat' }}
                label="Webchat form"
                errors={sectionErrorCount('Webchat form')}
              />
            )}
          </ul>
          <h3>Cases</h3>
          <ul>
            <NavItem
              current={view}
              onSelect={setView}
              reviewOf={reviewOf}
              target={{ kind: 'caseSections' }}
              label="Sections"
              errors={sectionErrorCount('Case sections')}
            />
            <NavItem
              current={view}
              onSelect={setView}
              reviewOf={reviewOf}
              target={{ kind: 'caseStatus' }}
              label="Case statuses"
              errors={sectionErrorCount('Case statuses')}
            />
            {caseSections.map(section => (
              <NavItem
                current={view}
                onSelect={setView}
                reviewOf={reviewOf}
                key={section.key}
                target={{ kind: 'caseSection', sectionKey: section.key }}
                label={section.label}
                errors={issuesByTab[`case:${section.key}`]?.filter(issue => issue.severity === 'error').length}
              />
            ))}
          </ul>
          {hasProfiles(originalFiles) && (
            <>
              <h3>Client profiles</h3>
              <ul>
                <NavItem
                  current={view}
                  onSelect={setView}
                  reviewOf={reviewOf}
                  target={{ kind: 'profiles' }}
                  label="Profiles"
                  errors={sectionErrorCount('Client profiles')}
                />
              </ul>
            </>
          )}
        </nav>
        <main className="main">
          {definitions.errors.length > 0 && (
            <div className="alert alert-error">
              Some files could not be read:
              <ul>
                {definitions.errors.map(fileError => (
                  <li key={fileError.path}>
                    <code>{fileError.path}</code>: {fileError.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* The section's title shows "Need help?" (SectionTitle) */}
          <SectionHelpContext.Provider value={sectionHelp}>{renderMain()}</SectionHelpContext.Provider>
        </main>
      </div>

      {tryItOut && <FlexDesktopPreview />}

      {reviewing && <ReviewChanges />}
    </>
  );
};
