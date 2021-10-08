import * as ApiV2 from "@aws-cdk/aws-apigatewayv2";
import * as ApiV2Integrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as logs from "@aws-cdk/aws-logs";
import { Runtime } from "@aws-cdk/aws-lambda";

export interface ServiceStackProps extends cdk.StackProps {
  readonly domainName: ApiV2.DomainName;
  readonly vpc: ec2.Vpc;
}

export class UsersServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    /** Create the api for a users service
     * If endpoint is used by the frontend, e.g. with "Attempt to make the call from the browser" setting,
     * you need to allow for CORS like below.
     */
    const httpApi = new ApiV2.HttpApi(this, "usersApi", {
      defaultDomainMapping: { domainName: props.domainName, mappingKey: "users" },
      corsPreflight: {
        allowMethods: [ApiV2.CorsHttpMethod.GET],
        allowOrigins: ["https://my-actual-bubble-domaian.com"],
        allowHeaders: ["*", "Content-Type", "Accept-Encoding"],
      },
    });

    /** Lambda functions */
    const getUserFn = new lambda.NodejsFunction(this, "getUser", {
      runtime: Runtime.NODEJS_14_X,
      entry: `./functions/user-api.ts`,
      handler: "getUser",
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
      logRetention: logs.RetentionDays.TWO_WEEKS,
      environment: {
        SOME_ENV_HERE: "SOME VALUE HERE",
      },
    });

    httpApi.addRoutes({
      path: "/v1/user",
      methods: [ApiV2.HttpMethod.GET],
      integration: new ApiV2Integrations.LambdaProxyIntegration({ handler: getUserFn }),
    });
  }
}
