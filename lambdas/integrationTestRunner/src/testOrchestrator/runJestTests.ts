/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { spawn } from 'child_process';
import type { ALBEvent } from 'aws-lambda';

export type IntegrationTestEvent = {
  testFilter: string;
};

export const isIntegrationTestEvent = (
  event: IntegrationTestEvent | ALBEvent,
): event is IntegrationTestEvent => Boolean((event as IntegrationTestEvent).testFilter);

export const runJestTests = async (event: IntegrationTestEvent) => {
  const env = { ...process.env };

  const { testFilter } = event;

  const cmd = spawn(
    /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
    [
      'run',
      'test:integration',
      '--',
      '--verbose',
      '--maxWorkers=1',
      '--forceExit',
      '--testTimeout=60000',
      testFilter,
    ],
    {
      stdio: 'inherit',
      env,
      shell: /^win/.test(process.platform),
    },
  );
  let result,
    isError = false;
  try {
    result = await new Promise((resolve, reject) => {
      cmd.on('exit', code => {
        if (code !== 0) {
          reject(`Execution error: ${code}`);
        } else {
          resolve(`Exited with code: ${code}`);
        }
      });

      cmd.on('error', error => {
        reject(`Execution error: ${error}`);
      });
    });
  } catch (error) {
    result = error;
    isError = true;
  }

  if (isError) {
    throw result;
  }
  console.info(`Test run (${testFilter}) result: `, result);
};
