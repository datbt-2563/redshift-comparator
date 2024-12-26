import prompts from "prompts";
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

const main = async () => {
  await showMenu();
};

main();
