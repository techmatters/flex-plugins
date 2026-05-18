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

import {
  isDefinitionSpecification,
  isFormDefinitionSpecification,
  processDefinitionFiles,
} from '../../specification';

describe('processDefinitionFiles', () => {
  test('Single Definition File - applies processor to node', () => {
    const processor = jest.fn();
    const singleton = { definitionFilePath: 'just me' };
    processDefinitionFiles(singleton, processor);
    expect(processor).toHaveBeenCalledWith(singleton, []);
  });

  test('Single other object - does nothing', () => {
    const processor = jest.fn();
    processDefinitionFiles({ a: 'some', b: 'guff' }, processor);
    expect(processor).toHaveBeenCalledTimes(0);
  });

  test('Flat set of DefinitionFileSpecifications - processes each passing in the path', () => {
    const processor = jest.fn();

    const flatStructure = {
      a: {
        definitionFilePath: 'A',
      },
      b: {
        definitionFilePath: 'B',
      },
      c: {
        definitionFilePath: 'C',
      },
      some: {
        other: 'object',
      },
    };
    processDefinitionFiles(flatStructure, processor);
    expect(processor).toHaveBeenCalledTimes(3);
    expect(processor).toHaveBeenCalledWith(flatStructure.a, ['a']);
    expect(processor).toHaveBeenCalledWith(flatStructure.b, ['b']);
    expect(processor).toHaveBeenCalledWith(flatStructure.c, ['c']);
  });

  test('Deep set of DefinitionFileSpecifications - processes each passing in the path to the object', () => {
    const processor = jest.fn();

    const deepStructure = {
      a: {
        definitionFilePath: 'A',
      },
      oneDeep: {
        b: {
          definitionFilePath: 'B',
        },
        twoDeep: {
          c: {
            definitionFilePath: 'C',
          },
        },
      },

      some: {
        other: 'object',
      },
    };
    processDefinitionFiles(deepStructure, processor);
    expect(processor).toHaveBeenCalledTimes(3);
    expect(processor).toHaveBeenCalledWith(deepStructure.a, ['a']);
    expect(processor).toHaveBeenCalledWith(deepStructure.oneDeep.b, ['oneDeep', 'b']);
    expect(processor).toHaveBeenCalledWith(deepStructure.oneDeep.twoDeep.c, [
      'oneDeep',
      'twoDeep',
      'c',
    ]);
  });

  test('Nested set of DefinitionFileSpecification - only processes top DefinitionFileSpecification', () => {
    const processor = jest.fn();

    const nestedStructure = {
      a: {
        definitionFilePath: 'A',
        b: {
          definitionFilePath: 'B',
        },
      },
      oneDeep: {
        c: {
          definitionFilePath: 'C',
        },
      },
      some: {
        other: 'object',
      },
    };
    processDefinitionFiles(nestedStructure, processor);
    expect(processor).toHaveBeenCalledTimes(2);
    expect(processor).toHaveBeenCalledWith(nestedStructure.a, ['a']);
    expect(processor).toHaveBeenCalledWith(nestedStructure.oneDeep.c, ['oneDeep', 'c']);
  });

  test('Circular reference - throws', () => {
    const processor = jest.fn();

    const circularStructure = {
      a: {
        definitionFilePath: 'A',
      },
      oneDeep: {},
    };
    circularStructure.oneDeep = circularStructure;
    expect(() => processDefinitionFiles(circularStructure, processor)).toThrow();
  });

  test('Structure with array of DefinitionFileSpecifications - processes each passing the index to the path', () => {
    const processor = jest.fn();

    const array = [
      {
        definitionFilePath: 'A',
      },
      {
        definitionFilePath: 'B',
      },
      {
        other: 'object',
      },
      {
        definitionFilePath: 'C',
      },
    ];
    processDefinitionFiles({ a: array }, processor);
    expect(processor).toHaveBeenCalledTimes(3);
    expect(processor).toHaveBeenCalledWith(array[0], ['a', '0']);
    expect(processor).toHaveBeenCalledWith(array[1], ['a', '1']);
    expect(processor).toHaveBeenCalledWith(array[3], ['a', '3']);
  });
});

describe('isFormDefinitionSpecification', () => {
  test("Has 'items' object property - true", () => {
    expect(isFormDefinitionSpecification({ items: {} })).toBeTruthy();
  });
  test("Has no 'items' object property - false", () => {
    expect(isFormDefinitionSpecification({ validator: () => {} })).toBeFalsy();
  });
  test("Has 'items' property of other type - false", () => {
    expect(isFormDefinitionSpecification({ items: 12 })).toBeFalsy();
  });
  test("Has 'items' object property and 'validator' function property - true", () => {
    expect(isFormDefinitionSpecification({ items: {}, validator: () => {} })).toBeTruthy();
  });
  test("Has 'validator' non function property - false", () => {
    expect(isFormDefinitionSpecification({ items: {}, validator: 'Hello' })).toBeFalsy();
  });
});

describe('isDefinitionSpecification', () => {
  test("Has 'required' boolean property - true", () => {
    expect(isDefinitionSpecification({ required: false })).toBeTruthy();
  });
  test("Has no 'required' property - false", () => {
    expect(isFormDefinitionSpecification({})).toBeFalsy();
  });
  test("Has 'required' property of other type - false", () => {
    expect(isFormDefinitionSpecification({ required: {} })).toBeFalsy();
  });
});
