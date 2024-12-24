import prompts from "prompts";
import { TestCase } from "src/test-runner/runner";

const fullTestCases = require("src/configuration/test-case.json") as TestCase[];

export const askForNote = async () => {
  const response = await prompts({
    type: "text",
    name: "note",
    message: "Enter a note for this campaign (optional)",
  });

  return response.note;
};

export const askForQueryPatterns = async (): Promise<string[]> => {
  const uniqueQueryPatterns: {
    queryPattern: string;
    queryName: string;
  }[] = [];

  fullTestCases.forEach((testCase) => {
    if (
      !uniqueQueryPatterns.find(
        (pattern) => pattern.queryPattern === testCase.queryPattern
      )
    ) {
      uniqueQueryPatterns.push({
        queryPattern: testCase.queryPattern,
        queryName: testCase.queryName,
      });
    }
  });

  const response = await prompts({
    type: "multiselect",
    name: "queryPatterns",
    message: "Select query patterns",
    choices: uniqueQueryPatterns.map((pattern) => ({
      title: `${pattern.queryPattern} - (${pattern.queryName})`,
      value: pattern.queryPattern,
    })),
  });

  return response.queryPatterns;
};

export const askForQueriesInPattern = async (
  pattern: string
): Promise<string[]> => {
  const response = await prompts({
    type: "multiselect",
    name: "queries",
    message: `Select queries in pattern ${pattern}`,
    choices: fullTestCases
      .filter((testCase) => testCase.queryPattern === pattern)
      .map((testCase) => ({
        title: testCase.queryAlias,
        value: testCase.queryAlias,
      })),
  });

  return response.queries;
};
