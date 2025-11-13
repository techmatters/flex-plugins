import { spawn } from 'child_process';
import type {ALBEvent} from "aws-lambda";

export type IntegrationTestEvent = {
  npmScript: string;
  testName?: string;
};

export const isIntegrationTestEvent = (
    event: IntegrationTestEvent | ALBEvent,
): event is IntegrationTestEvent => Boolean((event as IntegrationTestEvent).npmScript);

export const runJestTests = async (event: IntegrationTestEvent) => {
  const env = { ...process.env };

  const { testName, npmScript } = event;
  if (testName) {
    env.TEST_NAME = testName;
  }

  const cmd = spawn('npm', ['-loglevel silent', 'run', npmScript || 'test'], {
    stdio: 'inherit',
    env,
  });
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
  console.info(`Test run (${env.TEST_NAME}) result: `, result);
};
