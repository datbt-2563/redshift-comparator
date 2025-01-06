import { runQueries, TestCase } from "src/test-runner/runner";

const fs = require("fs");

const getAdjustSqlQueries = (): Record<string, string> => {
  const path = `src/configuration/sql.csv`;
  const content = fs.readFileSync(path, "utf-8");
  const rows = content.split("\n");
  const queries = rows.map((row) => {
    const columns = row.split(",");
    const aliasQuery = columns[0];
    const sqlQuery = row.substring(aliasQuery.length + 1);
    return {
      aliasQuery: `Q${columns[0]}`,
      sqlQuery: sqlQuery,
    };
  });

  let result = {};
  queries
    .filter((query) => query.sqlQuery !== "")
    .forEach((query) => {
      result[query.aliasQuery] = query.sqlQuery;
    });

  return result;
};

const main = async () => {
  const queries = getAdjustSqlQueries();

  let testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];
  // Remove all Q1 to Q4
  const queryPatterns = ["Q1", "Q2", "Q3", "Q4"];
  testCases = testCases.filter(
    (testCase) => !queryPatterns.includes(testCase.queryPattern)
  );

  //   console.log(testCases.length);
  // Replace fullSQL by queries

  testCases.forEach((testCase) => {
    const sqlQuery = queries[testCase.queryAlias];
    if (sqlQuery) {
      testCase.fullSQL = sqlQuery;
    }
  });

  const tables = await runQueries({
    clusterName: "dc2.large_x5nodes",
    campaignId: "compare-sql-2",
    testCases,
  });

  console.log(tables);
};

main();
