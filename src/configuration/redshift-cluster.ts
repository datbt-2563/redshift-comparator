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
    clusterName: "ra3.large_x6nodes",
    region: "ap-northeast-1",
    clusterIdentifier: "copy-coupon-redshift-cluster",
    database: "prd_coupon_logs_db",
    adminPasswordArn:
      "arn:aws:secretsmanager:ap-northeast-1:856562439801:secret:redshift!copy-coupon-redshift-cluster-admin-yMZrtx",
  },
];

export const getClusterConfig = (clusterName: string): ClusterConfig => {
  return clusters.find((cluster) => cluster.clusterName === clusterName);
};

export const getClusterNames = (): string[] => {
  return clusters.map((cluster) => cluster.clusterName);
};
