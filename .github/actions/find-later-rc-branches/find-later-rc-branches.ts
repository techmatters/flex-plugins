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
import git from 'isomorphic-git';
import { setOutput, setFailed } from '@actions/core';
import * as fs from "node:fs";


async function findLaterBranches(): Promise<string[]> {
  const patternToExtractVersions = /(?:origin\/)?v(?<majorString>[0-9]+)\.(?<minorString>[0-9]+)-rc$/
  const rcBranchToCheck = process.env.RC_BRANCH_TO_CHECK;
  const { majorString, minorString } = rcBranchToCheck.match(patternToExtractVersions).groups
  const majorVersion = parseInt(majorString);
  const minorVersion = parseInt(minorString);
  console.debug(`Current major version: ${majorVersion}, minor: ${minorVersion}`);
  const allBranches = await git.listBranches({ fs, remote: 'origin', dir: '../../../' });
  console.debug('Branches being checked:', JSON.stringify(allBranches));
  return [
    process.env.TRUNK_NAME,
    ...allBranches.filter(branchToTest => {
      const { majorString: majorStringToTest, minorString: minorStringToTest } = branchToTest.match(patternToExtractVersions)?.groups ?? {};
      if (!minorStringToTest || !majorStringToTest) return false;
      const majorVersionToTest = parseInt(majorStringToTest);
      const minorVersionToTest = parseInt(minorStringToTest);
      return (majorVersionToTest > majorVersion || (majorVersionToTest === majorVersion && minorVersionToTest > minorVersion ))
    }).map(laterRemoteBranch => laterRemoteBranch.replace('origin/', ''))
  ];

}

findLaterBranches()
.then((laterBranches) => {
  console.info(laterBranches);
  setOutput('found_branches', JSON.stringify(laterBranches));
})
.catch((err) => {
  console.error(err);
  setFailed(err.message);
});
