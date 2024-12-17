import {
  ExecuteStatementCommand,
  RedshiftDataClient,
} from "@aws-sdk/client-redshift-data";
import { getClusterConfig } from "src/configuration/redshift-cluster";

const config = { region: Region };
const redshiftDataClient = new RedshiftDataClient(config);

export async function invokeQuery(sql: string): Promise<InvokeQueryResult> {
  console.info("sql", sql);

  const input = {
    Database: COUPON_REDSHIFT_DATABASE_NAME,
    ClusterIdentifier: COUPON_REDSHIFT_CLUSTER_ID,
    Sql: sql,
    SecretArn: COUPON_REDSHIFT_USER_SECRET_ARN,
  };
  const command = new ExecuteStatementCommand(input);
  const request = await redshiftDataClient.send(command);

  const requestId = request.Id;
  if (!requestId) {
    throw new CouponUsageUnknownError(new Error("requestId is empty"));
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
}): Promise<QueryStatus> {
  const queryExecutionId = input.queryExecutionId;
  const describeStatementCommandInput: DescribeStatementCommandInput = {
    Id: queryExecutionId,
  };

  const command = new DescribeStatementCommand(describeStatementCommandInput);
  const response = await redshiftDataClient.send(command);

  const status = response.Status;
  const query = response.QueryString;
  if (!status || !query) {
    throw new CouponUsageUnknownError(new Error(response.Error));
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

/**
 * SQL 実行のメタ情報を返します
 * @param queryExecutionId
 */
export async function redshiftSqlResult(
  queryExecutionId: string
): Promise<GetStatementResultCommandOutput> {
  // 現状件数を指定して取得する方法がないため、とりあえず全件取得する実装
  const getStatementResultCommandInput: GetStatementResultCommandInput = {
    Id: queryExecutionId,
  };
  const command = new GetStatementResultCommand(getStatementResultCommandInput);

  return await redshiftDataClient.send(command);
}
