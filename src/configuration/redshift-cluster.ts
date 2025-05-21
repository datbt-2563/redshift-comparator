export interface ClusterConfig {
  clusterName: string;
  region: string;
  clusterIdentifier: string;
  database: string;
  dbUser?: string;
  adminPasswordArn: string;
}

export const clusters: ClusterConfig[] = [
  {
    clusterName: "ra3.large_x3nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern01",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern01-admin-1qvtdV",
  },
  {
    clusterName: "ra3.large_x4nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern02",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern02-admin-Dp8gIP",
  },
  {
    clusterName: "ra3.large_x5nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern03",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern03-admin-Bw5IkQ",
  },
  {
    clusterName: "ra3.large_x6nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern04",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern04-admin-cIYTNV",
  },
  {
    clusterName: "ra3.large_x7nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern05",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern05-admin-Wj0UAV",
  },
  {
    clusterName: "ra3.large_x8nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern06",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern06-admin-rjy1B6",
  },
  {
    clusterName: "ra3.large_x10nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern07",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern07-admin-JnFlRC",
  },
  {
    clusterName: "ra3.large_x14nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern08",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern08-admin-OxO5bK",
  },
  {
    clusterName: "ra3.xlplus_x3nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern09",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern09-admin-3sDsKg",
  },
  {
    clusterName: "ra3.xlplus_x4nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster-pattern10",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-pattern10-admin-XNuWfl",
  },
];

export const getClusterConfig = (clusterName: string): ClusterConfig => {
  return clusters.find((cluster) => cluster.clusterName === clusterName);
};

export const getClusterNames = (): string[] => {
  return clusters.map((cluster) => cluster.clusterName);
};
