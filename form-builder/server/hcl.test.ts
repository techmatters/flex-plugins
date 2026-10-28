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

import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import { HclObject, isObject, localsOf, parseHcl, parseTemplate } from './hcl';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');

const filesUnder = (dir: string, accept: (file: string) => boolean): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return filesUnder(full, accept);
    return accept(full) ? [full] : [];
  });

describe('HCL', () => {
  test('reads values, keeps interpolations and expressions as written', () => {
    const body = parseHcl(`
      # comment
      locals {
        common = read_terragrunt_config("common.hcl")
        config = merge(local.a, local.b)
        local_config = {
          name = "NAMI" // comment
          count = 3
          enabled = true
          nothing = null
          list = ["a", "b",]
          nested : { "quoted key" = "line\\nbreak", url = "\${flow_vars.url}/x.mp3" }
          heredoc = <<-EOT
            first
              second
          EOT
        }
      }
      include "root" {
        path = find_in_parent_folders()
      }
    `);
    expect(body.blocks.map((block) => [block.type, block.labels])).toEqual([
      ['locals', []],
      ['include', ['root']],
    ]);
    const locals = localsOf(body);
    expect(locals.config).toEqual({ expression: 'merge(local.a, local.b)' });
    expect(locals.local_config).toEqual({
      name: 'NAMI',
      count: 3,
      enabled: true,
      nothing: null,
      list: ['a', 'b'],
      nested: { 'quoted key': 'line\nbreak', url: '${flow_vars.url}/x.mp3' },
      heredoc: 'first\n  second\n',
    });
  });

  test('reads Studio flow templates written as jsonencode({...}) or as JSON', () => {
    const wrapped = parseTemplate(
      '${\n  jsonencode({\n  "description": "${flow_description}",\n  "states": [{ "name": "Trigger", "offset": { "x": -10 } }]\n})\n}\n',
    );
    expect(wrapped).toEqual({ description: '${flow_description}', states: [{ name: 'Trigger', offset: { x: -10 } }] });
    expect(parseTemplate('{ "a": "b ${x.y} c", "n": ${jsonencode(var.z)} }')).toEqual({
      a: 'b ${x.y} c',
      // jsonencode() of something we don't read: the something
      n: { expression: 'var.z' },
    });
  });

  test("reads every helpline's Terragrunt files and Studio flow templates", () => {
    const hclFiles = filesUnder(helplinesDir, (file) => file.endsWith('.hcl'));
    const templates = filesUnder(helplinesDir, (file) => file.includes('studio-flows') && file.endsWith('.tftpl'));
    expect(hclFiles.length).toBeGreaterThan(50);
    expect(templates.length).toBeGreaterThan(50);

    const failures: string[] = [];
    hclFiles.forEach((file) => {
      try {
        localsOf(parseHcl(readFileSync(file, 'utf8')));
      } catch (err) {
        failures.push(`${path.relative(helplinesDir, file)}: ${(err as Error).message}`);
      }
    });
    templates.forEach((file) => {
      try {
        const flow = parseTemplate(readFileSync(file, 'utf8'));
        if (!isObject(flow) || !Array.isArray((flow as HclObject).states))
          failures.push(`${path.relative(helplinesDir, file)}: no states`);
      } catch (err) {
        failures.push(`${path.relative(helplinesDir, file)}: ${(err as Error).message}`);
      }
    });
    expect(failures).toEqual([]);
  });
});
