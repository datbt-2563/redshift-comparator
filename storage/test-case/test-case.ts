export interface TestCase {
  sqlQueryName: string;
  targetCluster: string;
}
export type TestSuite = TestCase[];

export interface BuildTestSuiteConfig {
  sqlQueryNames: string[];
  targetClusters: string[];
}

export const buildTestsuite = (config: BuildTestSuiteConfig): TestSuite[] => {
  const testSuites: TestSuite[] = [];

  config.sqlQueryNames.forEach((sqlQueryName) => {
    const testSuite: TestSuite = [];
    config.targetClusters.forEach((targetCluster) => {
      testSuite.push({ sqlQueryName, targetCluster });
    });
    testSuites.push(testSuite);
  });
  return testSuites;
};
