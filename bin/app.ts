#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import { UsersServiceStack } from "../lib/users-services-stack";

const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };
const isProd = env.account === "12345678";

const app = new cdk.App();

const infrastructureStack = new InfrastructureStack(app, "InfrastructureStack", {
  env,
  certificateDomain: "*.api.my-domain.com",
  gatewayDomain: isProd ? "testprod.api.my-domain.com" : "testdev.api.my-domain.com",
});

const usersServiceStack = new UsersServiceStack(app, "UsersServiceStack", {
  env,
  vpc: infrastructureStack.vpc,
  domainName: infrastructureStack.apiGatewayDomainName,
});
