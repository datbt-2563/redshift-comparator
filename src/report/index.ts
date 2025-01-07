import fs from "fs";
import { getClusterNames } from "src/configuration/redshift-cluster";
import { getRecordsByCampaignId } from "src/storage/dynamo";
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
  return [
    "dc2.large_x5nodes_run_1",
    "dc2.large_x5nodes_run_2",
    "dc2.large_x5nodes_run_3",
    "campaign-2024-12-26T11:45:23.226Z",
    "campaign-2024-12-26T12:32:33.776Z",
    "campaign-2024-12-30T07:32:54.784Z",
    "campaign-2024-12-30T09:35:22.782Z",
    "campaign-2024-12-30T11:07:52.516Z",
    "campaign-2024-12-30T11:59:31.657Z",
    "campaign-2025-01-01T11:31:50.802Z",
    "campaign-2025-01-01T12:45:31.968Z",
    "campaign-2025-01-01T14:00:02.690Z",
  ];
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
  // const campaignIds = await getCampaignIds();
  const campaignIds = ["full-compare-sql"];

  // console.log(campaignIds);

  // for (const campaignId of campaignIds) {
  //   const records = await getRecordsByCampaignId(campaignId);
  //   const filePath = `./target_campaign/${campaignId}.csv`;
  //   const csv = [
  //     "campaignId,aliasQuery,clusterName,status,durationInMs,createdAt",
  //     ...records.map((record) => {
  //       return [
  //         record.campaignId,
  //         record.aliasQuery,
  //         record.clusterName,
  //         record.status,
  //         record.durationInMs,
  //         record.createdAt,
  //       ].join(",");
  //     }),
  //   ].join("\n");
  //   fs.writeFileSync(filePath, csv);
  //   console.log(`Write to ${filePath}`);
  // }

  // return;

  // getRecordsByCampaignId

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
  fs.writeFileSync("./report2.csv", csv);
};

main();
