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
import {
  CATEGORIES_FILE,
  CONTACT_TABS,
  getCaseSections,
  getCaseSectionSplitFormAt,
  getForm,
} from '../common/definitions';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { noticeDismissed, SaveState, selectChangedPaths, selectDraft } from '../drafts/draftSlice';
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
import { ProfilesEditor } from '../profiles/ProfilesEditor';
import { hasProfiles } from '../profiles/profiles';
import { CannedResponsesEditor } from '../chatsAndCalls/CannedResponsesEditor';
import { MessagesEditor } from '../chatsAndCalls/MessagesEditor';
import { WebchatFormEditor } from '../webchat/WebchatFormEditor';
import { PRE_ENGAGEMENT_FILE } from '../webchat/webchat';

// Defined outside the workspace so its buttons survive re-renders (e.g. when the draft loads)
const NavItem = ({
  current,
  onSelect,
  target,
  label,
  errors,
}: {
  current: View;
  onSelect: (view: View) => void;
  target: View;
  label: string;
  errors?: number;
}) => (
  <li>
    <button
      type="button"
      className={sameView(current, target) ? 'nav-item active' : 'nav-item'}
      onClick={() => onSelect(target)}
    >
      {label}
      {Boolean(errors) && <span className="nav-error-count">{errors}</span>}
    </button>
  </li>
);

const SAVE_STATE_TEXT: Record<SaveState, string> = {
  loading: 'Loading the draft…',
  saved: 'All changes saved',
  pending: 'Unsaved changes…',
  saving: 'Saving…',
  conflict: 'Not saved',
  error: "Couldn't save",
};

export const HelplineWorkspace = () => {
  const dispatch = useAppDispatch();
  const definitions = useAppSelector(selectDefinitions)!;
  const draft = useAppSelector(selectDraft);
  const changedPaths = useAppSelector(selectChangedPaths);
  const { view, tryItOut, reviewing, previewingSection, editorRevision } = useAppSelector(selectWorkspace);
  const issuesByTab = useAppSelector(selectIssuesByTab);
  const sectionIssues = useAppSelector(selectSectionIssues);
  const caseTargets = useAppSelector(selectCaseTargets);
  // Show the settings only Aselo staff may change; Aselo staff apply, helpline staff submit
  const staffMode = useAppSelector(selectActingAsStaff);
  const canApply = staffMode;

  const { files, original: originalFiles } = draft;
  const setView = (target: View) => dispatch(viewSelected(target));
  const setTryItOut = (preview: { focus: PreviewFocus; tab?: string }) => dispatch(tryItOutOpened(preview));

  const sectionErrorCount = (prefix: string) =>
    sectionIssues.filter(issue => issue.severity === 'error' && issue.message.startsWith(prefix)).length;
  const errorCount = (tabKey: string) => issuesByTab[tabKey]?.filter(issue => issue.severity === 'error').length ?? 0;

  const caseSections = getCaseSections(files);
  const changeCount = changedPaths.length;

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
        <div className="try-it-out-row">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setTryItOut({ focus: 'form', tab: tab.key })}
          >
            Try it out in Aselo
          </button>
          <span className="muted">See the draft form in the counselor's screen and fill it in.</span>
        </div>
        <ContactFormEditor key={`${tab.key}-${editorRevision}`} tab={tab} />
      </>
    );
  };

  const renderMain = () => {
    // Editors build their state from the files when they open, so wait for the saved draft
    if (draft.saveState === 'loading') return <p className="muted">Loading the draft…</p>;
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

  return (
    <>
      <div className="action-bar">
        <span className={changeCount ? 'change-count has-changes' : 'change-count'}>
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
        {changeCount > 0 && (
          <button type="button" className="link-button" onClick={discard}>
            Discard draft
          </button>
        )}
        <button
          type="button"
          className="primary-button"
          disabled={changeCount === 0 || draft.saveState === 'conflict'}
          onClick={() => dispatch(reviewOpened())}
        >
          {canApply ? 'Review & apply' : 'Review & submit'}
        </button>
      </div>

      {draft.conflict && (
        <div className="alert alert-error">
          {draft.conflict.updatedBy ?? 'Someone else'} changed this draft
          {draft.conflict.updatedAt ? ` at ${new Date(draft.conflict.updatedAt).toLocaleString()}` : ''} while you were
          editing, so your latest changes weren't saved. Reload to see their version, then make your changes again.
          <button type="button" className="link-button" onClick={() => dispatch(reloadHelpline())}>
            Reload
          </button>
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
          {/* Features and the service configuration are for Aselo staff only (not when viewing as helpline staff) */}
          {canApply && (
            <>
              <h3>Helpline</h3>
              <ul>
                <NavItem current={view} onSelect={setView} target={{ kind: 'features' }} label="Features" />
                <NavItem
                  current={view}
                  onSelect={setView}
                  target={{ kind: 'serviceConfig' }}
                  label="Service configuration"
                />
              </ul>
            </>
          )}
          <h3>Contact forms</h3>
          <ul>
            {CONTACT_TABS.filter(tab => files[tab.filePath]).map(tab => (
              <NavItem
                current={view}
                onSelect={setView}
                key={tab.key}
                target={{ kind: 'contactTab', tabKey: tab.key }}
                label={tab.title}
                errors={errorCount(tab.key)}
              />
            ))}
            {files[CATEGORIES_FILE] !== undefined && (
              <NavItem
                current={view}
                onSelect={setView}
                target={{ kind: 'categories' }}
                label="Issue categories"
                errors={sectionErrorCount('Issue categories')}
              />
            )}
          </ul>
          <h3>Chats and calls</h3>
          <ul>
            <NavItem
              current={view}
              onSelect={setView}
              target={{ kind: 'callTypes' }}
              label="Call types"
              errors={sectionErrorCount('Call types')}
            />
            <NavItem
              current={view}
              onSelect={setView}
              target={{ kind: 'cannedResponses' }}
              label="Canned responses"
              errors={sectionErrorCount('Canned responses')}
            />
            <NavItem current={view} onSelect={setView} target={{ kind: 'messages' }} label="Automatic messages" />
            {originalFiles[PRE_ENGAGEMENT_FILE] !== undefined && (
              <NavItem
                current={view}
                onSelect={setView}
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
              target={{ kind: 'caseSections' }}
              label="Sections"
              errors={sectionErrorCount('Case sections')}
            />
            <NavItem
              current={view}
              onSelect={setView}
              target={{ kind: 'caseStatus' }}
              label="Case statuses"
              errors={sectionErrorCount('Case statuses')}
            />
            {caseSections.map(section => (
              <NavItem
                current={view}
                onSelect={setView}
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
          {renderMain()}
        </main>
      </div>

      {tryItOut && <FlexDesktopPreview />}

      {reviewing && <ReviewChanges />}
    </>
  );
};
