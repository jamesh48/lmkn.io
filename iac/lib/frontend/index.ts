import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface LMKNIOFrontendStackProps {
  aws_env: {
    AWS_DEFAULT_SG: string;
    AWS_CLUSTER_ARN: string;
    AWS_VPC_ID: string;
    AWS_ALB_LISTENER_ARN: string;
  };
  svc_env: { AUTH_ENDPOINT: string; SALT: string };
}

export class LMKNFrontendStack extends Construct {
  constructor(scope: Construct, id: string, props: LMKNIOFrontendStackProps) {
    super(scope, id);

    const lmknFeFargateService = new ecs.FargateService(this, 'lmknf-service', {
      assignPublicIp: true,
      desiredCount: 1,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
      taskDefinition: new ecs.FargateTaskDefinition(
        this,
        'lmknf-task-definition',
        {
          taskRole: iam.Role.fromRoleName(
            this,
            'jh-ecs-task-definition-role',
            'jh-ecs-task-definition-role'
          ),
          executionRole: iam.Role.fromRoleName(
            this,
            'jh-ecs-task-execution-role',
            'jh-ecs-task-execution-role'
          ),
        }
      ),
      cluster: ecs.Cluster.fromClusterAttributes(this, 'jh-imported-cluster', {
        securityGroups: [
          ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'imported-default-sg',
            props.aws_env.AWS_DEFAULT_SG
          ),
        ],
        clusterName: 'jh-e1-ecs-cluster',
        clusterArn: props.aws_env.AWS_CLUSTER_ARN,
        vpc: ec2.Vpc.fromLookup(this, 'jh-imported-vpc', {
          vpcId: props.aws_env.AWS_VPC_ID,
        }),
      }),
      enableExecuteCommand: true,
    });

    const container = lmknFeFargateService.taskDefinition.addContainer(
      'lmknFrontend-container',
      {
        image: ecs.ContainerImage.fromAsset('../frontend'),
        logging: new ecs.AwsLogDriver({
          streamPrefix: 'lmknf-container',
          logRetention: logs.RetentionDays.FIVE_DAYS,
        }),
        environment: {
          ...props.svc_env,
        },
      }
    );

    container.addPortMappings({
      containerPort: 3000,
      hostPort: 3000,
    });

    const importedALBListener = elbv2.ApplicationListener.fromLookup(
      this,
      'imported-https-listener',
      {
        listenerArn: props.aws_env.AWS_ALB_LISTENER_ARN,
      }
    );

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'lmknf-tg', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [lmknFeFargateService],
      vpc: ec2.Vpc.fromLookup(this, 'jh-imported-vpc-tg', {
        vpcId: props.aws_env.AWS_VPC_ID,
      }),
      healthCheck: {
        path: '/',
        unhealthyThresholdCount: 2,
        healthyHttpCodes: '200',
        healthyThresholdCount: 5,
        interval: cdk.Duration.seconds(30),
        port: '3000',
        timeout: cdk.Duration.seconds(10),
      },
    });

    importedALBListener.addTargetGroups('lmknf-listener-tg', {
      targetGroups: [targetGroup],
      priority: 35,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/*'])],
    });
  }
}
