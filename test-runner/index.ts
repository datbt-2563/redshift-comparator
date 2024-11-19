import { TestSuite } from "storage/test-case/test-case";
import { executeQuery, ExecuteResult } from "./client";
import { getSQLQuery } from "storage/sql-query";

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
        name: `Test ${index + 1}`,
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
  let currentLabel = "A";

  results.forEach((result, index) => {
    const resultString = JSON.stringify(result); // Chuyển object thành chuỗi để so sánh dễ dàng

    // Nếu result đã có trong uniqueMap, sử dụng label đã gán
    if (uniqueMap.has(resultString)) {
      labels[index] = uniqueMap.get(resultString)!;
    } else {
      // Nếu result là duy nhất, gán label mới và lưu vào map
      uniqueMap.set(resultString, currentLabel);
      labels[index] = currentLabel;

      // Tăng ký tự label tiếp theo (A -> B -> C ...)
      currentLabel = String.fromCharCode(currentLabel.charCodeAt(0) + 1);
    }
  });

  return labels;
};

export const assignLabelForQuery = (sqls: string[]): string[] => {
  const labels: string[] = [];
  const uniqueMap = new Map<string, string>();
  let currentLabel = "Q1";

  sqls.forEach((sql, index) => {
    // Nếu sql đã có trong uniqueMap, sử dụng label đã gán
    if (uniqueMap.has(sql)) {
      labels[index] = uniqueMap.get(sql)!;
    } else {
      // Nếu sql là duy nhất, gán label mới và lưu vào map
      uniqueMap.set(sql, currentLabel);
      labels[index] = currentLabel;

      // Tăng ký tự label tiếp theo (Q1 -> Q2 -> Q3 ...)
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

  const sqls = sqlResults.map((result) => result.sql);
  const labelSqls = assignLabelForQuery(sqls);

  const tables = allTestResults.map((result, index) => {
    return {
      name: `Test ${index + 1}`,
      testSuite: result.testSuiteName,
      sql: labelSqls[index],
      resultLabel: labelResults[index],
      cluster: result.clusterName,
      timeInMs: Math.round(result.timeInMs),
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

  // await executeTestSuite(testsuite1, true);
  // await executeTestSuite(testsuite2, true);

  await executeTestSuites([testsuite1, testsuite2], true);
};

execute();
