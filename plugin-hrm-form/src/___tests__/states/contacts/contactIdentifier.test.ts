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

  const translation = {
    'Case-Contact': 'CONTACT_LABEL',
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
        translation,
        contactWithChildName('FIRST_NAME', 'LAST_NAME'),
      );
      expect(result).toEqual('FIRST_NAME LAST_NAME');
    });
    test('First name and last name both set to Unknown - returns Unknown', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        translation,
        contactWithChildName('Unknown', 'Unknown'),
      );
      expect(result).toEqual('Unknown');
    });
    test('First name and last name both empty - returns Unknown', () => {
      const result = contactLabel(definitionUsingNames as DefinitionVersion, translation, contactWithChildName('', ''));
      expect(result).toEqual('Unknown');
    });
    test('First name and last name both undefined - returns Unknown', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        translation,
        baselineContact as HrmServiceContact,
      );
      expect(result).toEqual('Unknown');
    });
    test('First name set and last name undefined - returns first name with trailing space', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        translation,
        contactWithChildName('FIRST_NAME', undefined),
      );
      expect(result).toEqual('FIRST_NAME ');
    });
    test('First name set and last name undefined - returns last name with leading space', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        translation,
        contactWithChildName(undefined, 'LAST_NAME'),
      );
      expect(result).toEqual(' LAST_NAME');
    });
    test('First name set and last name set Unknown - returns last name as Unknown', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        translation,
        contactWithChildName('FIRST_NAME', 'Unknown'),
      );
      expect(result).toEqual('FIRST_NAME Unknown');
    });
    test('Last name set and first name set Unknown - returns first name as Unknown', () => {
      const result = contactLabel(
        definitionUsingNames as DefinitionVersion,
        translation,
        contactWithChildName('Unknown', 'LAST_NAME'),
      );
      expect(result).toEqual('Unknown LAST_NAME');
    });
    test('Contact undefined - returns Unknown', () => {
      const result = contactLabel(definitionUsingNames as DefinitionVersion, translation, undefined);
      expect(result).toEqual('Unknown');
    });
  });
  describe('ChildInformation definition has no firstName or lastName inputs', () => {
    test('First name and last name set - returns labelled contact ID', () => {
      const result = contactLabel(
        baselineDefinition as DefinitionVersion,
        translation,
        contactWithChildName('FIRST_NAME', 'Unknown'),
      );
      expect(result).toEqual('CONTACT_LABEL #1234');
    });
    test('First name and last name both set to Unknown - returns labelled contact ID', () => {
      const result = contactLabel(
        baselineDefinition as DefinitionVersion,
        translation,
        contactWithChildName('Unknown', 'Unknown'),
      );
      expect(result).toEqual('CONTACT_LABEL #1234');
    });
    test('First name and last name both empty - returns labelled contact ID', () => {
      const result = contactLabel(baselineDefinition as DefinitionVersion, translation, contactWithChildName('', ''));
      expect(result).toEqual('CONTACT_LABEL #1234');
    });
    test('First name and last name both undefined - returns labelled contact ID', () => {
      const result = contactLabel(
        baselineDefinition as DefinitionVersion,
        translation,
        baselineContact as HrmServiceContact,
      );
      expect(result).toEqual('CONTACT_LABEL #1234');
    });
    test('ID undefined - returns empty string', () => {
      const { id, ...contactWithoutId } = baselineContact;
      const result = contactLabel(
        baselineDefinition as DefinitionVersion,
        translation,
        contactWithoutId as HrmServiceContact,
      );
      expect(result).toEqual('');
    });
    test('Contact undefined - returns empty string', () => {
      const result = contactLabel(baselineDefinition as DefinitionVersion, translation, undefined);
      expect(result).toEqual('');
    });
  });
  test('Definition undefined - returns labelled contact ID', () => {
    const result = contactLabel(undefined, translation, contactWithChildName('FIRST_NAME', 'Unknown'));
    expect(result).toEqual('CONTACT_LABEL #1234');
  });
});
