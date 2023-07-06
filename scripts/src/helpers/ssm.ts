import { SSM, STS } from 'aws-sdk';
import { logDebug, logWarning } from './log';

require('dotenv').config();

let ssm: AWS.SSM;
let privilegedSsm: AWS.SSM;
let roleToAssume: string = 'arn:aws:iam::712893914485:role/tf-twilio-iac-ssm-read-only';

const getPrivilegedSsm = async (): Promise<AWS.SSM> => {
  if (!privilegedSsm) {
    privilegedSsm = new SSM({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_REGION ?? 'us-east-1',
    });
  }

  return privilegedSsm;
};

export const setRoleToAssume = (role: string) => {
  logDebug('Setting role to assume: ', role);
  roleToAssume = role;
};

const getSsmConfig = async (): Promise<{
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  region: string;
}> => {
  if (roleToAssume) {
    const sts = new STS();
    const timestamp = new Date().getTime();
    const params = {
      RoleArn: roleToAssume,
      RoleSessionName: `tf-supplemental-${timestamp}`,
    };
    const stsResponse = await sts.assumeRole(params).promise();

    if (!stsResponse.Credentials) {
      logDebug('No credentials found');
      return {
        region: 'us-east-1',
      };
    }

    return {
      accessKeyId: stsResponse.Credentials.AccessKeyId,
      secretAccessKey: stsResponse.Credentials.SecretAccessKey,
      sessionToken: stsResponse.Credentials.SessionToken,
      region: 'us-east-1',
    };
  }

  return {
    region: 'us-east-1',
  };
};

const getSsm = async () => {
  if (!ssm) {
    ssm = new SSM(await getSsmConfig());
  }

  return ssm;
};

export const saveSSMParameter = async (
  Name: string,
  Value: string,
  Description: string,
  Tags: SSM.TagList,
) => {
  const config: SSM.PutParameterRequest = {
    Name,
    Value,
    Description,
    Tags,
    Type: 'SecureString',
    Tier: 'Standard',
  };

  const ssmClient = await getSsm();
  return ssmClient.putParameter(config).promise();
};

export const getSSMParameter = async (name: string, usePrivilegedAccess = false) => {
  const ssmClient = await (usePrivilegedAccess ? getPrivilegedSsm() : getSsm());
  try {
    return await ssmClient.getParameter({ Name: name, WithDecryption: true }).promise();
  } catch (e) {
    logWarning('getSSMParameter error: ', e);
    return null;
  }
};

const getSSMParametersChunkByPath = async (path: string, token: string | undefined) => {
  const ssmClient = await getPrivilegedSsm();
  return ssmClient
    .getParametersByPath({ Path: path, Recursive: true, NextToken: token, WithDecryption: true })
    .promise();
};

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
