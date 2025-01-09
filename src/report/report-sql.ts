import prompts from "prompts";
import { compare2FilesInS3 } from "src/comparator";
import { getRecordsByCampaignId } from "src/storage/dynamo";

const getPairGroupName = (aliasQuery: string) => {
  const countUnderScore = aliasQuery.split("_").length - 1;
  if (countUnderScore > 1) {
    return aliasQuery.slice(0, -2);
  }
  return aliasQuery;
};

const main = async () => {
  const records = await getRecordsByCampaignId("full-compare-sql-3rd");
  // console.log(records);

  // group by query alias
  // _2

  const pairGroups: Record<string, any[]> = {};

  for (const record of records) {
    const pairGroupName = getPairGroupName(record.aliasQuery);
    if (!pairGroups[pairGroupName]) {
      pairGroups[pairGroupName] = [];
    }
    pairGroups[pairGroupName].push(record);
  }

  let targetGroupNames = [
    // "Q5_1",
    // "Q5_2",
    // "Q5_8",
    // "Q6_7",
    "Q6_8",
    // "Q7_3",
    // "Q7_9",
    // "Q7_10",
    // "Q8_1",
    // "Q8_2",
    // "Q8_3",
    // "Q8_5",
    // "Q8_9",
    "Q9_2",
    "Q9_4",
    // "Q9_8",
    // "Q10_4",
    // "Q10_5",
    // "Q10_6",
    // "Q10_7",
  ];

  let match = 0;
  let notMatch = 0;
  let notMatchGroupNames: string[] = [];

  for (const pairGroup of Object.values(pairGroups)) {
    const first = pairGroup[0];
    const second = pairGroup[1];

    const pairGroupName = getPairGroupName(first.aliasQuery);
    console.log(`pairGroupName: ${pairGroupName}`);

    if (!targetGroupNames.includes(pairGroupName)) {
      continue;
    }

    const isUnloadQuery = !!first.outputLocation;

    if (isUnloadQuery) {
      const firstPath = first.outputLocation;
      const secondPath = second.outputLocation;

      const isSame = await compare2FilesInS3(firstPath, secondPath);
      if (!isSame) {
        // prompt to continue
        const response = await prompts({
          type: "confirm",
          name: "value",
          message: "Do you want to continue?",
          initial: true,
        });

        if (!response.value) {
          break;
        }
      }
    } else {
      const firstContent = first.result;
      const secondContent = second.result;

      const isSame = firstContent === secondContent;
      if (!isSame) {
        console.log(`pairGroupName: ${pairGroupName}`);
        console.log(`🐝 first: \n${firstContent}`);
        console.log(`🐝 second: \n${secondContent}`);

        // prompt to continue
        const response = await prompts({
          type: "confirm",
          name: "value",
          message: "Do you want to continue?",
          initial: true,
        });

        if (!response.value) {
          break;
        }
      }
    }
  }

  console.log(`match: ${match}`);
  console.log(`notMatch: ${notMatch}`);
  console.log(notMatchGroupNames);
};

main();
