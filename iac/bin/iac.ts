#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { LMKStack } from '../lib/lmk-stack';

const app = new cdk.App();

const {
  AWS_ALB_LISTENER_ARN,
  AWS_CLUSTER_ARN,
  AWS_DEFAULT_SG,
  AWS_VPC_ID,
  AUTH_ENDPOINT,
  SALT,
  SMS_APPLICATION_ID,
  SMS_ORIGINATION_NUMBER,
  SMS_REGISTRATION_KEYWORD,
} = process.env;

if (!AWS_ALB_LISTENER_ARN) {
  throw new Error('AWS_ALB_LISTENER_ARN is undefined!');
}
if (!AWS_CLUSTER_ARN) {
  throw new Error('AWS_CLUSTER_ARN is undefined!');
}

if (!AWS_DEFAULT_SG) {
  throw new Error('AWS_DEFAULT_SG is undefined!');
}

if (!AWS_VPC_ID) {
  throw new Error('AWS_VPC_ID is undefined!');
}

if (!AUTH_ENDPOINT) {
  throw new Error('AUTH_ENDPOINT is undefined!');
}

if (!SALT) {
  throw new Error('SALT is undefined!');
}

if (!SMS_APPLICATION_ID) {
  throw new Error('SMS_APPLICATION_ID is undefined!');
}

if (!SMS_ORIGINATION_NUMBER) {
  throw new Error('SMS_ORIGINATION_NUMBER is undefined');
}

if (!SMS_REGISTRATION_KEYWORD) {
  throw new Error('SMS_REGISTRATION_KEYWORD is undefined');
}

new LMKStack(app, 'lmk-stack', {
  aws_env: {
    AWS_ALB_LISTENER_ARN,
    AWS_CLUSTER_ARN,
    AWS_DEFAULT_SG,
    AWS_VPC_ID,
    SMS_APPLICATION_ID,
    SMS_ORIGINATION_NUMBER,
    SMS_REGISTRATION_KEYWORD,
  },
  svc_env: {
    AUTH_ENDPOINT,
    SALT,
  },
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
