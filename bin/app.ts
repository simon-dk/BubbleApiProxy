#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { ElasticIpStack } from '../lib/elastic-ip-stack.js';
import { NetworkStack } from '../lib/network-stack.js';
import { UsersApiStack } from '../lib/users-api-stack.js';

const app = new cdk.App();

const development = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const networkStackDev = new NetworkStack(app, 'NetworkStackDev', {
  env: development,
});

new ElasticIpStack(app, 'ElasticIpStackDev', {
  natInstanceId: '<first-deploy-network - then get id from console>',
  retainIp: false,
});

new UsersApiStack(app, 'UsersApiStackDev', {
  env: development,
  vpc: networkStackDev.vpc,
});
