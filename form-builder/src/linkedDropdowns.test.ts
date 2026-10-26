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

import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, test } from 'vitest';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import { listHelplines, loadDefinitionFiles } from '../server/definitionsApi';
import { DefinitionFileMap, getForm, getReferenceData } from './definitions';
import {
  AnswerNode,
  applyChainOptions,
  chainToTree,
  countByLevel,
  countDescendants,
  createChainFields,
  findChainsThroughField,
  getChildrenAtPath,
  makeKeyValuesUnique,
  updateChildrenAtPath,
  newAnswerNode,
  rowsToTree,
  treeToChainOptions,
  treeToRows,
} from './linkedDropdowns';
import { parseDelimitedText } from './spreadsheet';

const formDefinitionsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../lambdas/packages/hrm-form-definitions/form-definitions',
);

const field = (json: Record<string, unknown>) => json as unknown as FormItemJsonDefinition;
const labelsOf = (nodes: AnswerNode[]) => nodes.map((node) => node.label);

describe('parseDelimitedText', () => {
  test('reads cells pasted from a spreadsheet (tab separated)', () => {
    expect(parseDelimitedText('Province\tDistrict\r\nAbra\tBangued\r\n')).toEqual([
      ['Province', 'District'],
      ['Abra', 'Bangued'],
    ]);
  });

  test('reads CSV with quoted commas, quotes and line breaks', () => {
    expect(parseDelimitedText('a,"b, c","say ""hi""","two\nlines"\nd,e,f,g')).toEqual([
      ['a', 'b, c', 'say "hi"', 'two\nlines'],
      ['d', 'e', 'f', 'g'],
    ]);
  });
});

describe('findChainsThroughField', () => {
  const form = [
    field({ name: 'province', type: 'select' }),
    field({ name: 'municipality', type: 'dependent-select', dependsOn: 'province' }),
    field({ name: 'district', type: 'dependent-select', dependsOn: 'municipality' }),
    field({ name: 'abuse', type: 'select' }),
    field({ name: 'riskAssessment', type: 'dependent-select', dependsOn: 'abuse' }),
    field({ name: 'safetyPlan', type: 'dependent-select', dependsOn: 'abuse' }),
    field({ name: 'age', type: 'select' }),
  ];

  test('finds the whole chain from any level', () => {
    const chain = ['province', 'municipality', 'district'];
    expect(findChainsThroughField(form, 'province')).toEqual([chain]);
    expect(findChainsThroughField(form, 'municipality')).toEqual([chain]);
    expect(findChainsThroughField(form, 'district')).toEqual([chain]);
  });

  test('lists each chain when several dropdowns depend on one question', () => {
    expect(findChainsThroughField(form, 'abuse')).toEqual([
      ['abuse', 'riskAssessment'],
      ['abuse', 'safetyPlan'],
    ]);
    expect(findChainsThroughField(form, 'safetyPlan')).toEqual([['abuse', 'safetyPlan']]);
  });

  test('a field that is not linked has no chains', () => {
    expect(findChainsThroughField(form, 'age')).toEqual([]);
  });
});

describe('rowsToTree', () => {
  test('builds the tree, skipping empty, gapped and duplicate rows', () => {
    const { roots, stats } = rowsToTree(
      [
        ['Abra', 'Bangued', 'Agtangao'],
        ['Abra', 'Bangued', 'Angad'],
        ['Abra', 'Boliney'],
        ['Abra', 'Bangued', 'Angad'],
        ['', '', ''],
        ['Cebu', '', 'Lahug'],
        ['Cebu', 'San Jose', 'Poblacion', 'extra'],
      ],
      3,
    );
    expect(labelsOf(roots)).toEqual(['Abra', 'Cebu']);
    expect(labelsOf(roots[0].children)).toEqual(['Bangued', 'Boliney']);
    expect(labelsOf(roots[0].children[0].children)).toEqual(['Agtangao', 'Angad']);
    expect(stats).toEqual({
      rowsRead: 7,
      emptyRows: 1,
      rowsWithGaps: 1,
      duplicateRows: 1,
      extraColumns: true,
    });
  });

  test('keeps the saved value of answers that already existed', () => {
    const previous = [newAnswerNode('Girl', 'F', true)];
    const { roots } = rowsToTree([['Girl'], ['Boy']], 1, previous);
    expect(roots.map((node) => [node.value, node.existing])).toEqual([
      ['F', true],
      ['Boy', false],
    ]);
  });

  test('round trips through spreadsheet rows', () => {
    const rows = [
      ['Abra', 'Bangued', 'Agtangao'],
      ['Abra', 'Boliney'],
      ['Cebu', 'Lahug', 'Apas'],
    ];
    expect(treeToRows(rowsToTree(rows, 3).roots)).toEqual(rows);
  });
});

describe('makeKeyValuesUnique', () => {
  const twoSanJose = () =>
    rowsToTree(
      [
        ['Batangas', 'San Jose', 'Banay-banay'],
        ['Cebu', 'San Jose', 'Poblacion'],
        ['Cebu', 'Talisay'],
      ],
      3,
    ).roots;

  test('gives repeated names a unique saved value, keeping the label', () => {
    const { roots, renamed } = makeKeyValuesUnique(twoSanJose(), 3, { fixExisting: false });
    expect(renamed).toBe(2);
    expect(roots[0].children[0]).toMatchObject({ label: 'San Jose', value: 'San Jose (Batangas)' });
    expect(roots[1].children[0]).toMatchObject({ label: 'San Jose', value: 'San Jose (Cebu)' });
    expect(roots[1].children[1].value).toBe('Talisay');
  });

  test('leaves existing shared values alone unless fixing them', () => {
    const existing = structuredClone(twoSanJose());
    existing.forEach((root) => root.children.forEach((child) => (child.existing = true)));
    const kept = makeKeyValuesUnique(existing, 3, { fixExisting: false });
    expect(kept.renamed).toBe(0);
    expect(kept.stillShared).toBe(1);
    expect(makeKeyValuesUnique(existing, 3, { fixExisting: true }).renamed).toBe(2);
  });

  test('repeated names at the last level are fine and left alone', () => {
    const roots = rowsToTree(
      [
        ['A', 'Poblacion'],
        ['B', 'Poblacion'],
      ],
      2,
    ).roots;
    expect(makeKeyValuesUnique(roots, 2, { fixExisting: true }).renamed).toBe(0);
  });
});

describe('editing the tree by path', () => {
  test('finds and updates answers under a selected path without touching others', () => {
    const { roots } = rowsToTree(
      [
        ['Abra', 'Bangued'],
        ['Cebu', 'Lahug'],
      ],
      2,
    );
    const abra = roots[0];
    expect(labelsOf(getChildrenAtPath(roots, [abra.id])!)).toEqual(['Bangued']);
    expect(getChildrenAtPath(roots, ['missing'])).toBeUndefined();

    const updated = updateChildrenAtPath(roots, [abra.id], (children) => [
      ...children,
      newAnswerNode('Boliney'),
    ]);
    expect(labelsOf(updated[0].children)).toEqual(['Bangued', 'Boliney']);
    expect(updated[1]).toBe(roots[1]);
    expect(labelsOf(roots[0].children)).toEqual(['Bangued']);
    expect(countDescendants({ ...updated[0] })).toBe(2);
  });
});

describe('creating and saving a chain', () => {
  test('creates linked fields and writes their options', () => {
    const fields = createChainFields(['Province', 'District'], ['province'], 'Unknown');
    expect(fields.map((f) => [f.name, f.type])).toEqual([
      ['province2', 'select'],
      ['district', 'dependent-select'],
    ]);
    expect(fields[1]).toMatchObject({
      dependsOn: 'province2',
      defaultOption: { value: 'Unknown', label: '' },
    });

    const { roots } = rowsToTree(
      [
        ['Abra', 'Bangued'],
        ['Abra', 'Boliney'],
        ['Cebu', 'Lahug'],
      ],
      2,
    );
    const options = treeToChainOptions(roots, 2, { value: 'Unknown', label: '' });
    const result = applyChainOptions(fields, options, {});
    expect(result.referenceData).toBeUndefined();
    expect(result.fields[0]).toMatchObject({
      options: [
        { value: 'Unknown', label: '' },
        { value: 'Abra', label: 'Abra' },
        { value: 'Cebu', label: 'Cebu' },
      ],
    });
    expect(result.fields[1]).toMatchObject({
      options: {
        Abra: [
          { value: 'Bangued', label: 'Bangued' },
          { value: 'Boliney', label: 'Boliney' },
        ],
        Cebu: [{ value: 'Lahug', label: 'Lahug' }],
      },
    });
  });

  test('moves big lists into ReferenceData.json', () => {
    const fields = createChainFields(['Region', 'Town'], [], '');
    const rows = Array.from({ length: 250 }, (_, i) => ['North', `Town ${i}`]);
    const options = treeToChainOptions(rowsToTree(rows, 2).roots, 2);
    const result = applyChainOptions(fields, options, { 'ReferenceData.json': { townOptions: [] } });
    expect(result.fields[1]).toMatchObject({ optionsReferenceKey: 'townOptions2' });
    expect('options' in result.fields[1]).toBe(false);
    expect((result.referenceData!.townOptions2 as Record<string, unknown[]>).North).toHaveLength(250);
  });
});

describe('every linked dropdown in the repo', () => {
  test('saving without changes leaves the files exactly as they were', async () => {
    const helplines = await listHelplines(formDefinitionsDir);
    let chainsChecked = 0;
    for (const { code, versions } of helplines) {
      for (const version of versions) {
        const { files } = await loadDefinitionFiles(formDefinitionsDir, code, version);
        Object.entries(files)
          .filter(([, content]) => Array.isArray(content))
          .forEach(([filePath, content]) => {
            const form = content as FormItemJsonDefinition[];
            form
              .filter((item) => item.type === 'dependent-select')
              .flatMap((item) => findChainsThroughField(form, item.name))
              .forEach((chain) => {
                const fields = chain.map((name) => form.find((item) => item.name === name)!);
                const tree = chainToTree(fields, getReferenceData(files));
                const options = treeToChainOptions(
                  tree.roots,
                  fields.length,
                  tree.rootBlankOption,
                  tree.unusedLists,
                );
                const result = applyChainOptions(fields, options, files);
                const where = `${code}/${version}/${filePath} ${chain.join(' > ')}`;
                expect(JSON.stringify(result.fields), where).toBe(JSON.stringify(fields));
                if (result.referenceData) {
                  expect(JSON.stringify(result.referenceData), where).toBe(
                    JSON.stringify(getReferenceData(files)),
                  );
                }
                chainsChecked += 1;
              });
          });
      }
    }
    expect(chainsChecked).toBeGreaterThan(50);
  });
});

describe('real helpline data', () => {
  let ph: DefinitionFileMap;
  let mw: DefinitionFileMap;

  beforeAll(async () => {
    ph = (await loadDefinitionFiles(formDefinitionsDir, 'ph', 'v1')).files;
    mw = (await loadDefinitionFiles(formDefinitionsDir, 'mw', 'v1')).files;
  });

  const chainFields = (files: DefinitionFileMap, filePath: string, fieldName: string) => {
    const form = getForm(files, filePath)!;
    const [chain] = findChainsThroughField(form, fieldName);
    return chain.map((name) => form.find((item) => item.name === name)!);
  };

  test('MW region -> district -> traditional authority converts to a tree and back unchanged', () => {
    const fields = chainFields(mw, 'tabbedForms/ChildInformationTab.json', 'district');
    expect(fields.map((f) => f.name)).toEqual(['regionalArea', 'district', 'tradiotionalAuthority']);
    const tree = chainToTree(fields, getReferenceData(mw));
    expect(tree.sharedValues).toEqual([]);
    // MW has a list filed under "Ntholowa", which isn't a district; it's kept as it is
    expect(tree.unusedLists.map((unused) => unused.key)).toContain('Ntholowa');
    const options = treeToChainOptions(tree.roots, 3, tree.rootBlankOption, tree.unusedLists);
    const result = applyChainOptions(fields, options, mw);
    expect(JSON.stringify(result.fields)).toBe(JSON.stringify(fields));
  });

  test('PH: 37,000 districts load, and the shared municipality names are detected', () => {
    const fields = chainFields(ph, 'tabbedForms/ChildInformationTab.json', 'district');
    expect(fields.map((f) => f.name)).toEqual(['province', 'municipality', 'district']);
    const tree = chainToTree(fields, getReferenceData(ph));
    const [provinces, municipalities] = countByLevel(tree.roots, 3);
    expect(provinces).toBeGreaterThan(80);
    expect(municipalities).toBeGreaterThan(1600);
    expect(tree.sharedValues.length).toBeGreaterThan(50);

    // Re-importing the same data as a spreadsheet separates the shared names
    const { roots } = rowsToTree(treeToRows(tree.roots), 3, tree.roots);
    const unique = makeKeyValuesUnique(roots, 3, { fixExisting: true });
    expect(unique.stillShared).toBe(0);
    const options = treeToChainOptions(unique.roots, 3, tree.rootBlankOption);
    const keys = Object.keys(options[2]);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
