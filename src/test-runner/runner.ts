import { executeQuery, setNoCacheForSession } from "./client";
import dotenv from "dotenv";
import {
  RedshiftComparatorQueryResult,
  saveToDynamoDB,
} from "src/storage/dynamo";
dotenv.config();

export interface TestCase {
  no: string;
  queryPattern: string;
  queryName: string;
  lambdaFunctionName: string;
  sourceCodeFunctionName: string;
  queryAlias: string;
  fullSQL: string;
  shortSQL: string;
  count: string;
}

const _log = (msg) => {
  const time = `${new Date().toLocaleTimeString()}`;
  console.log(`${time}: ${msg}`);
};

export const runQueries = async (config: {
  campaignId: string;
  testCases: TestCase[];
  note?: string;
}): Promise<RedshiftComparatorQueryResult[]> => {
  const { campaignId, note, testCases } = config;

  const numberOfTestCases = testCases.length;
  _log(`Starting new campaign: ${campaignId}`);
  _log(`Number of queries: ${numberOfTestCases}`);

  _log(`Setting no-cache for session`);
  await setNoCacheForSession();
  _log("No-cache set");

  const tables: RedshiftComparatorQueryResult[] = [];

  let i = 0;
  for (const testCase of testCases) {
    i++;
    _log(`Executing query ${i}/${numberOfTestCases}: ${testCase.queryAlias}`);

    testCase.fullSQL = testCase.fullSQL.replace(/\\"/g, '"').trim();

    const isUnloadQuery = testCase.fullSQL
      .toLocaleLowerCase()
      .includes("unload");

    if (isUnloadQuery) {
      testCase.fullSQL = transformUnloadQuery(
        testCase.fullSQL,
        campaignId,
        testCase.queryAlias
      );
    }

    const result = await executeQuery(testCase.fullSQL);
    _log(`Status: ${result.status} - Duration: ${result.durationInMs} ms`);

    const record = {
      campaignId,
      queryExecutionId: result.queryExecutionId,
      status: result.status,
      aliasQuery: testCase.queryAlias,
      ...(result.result?.length
        ? {
            result: JSON.stringify(result.result),
          }
        : {}),
      durationInMs: result.durationInMs,
      // cluster: process.env.CLUSTER_NAME,
      outputLocation: result.outputLocation,
      note,
    };

    await saveToDynamoDB(record);
    tables.push(record);

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  _log("All queries executed");
  return tables;
};

/**
 * This function is used to transform the UNLOAD query to change the S3 path and IAM role
 * @param sql
 * @param campaignId
 * @param queryAlias
 */
export const transformUnloadQuery = (
  sql: string,
  campaignId: string,
  queryAlias: string
): string => {
  const regexpS3Path =
    /s3:\/\/prd-coupon-redshift-bucket-ap-northeast-1-856562439801\/[a-f0-9\-]+\//g;
  const regexpIamRole = /arn:aws:iam::856562439801:role\/[a-z0-9-]+/g;

  const newS3Path = `${process.env.REDSHIFT_CLUSTER_S3_BUCKET_NAME}/${campaignId}/${queryAlias}/`;
  const newIamRole = process.env.REDSHIFT_CLUSTER_IAM_ROLE_ARN;

  return sql
    .replace(regexpS3Path, newS3Path)
    .replace(regexpIamRole, newIamRole);
};
