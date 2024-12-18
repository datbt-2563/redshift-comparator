import { TestSuite } from "src/storage/test-case/test-case";
import { executeQuery, ExecuteResult } from "./client";
import { getSQLQuery } from "src/storage/sql-query";

export const executeTestSuite = async (
  testsuite: TestSuite,
  isShowReport = false,
  isParallel = false
) => {
  const testResults: ExecuteResult[] = [];

  if (isParallel) {
    const promises = testsuite.map(async (testCase) => {
      const { sqlQueryName, targetCluster } = testCase;
      const sqlQuery = getSQLQuery(sqlQueryName);
      const testResult: ExecuteResult = await executeQuery(
        sqlQuery.query,
        targetCluster
      );
      return testResult;
    });

    testResults.push(...(await Promise.all(promises)));
  } else {
    for (const testCase of testsuite) {
      const { sqlQueryName, targetCluster } = testCase;
      const sqlQuery = getSQLQuery(sqlQueryName);
      const testResult: ExecuteResult = await executeQuery(
        sqlQuery.query,
        targetCluster
      );
      testResults.push(testResult);
    }
  }

  if (isShowReport) {
    const sqlResults = testResults.map((result) => result.result);
    const labels = assignLabelForResults(sqlResults);

    const tables = testResults.map((result, index) => {
      return {
        // name: `Test ${index + 1}`,
        cluster: result.clusterName,
        label: labels[index],
        timeInMs: result.timeInMs,
      };
    });

    console.table(tables);
  }

  return testResults;
};

export type ExecuteTestSuiteResult = ExecuteResult & { testSuiteName: string };

export const assignLabelForResults = (results: any[]): string[] => {
  const labels: string[] = [];
  const uniqueMap = new Map<string, string>();
  let currentLabel = "R1";

  results.forEach((result, index) => {
    const resultStr = JSON.stringify(result);
    if (uniqueMap.has(resultStr)) {
      labels[index] = uniqueMap.get(resultStr)!;
    } else {
      uniqueMap.set(resultStr, currentLabel);
      labels[index] = currentLabel;

      currentLabel = `R${parseInt(currentLabel.slice(1)) + 1}`;
    }
  });

  return labels;
};

export const assignLabelForQuery = (sqls: string[]): string[] => {
  const labels: string[] = [];
  const uniqueMap = new Map<string, string>();
  let currentLabel = "Q1";

  sqls.forEach((sql, index) => {
    if (uniqueMap.has(sql)) {
      labels[index] = uniqueMap.get(sql)!;
    } else {
      uniqueMap.set(sql, currentLabel);
      labels[index] = currentLabel;

      currentLabel = `Q${parseInt(currentLabel.slice(1)) + 1}`;
    }
  });
  return labels;
};

export const executeTestSuites = async (
  testsuites: TestSuite[],
  isShowReport = false
) => {
  const allTestResults: ExecuteTestSuiteResult[] = [];
  for (const testsuite of testsuites) {
    const testSuiteName = `Test suite ${testsuites.indexOf(testsuite) + 1}`;
    const testResults = await executeTestSuite(testsuite, false, true);
    allTestResults.push(
      ...testResults.map((result) => ({ ...result, testSuiteName }))
    );
  }

  // console.log("All test results:");
  // console.log(allTestResults);

  const sqlResults = allTestResults.map((result) => result.result);
  const labelResults = assignLabelForResults(sqlResults);

  const sqls = allTestResults.map((result) => result.sql);
  const labelSqls = assignLabelForQuery(sqls);

  const tables = allTestResults.map((result, index) => {
    return {
      name: `Test ${index + 1}`,
      testSuite: result.testSuiteName,
      cluster: result.clusterName,
      query: sqls[index],
      queryLabel: labelSqls[index],
      result: sqlResults[index],
      resultLabel: labelResults[index],
      timeExecuteInMs: result.timeInMs,
    };
  });

  console.log("Test report:");
  console.table(tables);
};

const execute = async () => {
  const testsuite1: TestSuite = [
    {
      sqlQueryName: "Get 100 first org",
      targetCluster: "cluster1",
    },
    {
      sqlQueryName: "Get 10 first org",
      targetCluster: "cluster2",
    },
  ];

  const testsuite2: TestSuite = [
    {
      sqlQueryName: "Get 10 first org",
      targetCluster: "cluster1",
    },
    {
      sqlQueryName: "Get 100 first org",
      targetCluster: "cluster2",
    },
  ];

  const testsuite3: TestSuite = [
    {
      sqlQueryName: "Get 50 first org",
      targetCluster: "cluster1",
    },
    {
      sqlQueryName: "Get 100 first org",
      targetCluster: "cluster2",
    },
  ];

  const testsuite4: TestSuite = [
    {
      sqlQueryName: "Get 20 first org",
      targetCluster: "cluster1",
    },
    {
      sqlQueryName: "Get 30 first org",
      targetCluster: "cluster2",
    },
  ];

  const testsuite5: TestSuite = [
    {
      sqlQueryName: "Get 30 first org",
      targetCluster: "cluster1",
    },
    {
      sqlQueryName: "Get 50 first org",
      targetCluster: "cluster2",
    },
  ];

  await executeTestSuites(
    [testsuite1, testsuite2, testsuite3, testsuite4, testsuite5],
    true
  );
};

execute();
