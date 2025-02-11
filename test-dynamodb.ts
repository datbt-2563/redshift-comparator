import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

async function putDataToDynamoDB(): Promise<{
  isSuccess: boolean;
  timeInMs: number;
}> {
  const dynamoDBClient = new DynamoDBClient({
    region: "ap-northeast-1",
  });

  // Prepare DynamoDB PutItemCommand
  const command = new PutItemCommand({
    TableName: "dev-redshift-comparator-query-result",
    Item: {
      campaignId: { S: "dc2.large_x2nodes_run_test" },
      queryExecutionId: { S: randomUUID() },
      clusterName: { S: "dc2.large" },
      note: { S: "This is a test for DynamoDB capacity" },
    },
  });

  const startTs = new Date().getTime();
  try {
    // Execute the command
    const response = await dynamoDBClient.send(command);
    return {
      isSuccess: true,
      timeInMs: new Date().getTime() - startTs,
    };
  } catch (error) {
    console.error("❌ Error saving data:", error);
    return {
      isSuccess: false,
      timeInMs: new Date().getTime() - startTs,
    };
  }
}

async function doProcesses() {
  const N = 1000;

  let numberFailed = 0;
  let maxTime = 0;
  const promises = Array.from({ length: N }, async (_, i) => {
    const result = await putDataToDynamoDB();
    if (!result.isSuccess) {
      numberFailed++;
    }

    if (result.timeInMs > maxTime) {
      maxTime = result.timeInMs;
    }
  });

  await Promise.all(promises);

  console.log(`Number of failed: ${numberFailed}`);
  console.log(`Max time: ${maxTime} ms`);

  return {
    numberFailed,
    maxTime,
  };
}

async function attack() {
  let time = 0;
  while (true) {
    time++;
    console.log(`⏰ Time: ${time}`);
    const { numberFailed, maxTime } = await doProcesses();

    if (numberFailed > 0) {
      console.log("🔥 Attack detected!");
      console.log(`Number of failed: ${numberFailed}`);
      console.log(`Max time: ${maxTime} ms`);
      break;
    }

    if (maxTime > 10000) {
      console.log("🔥 Attack detected!");
      console.log(`Number of failed: ${numberFailed}`);
      console.log(`Max time: ${maxTime} ms`);
      break;
    }

    if (maxTime > 5000) {
      console.warn("⚠️ Potential attack detected!");
    } else {
      console.log("🌟 Everything is fine");
    }
  }
}

attack();
