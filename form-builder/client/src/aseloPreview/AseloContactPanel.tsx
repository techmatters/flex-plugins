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
 * The contact form panel as a counselor sees it in Aselo, following TabbedFormsTabs and
 * BottomBar in plugin-hrm-form: a back button, the contact's number and queue, a search tab then
 * Caller (only when someone calls about another person), Child, Categories and Summary tabs,
 * "Next" between tabs, and "Add to Case" and "Save and End" on the last one. Saving checks the
 * fields the way Aselo does, says so in an alert and marks tabs that need attention.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { CONTACT_TABS, getContactSplitFormAt } from '../common/definitions';
import { selectDraftFiles } from '../drafts/draftSlice';
import { AseloFormBody } from './AseloFormBody';
import { AseloCategories } from './AseloCategories';
import {
  BackIcon,
  ErrorIcon,
  FolderIcon,
  KeyboardArrowDownIcon,
  KeyboardArrowLeftIcon,
  KeyboardArrowRightIcon,
  KeyboardArrowUpIcon,
  SearchIcon,
} from './flexIcons';
import { AseloCallTypeScreen } from './AseloCallTypeScreen';
import { getCallTypeButtons } from '../chatsAndCalls/sections';
import { Strings, translate } from './translations';
import {
  backToCallTypes,
  categoriesChanged,
  categoriesViewChanged,
  categorySectionToggled,
  chooseDataCallType,
  nextPreviewTab,
  nonDataCallTypeChosen,
  saveAndEnd,
  selectContactPanel,
  selectPreview,
  setPreviewAnswer,
  TabId,
  tabSelected,
} from './previewSlice';
import './aselo.css';

const TAB_LABELS: Record<Exclude<TabId, 'search'>, string> = {
  CallerInformationTab: 'TabbedForms-AddCallerInfoTab',
  ChildInformationTab: 'TabbedForms-AddChildInfoTab',
  categories: 'TabbedForms-CategoriesTab',
  CaseInformationTab: 'TabbedForms-AddCaseInfoTab',
};

/**
 * StyledTabs is Material UI's Tabs with variant="scrollable" and scrollButtons="auto": when the
 * tabs don't fit, there's no scrollbar but a 40px arrow at each end, faded out on the side
 * there's nothing more to see (TabScrollButton). Whether they fit is measured, so it's local.
 */
const AseloTabStrip = ({ children }: { children: React.ReactNode }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });
  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const start = scroller.scrollLeft > 1;
    const end = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
    setOverflow(current => (current.start === start && current.end === end ? current : { start, end }));
  }, []);
  useLayoutEffect(measure);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);
  const scrollBy = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft += direction * scroller.clientWidth;
  };
  const showButtons = overflow.start || overflow.end;
  return (
    <div className="aselo-tabs">
      {showButtons && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={`aselo-tab-scroll ${overflow.start ? '' : 'disabled'}`}
          onClick={() => scrollBy(-1)}
        >
          <KeyboardArrowLeftIcon size={20} />
        </button>
      )}
      <div ref={scrollerRef} className="aselo-tabs-scroller" role="tablist" onScroll={measure}>
        {children}
      </div>
      {showButtons && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={`aselo-tab-scroll ${overflow.end ? '' : 'disabled'}`}
          onClick={() => scrollBy(1)}
        >
          <KeyboardArrowRightIcon size={20} />
        </button>
      )}
    </div>
  );
};

/**
 * AddCaseButton: a secondary button with a folder icon that opens "New Case" / "Existing Case".
 * Cases aren't part of the preview, so choosing one only closes the list. Whether the list is
 * open is only how the screen looks, so it's local.
 */
const AseloAddCaseButton = ({ strings }: { strings: Strings }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="aselo-add-case"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      {open && (
        <ul className="aselo-add-case-menu">
          {['TabbedForms-NewCase', 'TabbedForms-ExistingCase'].map(code => (
            <li key={code}>
              <button type="button" onClick={() => setOpen(false)}>
                {translate(strings, code)}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="aselo-button aselo-button-secondary"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <FolderIcon size={16} />
        <span className="aselo-add-case-label">{translate(strings, 'BottomBar-AddContactToNewCase')}</span>
        {open ? <KeyboardArrowUpIcon size={20} /> : <KeyboardArrowDownIcon size={20} />}
      </button>
    </div>
  );
};

// The preview's state and logic live in previewSlice.ts; strings are the language it shows. The
// queue is the one the sample task came from
export const AseloContactPanel = ({ strings, queueName }: { strings: Strings; queueName: string }) => {
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectDraftFiles);
  const {
    channel: taskType,
    screen,
    tabIndex,
    values,
    selectedCategories,
    categoriesView,
  } = useAppSelector(selectPreview);
  const { referenceData, forms, categories, tabs, currentTab, isLastTab, errorsByTab, categoriesInvalid } =
    useAppSelector(selectContactPanel);
  const tabHasError = (tab: TabId) =>
    tab === 'categories' ? categoriesInvalid : tab !== 'search' && Object.values(errorsByTab[tab] ?? {}).some(Boolean);

  if (screen === 'callTypes') {
    return (
      // As in CallTypeButtons: straight on the grey panel, no header (the contact's number only
      // shows with the tabs)
      <div className="aselo" role="form">
        <AseloCallTypeScreen
          buttons={getCallTypeButtons(files)}
          strings={strings}
          taskType={taskType}
          onDataCallType={name => dispatch(chooseDataCallType(name))}
          onNonDataCallType={() => dispatch(nonDataCallTypeChosen())}
        />
      </div>
    );
  }

  const renderTabContent = () => {
    // The search tab is never the one shown (it opens Aselo's search instead)
    if (currentTab === 'search') return null;
    if (currentTab === 'categories') {
      return (
        <AseloCategories
          definition={categories}
          selected={selectedCategories}
          view={categoriesView}
          strings={strings}
          onChange={selected => dispatch(categoriesChanged(selected))}
          onToggleSection={category => dispatch(categorySectionToggled(category))}
          onViewChange={gridView => dispatch(categoriesViewChanged(gridView))}
        />
      );
    }
    const tab = CONTACT_TABS.find(contactTab => contactTab.key === currentTab)!;
    return (
      <AseloFormBody
        key={currentTab}
        form={forms[currentTab]}
        values={values[currentTab]}
        errors={errorsByTab[currentTab] ?? {}}
        referenceData={referenceData}
        strings={strings}
        splitFormAt={getContactSplitFormAt(files, tab)}
        onChange={(name, value) => dispatch(setPreviewAnswer(currentTab, name, value))}
      />
    );
  };

  return (
    <div className="aselo" role="form">
      <div className="aselo-contact-header">
        <button type="button" className="aselo-back-button" onClick={() => dispatch(backToCallTypes())}>
          <BackIcon size={20} />
          <span>{translate(strings, 'TabbedForms-BackButton')}</span>
        </button>
        {/* A sample contact number; Aselo shows the contact's, then the queue it came from */}
        <p className="aselo-contact-id">
          <strong>#205810</strong>
          <span className="aselo-queue-name"> {queueName}</span>
        </p>
      </div>
      <AseloTabStrip>
        {tabs.map((tab, index) =>
          tab === 'search' ? (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-label="Search"
              aria-selected={false}
              className="aselo-tab aselo-search-tab"
              // In Aselo it opens the search over the form; searching isn't part of the preview
              title="Search (not in the preview)"
            >
              <SearchIcon size={20} />
            </button>
          ) : (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={index === tabIndex}
              className={`aselo-tab ${index === tabIndex ? 'selected' : ''}`}
              onClick={() => dispatch(tabSelected(index))}
            >
              {tabHasError(tab) && (
                <span className="aselo-tab-error">
                  <ErrorIcon size={10} title="Needs attention" />
                </span>
              )}
              {translate(strings, TAB_LABELS[tab])}
            </button>
          ),
        )}
      </AseloTabStrip>

      <div className="aselo-tab-content">{renderTabContent()}</div>

      {tabIndex > 0 && (
        <div className="aselo-bottom-bar">
          {isLastTab ? (
            <>
              <AseloAddCaseButton strings={strings} />
              <button
                type="button"
                className="aselo-button aselo-button-destructive"
                onClick={() => {
                  // As useTabbedForm does when the form has errors
                  if (dispatch(saveAndEnd()) === 'invalid') window.alert(translate(strings, 'Error-Form'));
                }}
              >
                {translate(strings, 'BottomBar-SaveAndEnd')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="aselo-button aselo-button-primary"
              onClick={() => dispatch(nextPreviewTab())}
            >
              {translate(strings, 'BottomBar-Next')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
