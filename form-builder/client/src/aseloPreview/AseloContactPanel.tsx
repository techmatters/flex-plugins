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
 * BottomBar in plugin-hrm-form: a back button and contact number, a search tab then Caller
 * (only when someone calls about another person), Child, Categories and Summary tabs, "Next"
 * between tabs and "Save and End" on the last one. Saving checks the fields the way Aselo
 * does and marks tabs that need attention.
 */
import { useAppDispatch, useAppSelector } from '../app/store';
import { CONTACT_TABS, getContactSplitFormAt } from '../common/definitions';
import { selectDraftFiles } from '../drafts/draftSlice';
import { AseloFormBody } from './AseloFormBody';
import { AseloCategories } from './AseloCategories';
import { BackIcon, ErrorIcon, SearchIcon } from './flexIcons';
import { AseloCallTypeScreen } from './AseloCallTypeScreen';
import { getCallTypeButtons } from '../chatsAndCalls/sections';
import { Strings, translate } from './translations';
import {
  backToCallTypes,
  categoriesChanged,
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

// The preview's state and logic live in previewSlice.ts; strings are the language it shows
export const AseloContactPanel = ({ strings }: { strings: Strings }) => {
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectDraftFiles);
  const { channel: taskType, screen, tabIndex, values, selectedCategories } = useAppSelector(selectPreview);
  const { referenceData, forms, categories, tabs, currentTab, isLastTab, errorsByTab, categoriesInvalid } =
    useAppSelector(selectContactPanel);
  const tabHasError = (tab: TabId) =>
    tab === 'categories' ? categoriesInvalid : tab !== 'search' && Object.values(errorsByTab[tab] ?? {}).some(Boolean);

  if (screen === 'callTypes') {
    return (
      <div className="aselo" role="form">
        <div className="aselo-contact-header">
          <div className="aselo-contact-id">#205810</div>
        </div>
        <div className="aselo-tab-content">
          <AseloCallTypeScreen
            buttons={getCallTypeButtons(files)}
            strings={strings}
            taskType={taskType}
            onDataCallType={name => dispatch(chooseDataCallType(name))}
            onNonDataCallType={() => dispatch(nonDataCallTypeChosen())}
          />
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    if (currentTab === 'search') {
      return (
        <p className="aselo-search-placeholder">
          Counselors search previous contacts here. It isn&apos;t part of the form.
        </p>
      );
    }
    if (currentTab === 'categories') {
      return (
        <AseloCategories
          definition={categories}
          selected={selectedCategories}
          hasError={categoriesInvalid}
          strings={strings}
          onChange={selected => dispatch(categoriesChanged(selected))}
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
        <div className="aselo-contact-id">#205810</div>
      </div>
      <div className="aselo-tabs" role="tablist">
        {tabs.map((tab, index) =>
          tab === 'search' ? (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-label="Search"
              aria-selected={index === tabIndex}
              className={`aselo-tab aselo-search-tab ${index === tabIndex ? 'selected' : ''}`}
              onClick={() => dispatch(tabSelected(index))}
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
      </div>

      <div className="aselo-tab-content">{renderTabContent()}</div>

      {tabIndex > 0 && (
        <div className="aselo-bottom-bar">
          {isLastTab ? (
            <button
              type="button"
              className="aselo-button aselo-button-destructive"
              onClick={() => dispatch(saveAndEnd())}
            >
              {translate(strings, 'BottomBar-SaveAndEnd')}
            </button>
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
