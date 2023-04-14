import { Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export const basicLambdaProps: NodejsFunctionProps = {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,
  memorySize: 256,
  timeout: Duration.seconds(10),
  logRetention: RetentionDays.ONE_WEEK,
  deadLetterQueueEnabled: true,
};
