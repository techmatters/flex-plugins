import type { AWS } from '@serverless/typescript';

const version = '0.0.2';

const hostedZone = 'aws.interrobang.consulting';
const domainNames = {
  dev: `dev.${hostedZone}`,
};

const functionDefinitions = [
  {
    name: 'hello',
    method: 'get',
    path: '/{accountSid}/hello',
  },
  {
    name: 'goodbye',
    method: 'get',
    path: '/{accountSid}/goodbye/{foo}',
  },
];

const functions = functionDefinitions.reduce((acc, def) => {
  acc[def.name] = {
    handler: `./functions/${def.name}/index.handler`,
    events: [
      {
        httpApi: {
          path: def.path,
          method: def.method,
        },
      },
    ],
    package: {
      patterns: [
        '!./functions/**',
        `./functions/${def.name}/**`,
      ]
    },
  };
  return acc;
}, {});

const serverlessConfiguration: AWS = {
  org: 'robertbodavis',
  app: 'aselo-flex-plugins-lambdas',
  // custom: {
  //   customCertificate: {
  //     hostedZoneNames: `${hostedZone}.`,
  //     certificateName: domainNames.dev,
  //   },
  //   customDomain: {
  //     domainName: domainNames.dev,
  //     certificateName: domainNames.dev,
  //     createRoute53Record: true,
  //     auoDomain: true,
  //   },
  // },
  service: 'aselo-flex-plugins-lambdas',
  frameworkVersion: '3',
  plugins: [
    // 'serverless-certificate-creator',
    // 'serverless-domain-manager',
    'serverless-plugin-typescript'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--stack-trace-limit=1000',
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      // shouldStartNameWithService: true,
    },
  },
  functions,
  package: { individually: true },
  resources: {}
};

module.exports = serverlessConfiguration;
