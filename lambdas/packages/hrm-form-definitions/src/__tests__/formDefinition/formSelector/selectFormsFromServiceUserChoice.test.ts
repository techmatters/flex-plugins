/**
 * Copyright (C) 2021-2023 Technology Matters
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

import {ContactFormDefinitionName, DefinitionVersion, selectFormsFromServiceUserChoice} from "../../../formDefinition";
import each from "jest-each";

type TestArrangement = {
    choiceLocations?: { form: string, input: string, aboutSelfValue: string }[]
    surveyAnswers: Record<string, string>,
    preEngagementSelections: Record<string, string>,
}

type SelectFormsTestCase = TestArrangement & {
    expectedForms: ContactFormDefinitionName[];
    formsDescription: string;
    populateFrom: keyof DefinitionVersion["prepopulateMappings"]
}

type SelectCallTypeTestCase = TestArrangement & {
    expectedCallType: string;
    callTypeDescription: string;
}

const selectFormsCasesWherePopulateFromIsIrrelevant: Omit<SelectFormsTestCase, 'populateFrom'>[] = [
    {
        surveyAnswers: {
            aboutSelf: 'Yes'
        },
        preEngagementSelections: {},
        expectedForms: ['ChildInformationTab', 'CaseInformationTab'],
        formsDescription: 'Default choice location, {populateFrom} as source: returns ChildInformationTab and CaseInformationTab if survey->aboutSelf = Yes',
    },
    {
        surveyAnswers: {
            aboutSelf: 'No'
        },
        preEngagementSelections: {},
        expectedForms: ['CallerInformationTab', 'CaseInformationTab'],
        formsDescription: 'Default choice location, {populateFrom} as source: returns CallerInformationTab and CaseInformationTab if survey->aboutSelf = No',
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'mySelfOrOther', aboutSelfValue: 'Myself' }
        ],
        surveyAnswers: {
            aboutSelf: 'No'
        },
        preEngagementSelections: {
            mySelfOrOther: 'Myself'
        },
        expectedForms: ['ChildInformationTab', 'CaseInformationTab'],
        formsDescription: 'preEngagement set as only choice source, {populateFrom} as source, and choice source has aboutSelfValue set - returns ChildInformationTab and CaseInformationTab'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' }
        ],
        surveyAnswers: {
            aboutSelf: 'Yes'
        },
        preEngagementSelections: {
            myselfOrOther: 'Other'
        },
        expectedForms: ['CallerInformationTab', 'CaseInformationTab'],
        formsDescription: 'preEngagement set as only choice source, {populateFrom} as source, and choice source has something other than aboutSelfValue set - returns CallerInformationTab and CaseInformationTab'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' },
            { form: 'survey', input: 'isAboutSelf', aboutSelfValue: 'Yeppers' }
        ],
        surveyAnswers: {
            isAboutSelf: 'Yeppers'
        },
        preEngagementSelections: {
            myselfOrOther: 'Other'
        },
        expectedForms: ['CallerInformationTab', 'CaseInformationTab'],
        formsDescription: 'Two choice sources, both populated, {populateFrom} as source - uses first sources choice'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' },
            { form: 'survey', input: 'isAboutSelf', aboutSelfValue: 'Yeppers' }
        ],
        surveyAnswers: {
            isAboutSelf: 'Yeppers'
        },
        preEngagementSelections: {},
        expectedForms: ['ChildInformationTab', 'CaseInformationTab'],
        formsDescription: 'Two choice sources, only second choice populated, {populateFrom} as source - uses second sources choice'
    }];

const selectFormsTestCases: SelectFormsTestCase[] = [
    ...selectFormsCasesWherePopulateFromIsIrrelevant.flatMap(tc => [
        { ...tc, populateFrom: 'preEngagement', formsDescription: tc.formsDescription.replace('{populateFrom}', 'preEngagement') },
        { ...tc, populateFrom: 'survey', formsDescription: tc.formsDescription.replace('{populateFrom}', 'survey')}] as SelectFormsTestCase[]),

    {
        surveyAnswers: {},
        preEngagementSelections: {},
        populateFrom: 'preEngagement',
        expectedForms: ['ChildInformationTab', 'CaseInformationTab'],
        formsDescription: 'Default choice location, preEngagement as source: returns ChildInformationTab and CaseInformationTab if aboutSelf not present',
    },
    {
        surveyAnswers: {},
        preEngagementSelections: {},
        populateFrom: 'survey',
        expectedForms: ['CaseInformationTab'],
        formsDescription: 'Default choice location, survey as source: returns CaseInformationTab only if aboutSelf not present',
    },
    {
        surveyAnswers: {},
        preEngagementSelections: { aboutSelf: 'Yes' },
        populateFrom: 'survey',
        expectedForms: ['CaseInformationTab'],
        formsDescription: 'Default choice location, survey as source: returns CaseInformationTab only if aboutSelf is present in preEngagement',
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' },
            { form: 'survey', input: 'isAboutSelf', aboutSelfValue: 'Yeppers' }
        ],
        surveyAnswers: {
            aboutSelf: 'No'
        },
        populateFrom: 'preEngagement',
        preEngagementSelections: {},
        expectedForms: ['ChildInformationTab', 'CaseInformationTab'],
        formsDescription: 'Two choice sources, no choice populated, preEngagement as source - returns CallerInformationTab and CaseInformationTab (does NOT use default)'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' },
            { form: 'survey', input: 'isAboutSelf', aboutSelfValue: 'Yeppers' }
        ],
        surveyAnswers: {
            aboutSelf: 'No'
        },
        populateFrom: 'survey',
        preEngagementSelections: {},
        expectedForms: ['CaseInformationTab'],
        formsDescription: 'Two choice sources, no choice populated, survey as source - returns CaseInformationTab only (does NOT fall back to default choice location)'
    },
]

const selectCallTypeTestCases: (SelectCallTypeTestCase)[] = [
    {
        surveyAnswers: {},
        preEngagementSelections: {},
        expectedCallType: 'Child calling about self',
        callTypeDescription: 'Default choice location: returns child callType if aboutSelf not present'
    },
    {
        surveyAnswers: {
            aboutSelf: 'Yes'
        },
        preEngagementSelections: {},
        expectedCallType: 'Child calling about self',
        callTypeDescription: 'Default choice location: returns childCallType if survey->aboutSelf = Yes'
    },
    {
        surveyAnswers: {
            aboutSelf: 'No'
        },
        preEngagementSelections: {},
        expectedCallType: 'Someone calling about a child',
        callTypeDescription: 'Default choice location: returns caller callType if survey->aboutSelf = No'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' }
        ],
        surveyAnswers: {
            aboutSelf: 'No'
        },
        preEngagementSelections: {
            myselfOrOther: 'Myself'
        },
        expectedCallType: 'Child calling about self',
        callTypeDescription: 'preEngagement set as only choice source, and choice source has aboutSelfValue set - child callType'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' }
        ],
        surveyAnswers: {
            aboutSelf: 'Yes'
        },
        preEngagementSelections: {
            myselfOrOther: 'Other'
        },
        expectedCallType: 'Someone calling about a child',
        callTypeDescription: 'preEngagement set as only choice source, and choice source has something other than aboutSelfValue set - caller callType'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' },
            { form: 'survey', input: 'isAboutSelf', aboutSelfValue: 'Yeppers' }
        ],
        surveyAnswers: {
            isAboutSelf: 'Yeppers'
        },
        preEngagementSelections: {
            myselfOrOther: 'Other'
        },
        expectedCallType: 'Someone calling about a child',
        callTypeDescription: 'Two choice sources, both populated - uses first sources choice'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' },
            { form: 'survey', input: 'isAboutSelf', aboutSelfValue: 'Yeppers' }
        ],
        surveyAnswers: {
            isAboutSelf: 'Yeppers'
        },
        preEngagementSelections: {},
        expectedCallType: 'Child calling about self',
        callTypeDescription: 'Two choice sources, only second choice populated - uses second sources choice'
    },
    {
        choiceLocations: [
            { form: 'preEngagement', input: 'myselfOrOther', aboutSelfValue: 'Myself' },
            { form: 'survey', input: 'isAboutSelf', aboutSelfValue: 'Yeppers' }
        ],
        surveyAnswers: {
            aboutSelf: 'No'
        },
        preEngagementSelections: {},
        expectedCallType: 'Child calling about self',
        callTypeDescription: 'Two choice sources, no choice populated - callType child (does NOT use default)'
    }

]

describe('selectForms', () => {
    each(selectFormsTestCases).test('$formsDescription', ({ surveyAnswers, preEngagementSelections, choiceLocations, populateFrom, expectedForms }: SelectFormsTestCase) => {
        const selector = selectFormsFromServiceUserChoice(choiceLocations);
        const selected = selector.selectForms(populateFrom, preEngagementSelections, surveyAnswers);
        expect(selected.sort()).toStrictEqual(expectedForms.sort());
    });
})

describe('selectCallType', () => {
    each(selectCallTypeTestCases).test('$callTypeDescription', ({ surveyAnswers, preEngagementSelections, choiceLocations, expectedCallType }: SelectCallTypeTestCase) => {
        const selector = selectFormsFromServiceUserChoice(choiceLocations);
        const selected = selector.selectCallType(preEngagementSelections, surveyAnswers);
        expect(selected).toStrictEqual(expectedCallType);
    });
})