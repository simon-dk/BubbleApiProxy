import * as ACM from "@aws-cdk/aws-certificatemanager";
import * as ApiV2 from "@aws-cdk/aws-apigatewayv2";
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

export interface InfrastructureStackProps extends cdk.StackProps {
  readonly certificateDomain: string;
  readonly gatewayDomain: string;
}

export class InfrastructureStack extends cdk.Stack {
  public readonly apiGatewayDomainName: ApiV2.DomainName;
  public readonly vpc: ec2.Vpc;

  constructor(scope: cdk.Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    /** 
     * Creates a ACM certificate so the API can have a custom domain-name.
     * After first deploy, go to Console -> Certificate Manager to see the status and CNAME records to be added to your DNS provider.
     * The stack/deploymentstatus will not finish until DNS records have been added.
     */
    const acmCertificate = new ACM.Certificate(this, "acm-certificate", {
      domainName: props.certificateDomain,
      validationMethod: ACM.ValidationMethod.DNS,
    });

    /** Creates a domainName in Api Gateway that uses the certificate as validation */
    this.apiGatewayDomainName = new ApiV2.DomainName(this, "apigateway-domain", {
      domainName: props.gatewayDomain,
      certificate: acmCertificate,
    });

    /** 
     * Here we create a Nat Instance (cheaper than a  NAT gateway) which holds the static IP.
     * You can get the ip in the console -> EC2 after creation
     */
    const natInstance = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType("t2.micro"),
    });

    /** Lambdas with a static ip needs to be in a VPC which we create here */
    this.vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 3,
      natGatewayProvider: natInstance,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 20,
          name: "lambdaPrivateSubnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });

    /** 
     * Map over each subnet and add the subnet-cidr to the natInstance. 
     * This allow lambdas in each subnet to connect to the internet via the static ip in the nat instance.
     */
    this.vpc.privateSubnets.map((subnet, index) => {
      const { ipv4CidrBlock, subnetId } = subnet;

      natInstance.securityGroup.addIngressRule(
        ec2.Peer.ipv4(ipv4CidrBlock),
        ec2.Port.tcpRange(0, 65535),
        `Ingress rule #${index} for ${subnetId} (lambda)`
      );
    });

    /** Now to the actual service */

    /** Create the api for a users service
     * If endpoint is used by the frontend, e.g. with "Attempt to make the call from the browser" setting,
     * you need to allow for CORS like below.
     */
    // const httpApi = new ApiV2.HttpApi(this, "usersApi", {
    //   defaultDomainMapping: { domainName: apiGatewayDomain, mappingKey: "users" },
    //   corsPreflight: {
    //     allowMethods: [ApiV2.CorsHttpMethod.GET],
    //     allowOrigins: ["https://my-actual-bubble-domaian.com"],
    //     allowHeaders: ["*", "Content-Type", "Accept-Encoding"],
    //   },
    // });

    // const getUserFn = new lambda.NodejsFunction(this, "getUser", {
    //   runtime: Runtime.NODEJS_14_X,
    //   entry: `./functions/user-api.ts`,
    //   handler: "getUser",
    //   vpc: vpc,
    //   vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
    //   // securityGroups: [props.securityGroup],
    //   logRetention: logs.RetentionDays.TWO_WEEKS,
    //   environment: {
    //     SOME_ENV_HERE: "SOME VALUE HERE",
    //   },
    // });

    // httpApi.addRoutes({
    //   path: "/v1/user",
    //   methods: [ApiV2.HttpMethod.GET],
    //   integration: new ApiV2Integrations.LambdaProxyIntegration({ handler: getUserFn }),
    // });
  }
}
