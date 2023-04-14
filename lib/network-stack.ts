import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

/**
 * This stack creates a VPC with a public, isolated and private subnet. 
 * 
 * In this example, only the private subnet is used for lambda functions, but the others are kept for reference.
 * 
 * The VPC is created with a NAT instance, which is a much cheaper alternative to a NAT gateway. 
 * It is not perfect though as there is no reduncancy built in (only runs in one AZ), but for most small to medium usecases
 * it is more than enough.
 */
export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* Uses the "fck nat" ami described here: https://github.com/AndrewGuenther/fck-nat */
    const natGatewayProvider = new ec2.NatInstanceProvider({
      instanceType: new ec2.InstanceType('t4g.nano'),
      machineImage: new ec2.LookupMachineImage({
        name: 'fck-nat-amzn2-*-arm64-ebs',
        owners: ['568608671756'],
      }),
    });

    /**
     * This subnet can be used for public facing resources,
     * such as API Gateway, ALB, bastion host etc.
     */
    const publicSubnetConfig: ec2.SubnetConfiguration = {
      name: 'public-subnet',
      subnetType: ec2.SubnetType.PUBLIC,
      cidrMask: 24,
    };

    /**
     * This subnet can be used for resources that should not be publicly accessible,
     * such as RDS, Elasticache, Redshift etc.
     */
    const isolatedSubnetConfig: ec2.SubnetConfiguration = {
      name: 'isolated-subnet',
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      cidrMask: 24,
    };

    /**
     * This subnet can be used for resources that should not be publicly accessible,
     * but should have access to the internet, such as Lambda functions.
     */
    const privateLambdaSubnetConfig: ec2.SubnetConfiguration = {
      name: 'private-lambda-subnet',
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      cidrMask: 20,
    };

    this.vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 3,
      natGatewayProvider,
      natGateways: 1,
      subnetConfiguration: [
        publicSubnetConfig,
        isolatedSubnetConfig,
        privateLambdaSubnetConfig,
      ],
    });
  }
}
