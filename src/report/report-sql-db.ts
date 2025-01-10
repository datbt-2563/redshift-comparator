import prompts from "prompts";
import { compare2FilesInS3 } from "src/comparator";
import { getRecordsByCampaignId } from "src/storage/dynamo";
import { TestCase } from "src/test-runner/runner";

const main = async () => {
  const recordsBase = await getRecordsByCampaignId("dc2.large_x5nodes_run_3");
  const records = await getRecordsByCampaignId(
    // "campaign-2025-01-10T02:02:19.274Z"
    "full-compare-sql-5th"
  );
  // const records = await getRecordsByCampaignId("full-compare-sql-4th");
  // const records = await getRecordsByCampaignId("full-compare-sql");

  const testCases: TestCase[] =
    require("../configuration/test-case.json") as TestCase[];

  let match = 0;
  let notMatch = 0;
  let notMatchGroupNames: string[] = [];

  for (const testCase of testCases) {
    const queryAlias = testCase.queryAlias;

    // check if the queryAlias is in the records and the recordsBase
    const isExistInRecords = records.some(
      (record) => record.aliasQuery === queryAlias
    );
    const isExistInRecordsBase = recordsBase.some(
      (record) => record.aliasQuery === queryAlias
    );

    if (isExistInRecords && isExistInRecordsBase) {
      const first = recordsBase.find(
        (record) => record.aliasQuery === queryAlias
      );
      const second = records.find((record) => record.aliasQuery === queryAlias);

      const isUnloadQuery = !!first.outputLocation;

      if (isUnloadQuery) {
        const firstPath = first.outputLocation;
        const secondPath = second.outputLocation;

        const isSame = await compare2FilesInS3(firstPath, secondPath);
        if (isSame) {
          match++;
        } else {
          notMatch++;
          notMatchGroupNames.push(queryAlias);
        }
        // if (!isSame) {
        //   // prompt to continue
        //   const response = await prompts({
        //     type: "confirm",
        //     name: "value",
        //     message: "Do you want to continue?",
        //     initial: true,
        //   });

        //   if (!response.value) {
        //     break;
        //   }
        // }
      } else {
        const firstContent = first.result;
        const secondContent = second.result;

        const isSame = firstContent === secondContent;
        if (isSame) {
          match++;
        } else {
          notMatch++;
          notMatchGroupNames.push(queryAlias);
        }
        // if (!isSame) {
        //   console.log(`pairGroupName: ${first.aliasQuery}`);
        //   console.log(`🐝 first: \n${firstContent}`);
        //   console.log(`🐝 second: \n${secondContent}`);

        //   // prompt to continue
        //   const response = await prompts({
        //     type: "confirm",
        //     name: "value",
        //     message: "Do you want to continue?",
        //     initial: true,
        //   });

        //   if (!response.value) {
        //     break;
        //   }
        // }
      }
    } else {
      console.log(`skip: ${queryAlias}`);
    }
  }

  console.log(`match: ${match}`);
  console.log(`notMatch: ${notMatch}`);
  console.log(notMatchGroupNames);
};

main();
