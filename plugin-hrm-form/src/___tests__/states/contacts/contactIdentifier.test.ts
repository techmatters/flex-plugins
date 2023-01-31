import { callTypes, DefinitionVersion, FormInputType } from 'hrm-form-definitions';
import each from 'jest-each';

import { contactLabelFromHrmContact, contactLabelFromSearchContact } from '../../../states/contacts/contactIdentifier';
import { ContactRawJson, HrmServiceContact, SearchAPIContact } from '../../../types/types';

const baselineDefinition: Partial<DefinitionVersion> = {
  tabbedForms: {
    ChildInformationTab: [],
    CaseInformationTab: [],
    CallerInformationTab: [],
    IssueCategorizationTab: () => ({}),
    ContactlessTaskTab: { offlineChannels: [] },
  },
};

const baselineRawJson: ContactRawJson = {
  childInformation: {},
  callerInformation: {},
  caseInformation: { categories: {} },
  callType: callTypes.child,
  conversationMedia: [],
  contactlessTask: {
    channel: 'voice',
  },
};

const hrmContactWithChildName = (firstName: string, lastName: string): HrmServiceContact => {
  const baselineHrmContact: Partial<HrmServiceContact> = {
    id: '1234',
    rawJson: {
      ...baselineRawJson,
      childInformation: {
        lastName,
        firstName,
      },
    },
  };
  return baselineHrmContact as HrmServiceContact;
};

const searchAPIContactWithChildName = (firstName: string, lastName: string): SearchAPIContact => {
  const baselineContact: Partial<SearchAPIContact> = {
    contactId: '1234',
    details: {
      ...baselineRawJson,
      childInformation: {
        lastName,
        firstName,
      },
    },
  };
  return baselineContact as SearchAPIContact;
};
describe('contactLabel', () => {
  each([
    {
      baselineContact: {
        id: '1234',
        rawJson: baselineRawJson,
      },
      contactLabelFunctionToTest: contactLabelFromHrmContact,
      contactWithChildName: hrmContactWithChildName,
      contactType: 'HrmContact',
    },
    {
      baselineContact: {
        contactId: '1234',
        details: baselineRawJson,
      },
      contactLabelFunctionToTest: contactLabelFromSearchContact,
      contactWithChildName: searchAPIContactWithChildName,
      contactType: 'SearchContact',
    },
  ]).describe('for $contactType', ({ baselineContact, contactLabelFunctionToTest, contactWithChildName }) => {
    describe('ChildInformation has firstName or lastName inputs', () => {
      const definitionUsingNames: Partial<DefinitionVersion> = {
        ...baselineDefinition,
        tabbedForms: {
          ...baselineDefinition.tabbedForms,
          ChildInformationTab: [{ type: FormInputType.Input, name: 'lastName', label: 'Last Name' }],
        },
      };
      test('First name and last name set - returns first and last name separated by space', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          contactWithChildName('FIRST_NAME', 'LAST_NAME'),
        );
        expect(result).toEqual('FIRST_NAME LAST_NAME');
      });
      test('First name and last name both set to Unknown - returns placeholder', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          contactWithChildName('Unknown', 'Unknown'),
        );
        expect(result).toEqual('Unknown');
      });
      test('First name and last name both empty - returns Unknown', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          contactWithChildName('', ''),
        );
        expect(result).toEqual('Unknown');
      });
      test('First name and last name both undefined - returns placeholder', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          baselineContact as typeof baselineContact,
        );
        expect(result).toEqual('Unknown');
      });
      test('Cusom placeholder specified - uses custom placeholder', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          baselineContact as typeof baselineContact,
          {
            placeholder: 'CUSTOM_PLACEHOLDER',
          },
        );
        expect(result).toEqual('CUSTOM_PLACEHOLDER');
      });
      test('First name set and last name undefined - returns first name with trailing space', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          contactWithChildName('FIRST_NAME', undefined),
        );
        expect(result).toEqual('FIRST_NAME ');
      });
      test('First name set and last name undefined - returns last name with leading space', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          contactWithChildName(undefined, 'LAST_NAME'),
        );
        expect(result).toEqual(' LAST_NAME');
      });
      test('First name set and last name set Unknown - returns last name as Unknown', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          contactWithChildName('FIRST_NAME', 'Unknown'),
        );
        expect(result).toEqual('FIRST_NAME Unknown');
      });
      test('Last name set and first name set Unknown - returns first name as Unknown', () => {
        const result = contactLabelFunctionToTest(
          definitionUsingNames as DefinitionVersion,
          contactWithChildName('Unknown', 'LAST_NAME'),
        );
        expect(result).toEqual('Unknown LAST_NAME');
      });
      test('Contact undefined - returns placeholder', () => {
        const result = contactLabelFunctionToTest(definitionUsingNames as DefinitionVersion, undefined, {
          placeholder: 'CUSTOM_PLACEHOLDER',
        });
        expect(result).toEqual('CUSTOM_PLACEHOLDER');
      });
    });
    describe('ChildInformation definition has no firstName or lastName inputs', () => {
      test('First name and last name set - returns contact ID', () => {
        const result = contactLabelFunctionToTest(
          baselineDefinition as DefinitionVersion,
          contactWithChildName('FIRST_NAME', 'LAST_NAME'),
        );
        expect(result).toEqual('#1234');
      });
      test('First name and last name both set to Unknown - returns contact ID', () => {
        const result = contactLabelFunctionToTest(
          baselineDefinition as DefinitionVersion,
          contactWithChildName('Unknown', 'Unknown'),
        );
        expect(result).toEqual('#1234');
      });
      test('First name and last name both empty - returns contact ID', () => {
        const result = contactLabelFunctionToTest(
          baselineDefinition as DefinitionVersion,
          contactWithChildName('', ''),
        );
        expect(result).toEqual('#1234');
      });
      test('First name and last name both undefined - returns contact ID', () => {
        const result = contactLabelFunctionToTest(
          baselineDefinition as DefinitionVersion,
          baselineContact as HrmServiceContact,
        );
        expect(result).toEqual('#1234');
      });
      test('ID undefined - returns placeholder', () => {
        const { id, contactId, ...contactWithoutId } = baselineContact;
        const result = contactLabelFunctionToTest(
          baselineDefinition as DefinitionVersion,
          contactWithoutId as HrmServiceContact,
        );
        expect(result).toEqual('Unknown');
      });
      test('substituteForId set false - returns placeholder', () => {
        const result = contactLabelFunctionToTest(
          baselineDefinition as DefinitionVersion,
          baselineContact as HrmServiceContact,
          {
            substituteForId: false,
          },
        );
        expect(result).toEqual('Unknown');
      });
      test('substituteForId set false and name provided - returns placeholder', () => {
        const result = contactLabelFromHrmContact(
          baselineDefinition as DefinitionVersion,
          contactWithChildName('FIRST_NAME', 'LAST_NAME'),
          {
            substituteForId: false,
          },
        );
        expect(result).toEqual('Unknown');
      });
      test('ID undefined & custom placeholder specified - returns placeholder', () => {
        const { id, contactId, ...contactWithoutId } = baselineContact;
        const result = contactLabelFunctionToTest(
          baselineDefinition as DefinitionVersion,
          contactWithoutId as HrmServiceContact,
          {
            placeholder: 'CUSTOM_PLACEHOLDER',
          },
        );
        expect(result).toEqual('CUSTOM_PLACEHOLDER');
      });
      test('Contact undefined - returns placeholder', () => {
        const result = contactLabelFunctionToTest(baselineDefinition as DefinitionVersion, undefined);
        expect(result).toEqual('Unknown');
      });
    });
    test('Definition undefined - returns labelled contact ID', () => {
      const result = contactLabelFunctionToTest(undefined, contactWithChildName('FIRST_NAME', 'Unknown'));
      expect(result).toEqual('#1234');
    });
  });
});
