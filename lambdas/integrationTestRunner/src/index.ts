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

import { execSync } from 'child_process';
import type { ALBEvent, ALBResult } from 'aws-lambda';
import { handleWebhookReceiver } from './webhookReceiver/handler';

export type IntegrationTestEvent = {
  testPattern: string;
  jestArgs?: string[];
};

const isIntegrationTestEvent = (
  event: IntegrationTestEvent | ALBEvent,
): event is IntegrationTestEvent => Boolean((event as IntegrationTestEvent).testPattern);

export type IntegrationTestResult = {
  success: boolean;
  output: string;
  error?: string;
};

export const handler = async (
  event: IntegrationTestEvent | ALBEvent,
): Promise<IntegrationTestResult | ALBResult> => {
  if (isIntegrationTestEvent(event)) {
    try {
      const testPattern = event.testPattern || '';
      const additionalArgs = event.jestArgs || [];

      const jestCommand = [
        'npx',
        'jest',
        testPattern,
        '--runInBand',
        '--forceExit',
        '--detectOpenHandles',
        ...additionalArgs,
      ]
        .filter(Boolean)
        .join(' ');

      console.info('Running Jest command:', jestCommand);

      // Run tests from the integrationTests directory
      const testsDir = process.env.INTEGRATION_TESTS_DIR || '../integrationTests';

      const output = execSync(jestCommand, {
        cwd: testsDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      console.info('Jest completed successfully');
      console.debug('Jest output:', output);

      return {
        success: true,
        output,
      };
    } catch (error: any) {
      // Jest returns non-zero exit code when tests fail
      const output = error.stdout || error.stderr || String(error);
      console.error('Jest failed:', output);

      return {
        success: false,
        output,
        error: error.message,
      };
    }
  } else {
    return handleWebhookReceiver(event);
  }
};
