declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ALB_LISTENER_ARN: string | undefined;
      AWS_DEFAULT_SG: string | undefined;
      AWS_CLUSTER_ARN: string | undefined;
      AWS_VPC_ID: string | undefined;
      AUTH_ENDPOINT: string | undefined;
      SALT: string | undefined;
    }
  }
}

export {};
