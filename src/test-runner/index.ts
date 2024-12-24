import { RedshiftComparatorQueryResult } from "src/storage/dynamo";
import { runQueries, TestCase } from "./runner";

export const runAllQueries = async (clusterName: string, note: string) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const results = await runQueries({
    clusterName,
    campaignId: new Date().toISOString(),
    testCases,
    note,
  });
  showReportRunQueries(results);
};

export const runQueriesByPatterns = async (
  clusterName: string,
  patterns: string[],
  note: string
) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const filteredTestCases = testCases.filter((testCase) =>
    patterns.includes(testCase.queryPattern)
  );

  const results = await runQueries({
    clusterName,
    campaignId: new Date().toISOString(),
    testCases: filteredTestCases,
    note,
  });

  showReportRunQueries(results);
};

export const runQueriesByQueryAliases = async (
  clusterName: string,
  queryAliases: string[],
  note: string
) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const filteredTestCases = testCases.filter((testCase) =>
    queryAliases.includes(testCase.queryAlias)
  );

  const results = await runQueries({
    clusterName,
    campaignId: `campaign-` + new Date().toISOString(),
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
