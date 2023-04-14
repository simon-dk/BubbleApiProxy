import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface ElasticIpStackProps extends cdk.StackProps {
  /**
   * The natInstanceId is the id of the natInstance created in the network stack.
   * You find this id in the console after the network stack has been deployed.
   */
  natInstanceId: string;

  /**
   * Decided whether you want to retain the ip address, even if the stack is deleted.
   *
   * Be adviced that this keeps the ip and will incur cost if all other stacks are
   * deleted. Its usefull to make sure that even if you delete the stack, you can
   * keep the ip.
   */
  retainIp?: boolean;
}

/**
 * This stack creates an elastic (static) ip address, and attaches it to the natInstance
 * created in the network stack. If the natInstance is ever recreated, the ip will be the same.
 *
 * In production you will want to uncomment the line that retains the ip address.
 *
 * This is a workaround for a bug in the CDK, where the natGatewayId is not available:
 * e.g. "instanceId: natGatewayProvider.configuredGateways[0].gatewayId" doest not work.
 */
export class ElasticIpStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: ElasticIpStackProps) {
    super(scope, id, props);

    const elasticIp = new ec2.CfnEIP(this, 'elastic-ip', {
      instanceId: props.natInstanceId,
    });

    if (props.retainIp) {
      elasticIp.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }
  }
}
