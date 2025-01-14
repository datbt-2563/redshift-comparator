export interface ClusterConfig {
  clusterName: string;
  region: string;
  clusterIdentifier: string;
  database: string;
  dbUser?: string;
  adminPasswordArn: string;
}

export const clusters: ClusterConfig[] = [
  // {
  //   clusterName: "dc2.large_x2nodes",
  //   region: "ap-northeast-1",
  //   clusterIdentifier: "dev-coupon-redshift-cluster-1",
  //   database: "prd_coupon_logs_db",
  //   adminPasswordArn:
  //     "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-1-admin-tV2DUd",
  // },
  // {
  //   clusterName: "dc2.large_x3nodes",
  //   region: "ap-northeast-1",
  //   clusterIdentifier: "dev-coupon-redshift-cluster-2",
  //   database: "prd_coupon_logs_db",
  //   adminPasswordArn:
  //     "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-2-admin-DgRvv4",
  // },
  {
    clusterName: "dc2.large_x4nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-3",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-3-admin-PYni6a",
  },
  // {
  //   clusterName: "dc2.large_x5nodes",
  //   region: "ap-northeast-1",
  //   clusterIdentifier: "dev-coupon-redshift-cluster-4",
  //   database: "prd_coupon_logs_db",
  //   adminPasswordArn:
  //     "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-4-admin-XdSngA",
  // },
  // {
  //   clusterName: "ra3.large_x3nodes",
  //   region: "ap-northeast-1",
  //   clusterIdentifier: "dev-coupon-redshift-cluster-5",
  //   database: "prd_coupon_logs_db",
  //   adminPasswordArn:
  //     "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-5-admin-aour7A",
  // },
  // {
  //   clusterName: "ra3.xlplus_x3nodes",
  //   region: "ap-northeast-1",
  //   clusterIdentifier: "dev-coupon-redshift-cluster-6",
  //   database: "prd_coupon_logs_db",
  //   adminPasswordArn:
  //     "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-6-admin-LpqSoc",
  // },
  // {
  //   clusterName: "ra3.4xlarge_x2nodes",
  //   region: "ap-northeast-1",
  //   clusterIdentifier: "dev-coupon-redshift-cluster-7",
  //   database: "prd_coupon_logs_db",
  //   adminPasswordArn:
  //     "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-7-admin-QwwrFJ",
  // },
];

export const getClusterConfig = (clusterName: string): ClusterConfig => {
  return clusters.find((cluster) => cluster.clusterName === clusterName);
};

export const getClusterNames = (): string[] => {
  return clusters.map((cluster) => cluster.clusterName);
};
