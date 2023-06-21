import { SSMClient, GetParameterCommand, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ region: 'us-east-1' });

export const getSsmParameter = async (Name: string) => {
  const command = new GetParameterCommand({ Name, WithDecryption: true });
  const response = await ssmClient.send(command);

  return response.Parameter?.Value;
};

export const getSsmParametersByPath = async (Path: string) => {
  const command = new GetParametersByPathCommand({ Path, WithDecryption: true });
  const response = await ssmClient.send(command);

  if (!response.Parameters) return {};

  return response.Parameters.reduce((obj: Record<string, string>, parameter) => {
    obj[parameter.Name!] = parameter.Value!;
    return obj;
  }, {});
};
