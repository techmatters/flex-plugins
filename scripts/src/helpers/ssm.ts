import {
  GetParameterCommand,
  GetParametersByPathCommand,
  PutParameterCommand,
  PutParameterRequest,
  SSMClient,
  Tag,
  Parameter,
} from '@aws-sdk/client-ssm';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { logDebug, logWarning } from './log';

require('dotenv').config();

let ssm: SSMClient;
let privilegedSsm: SSMClient;
let roleToAssume: string = 'arn:aws:iam::712893914485:role/tf-twilio-iac-ssm-read-only';

const getPrivilegedSsm = async (): Promise<SSMClient> => {
  if (!privilegedSsm) {
    privilegedSsm = new SSMClient({
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
  console.log('>>>>>>>>>>> roleToAssume', roleToAssume)
  if (roleToAssume) {
    const sts = new STSClient();
    const timestamp = new Date().getTime();
    const params = {
      RoleArn: roleToAssume,
      RoleSessionName: `tf-supplemental-${timestamp}`,
    };
    const stsResponse = await sts.send(new AssumeRoleCommand(params));

    if (!stsResponse.Credentials) {
      logDebug('No credentials found');
      console.log('>>>>>>>>>>> return 1')
      return {
        region: 'us-east-1',
      };
    }

      console.log('>>>>>>>>>>> return 2')
    return {
      accessKeyId: stsResponse.Credentials.AccessKeyId,
      secretAccessKey: stsResponse.Credentials.SecretAccessKey,
      sessionToken: stsResponse.Credentials.SessionToken,
      region: 'us-east-1',
    };
  }

      console.log('>>>>>>>>>>> return 3')
  return {
    region: 'us-east-1',
  };
};

const getSsm = async () => {
      console.log('>>>>>>>>>>> ssm?', Boolean(ssm))
  if (!ssm) {
    ssm = new SSMClient(await getSsmConfig());
  }

  return ssm;
};

export const saveSSMParameter = async (
  Name: string,
  Value: string,
  Description: string,
  Tags: Tag[],
) => {
  const config: PutParameterRequest = {
    Name,
    Value,
    Description,
    Tags,
    Type: 'SecureString',
    Tier: 'Standard',
  };

  const ssmClient = await getSsm();
  return ssmClient.send(new PutParameterCommand(config));
};

export const getSSMParameter = async (name: string, usePrivilegedAccess = false) => {
  const ssmClient = await (usePrivilegedAccess ? getPrivilegedSsm() : getSsm());
  console.log('>>>>>>>>>>> ssmClient', ssmClient.config)
  try {
    return await ssmClient.send(new GetParameterCommand({ Name: name, WithDecryption: true }));
  } catch (e) {
    logWarning('getSSMParameter error: ', e);
    return null;
  }
};

const getSSMParametersChunkByPath = async (path: string, token: string | undefined) => {
  const ssmClient = await getPrivilegedSsm();
  return ssmClient.send(
    new GetParametersByPathCommand({
      Path: path,
      Recursive: true,
      NextToken: token,
      WithDecryption: true,
    }),
  );
};

export const getSSMParametersByPath = async (path: string) => {
  const parameters: Parameter[] = [];
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
