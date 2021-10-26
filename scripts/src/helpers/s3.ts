import AWS from 'aws-sdk';

require('dotenv').config();

AWS.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: 'us-east-1',
});

const s3Client = new AWS.S3();

// TODO: Should we check if the bucket exists first? Right now, if the bucket exist, the following code doesn't override it nor throws any error.
export const createS3Bucket = async (name: string) => {
  const createBucketParams: AWS.S3.Types.CreateBucketRequest = {
    Bucket: name,
  };

  return new Promise<AWS.S3.CreateBucketOutput>((resolve, reject) => {
    s3Client.createBucket(createBucketParams, async (err, data) => {
      if (err) {
        reject(err);
      }

      try {
        await setCORSPolicy(name);
        await setPublicAccessBlock(name);
        resolve(data);
      } catch(bucketCustomConfigError) {
        reject(bucketCustomConfigError);
      }
    });
  });
};

const setCORSPolicy = async (name: string) => {
  const putBucketCorsParams: AWS.S3.Types.PutBucketCorsRequest = {
    Bucket: name,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'POST', 'PUT'],
          AllowedOrigins: ['https://flex.twilio.com'],
          ExposeHeaders: [],
        }
      ],
    },
  };

  return new Promise((resolve, reject) => {
    s3Client.putBucketCors(putBucketCorsParams, (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });
};

const setPublicAccessBlock = async (name: string) => {
  const putPublicAccessBlockParams: AWS.S3.Types.PutPublicAccessBlockRequest = {
    Bucket: name,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      IgnorePublicAcls: true,
      BlockPublicPolicy: true,
      RestrictPublicBuckets: true,
    },
  };

  return new Promise((resolve, reject) => {
    s3Client.putPublicAccessBlock(putPublicAccessBlockParams, (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });
};
