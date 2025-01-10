import { RedshiftComparatorQueryResult } from "src/storage/dynamo";
import { runQueries, TestCase } from "./runner";
import { getAdjustSqlQueries } from "src/sql";

export const generateCampaignId = () => {
  return `campaign-` + new Date().toISOString();
};

export const runAllQueries = async (
  clusterName: string,
  note: string,
  campaignId?: string
) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const queries = getAdjustSqlQueries();

  // change query to new adjusted query
  console.log(`change query to new adjusted query`);
  testCases.forEach((testCase) => {
    const sqlQuery = queries[testCase.queryAlias];
    if (sqlQuery) {
      testCase.fullSQL = sqlQuery;
    }
  });

  const results = await runQueries({
    clusterName,
    campaignId: campaignId || generateCampaignId(),
    testCases,
    note,
  });
  showReportRunQueries(results);
};

export const runQueriesByPatterns = async (
  clusterName: string,
  patterns: string[],
  note: string,
  campaignId?: string
) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const filteredTestCases = testCases.filter((testCase) =>
    patterns.includes(testCase.queryPattern)
  );

  const results = await runQueries({
    clusterName,
    campaignId: campaignId || generateCampaignId(),
    testCases: filteredTestCases,
    note,
  });

  showReportRunQueries(results);
};

export const runQueriesByQueryAliases = async (
  clusterName: string,
  queryAliases: string[],
  note: string,
  campaignId?: string
) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const filteredTestCases = testCases.filter((testCase) =>
    queryAliases.includes(testCase.queryAlias)
  );

  const results = await runQueries({
    clusterName,
    campaignId: campaignId || generateCampaignId(),
    testCases: filteredTestCases,
    note,
  });
  showReportRunQueries(results);
};

export const showReportRunQueries = async (
  results: RedshiftComparatorQueryResult[]
) => {
  // Total time
  console.log(`🚀 🚀 🚀Report for Campaign ID: ${results[0].campaignId}`);
  if (results[0].note) {
    console.log(`Campaign note: ${results[0].note}`);
  }

  const queryResultCount = results.length;
  if (queryResultCount) {
    console.log(`Number of queries: ${queryResultCount}`);

    const totalDuration = results.reduce(
      (acc, table) => acc + table.durationInMs,
      0
    );
    const averageTime = totalDuration / results.length;

    console.log(`Total duration: ${Math.floor(totalDuration / 1000)}s`);
    console.log(`Average time per query: ${Math.floor(averageTime / 1000)}s`);
  }

  console.table(results, [
    "aliasQuery",
    "status",
    "durationInMs",
    "queryExecutionId",
    "outputLocation",
  ]);
};
