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
import { useMemo, useState } from 'react';
import type {
  CategoriesDefinition,
  FormItemJsonDefinition,
} from '@hrm-form-definitions/formDefinition/types';
import type { ContactTab, DefinitionFileMap } from '../definitions';
import {
  CONTACT_TABS,
  getCategoriesByHelpline,
  getContactSplitFormAt,
  getForm,
  getReferenceData,
} from '../definitions';
import { AseloFormBody } from './AseloFormBody';
import {
  AseloCategories,
  countSelected,
  DEFAULT_MAXIMUM_SELECTIONS,
  SelectedCategories,
} from './AseloCategories';
import { FieldValue, FormValues, initialValueFor, validateField } from './aseloFields';
import { BackIcon, ErrorIcon, SearchIcon } from './flexIcons';
import { Strings, translate } from './translations';
import './aselo.css';

type TabId = 'search' | ContactTab['key'] | 'categories';
export type CallType = 'child' | 'caller';
export type SaveResult = 'saved' | 'invalid';

const TAB_LABELS: Record<Exclude<TabId, 'search'>, string> = {
  CallerInformationTab: 'TabbedForms-AddCallerInfoTab',
  ChildInformationTab: 'TabbedForms-AddChildInfoTab',
  categories: 'TabbedForms-CategoriesTab',
  CaseInformationTab: 'TabbedForms-AddCaseInfoTab',
};

type Props = {
  files: DefinitionFileMap;
  strings: Strings;
  callType: CallType;
  // The tab to open first (the one being edited)
  initialTab?: ContactTab['key'];
  onSaveResult?: (result: SaveResult | undefined) => void;
};

// IssueCategorizationTab is keyed by helpline name; contacts use the default helpline
const categoriesForDefaultHelpline = (files: DefinitionFileMap): CategoriesDefinition | undefined => {
  const byHelpline = getCategoriesByHelpline(files);
  const info = files['HelplineInformation.json'] as
    | { helplines?: { value: string; default?: boolean }[] }
    | undefined;
  const helplines = info?.helplines ?? [];
  const defaultHelpline = (helplines.find((h) => h.default) ?? helplines[0])?.value;
  return (defaultHelpline && byHelpline[defaultHelpline]) || Object.values(byHelpline)[0];
};

export const AseloContactPanel = ({ files, strings, callType, initialTab, onSaveResult }: Props) => {
  const referenceData = getReferenceData(files);
  const forms = useMemo(
    () =>
      Object.fromEntries(
        CONTACT_TABS.map((tab) => [tab.key, getForm(files, tab.filePath) ?? []]),
      ) as Record<ContactTab['key'], FormItemJsonDefinition[]>,
    [files],
  );
  const categories = categoriesForDefaultHelpline(files);
  const maxSelections = categories?.maxSelections ?? DEFAULT_MAXIMUM_SELECTIONS;

  const tabs: TabId[] = [
    'search',
    ...(callType === 'caller' ? (['CallerInformationTab'] as const) : []),
    'ChildInformationTab',
    'categories',
    'CaseInformationTab',
  ];
  const [tabIndex, setTabIndex] = useState(() =>
    Math.max(1, tabs.indexOf(initialTab ?? 'ChildInformationTab')),
  );
  const currentTab = tabs[Math.min(tabIndex, tabs.length - 1)];

  const [values, setValues] = useState<Record<ContactTab['key'], FormValues>>(
    () =>
      Object.fromEntries(
        CONTACT_TABS.map((tab) => [
          tab.key,
          Object.fromEntries(
            (getForm(files, tab.filePath) ?? []).map((item) => [
              item.name,
              initialValueFor(item, referenceData),
            ]),
          ),
        ]),
      ) as Record<ContactTab['key'], FormValues>,
  );
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({});
  // Like the plugin's form library: errors show after the first save attempt, then update live
  const [submitted, setSubmitted] = useState(false);

  const contactTabsShown = tabs.filter(
    (tab): tab is ContactTab['key'] => tab !== 'search' && tab !== 'categories',
  );
  const errorsByTab = Object.fromEntries(
    contactTabsShown.map((tabKey) => [
      tabKey,
      submitted
        ? Object.fromEntries(
            forms[tabKey].map((item) => [
              item.name,
              validateField(item, values[tabKey], referenceData),
            ]),
          )
        : {},
    ]),
  ) as Record<ContactTab['key'], Record<string, string | undefined>>;
  const selectedCount = countSelected(selectedCategories);
  const categoriesInvalid = submitted && (selectedCount < 1 || selectedCount > maxSelections);
  const tabHasError = (tab: TabId) =>
    tab === 'categories'
      ? categoriesInvalid
      : tab !== 'search' && Object.values(errorsByTab[tab] ?? {}).some(Boolean);

  const setValue = (tabKey: ContactTab['key'], name: string, value: FieldValue) => {
    onSaveResult?.(undefined);
    setValues((current) => {
      const tabValues = { ...current[tabKey], [name]: value };
      // A linked dropdown goes back to its blank answer when the one above changes
      forms[tabKey]
        .filter((item) => item.type === 'dependent-select' && item.dependsOn === name)
        .forEach((item) => {
          tabValues[item.name] = initialValueFor(item, referenceData);
        });
      return { ...current, [tabKey]: tabValues };
    });
  };

  const saveAndEnd = () => {
    setSubmitted(true);
    const invalid =
      contactTabsShown.some((tabKey) =>
        forms[tabKey].some((item) => validateField(item, values[tabKey], referenceData)),
      ) ||
      selectedCount < 1 ||
      selectedCount > maxSelections;
    onSaveResult?.(invalid ? 'invalid' : 'saved');
  };

  const isLastTab = tabIndex === tabs.length - 1;

  const renderTabContent = () => {
    if (currentTab === 'search') {
      return (
        <p className="aselo-search-placeholder">
          Counselors search previous contacts here. It isn't part of the form.
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
          onChange={(selected) => {
            onSaveResult?.(undefined);
            setSelectedCategories(selected);
          }}
        />
      );
    }
    const tab = CONTACT_TABS.find((contactTab) => contactTab.key === currentTab)!;
    return (
      <AseloFormBody
        key={currentTab}
        form={forms[currentTab]}
        values={values[currentTab]}
        errors={errorsByTab[currentTab] ?? {}}
        referenceData={referenceData}
        strings={strings}
        splitFormAt={getContactSplitFormAt(files, tab)}
        onChange={(name, value) => setValue(currentTab, name, value)}
      />
    );
  };

  return (
    <div className="aselo" role="form">
      <div className="aselo-contact-header">
        <button type="button" className="aselo-back-button" tabIndex={-1}>
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
              onClick={() => setTabIndex(index)}
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
              onClick={() => setTabIndex(index)}
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
              onClick={saveAndEnd}
            >
              {translate(strings, 'BottomBar-SaveAndEnd')}
            </button>
          ) : (
            <button
              type="button"
              className="aselo-button aselo-button-primary"
              onClick={() => setTabIndex(tabIndex + 1)}
            >
              {translate(strings, 'BottomBar-Next')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
