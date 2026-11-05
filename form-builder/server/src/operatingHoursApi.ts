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
 * Operating hours, as the helpline's Studio flows use them:
 *
 * - What its flows ask the account-scoped operatingHours route for: each channel and office in
 *   the request body of a widget calling it, in the helpline's Studio flow templates and the
 *   shared ones its .hcl files point at. A channel missing from the operating hours makes the
 *   check fail, so the operating hours editor checks against these.
 * - The channels and offices its operating hours file has, for the flow designer to offer.
 */
import { promises as fs } from 'fs';
import path from 'path';

import {
  type OperatingHoursChoices,
  type OperatingHoursUsage,
  REPO_OPERATING_INFO_DIR,
} from '@tech-matters/form-builder-shared';

const filesUnder = async (dir: string, pattern: RegExp): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return filesUnder(full, pattern);
      return pattern.test(entry.name) ? [full] : [];
    }),
  );
  return nested.flat();
};

// The shared templates (twilio-iac/helplines/templates/...) a helpline's .hcl files point at
const sharedTemplatesOf = async (helplinesDir: string, code: string) => {
  const hclFiles = await filesUnder(path.join(helplinesDir, code), /\.hcl$/);
  const texts = await Promise.all(hclFiles.map(file => fs.readFile(file, 'utf8').catch(() => '')));
  const paths = texts.flatMap(text =>
    [...text.matchAll(/\/app\/twilio-iac\/helplines\/(templates\/[^"'\s)]+\.tftpl)/g)].map(match => match[1]),
  );
  return [...new Set(paths)].map(relative => path.join(helplinesDir, relative));
};

const textField = (body: string, field: string) => {
  try {
    const value = (JSON.parse(body) as Record<string, unknown>)[field];
    return typeof value === 'string' ? value : undefined;
  } catch {
    // Not quite JSON (e.g. a Terraform interpolation in it): read the field as written
    return body.match(new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`))?.[1];
  }
};

/**
 * The request bodies of the widgets calling the operatingHours route in a Studio flow template:
 * a widget's "body" comes before (or a little after) its "url" in its properties.
 */
const operatingHoursCallsIn = (template: string) =>
  [...template.matchAll(/\/operatingHours"/g)].flatMap(match => {
    const index = match.index ?? 0;
    const start = template.lastIndexOf('"properties"', index);
    const window = template.slice(start < 0 ? Math.max(0, index - 2000) : start, index + 400);
    const escaped = window.match(/"body"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    if (escaped === undefined) return [{ channel: undefined, office: undefined }];
    let body: string;
    try {
      body = JSON.parse(`"${escaped}"`) as string;
    } catch {
      body = escaped;
    }
    return [{ channel: textField(body, 'channel'), office: textField(body, 'office') }];
  });

/** Each channel and office the helpline's Studio flows ask the operatingHours route about. */
export const findOperatingHoursUsage = async (helplinesDir: string, code: string): Promise<OperatingHoursUsage[]> => {
  const templates = [
    ...(await filesUnder(path.join(helplinesDir, code), /\.tftpl$/)),
    ...(await sharedTemplatesOf(helplinesDir, code)),
  ];
  const usages: OperatingHoursUsage[] = [];
  const seen = new Set<string>();
  for (const file of templates.sort()) {
    const template = await fs.readFile(file, 'utf8').catch(() => '');
    const relative = path.relative(helplinesDir, file).split(path.sep).join('/');
    operatingHoursCallsIn(template).forEach(({ channel, office }) => {
      const id = `${relative}|${channel}|${office}`;
      if (seen.has(id)) return;
      seen.add(id);
      usages.push({
        file: relative,
        ...(channel === undefined ? {} : { channel }),
        ...(office ? { office } : {}),
        // e.g. "{{flow.channel.address}}": worked out when the flow runs
        dynamic: Boolean(channel?.includes('{{') || office?.includes('{{')),
      });
    });
  }
  return usages;
};

/** The channels and offices in the helpline's operating hours file (none without one). */
export const operatingHoursChoices = async (
  formDefinitionsDir: string,
  code: string,
): Promise<OperatingHoursChoices> => {
  const filePath = path.resolve(
    formDefinitionsDir,
    '../../..',
    path.relative('lambdas', REPO_OPERATING_INFO_DIR),
    `${code}.json`,
  );
  try {
    const info = JSON.parse((await fs.readFile(filePath, 'utf8')).replace(/^﻿/, '')) as {
      operatingHours?: Record<string, unknown>;
      offices?: Record<string, { operatingHours?: Record<string, unknown> }>;
    };
    const offices = Object.keys(info.offices ?? {});
    const channels = [
      ...new Set([
        ...Object.keys(info.operatingHours ?? {}),
        ...Object.values(info.offices ?? {}).flatMap(office => Object.keys(office.operatingHours ?? {})),
      ]),
    ];
    return { hasOperatingHours: true, channels, offices };
  } catch {
    return { hasOperatingHours: false, channels: [], offices: [] };
  }
};
