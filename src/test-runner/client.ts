import {
  DescribeStatementCommand,
  DescribeStatementCommandInput,
  ExecuteStatementCommand,
  Field,
  GetStatementResultCommand,
  RedshiftDataClient,
  StatusString,
} from "@aws-sdk/client-redshift-data";
import { getClusterConfig } from "src/configuration/redshift-cluster";

// TODO: get information of current cluster by querying system tables

/**
 * Set no cache for session and return the session id
 * @param clusterName
 */
export async function setNoCacheForSession(
  clusterName: string
): Promise<string> {
  const config = getClusterConfig(clusterName);

  const redshiftDataClient = new RedshiftDataClient({
    region: config.region,
    userAgentAppId: "coupon-redshift-client",
  });

  const command = new ExecuteStatementCommand({
    ClusterIdentifier: config.clusterIdentifier,
    Sql: "SET enable_result_cache_for_session TO off;",
    SecretArn: config.adminPasswordArn,
    Database: config.database,
    SessionKeepAliveSeconds: 10 * 60, // keep alive session for 10 minutes
  });

  const request = await redshiftDataClient.send(command);
  const sessionId = request.SessionId;
  console.log(`SessionId: ${sessionId}`);

  // sleep for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return sessionId;
}

export async function invokeQuery(
  clusterName: string,
  sessionId: string,
  sql: string
): Promise<{ queryExecutionId: string }> {
  const command = new ExecuteStatementCommand({
    Sql: sql,
    /**
     * Use the session id to execute the query in the same session - with the enable_result_cache_for_session set to off
     */
    SessionId: sessionId,

    // Database: config.database,
    // ClusterIdentifier: config.clusterIdentifier,
    // SecretArn: process.env.COUPON_REDSHIFT_USER_SECRET_ARN,
  });

  const config = getClusterConfig(clusterName);

  const redshiftDataClient = new RedshiftDataClient({
    region: config.region,
    userAgentAppId: "coupon-redshift-client",
  });

  const request = await redshiftDataClient.send(command);
  // console.log("request", request);

  const requestId = request.Id;
  if (!requestId) {
    throw new Error("Failed to execute query");
  }

  return { queryExecutionId: requestId };
}

/**
 * 実行されたクエリからCSV出力先のS3Arnを取得する
 * @param query
 */
async function extractOutputLocation(
  query: string
): Promise<string | undefined> {
  console.log(`Extracting output location from query: ${query}`);
  const regex = /to\s+'(s3:\/\/[^']+)'/i;
  const match = query.match(regex);
  if (match) {
    console.log(`Output location: ${match[1]}`);
    return match[1];
  }
}

/**
 * Redshiftクエリの実行を１回ポーリングする
 */
export async function redshiftStatusPollerOnce(input: {
  sessIonId: string;
  clusterName: string;
  queryExecutionId: string;
}): Promise<{
  queryExecutionId: string;
  hasResultSet?: boolean;
  status: StatusString;
  duration?: number;
  outputLocation?: string;
}> {
  const queryExecutionId = input.queryExecutionId;
  const describeStatementCommandInput: DescribeStatementCommandInput = {
    Id: queryExecutionId,
  };

  const command = new DescribeStatementCommand(describeStatementCommandInput);

  const config = getClusterConfig(input.clusterName);

  const redshiftDataClient = new RedshiftDataClient({
    region: config.region,
    userAgentAppId: "coupon-redshift-client",
  });

  const response = await redshiftDataClient.send(command);

  const status = response.Status;
  const query = response.QueryString;
  if (!status || !query) {
    throw new Error("Failed to get query status");
  }

  let outputLocation: string | undefined;
  // CSVクエリの場合は実行したクエリからS3Arnを取得する
  if (query.toLocaleLowerCase().includes("unload")) {
    outputLocation = await extractOutputLocation(query);
  }

  let duration: number | undefined;
  if (status === "FINISHED") {
    duration = response.Duration;
  }

  return {
    queryExecutionId,
    status: status,
    outputLocation,
    duration,
    hasResultSet: response.HasResultSet,
  };
}

export async function getQueryResult(
  clusterName: string,
  queryExecutionId: string
): Promise<Field[][]> {
  // Lấy kết quả của truy vấn
  const resultCommand = new GetStatementResultCommand({
    Id: queryExecutionId,
  });

  const config = getClusterConfig(clusterName);

  const redshiftDataClient = new RedshiftDataClient({
    region: config.region,
    userAgentAppId: "coupon-redshift-client",
  });

  const result = await redshiftDataClient.send(resultCommand);
  return result.Records;
}

export const executeQuery = async (
  clusterName: string,
  sessionId: string,
  sql: string
): Promise<{
  status: string;
  queryExecutionId: string;
  durationInMs?: number;
  outputLocation?: string;
  result?: Field[][];
}> => {
  const { queryExecutionId } = await invokeQuery(clusterName, sessionId, sql);

  const MAX_TIMEOUT = 1000 * 60 * 5; // 5 minutes
  const BREAK_TIME = 1000 * 3; // 3 seconds

  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > MAX_TIMEOUT) {
      break;
    }

    const { status, outputLocation, duration, hasResultSet } =
      await redshiftStatusPollerOnce({
        queryExecutionId,
        clusterName,
        sessIonId: sessionId,
      });

    // console.log("- status", status);

    if (status === "FINISHED") {
      let result = [];
      if (hasResultSet) {
        result = await getQueryResult(clusterName, queryExecutionId);
      }

      return {
        queryExecutionId,
        status,
        outputLocation,
        result,
        durationInMs: Math.round(duration / 1000000),
      };
    }

    if (status === "FAILED") {
      return {
        queryExecutionId,
        status,
        outputLocation,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, BREAK_TIME));
  }
};
