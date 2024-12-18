import { QueryStatus } from "@aws-sdk/client-cloudwatch-logs";
import {
  DescribeStatementCommand,
  DescribeStatementCommandInput,
  ExecuteStatementCommand,
  GetStatementResultCommand,
  RedshiftDataClient,
} from "@aws-sdk/client-redshift-data";
import { getClusterConfig } from "src/configuration/redshift-cluster";

// TODO: get information of current cluster by querying system tables

const config = getClusterConfig("dev-cluster");

const redshiftDataClient = new RedshiftDataClient({
  region: config.region,
});

export async function invokeQuery(
  sql: string
): Promise<{ queryExecutionId: string }> {
  console.info("sql", sql);

  const command = new ExecuteStatementCommand({
    ClusterIdentifier: config.clusterIdentifier,
    Database: config.database,
    DbUser: config.dbUser,
    Sql: sql,
  });

  const request = await redshiftDataClient.send(command);

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
  const regexp = /to 's3:\/\/.*'/;
  const matchResult = query.match(regexp);

  // arnが含まれない場合は、処理を終了する
  if (!matchResult) return;

  // arnを取得
  const arn = matchResult[0].replace(/to '/, "").replace(/'/, "");
  const suffix = "000";
  console.log("arn", `${arn}${suffix}`);
  return `${arn}${suffix}`;
}

/**
 * Redshiftクエリの実行を１回ポーリングする
 */
export async function redshiftStatusPollerOnce(input: {
  queryExecutionId: string;
}): Promise<{
  queryExecutionId: string;
  status: string;
  outputLocation?: string;
}> {
  const queryExecutionId = input.queryExecutionId;
  const describeStatementCommandInput: DescribeStatementCommandInput = {
    Id: queryExecutionId,
  };

  const command = new DescribeStatementCommand(describeStatementCommandInput);
  const response = await redshiftDataClient.send(command);

  const status = response.Status;
  const query = response.QueryString;
  if (!status || !query) {
    throw new Error("Failed to get query status");
  }

  // フロント側で扱いやすいように変換する
  let queryStatus: string;
  switch (status) {
    case "FINISHED":
      queryStatus = "SUCCEEDED";
      break;
    case "ABORTED":
      queryStatus = "CANCELLED";
      break;
    case "SUBMITTED":
    case "PICKED":
      queryStatus = "QUEUED";
      break;
    case "STARTED":
      queryStatus = "RUNNING";
      break;
    default:
      queryStatus = status;
  }

  // CSVクエリの場合は実行したクエリからS3Arnを取得する
  const outputLocation = await extractOutputLocation(query);

  return {
    queryExecutionId,
    status: queryStatus,
    outputLocation,
  };
}

export async function getQueryResult(queryExecutionId: string) {
  // Lấy kết quả của truy vấn
  const resultCommand = new GetStatementResultCommand({
    Id: queryExecutionId,
  });

  const result = await redshiftDataClient.send(resultCommand);
  console.log("Query Result:", result.Records);
}
