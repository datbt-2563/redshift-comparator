export interface ClusterConfig {
  clusterName: string;
  region: string;
  clusterIdentifier: string;
  database: string;
  dbUser?: string;
}

export const clusters: ClusterConfig[] = [
  {
    clusterName: "dev-cluster",
    region: "ap-northeast-1",
    clusterIdentifier: "dev-coupon-redshift-cluster",
    database: "prd_coupon_logs_db",
    // dbUser: "admin",
  },
];

export const getClusterConfig = (clusterName: string): ClusterConfig => {
  return clusters.find((cluster) => cluster.clusterName === clusterName);
};
