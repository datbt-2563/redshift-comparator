export interface Cluster {
  name: string;

  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export const clusters: Cluster[] = [
  {
    name: "cluster1",
    host: "localhost",
    port: 4000,
    user: "root",
    password: "rootpassword",
    database: "mydatabase",
  },
  {
    name: "cluster2",
    host: "localhost",
    port: 4001,
    user: "root",
    password: "rootpassword",
    database: "mydatabase",
  },
];

export const getClusterConfig = (clusterName: string): Partial<Cluster> => {
  const config = clusters.find((cluster) => cluster.name === clusterName);
  return {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  };
};
