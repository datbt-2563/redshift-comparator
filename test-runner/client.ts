import { getClusterConfig } from "configuration/target-cluster";
import mysql from "mysql2/promise";

export interface ExecuteResult {
  sql: string;
  result: any;
  timeInMs: number;
  clusterName: string;
}

export async function executeQuery(
  sql: string,
  clusterName: string
): Promise<ExecuteResult> {
  let connection;
  const clusterConfig = getClusterConfig(clusterName);

  let startTime;
  let result;
  try {
    connection = await mysql.createConnection(clusterConfig);

    startTime = performance.now();
    const [rows] = await connection.execute(sql);
    result = rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  const endTime = performance.now();

  return {
    sql,
    clusterName,
    result,
    timeInMs: endTime - startTime,
  };
}
