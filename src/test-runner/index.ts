import { executeQuery } from "./client";
import fs from "fs";
import dotenv from "dotenv";
import {
  RedshiftComparatorQueryResult,
  saveToDynamoDB,
} from "src/storage/dynamo";
dotenv.config();

interface TestCase {
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

const startNewCampaign = async (note?: string) => {
  const campaignId = new Date().toISOString();
  console.log("Starting new campaign:", campaignId);

  // Get data from ./configuration/test-case.json
  const testCases = require("../configuration/test-case.json") as TestCase[];

  // console.log(testCases);
  const tables: RedshiftComparatorQueryResult[] = [];

  for (const testCase of testCases) {
    console.log(`Executing ${testCase.queryAlias}...`);
    // Replace \" with "
    testCase.fullSQL = testCase.fullSQL.replace(/\\"/g, '"').trim();
    // console.log("Executing SQL:", testCase.fullSQL);

    // if SQL contain "UNLOAD", skip

    if (testCase.fullSQL.toLocaleLowerCase().includes("unload")) {
      console.log("Skip UNLOAD query");
      continue;
    }

    const result = await executeQuery(testCase.fullSQL);
    // console.log(`Done`);
    console.log(result.durationInMs);
    // console.log(result.result);
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

    // sleep 1s
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // console.log(tables);

  // Write to a file
  // fs.writeFileSync("tables.json", JSON.stringify(tables, null, 2));

  // Total time
  const totalDuration = tables.reduce(
    (acc, table) => acc + table.durationInMs,
    0
  );
  console.log("Total duration:", totalDuration);
  const averageTime = totalDuration / tables.length;
  console.log("Average time:", averageTime);
};

const main = async () => {
  await startNewCampaign("test third times");
};

main();
