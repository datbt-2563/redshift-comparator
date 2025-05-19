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
    clusterIdentifier: "dev-coupon-redshift-cluster-2",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!dev-coupon-redshift-cluster-2-admin-MACdHt",
  },
];

export const getClusterConfig = (clusterName: string): ClusterConfig => {
  return clusters.find((cluster) => cluster.clusterName === clusterName);
};

export const getClusterNames = (): string[] => {
  return clusters.map((cluster) => cluster.clusterName);
};
