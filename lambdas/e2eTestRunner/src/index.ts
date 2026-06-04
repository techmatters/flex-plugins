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

import { spawn } from 'child_process';
import path from 'path';
import { promises as fs, createReadStream } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { format } from 'date-fns';

const SSM_REGION = 'us-east-1'; // All our parameters are in this region, regardless of where the actual helpline is deployed to

type HandlerEnv = Record<string, string | undefined>;

type E2ETestEvent = {
  testName?: string;
  npmScript?: string;
};

const getParameterValue = async (name: string): Promise<string> => {
  const ssm = new SSMClient({ region: SSM_REGION });
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const {
    Parameter: { Value },
  } = await ssm.send(command);
  console.debug(`SSM ${name} = ${Value}`);
  return Value as string;
};

// https://stackoverflow.com/a/65862128/30481093
const uploadDir = async (
  dirPath: string,
  bucketName: string,
  s3BasePath: string,
  options: { region: string },
): Promise<void> => {
  const s3 = new S3Client(options);

  // Recursive getFiles from https://stackoverflow.com/a/45130990/831465
  async function getFiles(dir: string): Promise<string[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map(dirent => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : [res];
      }),
    );
    return ([] as string[]).concat(...files);
  }

  const files = await getFiles(dirPath);
  console.debug('Uploading files:', files);
  const uploads = files.map(filePath =>
    s3.send(
      new PutObjectCommand({
        Key: path
          .join(s3BasePath, path.relative(dirPath, filePath))
          .replaceAll('\\', '/'),
        Bucket: bucketName,
        Body: createReadStream(filePath),
      }),
    ),
  );
  await Promise.all(uploads);
};

const uploadTestArtifactsToS3 = async (env: HandlerEnv): Promise<void> => {
  const accountSid = await getParameterValue(
    `/${env.HL_ENV}/twilio/${(env.HL as string).toUpperCase()}/account_sid`,
  );
  const region = await getParameterValue(`/${env.HL_ENV}/aws/${accountSid}/region`);
  const bucket = await getParameterValue(
    `/${env.HL_ENV}/s3/${accountSid}/docs_bucket_name`,
  );

  const now = new Date();
  const formattedDate = format(now, 'yyyy-MM-dd-HH-mm-ss-SSSS');
  const s3KeyRoot = `e2e-tests/${env.TEST_NAME ?? 'all_test'}/${formattedDate}`;
  console.info(`Uploading test artifacts to ${s3KeyRoot}`);
  await uploadDir(path.resolve('/tmp/storage'), bucket, s3KeyRoot, { region });
  await uploadDir(
    path.resolve('/tmp/test-results'),
    bucket,
    `${s3KeyRoot}/test-results`,
    {
      region,
    },
  );
};

export const handler = async (event: E2ETestEvent): Promise<void> => {
  const env: HandlerEnv = { ...process.env };

  const { testName, npmScript } = event;
  if (testName) {
    env.TEST_NAME = testName;
  }

  const cmd = spawn(
    /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
    ['-loglevel silent', 'run', npmScript || 'test'],
    {
      stdio: 'inherit',
      cwd: '/app/e2e-tests',
      env: env as NodeJS.ProcessEnv,
    },
  );

  let result: unknown;
  let isError = false;
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

  try {
    console.info('Attempting artifact uploads...');
    await uploadTestArtifactsToS3(env);
  } catch (err) {
    console.error('Error uploading test artifacts:', err);
  }

  if (isError) {
    throw result;
  }
  console.info(`Test run (${env.TEST_NAME}) result: `, result);
};
