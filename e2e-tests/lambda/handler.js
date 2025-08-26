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
const path = require('path');
const { promises: fs, createReadStream } = require('fs');
const { S3 } = require('@aws-sdk/client-s3');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm')

const uploadTestArtifactsToS3 = async (env) => {
  const getParameterValue = async (name) => {
    const ssm = new SSMClient({});
    const params = {
      Name: name,
      WithDecryption: true,
    };

    const command = new GetParameterCommand(params);
    const { Parameter: { Value } } = await ssm.send(command);
    console.debug(`SSM ${name} = ${Value}`);
    return Value;
  };


  // https://stackoverflow.com/a/65862128/30481093
  async function uploadDir(dirPath, bucketName, s3BasePath, options = {}) {
    const s3 = new S3(options);

    // Recursive getFiles from
    // https://stackoverflow.com/a/45130990/831465
    async function getFiles(dir) {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
          dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFiles(res) : res;
          })
      );
      return Array.prototype.concat(...files);
    }

    const files = await getFiles(dirPath);
    console.debug('Uploading files:', files);
    const uploads = files.map((filePath) =>
        s3
            .putObject({
              Key: path.join(s3BasePath, path.relative(dirPath, filePath)).replace('\\', '/'),
              Bucket: bucketName,
              Body: createReadStream(filePath),
            })
    );
    return Promise.all(uploads);
  }
  const now = new Date();

  const accountSid = await getParameterValue(`/${env.HL_ENV}/twilio/${env.HL.toUpperCase()}/account_sid`);
  const region = await getParameterValue(`/${env.HL_ENV}/aws/${accountSid}/region`)
  const bucket = await getParameterValue(`/${env.HL_ENV}/s3/${accountSid}/docs_bucket_name`)
  const s3KeyRoot = `e2e-tests/${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}T${now.getUTCHours()}${now.getUTCMinutes()}${now.getUTCSeconds()}-${now.getUTCMilliseconds()}`;
  await uploadDir(path.resolve('/tmp/temp'), bucket, `${s3KeyRoot}/temp`, { region });
  await uploadDir(path.resolve('/tmp/test-results'), bucket, `${s3KeyRoot}/test-results`, { region });
}

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

  try {
    await uploadTestArtifactsToS3(env)
  } catch (err) {
    console.error('Error uploading test artifacts:', err);
  }

  console.log(result);
};
