import { QueryStatus } from "@aws-sdk/client-cloudwatch-logs";
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
    Sql: sql,
    SecretArn: process.env.COUPON_REDSHIFT_USER_SECRET_ARN,
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
  status: StatusString;
  duration?: number;
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

  let outputLocation: string | undefined;
  // CSVクエリの場合は実行したクエリからS3Arnを取得する
  if (query.includes("UNLOAD")) {
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
  };
}

export async function getQueryResult(
  queryExecutionId: string
): Promise<Field[][]> {
  // Lấy kết quả của truy vấn
  const resultCommand = new GetStatementResultCommand({
    Id: queryExecutionId,
  });

  const result = await redshiftDataClient.send(resultCommand);
  return result.Records;
}

export const executeQuery = async (
  sql: string
): Promise<{
  status: string;
  durationInMs?: number;
  outputLocation?: string;
  result?: Field[][];
}> => {
  const { queryExecutionId } = await invokeQuery(sql);

  const MAX_TIMEOUT = 1000 * 60 * 5; // 5 minutes
  const BREAK_TIME = 1000 * 3; // 3 seconds

  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > MAX_TIMEOUT) {
      break;
    }

    const { status, outputLocation, duration } = await redshiftStatusPollerOnce(
      {
        queryExecutionId,
      }
    );

    console.log("- status", status);

    if (status === "FINISHED") {
      const result = await getQueryResult(queryExecutionId);
      return {
        status,
        outputLocation,
        result: result,
        durationInMs: Math.round(duration / 1000000),
      };
    }

    if (status === "FAILED") {
      return {
        status,
        outputLocation,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, BREAK_TIME));
  }
};
