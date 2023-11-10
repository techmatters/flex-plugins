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

const { spawn } = require('child_process');

module.exports.handler = async (event) => {
  const env = { ...process.env };

  const { testName, npmScript } = event;
  if (testName) {
    env.TEST_NAME = testName;
  }

  const cmd = spawn('npm', ['-loglevel silent', 'run', npmScript || 'test'], {
    stdio: 'inherit',
    stderr: 'inherit',
    env,
  });

  const result = await new Promise((resolve, reject) => {
    cmd.on('exit', (code) => {
      if (code !== 0) {
        reject(`Execution error: ${code}`);
      } else {
        resolve(`Exited with code: ${code}`);
      }
    });

    cmd.on('error', (error) => {
      reject(`Execution error: ${error}`);
    });
  });

  console.log(result);
};
