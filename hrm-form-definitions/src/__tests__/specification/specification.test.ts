import { processDefinitionFiles } from '../../specification';

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
