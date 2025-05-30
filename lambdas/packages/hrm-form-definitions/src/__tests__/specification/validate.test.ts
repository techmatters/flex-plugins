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

import each from 'jest-each';
import { CategoriesDefinition, FormDefinition, FormInputType } from '../../formDefinition';
import { DefinitionSpecification, FormDefinitionSpecification } from '../../specification';

import { validateCategoriesDefinition, validateFormDefinition } from '../../specification/validate';

describe('validateFormDefinition', () => {
  type TestCase = {
    description: string;
    specification: FormDefinitionSpecification;
    definition: FormDefinition;
    expectedResult: ReturnType<typeof validateFormDefinition>;
  };

  const testCases: TestCase[] = [
    {
      description: 'Validator works at top level form',
      specification: {
        items: {},
        validator: () => {
          throw new Error('Boom! on top level form');
        },
      },
      definition: [],
      expectedResult: {
        valid: false,
        issues: ['Boom! on top level form'],
        itemReports: {},
      },
    },
    {
      description: 'Required item missing results in invalid form',
      specification: {
        items: {
          one: { required: true },
        },
      },
      definition: [{ name: 'another', label: 'another', type: FormInputType.Input }],
      expectedResult: {
        valid: false,
        issues: [],
        itemReports: {
          one: { issues: ['Required form item not found'], valid: false },
        },
      },
    },
    {
      description: 'Duplicated item results in invalid form',
      specification: {
        items: {
          one: { required: true },
        },
      },
      definition: [
        { name: 'one', label: 'one', type: FormInputType.Input },
        { name: 'one', label: 'one', type: FormInputType.Input },
      ],
      expectedResult: {
        valid: false,
        issues: [],
        itemReports: {
          one: {
            issues: ['Found 2 items with this name in the form. Names should be unique'],
            valid: false,
          },
        },
      },
    },
    {
      description: 'Validator works at form item level',
      specification: {
        items: {
          one: {
            required: true,
            validator: () => {
              throw new Error('Boom! on form item one');
            },
          },
        },
      },
      definition: [{ name: 'one', label: 'one', type: FormInputType.Input }],
      expectedResult: {
        valid: false,
        issues: [],
        itemReports: {
          one: {
            issues: ['Item one failed validation: Boom! on form item one'],
            valid: false,
          },
        },
      },
    },
    {
      description: 'Validation is succesful if criteria is met',
      specification: {
        items: {
          one: {
            required: true,
          },
        },
      },
      definition: [{ name: 'one', label: 'one', type: FormInputType.Input }],
      expectedResult: {
        valid: true,
        issues: [],
        itemReports: {
          one: {
            issues: [],
            valid: true,
          },
        },
      },
    },
  ];

  each(testCases).test('$description', async ({ specification, definition, expectedResult }) => {
    const result = validateFormDefinition(specification, definition);

    expect(result).toMatchObject(expectedResult);
  });
});

describe('validateCategoriesDefinition', () => {
  type TestCase = {
    description: string;
    specification: DefinitionSpecification;
    definition: CategoriesDefinition;
    expectedResult: ReturnType<typeof validateCategoriesDefinition>;
  };

  const testCases: TestCase[] = [
    {
      description: 'Marking as required results in invalid definition if there are no categories',
      specification: {
        required: true,
      },
      definition: {},
      expectedResult: {
        valid: false,
        issues: ['Definition must contain at least one category.'],
      },
    },
    {
      description: 'Validator works for categories specs',
      specification: {
        required: false,
        validator: () => {
          throw new Error('Boom! on categories validator');
        },
      },
      definition: {},
      expectedResult: {
        valid: false,
        issues: ['Boom! on categories validator'],
      },
    },
    {
      description: 'Invalid type for subcategories for a category results in invalid definition',
      specification: {
        required: true,
      },
      definition: {
        category1: {
          color: '',
          subcategories: 'string' as any,
        },
      },
      expectedResult: {
        valid: false,
        issues: ['Subcategories array missing for category category1.'],
      },
    },
    {
      description: 'Empty array of subcategories for a category results in invalid definition',
      specification: {
        required: true,
      },
      definition: {
        category1: {
          color: '',
          subcategories: [],
        },
      },
      expectedResult: {
        valid: false,
        issues: ['Subcategories array missing for category category1.'],
      },
    },
    {
      description: 'Validation is succesful if criteria is met',
      specification: {
        required: true,
      },
      definition: {
        category1: {
          color: '',
          subcategories: ['subcategory1'],
        },
      },
      expectedResult: {
        valid: true,
        issues: [],
      },
    },
  ];

  each(testCases).test('$description', async ({ specification, definition, expectedResult }) => {
    const result = validateCategoriesDefinition(specification, definition);

    expect(result).toMatchObject(expectedResult);
  });
});
