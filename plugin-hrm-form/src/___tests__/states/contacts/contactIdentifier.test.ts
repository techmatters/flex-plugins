import { callTypes, DefinitionVersion, FormInputType } from 'hrm-form-definitions';

import { contactLabel } from '../../../states/contacts/contactIdentifier';
import { HrmServiceContact } from '../../../types/types';

describe('contactLabel', () => {
  const baselineDefinition: Partial<DefinitionVersion> = {
    tabbedForms: {
      ChildInformationTab: [],
      CaseInformationTab: [],
      CallerInformationTab: [],
      IssueCategorizationTab: () => ({}),
      ContactlessTaskTab: { offlineChannels: [] },
    },
  };

  const baselineContact: Partial<HrmServiceContact> = {
    id: '1234',
    rawJson: {
      childInformation: {},
      callerInformation: {},
      caseInformation: { categories: {} },
      callType: callTypes.child,
      conversationMedia: [],
      contactlessTask: {
        channel: 'voice',
      },
    },
  };

  const contactWithChildName = (firstName: string, lastName: string): HrmServiceContact => {
    return {
      ...baselineContact,
      rawJson: {
        ...baselineContact.rawJson,
        childInformation: {
          lastName,
          firstName,
        },
      },
    } as HrmServiceContact;
  };

  describe('ChildInformation has firstName or lastName inputs', () => {
    const definitionUsingNames: Partial<DefinitionVersion> = {
      ...baselineDefinition,
      tabbedForms: {
        ...baselineDefinition.tabbedForms,
        ChildInformationTab: [{ type: FormInputType.Input, name: 'lastName', label: 'Last Name' }],
      },
    };
    test('First name and last name set - returns first and last name separated by space', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        contactWithChildName('FIRST_NAME', 'LAST_NAME'),
      );
      expect(result).toEqual('FIRST_NAME LAST_NAME');
    });
    test('First name and last name both set to Unknown - returns placeholder', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        contactWithChildName('Unknown', 'Unknown'),
      );
      expect(result).toEqual('Unknown');
    });
    test('First name and last name both empty - returns Unknown', () => {
      const result = contactLabel(definitionUsingNames as DefinitionVersion, contactWithChildName('', ''));
      expect(result).toEqual('Unknown');
    });
    test('First name and last name both undefined - returns placeholder', () => {
      const result = contactLabel(definitionUsingNames as DefinitionVersion, baselineContact as HrmServiceContact);
      expect(result).toEqual('Unknown');
    });
    test('Cusom placeholder specified - uses custom placeholder', () => {
      const result = contactLabel(definitionUsingNames as DefinitionVersion, baselineContact as HrmServiceContact, {
        placeholder: 'CUSTOM_PLACEHOLDER',
      });
      expect(result).toEqual('CUSTOM_PLACEHOLDER');
    });
    test('First name set and last name undefined - returns first name with trailing space', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        contactWithChildName('FIRST_NAME', undefined),
      );
      expect(result).toEqual('FIRST_NAME ');
    });
    test('First name set and last name undefined - returns last name with leading space', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        contactWithChildName(undefined, 'LAST_NAME'),
      );
      expect(result).toEqual(' LAST_NAME');
    });
    test('First name set and last name set Unknown - returns last name as Unknown', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        contactWithChildName('FIRST_NAME', 'Unknown'),
      );
      expect(result).toEqual('FIRST_NAME Unknown');
    });
    test('Last name set and first name set Unknown - returns first name as Unknown', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        contactWithChildName('Unknown', 'LAST_NAME'),
      );
      expect(result).toEqual('Unknown LAST_NAME');
    });
    test('Contact undefined - returns placeholder', () => {
      const result = contactLabel(definitionUsingNames as DefinitionVersion, undefined, {
        placeholder: 'CUSTOM_PLACEHOLDER',
      });
      expect(result).toEqual('CUSTOM_PLACEHOLDER');
    });
  });
  describe('ChildInformation definition has no firstName or lastName inputs', () => {
    test('First name and last name set - returns contact ID', () => {
      const result = contactLabel(
        baselineDefinition as DefinitionVersion,
        contactWithChildName('FIRST_NAME', 'LAST_NAME'),
      );
      expect(result).toEqual('#1234');
    });
    test('First name and last name both set to Unknown - returns contact ID', () => {
      const result = contactLabel(baselineDefinition as DefinitionVersion, contactWithChildName('Unknown', 'Unknown'));
      expect(result).toEqual('#1234');
    });
    test('First name and last name both empty - returns contact ID', () => {
      const result = contactLabel(baselineDefinition as DefinitionVersion, contactWithChildName('', ''));
      expect(result).toEqual('#1234');
    });
    test('First name and last name both undefined - returns contact ID', () => {
      const result = contactLabel(baselineDefinition as DefinitionVersion, baselineContact as HrmServiceContact);
      expect(result).toEqual('#1234');
    });
    test('ID undefined - returns placeholder', () => {
      const { id, ...contactWithoutId } = baselineContact;
      const result = contactLabel(baselineDefinition as DefinitionVersion, contactWithoutId as HrmServiceContact);
      expect(result).toEqual('Unknown');
    });
    test('substituteForId set false - returns placeholder', () => {
      const result = contactLabel(baselineDefinition as DefinitionVersion, baselineContact as HrmServiceContact, {
        substituteForId: false,
      });
      expect(result).toEqual('Unknown');
    });
    test('substituteForId set false and name provided - returns placeholder', () => {
      const result = contactLabel(
        baselineDefinition as DefinitionVersion,
        contactWithChildName('FIRST_NAME', 'LAST_NAME'),
        {
          substituteForId: false,
        },
      );
      expect(result).toEqual('Unknown');
    });
    test('ID undefined & custom placeholder specified - returns placeholder', () => {
      const { id, ...contactWithoutId } = baselineContact;
      const result = contactLabel(baselineDefinition as DefinitionVersion, contactWithoutId as HrmServiceContact, {
        placeholder: 'CUSTOM_PLACEHOLDER',
      });
      expect(result).toEqual('CUSTOM_PLACEHOLDER');
    });
    test('Contact undefined - returns placeholder', () => {
      const result = contactLabel(baselineDefinition as DefinitionVersion, undefined);
      expect(result).toEqual('Unknown');
    });
  });
  test('Definition undefined - returns labelled contact ID', () => {
    const result = contactLabel(undefined, contactWithChildName('FIRST_NAME', 'Unknown'));
    expect(result).toEqual('#1234');
  });
});
