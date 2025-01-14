import prompts from "prompts";
import { getRecordsByCampaignId } from "src/storage/dynamo";

const campaignIds = [
  // "dc2.large_x2nodes_run_3",
  // "dc2.large_x3nodes_run_2",
  // "combine_dc2.large_x4nodes_run_2",
  // "combine_dc2.large_x5nodes_run_2",
  "campaign-2025-01-14T08:09:29.070Z",
];

const analyzeStat = async (campaignId: string) => {
  const records = await getRecordsByCampaignId(campaignId);

  let totalTime = 0;
  let peakResponseTime = 0;
  records.forEach((record) => {
    totalTime += record.durationInMs;
    if (record.durationInMs > peakResponseTime) {
      peakResponseTime = Math.max(peakResponseTime, record.durationInMs);
    }
  });

  const avgTime = Math.floor((totalTime / records.length) * 100) / 100; // in ms

  console.log(`campaignId: ${campaignId}`);
  console.log(`totalTime: ${totalTime} ms`);
  console.log(`peakResponseTime: ${peakResponseTime} ms`);
  console.log(`avgTime: ${avgTime} ms\n`);
};

const main = async () => {
  for (const campaignId of campaignIds) {
    await analyzeStat(campaignId);
  }
};

main();
