// Import AWS SDK
import {
  CloudWatchLogsClient,
  DescribeLogStreamsCommand,
  FilterLogEventsCommand,
  GetLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import * as fs from "fs";

// Configure AWS SDK
const REGION = "ap-northeast-1";
// const LOG_GROUP_NAME =
//   "/aws/lambda/prd-coupon-invokeCouponUsageAggregateCsvUrl-function";

// 1. invokeCouponUsageAggregateJsonFn: lambda.Function;

//   2. invokeCouponUsageAggregateCsvUrlFn: lambda.Function;

//   3. invokeCouponUsageLogJsonFn: lambda.Function;
//   4. invokeCouponUsageLogCsvUrlFn: lambda.Function;

//   invokeCouponDisplayAggregateJsonFn: lambda.Function;
//   invokeCouponDisplayAggregateCsvUrlFn: lambda.Function;
//   invokeCouponDisplayLogJsonFn: lambda.Function;
//   invokeCouponDisplayLogCsvUrlFn: lambda.Function;

const logGroupNames = [
  // "/aws/lambda/prd-coupon-invokeCouponUsageAggregateJsonFn",
  // "/aws/lambda/prd-coupon-invokeCouponUsageAggregateCsvUrlFn",
  // "/aws/lambda/prd-coupon-invokeCouponDisplayAggregateJson-function",
  // "/aws/lambda/prd-coupon-invokeCouponDisplayAggregateCsvUrl-function",
  // "/aws/lambda/prd-coupon-InvokeCouponUsageLogCsvUrl-function",
  // "/aws/lambda/prd-coupon-InvokeCouponDisplayLogCsvUrl-function",

  "/aws/lambda/prd-coupon-InvokeCouponDisplayLog-function",
  "/aws/lambda/prd-coupon-InvokeCouponUsageLog-function",
];

const START_TIME = new Date("2023-01-01T00:00:00Z").getTime();
const END_TIME = new Date().getTime();
const PATTERN = "sql ";

const client = new CloudWatchLogsClient({ region: REGION });

async function fetchLogs(logGroupName: string) {
  const fileName = logGroupName.split("/").pop();
  const OUTPUT_FILE = `./logs/${fileName}.json`;

  let nextToken: string | undefined = undefined;
  let allLogs: {
    order: number;
    timestamp: number;
    message: string;
  }[] = [];

  let order = 0;

  try {
    do {
      console.log(`Fetching logs... - order: ${order}`);
      const filterCommand = new FilterLogEventsCommand({
        logGroupName: logGroupName,
        startTime: START_TIME,
        endTime: END_TIME,
        filterPattern: PATTERN,
        nextToken,
      });

      const filterResponse = await client.send(filterCommand);

      if (filterResponse.events && filterResponse.events.length > 0) {
        const logMessages = filterResponse.events.map((event) => {
          return {
            order: order++,
            timestamp: event.timestamp,
            message: event.message,
          };
        });
        allLogs.push(...logMessages);
      }

      nextToken = filterResponse.nextToken;
    } while (nextToken);

    if (allLogs.length > 0) {
      // fs.writeFileSync(OUTPUT_FILE, allLogs.join("\n"));
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allLogs, null, 2));
      console.log(`Logs saved to ${OUTPUT_FILE}`);
    } else {
      console.log("No matching logs found.");
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
}

const main = async () => {
  for (const logGroupName of logGroupNames) {
    console.log(`Fetching logs for ${logGroupName}`);
    await fetchLogs(logGroupName);
  }
};

main();
