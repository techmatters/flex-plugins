import AWS from 'aws-sdk';
import { logDebug } from './log';

require('dotenv').config();

AWS.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION ?? 'us-east-1',
});

const ssm = new AWS.SSM();

export const saveSSMParameter = async (
  Name: string,
  Value: string,
  Description: string,
  Tags: AWS.SSM.TagList,
) => {
  const config: AWS.SSM.PutParameterRequest = {
    Name,
    Value,
    Description,
    Tags,
    Type: 'SecureString',
    Tier: 'Standard',
  };

  return new Promise<AWS.SSM.PutParameterResult>((resolve, reject) => {
    ssm.putParameter(config, (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });
};

export const getSSMParameter = (name: string) =>
  new Promise<AWS.SSM.GetParameterResult | undefined>((resolve, reject) => {
    ssm.getParameter({ Name: name }, (err, result) => {
      if (err) {
        if (err.code === 'ParameterNotFound') {
          resolve(undefined);
        }
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

const getSSMParametersChunkByPath = (path: string, token: string | undefined) =>
  new Promise<AWS.SSM.GetParametersByPathResult>((resolve, reject) => {
    ssm.getParametersByPath(
      { Path: path, Recursive: true, NextToken: token, WithDecryption: true },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result ?? { NextToken: null, Parameters: [] });
        }
      },
    );
  });

export const getSSMParametersByPath = async (path: string) => {
  const parameters: AWS.SSM.ParameterList = [];
  let nextToken: string | undefined;

  do {
    // eslint-disable-next-line no-await-in-loop
    const { Parameters: results, NextToken } = await getSSMParametersChunkByPath(path, nextToken);
    nextToken = results?.length ? NextToken : undefined;
    logDebug(`Chunk of ${results?.length} parameters found for path: ${path}`);
    parameters.push(...(results ?? []));
  } while (nextToken);

  return parameters;
};

// export const deleteSSMParameter = async (Name: string) => {
//   ssm.deleteParameter({ Name }, (err, data) => {
//     if (err) {
//       return Promise.reject(err);
//     }

//     return Promise.resolve(data);
//   });
// };
