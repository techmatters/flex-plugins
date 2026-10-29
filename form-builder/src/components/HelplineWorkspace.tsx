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
import { useMemo, useState } from 'react';
import type { DefinitionFiles } from '../../server/definitionsApi';
import {
  CATEGORIES_FILE,
  caseSectionTarget,
  CONTACT_TABS,
  isContactTab,
  getCaseSections,
  getCaseSectionSplitFormAt,
  getContactSplitFormAt,
  getForm,
  getHelplineName,
  getReferenceData,
} from '../definitions';
import { validateSections } from '../sections';
import { SaveState, useDraft } from '../useDraft';
import type { DraftClient } from '../draftClient';
import { validateContactTab, ValidationIssue } from '../validation';
import { FlexDesktopPreview, PreviewFocus } from '../aselo/FlexDesktopPreview';
import { AseloSectionPreview } from '../aselo/AseloSectionPreview';
import { ContactFormEditor } from './ContactFormEditor';
import { ReviewChanges } from './ReviewChanges';
import { CallTypesEditor } from './sections/CallTypesEditor';
import { CategoriesEditor } from './sections/CategoriesEditor';
import { CaseStatusEditor } from './sections/CaseStatusEditor';
import { CaseSectionsEditor } from './sections/CaseSectionsEditor';
import { FeaturesEditor } from './sections/FeaturesEditor';
import { ServiceConfigEditor } from './sections/ServiceConfigEditor';
import { ProfilesEditor } from './sections/ProfilesEditor';
import { hasProfiles } from '../profiles';
import { getFeatures } from '../helplineFeatures';
import { CannedResponsesEditor } from './sections/CannedResponsesEditor';
import { MessagesEditor } from './sections/MessagesEditor';
import { WebchatFormEditor } from './webchat/WebchatFormEditor';
import { PRE_ENGAGEMENT_FILE } from '../webchat';
import { FormSelectorEditor } from './sections/FormSelectorEditor';
import { checkFormSelectorFlag, FORM_SELECTOR_PREFIX } from '../formSelector';

// Which screen is showing in the main area
type View =
  | { kind: 'contactTab'; tabKey: string }
  | { kind: 'categories' }
  | { kind: 'callTypes' }
  | { kind: 'cannedResponses' }
  | { kind: 'messages' }
  | { kind: 'webchat' }
  | { kind: 'formSelector' }
  | { kind: 'caseStatus' }
  | { kind: 'caseSections' }
  | { kind: 'features' }
  | { kind: 'serviceConfig' }
  | { kind: 'profiles' }
  | { kind: 'caseSection'; sectionKey: string };

const sameView = (a: View, b: View) => JSON.stringify(a) === JSON.stringify(b);

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

type Props = {
  definitions: DefinitionFiles;
  // Show the settings only Aselo staff may change
  staffMode: boolean;
  // Aselo staff apply changes; helpline staff submit them for review
  canApply: boolean;
  // False when deployed without the GitHub App: Aselo staff download the changes and open the PR
  applyInBuilder?: boolean;
  draftClient: DraftClient;
  // Reload the helpline from the server (after applying, or when someone else changed the draft)
  onReload: () => void;
  saveDelayMs?: number;
};

const SAVE_STATE_TEXT: Record<SaveState, string> = {
  loading: 'Loading the draft…',
  saved: 'All changes saved',
  pending: 'Unsaved changes…',
  saving: 'Saving…',
  conflict: 'Not saved',
  error: "Couldn't save",
};

export const HelplineWorkspace = ({
  definitions,
  staffMode,
  canApply,
  applyInBuilder = true,
  draftClient,
  onReload,
  saveDelayMs,
}: Props) => {
  const { code, version, files: originalFiles } = definitions;
  const draft = useDraft(code, version, originalFiles, draftClient, { saveDelayMs });
  const files = draft.files;

  const [view, setView] = useState<View>({ kind: 'contactTab', tabKey: CONTACT_TABS[0].key });
  // What the full-screen "Try it out" preview opens on, when it's open
  const [tryItOut, setTryItOut] = useState<{ focus: PreviewFocus; tab?: string }>();
  const [reviewing, setReviewing] = useState(false);
  // The case section whose Aselo preview is open
  const [previewingSection, setPreviewingSection] = useState<string>();
  // Bumped on discard so the editor rebuilds from the restored files
  const [editorRevision, setEditorRevision] = useState(0);

  const caseTargets = useMemo(() => getCaseSections(files).map(caseSectionTarget), [files]);
  // Contact tabs by tab key, case section forms by `case:<section key>`
  const issuesByTab = useMemo(
    () =>
      Object.fromEntries([
        ...CONTACT_TABS.map((tab) => [tab.key, validateContactTab(files, originalFiles, tab)]),
        ...caseTargets.map((target) => [`case:${target.key}`, validateContactTab(files, originalFiles, target)]),
      ]) as Record<string, ValidationIssue[]>,
    [files, originalFiles, caseTargets],
  );
  // Whether answers fill in the contact with PrepopulateMappings.json (else PrepopulateKeys.json)
  const usePrepopulateMappings =
    getFeatures(files, definitions.serviceConfigDefaults)?.usePrepopulateMappings ??
    definitions.featureFlags?.use_prepopulate_mappings === true;
  const sectionIssues = useMemo(
    () => [
      ...validateSections(files, originalFiles, definitions.code),
      ...checkFormSelectorFlag(originalFiles, files, usePrepopulateMappings),
    ],
    [files, originalFiles, definitions.code, usePrepopulateMappings],
  );
  // For the review: problems in forms the draft changes (anything blocking always counts), so
  // reviewers aren't shown old notes about forms nobody touched
  const changedFilePaths = new Set(draft.changedPaths);
  const reviewIssues = [
    ...[...CONTACT_TABS, ...caseTargets].flatMap((target) => {
      const issues = issuesByTab[isContactTab(target) ? target.key : `case:${target.key}`] ?? [];
      return changedFilePaths.has(target.filePath) ? issues : issues.filter((issue) => issue.severity === 'error');
    }),
    ...sectionIssues,
  ];
  const sectionErrorCount = (prefix: string) =>
    sectionIssues.filter((issue) => issue.severity === 'error' && issue.message.startsWith(prefix))
      .length;
  const errorCount = (tabKey: string) =>
    issuesByTab[tabKey]?.filter((issue) => issue.severity === 'error').length ?? 0;

  const referenceData = getReferenceData(files);
  const caseSections = getCaseSections(files);
  const changeCount = draft.changedPaths.length;

  const discard = async () => {
    if (window.confirm('Discard all the draft changes for this helpline? This can’t be undone.')) {
      await draft.discardChanges();
      setEditorRevision((revision) => revision + 1);
    }
  };


  const renderContactTab = (tabKey: string) => {
    const tab = CONTACT_TABS.find((contactTab) => contactTab.key === tabKey)!;
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
        <ContactFormEditor
          key={`${tab.key}-${editorRevision}`}
          tab={tab}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          helplineLanguage={definitions.helplineLanguage}
          issues={issuesByTab[tab.key] ?? []}
          onChangeFiles={draft.updateFiles}
        />
      </>
    );
  };

  const renderMain = () => {
    // Editors build their state from the files when they open, so wait for the saved draft
    if (draft.saveState === 'loading') return <p className="muted">Loading the draft…</p>;
    if (view.kind === 'contactTab') return renderContactTab(view.tabKey);
    const editorKey = `${view.kind}-${editorRevision}`;
    if (view.kind === 'callTypes') {
      return (
        <CallTypesEditor
          key={editorKey}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          helplineLanguage={definitions.helplineLanguage}
          onChangeFiles={draft.updateFiles}
          onTryItOut={() => setTryItOut({ focus: 'callTypes' })}
        />
      );
    }
    if (view.kind === 'cannedResponses') {
      return (
        <CannedResponsesEditor
          key={editorKey}
          draftFiles={files}
          helplineLanguage={definitions.helplineLanguage}
          enabled={getFeatures(files, definitions.serviceConfigDefaults)?.enableCannedResponses ?? definitions.featureFlags?.enable_canned_responses !== false}
          onChangeFiles={draft.updateFiles}
          onTryItOut={() => setTryItOut({ focus: 'cannedResponses' })}
        />
      );
    }
    if (view.kind === 'messages') {
      return (
        <MessagesEditor
          key={editorKey}
          draftFiles={files}
          helplineName={getHelplineName(files, code)}
          onChangeFiles={draft.updateFiles}
        />
      );
    }
    if (view.kind === 'webchat') {
      return (
        <WebchatFormEditor
          key={editorKey}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          settings={definitions.webchat}
          featureFlags={{
            ...definitions.featureFlags,
            ...(getFeatures(files, definitions.serviceConfigDefaults) ? { use_prepopulate_mappings: getFeatures(files, definitions.serviceConfigDefaults)!.usePrepopulateMappings } : {}),
          }}
          issues={sectionIssues.filter((issue) => issue.message.startsWith('Webchat form'))}
          onChangeFiles={draft.updateFiles}
        />
      );
    }
    if (view.kind === 'formSelector') {
      return (
        <FormSelectorEditor
          key={editorKey}
          draftFiles={files}
          staffMode={staffMode}
          usePrepopulateMappings={usePrepopulateMappings}
          issues={sectionIssues.filter((issue) => issue.message.startsWith(FORM_SELECTOR_PREFIX))}
          onChangeFiles={draft.updateFiles}
        />
      );
    }
    if (view.kind === 'categories') {
      return (
        <CategoriesEditor
          key={editorKey}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          helplineLanguage={definitions.helplineLanguage}
          issues={sectionIssues.filter((issue) => issue.message.startsWith('Issue categories'))}
          onChangeFiles={draft.updateFiles}
          onTryItOut={() => setTryItOut({ focus: 'form', tab: 'categories' })}
        />
      );
    }
    if (view.kind === 'profiles') {
      return (
        <ProfilesEditor
          key={editorKey}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          profilesEnabled={getFeatures(files, definitions.serviceConfigDefaults)?.enableClientProfiles !== false}
          issues={sectionIssues.filter((issue) => issue.message.startsWith('Client profiles'))}
          onChangeFiles={draft.updateFiles}
        />
      );
    }
    if (view.kind === 'features' && canApply) {
      return (
        <FeaturesEditor
          key={editorKey}
          draftFiles={files}
          originalFiles={originalFiles}
          canChange={canApply}
          defaults={definitions.serviceConfigDefaults}
          onChangeFiles={draft.updateFiles}
        />
      );
    }
    if (view.kind === 'serviceConfig' && canApply) {
      return (
        <ServiceConfigEditor
          key={editorKey}
          code={definitions.code}
          draftFiles={files}
          originalFiles={originalFiles}
          defaults={definitions.serviceConfigDefaults}
          onChangeFiles={draft.updateFiles}
        />
      );
    }
    if (view.kind === 'caseSections') {
      return (
        <CaseSectionsEditor
          key={editorKey}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          helplineLanguage={definitions.helplineLanguage}
          issues={sectionIssues.filter((issue) => issue.message.startsWith('Case sections'))}
          onChangeFiles={draft.updateFiles}
          onOpenForm={(sectionKey) => setView({ kind: 'caseSection', sectionKey })}
        />
      );
    }
    if (view.kind === 'caseStatus') {
      return (
        <CaseStatusEditor
          key={editorKey}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          issues={sectionIssues.filter((issue) => issue.message.startsWith('Case statuses'))}
          onChangeFiles={draft.updateFiles}
        />
      );
    }
    // e.g. Features after switching to "View as helpline staff"
    if (view.kind !== 'caseSection') return renderContactTab(CONTACT_TABS[0].key);
    const target = caseTargets.find((caseTarget) => caseTarget.key === view.sectionKey);
    const form = target && getForm(files, target.filePath);
    if (!target || !form) return <p className="muted">This case section has no form.</p>;
    return (
      <>
        <div className="try-it-out-row">
          <button type="button" className="secondary-button" onClick={() => setPreviewingSection(target.key)}>
            Preview in Aselo
          </button>
          <span className="muted">See the draft form as counselors see it when they add a {target.title} to a case.</span>
        </div>
        <ContactFormEditor
          key={`case-${target.key}-${editorRevision}`}
          tab={target}
          draftFiles={files}
          originalFiles={originalFiles}
          staffMode={staffMode}
          helplineLanguage={definitions.helplineLanguage}
          issues={issuesByTab[`case:${target.key}`] ?? []}
          onChangeFiles={draft.updateFiles}
        />
        {previewingSection === target.key && (
          <div className="modal-backdrop" role="presentation" onClick={() => setPreviewingSection(undefined)}>
            <div
              className="modal modal-wide"
              role="dialog"
              aria-modal="true"
              aria-label={`${target.title} in Aselo`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{target.title} in Aselo</h2>
                <button type="button" className="link-button" onClick={() => setPreviewingSection(undefined)}>
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
          onClick={() => setReviewing(true)}
        >
          {canApply ? 'Review & apply' : 'Review & submit'}
        </button>
      </div>

      {draft.conflict && (
        <div className="alert alert-error">
          {draft.conflict.updatedBy ?? 'Someone else'} changed this draft
          {draft.conflict.updatedAt ? ` at ${new Date(draft.conflict.updatedAt).toLocaleString()}` : ''}{' '}
          while you were editing, so your latest changes weren't saved. Reload to see their
          version, then make your changes again.
          <button type="button" className="link-button" onClick={onReload}>
            Reload
          </button>
        </div>
      )}

      {draft.notice && (
        <div className="alert alert-info">
          {draft.notice}
          <button type="button" className="link-button" onClick={draft.dismissNotice}>
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
            {CONTACT_TABS.filter((tab) => files[tab.filePath]).map((tab) => (
              <NavItem current={view} onSelect={setView}
                key={tab.key}
                target={{ kind: 'contactTab', tabKey: tab.key }}
                label={tab.title}
                errors={errorCount(tab.key)}
              />
            ))}
            {files[CATEGORIES_FILE] !== undefined && (
              <NavItem current={view} onSelect={setView}
                target={{ kind: 'categories' }}
                label="Issue categories"
                errors={sectionErrorCount('Issue categories')}
              />
            )}
            <NavItem
              current={view}
              onSelect={setView}
              target={{ kind: 'formSelector' }}
              label={FORM_SELECTOR_PREFIX}
              errors={sectionErrorCount(FORM_SELECTOR_PREFIX)}
            />
          </ul>
          <h3>Chats and calls</h3>
          <ul>
            <NavItem current={view} onSelect={setView}
              target={{ kind: 'callTypes' }}
              label="Call types"
              errors={sectionErrorCount('Call types')}
            />
            <NavItem current={view} onSelect={setView}
              target={{ kind: 'cannedResponses' }}
              label="Canned responses"
              errors={sectionErrorCount('Canned responses')}
            />
            <NavItem current={view} onSelect={setView} target={{ kind: 'messages' }} label="Automatic messages" />
            {originalFiles[PRE_ENGAGEMENT_FILE] !== undefined && (
              <NavItem current={view} onSelect={setView}
                target={{ kind: 'webchat' }}
                label="Webchat form"
                errors={sectionErrorCount('Webchat form')}
              />
            )}
          </ul>
          <h3>Cases</h3>
          <ul>
            <NavItem current={view} onSelect={setView}
              target={{ kind: 'caseSections' }}
              label="Sections"
              errors={sectionErrorCount('Case sections')}
            />
            <NavItem current={view} onSelect={setView}
              target={{ kind: 'caseStatus' }}
              label="Case statuses"
              errors={sectionErrorCount('Case statuses')}
            />
            {caseSections.map((section) => (
              <NavItem current={view} onSelect={setView}
                key={section.key}
                target={{ kind: 'caseSection', sectionKey: section.key }}
                label={section.label}
                errors={issuesByTab[`case:${section.key}`]?.filter((issue) => issue.severity === 'error').length}
              />
            ))}
          </ul>
          {hasProfiles(originalFiles) && (
            <>
              <h3>Client profiles</h3>
              <ul>
                <NavItem current={view} onSelect={setView}
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
                {definitions.errors.map((fileError) => (
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

      {tryItOut && (
        <FlexDesktopPreview
          definitions={definitions}
          files={files}
          focus={tryItOut.focus}
          initialTab={tryItOut.tab as never}
          onClose={() => setTryItOut(undefined)}
        />
      )}

      {reviewing && (
        <ReviewChanges
          code={code}
          version={version}
          originalFiles={originalFiles}
          draftFiles={files}
          changedPaths={draft.changedPaths}
          mode={canApply ? 'apply' : 'submit'}
          applyInBuilder={applyInBuilder}
          alreadySubmitted={draft.meta?.status === 'submitted'}
          onSubmit={draft.submit}
          onApply={draft.apply}
          issues={reviewIssues}
          webchatDefaultLocale={definitions.webchat?.defaultLocale}
          onClose={() => setReviewing(false)}
        />
      )}
    </>
  );
};
