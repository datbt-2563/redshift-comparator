import { queryConfig, QueryConfig } from "get-logs/config";
import * as fs from "fs";
import {
  analyzeLog,
  AnalyzingLogResult,
  FullAnalyzingResult,
} from "../../../analyze-log";
import { log } from "console";
import { escapeCSVField, getLambdaNameFromJsonPath } from "get-logs/helper";

const analyzeQuery = (
  config: QueryConfig
): {
  logResults: AnalyzingLogResult[];
  matchCount: number;
  total: number;
  filePath: string;
  firstMatchTimestamp?: number;
  lastMatchTimestamp?: number;
  firstNotMatchTimestamp?: number;
  lastNotMatchTimestamp?: number;
} => {
  const logs = JSON.parse(fs.readFileSync(config.jsonPath, "utf-8"));
  let csv = "no,timestamp,shortSQL,fullSQL\n";
  let no = 1;
  let matchCount = 0;

  let firstMatchTimestamp = 0;
  let lastMatchTimestamp = 0;
  let firstNotMatchTimestamp = 0;
  let lastNotMatchTimestamp = 0;

  const logResults: AnalyzingLogResult[] = [];

  for (let i = 0; i < logs.length; i++) {
    const { isMatch, timestamp, shortSQL, fullSQL } = analyzeLog(
      logs[i],
      config.match
    );

    logResults.push({
      timestamp,
      shortSQL,
      fullSQL,
      isMatch,
    });

    if (isMatch) {
      csv += `${no},${timestamp},${escapeCSVField(shortSQL)},${escapeCSVField(
        fullSQL
      )}\n`;
      no++;
      matchCount++;

      if (firstMatchTimestamp === 0) {
        firstMatchTimestamp = timestamp;
        lastMatchTimestamp = timestamp;
      } else {
        firstMatchTimestamp = Math.min(firstMatchTimestamp, timestamp);
        lastMatchTimestamp = Math.max(lastMatchTimestamp, timestamp);
      }
    } else {
      if (firstNotMatchTimestamp === 0) {
        firstNotMatchTimestamp = timestamp;
        lastNotMatchTimestamp = timestamp;
      } else {
        firstNotMatchTimestamp = Math.min(firstNotMatchTimestamp, timestamp);
        lastNotMatchTimestamp = Math.max(lastNotMatchTimestamp, timestamp);
      }
    }
  }

  console.log(`Match count: ${matchCount} / ${logs.length}`);
  const filePath = `logs/data/${config.alias}.csv`;

  fs.writeFileSync(filePath, csv);

  return {
    logResults,
    matchCount,
    total: logs.length,
    filePath,
    firstMatchTimestamp,
    lastMatchTimestamp,
    firstNotMatchTimestamp,
    lastNotMatchTimestamp,
  };
};

const main = async () => {
  const result: {
    alias: string;
    name: string;
    jsonPath: string;
    lambdaName: string;
    functionName: string;
    matchCount: number;
    total: number;
    filePath: string;
    proportion: number;
    firstMatchTimestamp?: string;
    lastMatchTimestamp?: string;
    firstNotMatchTimestamp?: string;
    lastNotMatchTimestamp?: string;
  }[] = [];

  // const rowCsv = "no,timestamp,shortSQL,fullSQL\n";

  const fullLogs: FullAnalyzingResult[] = [];

  for (const config of queryConfig) {
    console.log(`Analyzing ${config.alias}`);
    const res = analyzeQuery(config);

    res.logResults.forEach((log) => {
      fullLogs.push({
        ...log,
        queryConfig: config,
      });
    });

    result.push({
      alias: config.alias,
      name: config.name,
      lambdaName: getLambdaNameFromJsonPath(config.jsonPath),
      jsonPath: config.jsonPath,
      functionName: config.functionName,
      matchCount: res.matchCount,
      total: res.total,
      proportion: Math.round((res.matchCount / res.total) * 100),
      firstMatchTimestamp: new Date(res.firstMatchTimestamp).toISOString(),

      lastMatchTimestamp: new Date(res.lastMatchTimestamp).toISOString(),
      firstNotMatchTimestamp: new Date(
        res.firstNotMatchTimestamp
      ).toISOString(),
      lastNotMatchTimestamp: new Date(res.lastNotMatchTimestamp).toISOString(),
      filePath: res.filePath,
    });
  }

  console.log("Results:");
  console.table(result);

  // Write result to a csv file

  const overviewResultFilePath = "logs/data/overview.csv";
  let order = 1;
  let resultCsv =
    "no,alias,name,lambdaName,functionName,matchCount,total,proportion,firstMatchTimestamp,lastMatchTimestamp,firstNotMatchTimestamp,lastNotMatchTimestamp,filePath\n";
  result.forEach((res) => {
    resultCsv += `${order},${res.alias},${res.name},${res.lambdaName},${res.functionName},${res.matchCount},${res.total},${res.proportion}%,${res.firstMatchTimestamp},${res.lastMatchTimestamp},${res.firstNotMatchTimestamp},${res.lastNotMatchTimestamp},${res.filePath}\n`;
    order++;
  });

  fs.writeFileSync(overviewResultFilePath, resultCsv);

  //  Write full logs to a file
  const fullLogsFilePath = "logs/data/full-logs.csv";
  let no = 1;

  let fullLogsCsv =
    "no,alias,name,lambda,functionName,isMatching,timestamp,shortSQL,fullSQL\n";
  fullLogs.forEach((log) => {
    fullLogsCsv += `${no},${log.queryConfig.alias},${
      log.queryConfig.name
    },${getLambdaNameFromJsonPath(log.queryConfig.jsonPath)},${
      log.queryConfig.functionName
    },${log.isMatch ? 1 : 0},${new Date(
      log.timestamp
    ).toISOString()},${escapeCSVField(log.shortSQL)},${escapeCSVField(
      log.fullSQL
    )}\n`;
    no++;
  });

  fs.writeFileSync(fullLogsFilePath, fullLogsCsv);
};

main();
