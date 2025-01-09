import prompts from "prompts";
import { getAdjustSqlQueries } from "src/sql";
import { RedshiftComparatorQueryResult } from "src/storage/dynamo";
import { generateCampaignId, runAllQueries } from "src/test-runner";
import {
  askForClusterName,
  askForNote,
  askForQueriesInPattern,
  askForQueryPatterns,
} from "src/test-runner/prompt";
import { runQueries, TestCase } from "src/test-runner/runner";

export const runAliasQueryAndCompare = async (
  aliases: string[],
  note: string,
  campaignId?: string
) => {
  const clusterName = "dc2.large_x5nodes";

  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const filteredTestCases = testCases.filter((testCase) =>
    aliases.includes(testCase.queryAlias)
  );

  const baseCampaignId = `dc2.large_x5nodes_run_3`;

  const results = await runQueries({
    clusterName,
    campaignId: campaignId || generateCampaignId(),
    testCases: filteredTestCases,
    note,
  });

  const compareResult = (
    baseResult: {
      campaignId: string;
      aliasQuery: string;
      clusterName: string;
      status: string;
      durationInMs: number;
      createdAt: string;
    },
    newResult: RedshiftComparatorQueryResult
  ) => {
    if (baseResult.status !== newResult.status) {
      throw new Error(
        `Status mismatch: ${baseResult.status} !== ${newResult.status}`
      );
    }
    if (baseResult.clusterName !== newResult.clusterName) {
      throw new Error(
        `Cluster name mismatch: ${baseResult.clusterName} !== ${newResult.clusterName}`
      );
    }

    const baseMs = baseResult.durationInMs;
    const newMs = newResult.durationInMs;

    if (baseMs === newMs) {
      console.log(`${baseResult.aliasQuery}: SAME`);
    } else if (newMs < baseMs) {
      console.log(
        `${baseResult.aliasQuery}: FASTER: ${Math.floor(
          ((baseMs - newMs) / baseMs) * 100
        )} %`
      );
    } else {
      console.log(
        `${baseResult.aliasQuery}: SLOWER: ${Math.floor(
          ((newMs - baseMs) / baseMs) * 100
        )} %`
      );
    }
  };

  for (const alias of aliases) {
    const baseResult = await getBaseResult(baseCampaignId, alias);

    const result = results.find((result) => result.aliasQuery === alias);
    if (!result) {
      throw new Error(`Result not found: ${alias}`);
    }

    compareResult(baseResult, result);
  }
};

export const getBaseResult = async (
  campaignId: string,
  aliasQuery: string
): Promise<{
  campaignId: string;
  aliasQuery: string;
  clusterName: string;
  status: string;
  durationInMs: number;
  createdAt: string;
}> => {
  const pathBaseResult = `./target_campaign/${campaignId}.csv`;
  // read from csv file
  const fs = require("fs");

  const content = await fs.promises.readFile(pathBaseResult, "utf-8");

  //   const HEADER =
  //     "campaignId,aliasQuery,clusterName,status,durationInMs,createdAt";

  const rows: {
    campaignId: string;
    aliasQuery: string;
    clusterName: string;
    status: string;
    durationInMs: number;
    createdAt: string;
  }[] = [];
  const lines = content.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(",");
    if (columns.length !== 6) {
      throw new Error(`Invalid CSV format: ${line}`);
    }
    rows.push({
      campaignId: columns[0],
      aliasQuery: columns[1],
      clusterName: columns[2],
      status: columns[3],
      durationInMs: parseInt(columns[4]),
      createdAt: columns[5],
    });
  }

  const targetRow = rows.find(
    (row) => row.campaignId === campaignId && row.aliasQuery === aliasQuery
  );

  if (!targetRow) {
    throw new Error(`Result not found: ${campaignId}, ${aliasQuery}`);
  }

  return targetRow;
};

export const compareAllQueries = async (note: string, campaignId?: string) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];
  const aliases = testCases.map((testCase) => testCase.queryAlias);

  const results = await runAliasQueryAndCompare(aliases, note, campaignId);
};

export const compareQueriesByPatterns = async (
  patterns: string[],
  note: string,
  campaignId?: string
) => {
  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  const filteredTestCases = testCases.filter((testCase) =>
    patterns.includes(testCase.queryPattern)
  );
  const aliases = filteredTestCases.map((testCase) => testCase.queryAlias);

  const results = await runAliasQueryAndCompare(aliases, note, campaignId);
};

export const compareQueriesByQueryAliases = async (
  queryAliases: string[],
  note: string,
  campaignId?: string
) => {
  const results = await runAliasQueryAndCompare(queryAliases, note, campaignId);
};

const showMenu = async () => {
  const choices = [
    {
      title: "Compare the result of queries",
      value: "compare-the-result-of-queries",
    },
    {
      title: "Full compare All Queries (1 planning + 3 test)",
      value: "full-compare-all-queries",
    },
    {
      title: "Compare All Queries",
      value: "compare-all-queries",
    },
    {
      title: "Compare Queries by Patterns",
      value: "compare-queries-by-patterns",
    },
    {
      title: "Compare Selected Queries in Pattern",
      value: "compare-selected-queries-in-pattern",
    },
    {
      title: "Exit",
      value: "exit",
    },
  ];
  const response = await prompts({
    type: "select",
    name: "value",
    message: "Choose an action",
    choices,
  });

  const { value } = response;

  switch (value) {
    case "compare-the-result-of-queries":
      await compareTheResultOfQueries();
      break;

    case "full-compare-all-queries":
      console.log("Full compare All Queries (1 planning + 3 test)...");
      const _note = await askForNote();
      const extraNotes = ["test planning", "1st", "2nd", "3rd"];
      for (let i = 0; i < 4; i++) {
        const _fullNote = `${_note} - ${extraNotes[i]}`;
        console.log(`Note: ${_fullNote}`);
        await compareAllQueries(_fullNote);
        // sleep 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      break;

    case "compare-all-queries":
      console.log("Comparing all queries...");
      const note = await askForNote();
      await compareAllQueries(note);
      break;
    case "compare-queries-by-patterns":
      console.log("Comparing queries by patterns...");
      const queryPatterns = await askForQueryPatterns();
      console.log(queryPatterns);
      const note2 = await askForNote();
      await compareQueriesByPatterns(queryPatterns, note2);
      break;
    case "compare-selected-queries-in-pattern":
      console.log("Comparing selected queries in pattern...");
      const queryPatterns2 = await askForQueryPatterns();
      const queryAliases: string[] = [];
      for (const pattern of queryPatterns2) {
        const aliases = await askForQueriesInPattern(pattern);
        queryAliases.push(...aliases);
      }
      const note3 = await askForNote();
      await compareQueriesByQueryAliases(queryAliases, note3);
      break;
    case "exit":
      console.log("Exiting...");
      break;
  }
};

const compareTheResultOfQueries = async () => {
  const queries = getAdjustSqlQueries();

  let testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];
  // Remove all Q1 to Q4
  const queryPatterns = ["Q1", "Q2", "Q3", "Q4"];
  testCases = testCases.filter(
    (testCase) => !queryPatterns.includes(testCase.queryPattern)
  );

  const targetGroupNames = [
    "Q5_1",
    "Q5_2",
    "Q5_8",
    "Q6_7",
    "Q6_8",
    "Q7_3",
    "Q7_9",
    "Q7_10",
    "Q8_1",
    "Q8_2",
    "Q8_3",
    "Q8_5",
    "Q8_9",
    "Q9_2",
    "Q9_4",
    "Q9_8",
    // "Q10_4",
    // "Q10_5",
    // "Q10_6",
    // "Q10_7",
  ];

  let matched = 0;
  let unmatched = 0;

  const getPairGroupName = (aliasQuery: string) => {
    const countUnderScore = aliasQuery.split("_").length - 1;
    if (countUnderScore > 1) {
      return aliasQuery.slice(0, -2);
    }
    return aliasQuery;
  };

  for (const tc of testCases) {
    const sqlQuery = queries[tc.queryAlias];

    const pairGroupName = getPairGroupName(tc.queryAlias);
    if (!targetGroupNames.includes(pairGroupName)) {
      continue;
    }

    console.log(`pairGroupName: ${pairGroupName}`);

    if (sqlQuery) {
      const isUnloadQuery = sqlQuery.toLocaleLowerCase().includes("unload");
      // if (isUnloadQuery) continue;

      console.log(`Comparing ${tc.queryAlias}`);
      console.log(`testCase.fullSQL`, tc.fullSQL);

      const tc2 = Object.assign({}, tc);
      tc2.fullSQL = sqlQuery;
      tc2.queryAlias = tc.queryAlias + "_2";

      console.log(`testcase2.fullSQL`, tc2.fullSQL);

      console.log(`confirm sql is different`);
      const isSame = tc.fullSQL === tc2.fullSQL;

      if (isSame) {
        console.log(`❌ SQL is the same`);

        continue;
      }

      const results = await runQueries({
        clusterName: "dc2.large_x5nodes",
        campaignId: "full-compare-sql-3rd",
        testCases: [tc, tc2],
      });

      const result1 = results[0];
      const result2 = results[1];

      if (isUnloadQuery) {
        const file1 = result1.outputLocation;
        const file2 = result2.outputLocation;

        console.log(`file1`, file1);
        console.log(`file2`, file2);

        const isSame = await compare2FilesInS3(file1, file2);
        if (isSame) {
          console.log(`✅ Result match`);
          matched++;
        } else {
          console.log(`❌ Result mismatch`);
          unmatched++;
        }
      } else {
        if (result1.result?.toString() === result2.result?.toString()) {
          console.log(`✅ Result match`);
          matched++;
        } else {
          console.log(`result1.result`, result1.result);
          console.log(`result2.result`, result2.result);

          console.log(`❌ Result mismatch`);

          unmatched++;
        }
      }
    }
  }

  console.log(`Matched: ${matched}`);
  console.log(`Unmatched: ${unmatched}`);
};

export const compare2FilesInS3 = async (
  filePath1: string,
  filePath2: string
): Promise<boolean> => {
  // s3://dev-redshift-comparator/campaign-2024-12-26T12:32:33.776Z/Q6_2/
  const AWS = require("aws-sdk");
  const s3 = new AWS.S3();

  const params1 = {
    Bucket: "dev-redshift-comparator",
    Key: filePath1.replace("s3://dev-redshift-comparator/", "") + "000",
  };

  const params2 = {
    Bucket: "dev-redshift-comparator",
    Key: filePath2.replace("s3://dev-redshift-comparator/", "") + "000",
  };

  const data1 = await s3.getObject(params1).promise();

  const data2 = await s3.getObject(params2).promise();

  const content1 = data1.Body.toString();
  const content2 = data2.Body.toString();

  console.log(`content1\n`, content1);
  console.log(`content2\n`, content2);

  const isSame = content1 === content2;

  if (isSame) {
    console.log(`✅ Result match`);
    return true;
  } else {
    // Check order of rows
    const rows1 = content1.split("\n");
    const rows2 = content2.split("\n");

    if (rows1.length !== rows2.length) {
      console.log(`❌ Row count mismatch`);
      return false;
    }

    const row1IgnoresFirstCol = [];
    const row2IgnoresFirstCol = [];

    for (let i = 0; i < rows1.length; i++) {
      const rowData = rows1[i].split(",");
      const rowData2 = rows2[i].split(",");

      row1IgnoresFirstCol.push(rowData.slice(1).join(","));
      row2IgnoresFirstCol.push(rowData2.slice(1).join(","));
    }

    // sort row1IgnoresFirstCol theo alphabe
    row1IgnoresFirstCol.sort();
    row2IgnoresFirstCol.sort();

    const isSameOrder =
      row1IgnoresFirstCol.join(",") === row2IgnoresFirstCol.join(",");

    console.log(`row1IgnoresFirstCol\n`, row1IgnoresFirstCol.join(","));
    console.log(`row2IgnoresFirstCol\n`, row2IgnoresFirstCol.join(","));

    if (isSameOrder) {
      console.log(`✅ Result match`);
      return true;
    }

    return false;
  }
};

const main = async () => {
  await showMenu();
};

// main();
