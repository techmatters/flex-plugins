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

/**
 * Auxiliary script that outputs to the console the list of
 * helplines that uses webchat, given an environment.
 */
const fs = require('fs');
const path = require('path');

const CONFIGURATIONS_PATH = path.join(__dirname, '../configurations');

const getEnvironment = () => {
  const ENVIRONMENTS = ['development', 'staging', 'production'];
  const environment = process.argv[2];

  if (!environment) {
    throw new Error(`Please specify an environment: ${ENVIRONMENTS}`);
  }

  if (!ENVIRONMENTS.includes(environment)) {
    throw new Error(`Invalid environment: ${environment}. Possible values: ${ENVIRONMENTS}`);
  }

  return environment;
};

function main() {
  const configFilenames = fs.readdirSync(CONFIGURATIONS_PATH);
  const environment = getEnvironment();
  const helplinesForEnvironment = configFilenames
    .filter((filename) => filename.includes(environment))
    .map((filename) => filename.split('-')[0].toUpperCase());
  console.log(JSON.stringify(helplinesForEnvironment));
}

main();
