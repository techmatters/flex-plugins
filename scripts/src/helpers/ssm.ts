import AWS from 'aws-sdk';

require('dotenv').config();

AWS.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: 'us-east-1',
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

// export const deleteSSMParameter = async (Name: string) => {
//   ssm.deleteParameter({ Name }, (err, data) => {
//     if (err) {
//       return Promise.reject(err);
//     }

//     return Promise.resolve(data);
//   });
// };
