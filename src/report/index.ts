import fs from "fs";
import { getClusterNames } from "src/configuration/redshift-cluster";
import { TestCase } from "src/test-runner/runner";

interface CampaignData {
  campaignId: string;
  aliasQuery: string;
  clusterName: string;
  status: string;
  durationInMs: number;
  createdAt: Date;
}

const getCampaignIds = async () => {
  const clusterNames = await getClusterNames();
  const campaignIds = [];
  clusterNames.forEach((clusterName) => {
    for (let i = 0; i < 3; i++) {
      const campaignId = `${clusterName}_run_${i + 1}`;
      campaignIds.push(campaignId);
    }
  });
  return campaignIds;
};

const getCampaignDataFromCsv = async (
  campaignId: string
): Promise<CampaignData[]> => {
  const filePath = `./target_campaign/${campaignId}.csv`;
  // campaignId,aliasQuery,clusterName,status,durationInMs,createdAt
  const csv = fs.readFileSync(filePath, "utf8");

  const rows = csv.split("\n").slice(1);
  const campaignData: CampaignData[] = rows.map((row) => {
    const [
      campaignId,
      aliasQuery,
      clusterName,
      status,
      durationInMs,
      createdAt,
    ] = row.split(",");
    return {
      campaignId: campaignId,
      aliasQuery: aliasQuery,
      clusterName: clusterName,
      status: status,
      durationInMs: parseInt(durationInMs),
      createdAt: new Date(createdAt),
    };
  });

  return campaignData;
};

const main = async () => {
  const campaignIds = await getCampaignIds();
  console.log(campaignIds);

  const report: Record<string, Record<string, CampaignData>> = {};
  for (const campaignId of campaignIds) {
    const campaignData = await getCampaignDataFromCsv(campaignId);
    campaignData.forEach((data) => {
      // Do something with data
      const alias = data.aliasQuery;
      const _campaignId = data.campaignId;

      if (report[alias] === undefined) {
        report[alias] = {};
      }
      report[alias][_campaignId] = data;
    });
  }

  console.log(report);

  // Write report to file CSV

  let headers = ["aliasQuery", ...campaignIds];

  const fullTestCases =
    require("src/configuration/test-case.json") as TestCase[];

  const aliases = fullTestCases.map((testCase) => testCase.queryAlias);

  const rows = [];
  aliases.forEach((alias) => {
    const row = [alias];
    campaignIds.forEach((campaignId) => {
      const data = report[alias][campaignId];
      if (data) {
        row.push(data.durationInMs.toString());
      } else {
        row.push("N/A");
        console.log(`No data for ${alias} - ${campaignId}`);
      }
    });
    rows.push(row.join(","));
  });

  const csv = [headers.join(","), ...rows].join("\n");
  fs.writeFileSync("./report.csv", csv);
};

main();
