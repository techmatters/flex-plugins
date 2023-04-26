import { SSM, STS } from 'aws-sdk';
import { logDebug, logWarning } from './log';

require('dotenv').config();

let ssm: AWS.SSM;
let roleToAssume: string = 'arn:aws:iam::712893914485:role/tf-twilio-iac-ssm-read-only';

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

    logDebug('Using SSM credentials from role: ', roleToAssume);

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

  logWarning('saveSSMParameter: ', config);

  const ssmClient = await getSsm();
  return ssmClient.putParameter(config).promise();
};

export const getSSMParameter = async (name: string) => {
  const ssmClient = await getSsm();
  logWarning('getSSMParameter: ', name);
  try {
    const result = await ssmClient.getParameter({ Name: name, WithDecryption: true }).promise();
    return result;
  } catch (e) {
    logWarning('getSSMParameter error: ', e);
    return null;
  }
};

// export const deleteSSMParameter = async (Name: string) => {
//   ssm.deleteParameter({ Name }, (err, data) => {
//     if (err) {
//       return Promise.reject(err);
//     }

//     return Promise.resolve(data);
//   });
// };
