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
  CONTACT_TABS,
  getCaseSections,
  getCaseSectionSplitFormAt,
  getCaseStatuses,
  getCategoriesByHelpline,
  getContactSplitFormAt,
  getForm,
  getHelplineName,
  getReferenceData,
} from '../definitions';
import { validateSections } from '../sections';
import { useDraft } from '../useDraft';
import { validateContactTab, ValidationIssue } from '../validation';
import { CategoriesPreview } from './CategoriesPreview';
import { FlexDesktopPreview, PreviewFocus } from '../aselo/FlexDesktopPreview';
import { AseloSectionPreview } from '../aselo/AseloSectionPreview';
import { CaseStatusPreview } from './CaseStatusPreview';
import { ContactFormEditor } from './ContactFormEditor';
import { ReviewChanges } from './ReviewChanges';
import { CallTypesEditor } from './sections/CallTypesEditor';
import { CannedResponsesEditor } from './sections/CannedResponsesEditor';
import { MessagesEditor } from './sections/MessagesEditor';

// Which screen is showing in the main area
type View =
  | { kind: 'contactTab'; tabKey: string }
  | { kind: 'categories' }
  | { kind: 'callTypes' }
  | { kind: 'cannedResponses' }
  | { kind: 'messages' }
  | { kind: 'caseStatus' }
  | { kind: 'caseSection'; sectionKey: string };

const sameView = (a: View, b: View) => JSON.stringify(a) === JSON.stringify(b);

type Props = {
  definitions: DefinitionFiles;
  staffMode: boolean;
};

export const HelplineWorkspace = ({ definitions, staffMode }: Props) => {
  const { code, version, files: originalFiles } = definitions;
  const draft = useDraft(code, version, originalFiles);
  const files = draft.files;

  const [view, setView] = useState<View>({ kind: 'contactTab', tabKey: CONTACT_TABS[0].key });
  // What the full-screen "Try it out" preview opens on, when it's open
  const [tryItOut, setTryItOut] = useState<{ focus: PreviewFocus; tab?: string }>();
  const [reviewing, setReviewing] = useState(false);
  // Bumped on discard so the editor rebuilds from the restored files
  const [editorRevision, setEditorRevision] = useState(0);

  const issuesByTab = useMemo(
    () =>
      Object.fromEntries(
        CONTACT_TABS.map((tab) => [tab.key, validateContactTab(files, originalFiles, tab)]),
      ) as Record<string, ValidationIssue[]>,
    [files, originalFiles],
  );
  const sectionIssues = useMemo(() => validateSections(files, originalFiles), [files, originalFiles]);
  const allIssues = [...Object.values(issuesByTab).flat(), ...sectionIssues];
  const sectionErrorCount = (prefix: string) =>
    sectionIssues.filter((issue) => issue.severity === 'error' && issue.message.startsWith(prefix))
      .length;
  const errorCount = (tabKey: string) =>
    issuesByTab[tabKey]?.filter((issue) => issue.severity === 'error').length ?? 0;

  const referenceData = getReferenceData(files);
  const caseSections = getCaseSections(files);
  const changeCount = draft.changedPaths.length;

  const discard = () => {
    if (window.confirm('Discard all your changes for this helpline? This can’t be undone.')) {
      draft.discardChanges();
      setEditorRevision((revision) => revision + 1);
    }
  };

  const NavItem = ({ target, label, errors }: { target: View; label: string; errors?: number }) => (
    <li>
      <button
        type="button"
        className={sameView(view, target) ? 'nav-item active' : 'nav-item'}
        onClick={() => setView(target)}
      >
        {label}
        {Boolean(errors) && <span className="nav-error-count">{errors}</span>}
      </button>
    </li>
  );

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
          issues={issuesByTab[tab.key] ?? []}
          onChangeFiles={draft.updateFiles}
        />
      </>
    );
  };

  const renderMain = () => {
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
          enabled={definitions.featureFlags?.enable_canned_responses !== false}
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
    if (view.kind === 'categories') {
      return <CategoriesPreview categoriesByHelpline={getCategoriesByHelpline(files)} />;
    }
    if (view.kind === 'caseStatus') {
      return <CaseStatusPreview statuses={getCaseStatuses(files)} />;
    }
    const section = caseSections.find((caseSection) => caseSection.key === view.sectionKey);
    const form = section && getForm(files, section.formPath);
    if (!section || !form) return <p className="muted">This case section has no form.</p>;
    return (
      <AseloSectionPreview
        key={section.key}
        title={section.label}
        form={form}
        files={files}
        helplineLanguage={definitions.helplineLanguage}
        splitFormAt={getCaseSectionSplitFormAt(files, section.key)}
      />
    );
  };

  return (
    <>
      <div className="action-bar">
        <span className={changeCount ? 'change-count has-changes' : 'change-count'}>
          {changeCount
            ? `Draft: ${changeCount} file${changeCount === 1 ? '' : 's'} changed${draft.savedInBrowser ? ', saved in this browser' : ''}`
            : 'No changes yet'}
        </span>
        {changeCount > 0 && (
          <button type="button" className="link-button" onClick={discard}>
            Discard all changes
          </button>
        )}
        <button
          type="button"
          className="primary-button"
          disabled={changeCount === 0}
          onClick={() => setReviewing(true)}
        >
          Review &amp; export
        </button>
      </div>

      {changeCount > 0 && !draft.savedInBrowser && (
        <div className="alert alert-error">
          Your changes are too big to keep in this browser, so they'll be lost if you close or
          reload this page. Use “Review &amp; export” to download them before you leave.
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
          <h3>Contact forms</h3>
          <ul>
            {CONTACT_TABS.filter((tab) => files[tab.filePath]).map((tab) => (
              <NavItem
                key={tab.key}
                target={{ kind: 'contactTab', tabKey: tab.key }}
                label={tab.title}
                errors={errorCount(tab.key)}
              />
            ))}
            {files[CATEGORIES_FILE] !== undefined && (
              <NavItem target={{ kind: 'categories' }} label="Issue categories" />
            )}
          </ul>
          <h3>Chats and calls</h3>
          <ul>
            <NavItem
              target={{ kind: 'callTypes' }}
              label="Call types"
              errors={sectionErrorCount('Call types')}
            />
            <NavItem
              target={{ kind: 'cannedResponses' }}
              label="Canned responses"
              errors={sectionErrorCount('Canned responses')}
            />
            <NavItem target={{ kind: 'messages' }} label="Automatic messages" />
          </ul>
          <h3>Cases (preview only)</h3>
          <ul>
            <NavItem target={{ kind: 'caseStatus' }} label="Case statuses" />
            {caseSections.map((section) => (
              <NavItem
                key={section.key}
                target={{ kind: 'caseSection', sectionKey: section.key }}
                label={section.label}
              />
            ))}
          </ul>
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
          issues={allIssues}
          onClose={() => setReviewing(false)}
        />
      )}
    </>
  );
};
