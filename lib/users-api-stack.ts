import * as apigatewayv2_alpha from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

import { basicLambdaProps } from './common/basic-lambda-props.js';

export interface UsersApiStackProps extends cdk.StackProps {
  /**
   * The vpc is the vpc created in the network stack.
   */
  vpc: ec2.IVpc;
}

/**
 * Here we create a simple HTTP API with two routes for users.
 *
 * The lambdas and the routes associated with them are defined in this stack, but should
 * be changed to suit your needs.
 */
export class UsersApiStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: UsersApiStackProps) {
    super(scope, id, props);

    /* Lambda Functions */
    const getUsersFn = new lambdaNode.NodejsFunction(this, 'getUsersFn', {
      entry: path.resolve('src/api/get-users.ts'),
      ...basicLambdaProps,
      vpc: props.vpc,
      environment: {
        NODE_ENV: 'production',
        SOME_OTHER_ENV: 'SOME OTHER VALUE',
      },
    });

    const getUserFn = new lambdaNode.NodejsFunction(this, 'getUserFn', {
      entry: path.resolve('src/api/get-user.ts'),
      ...basicLambdaProps,
      vpc: props.vpc,
      environment: {
        NODE_ENV: 'production',
        SOME_OTHER_ENV: 'SOME OTHER VALUE',
      },
    });

    /* HTTP Api */
    const httpApi = new apigatewayv2_alpha.HttpApi(this, 'usersHttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigatewayv2_alpha.CorsHttpMethod.GET],
        allowHeaders: ['*'],
      },
    });

    /* Routes */
    httpApi.addRoutes({
      path: '/users',
      methods: [apigatewayv2_alpha.HttpMethod.GET],
      integration: new HttpLambdaIntegration('getUsersIntegration', getUsersFn),
    });

    httpApi.addRoutes({
      path: '/users/{userId}',
      methods: [apigatewayv2_alpha.HttpMethod.GET],
      integration: new HttpLambdaIntegration('getUserIntegration', getUserFn),
    });
  }
}
