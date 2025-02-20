import { PutItemInput } from "@aws-sdk/client-dynamodb";
import * as aws from "aws-sdk";
import * as luxon from "luxon";

// add lib uuid
import { v4 as uuidv4 } from "uuid";

const fs = require("fs");

const tableName = "dev-test-modn-2025-lottery-ModNPriorityQueue-table";

export async function dequeue(limit = 100): Promise<any[]> {
  const param = {
    TableName: tableName,
    IndexName: "modn-queue-index",
    ExpressionAttributeNames: {
      "#inFlight": "inFlight",
    },
    ExpressionAttributeValues: {
      ":yes": 1,
    },
    KeyConditionExpression: "#inFlight = :yes",
    ScanIndexForward: true,
    Limit: limit,
  };
  // console.log("dequeue param", param);

  const dynamo = new aws.DynamoDB.DocumentClient({
    region: "ap-northeast-1",
    apiVersion: "2012-08-10",
    signatureVersion: "v4",
    maxRetries: 3,
    retryDelayOptions: {
      base: 100,
    },
  });

  try {
    const result = await dynamo.query(param).promise();

    if (result.Items!.length) {
      console.log("🎉 Dequeue success", result.Items!.length);
    }

    return result.Items;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
}

export async function enqueue() {
  const userId = `user-${uuidv4()}`;
  const campaignId = "357f9e4c-4d61-46d4-9825-b4d8bff9d758";

  const now = luxon.DateTime.utc().toMillis();

  const param = {
    TableName: tableName,
    Item: {
      id: userId,
      campaignId: campaignId,
      createAt: now,
      updateAt: now,

      inFlight: 1, // this attr is used for GSI
      message: {
        giftTableName: "dev-test-modn-2025-lottery-ModNGift-table",
        giftTypeTableName: "dev-test-modn-2025-lottery-ModNGiftType-table",
      },
      result: {
        campaignId: campaignId,
        lotteryStatus: "IN_PROGRESS",
      },
    },
    ConditionExpression: "attribute_not_exists(id)",
  };

  const dynamo = new aws.DynamoDB.DocumentClient({
    region: "ap-northeast-1",
    apiVersion: "2012-08-10",
    signatureVersion: "v4",
    maxRetries: 3,
    retryDelayOptions: {
      base: 100,
    },
  });

  try {
    await dynamo.put(param).promise();
  } catch (e: any) {
    console.error(e);
    throw e;
  }
}

async function queryDynamoDB(): Promise<{
  isSuccess: boolean;
  timeInMs: number;
}> {
  const startTs = new Date().getTime();
  try {
    // Execute the command
    const result = await enqueue();
    return {
      isSuccess: true,
      timeInMs: new Date().getTime() - startTs,
    };
  } catch (error) {
    console.error("❌ Error query data:", error);
    return {
      isSuccess: false,
      timeInMs: new Date().getTime() - startTs,
    };
  }
}

async function doProcesses(numberProcesses = 10) {
  const N = numberProcesses || 10;

  let numberFailed = 0;
  let maxTime = 0;
  let maxTimeSuccess = 0;
  let maxTimeFailed = 0;
  let timeInMsArr = [];
  const promises = Array.from({ length: N }, async (_, i) => {
    const result = await queryDynamoDB();

    timeInMsArr.push(result.timeInMs);

    if (!result.isSuccess) {
      numberFailed++;
    }

    if (result.timeInMs > maxTime) {
      maxTime = result.timeInMs;
    }

    if (result.isSuccess) {
      if (result.timeInMs > maxTimeSuccess) {
        maxTimeSuccess = result.timeInMs;
      }
    } else {
      if (result.timeInMs > maxTimeFailed) {
        maxTimeFailed = result.timeInMs;
      }
    }
  });

  await Promise.all(promises);

  console.log(`Number of failed: ${numberFailed}`);
  console.log(`Max time: ${maxTime} ms`);

  return {
    numberFailed,
    maxTime,
    maxTimeSuccess,
    maxTimeFailed,
    timeInMsArr,
  };
}

async function attack() {
  const ts = new Date().getTime();
  // Create log folder if not exist
  if (!fs.existsSync(`log/${ts}`)) {
    fs.mkdirSync(`log/${ts}`);
  }

  let time = 0;
  let numberProcesses = 200;
  const increaseProcesses = 100;
  while (true) {
    time++;

    console.log(`⏰ Time: ${time}, Number of processes: ${numberProcesses}`);
    const {
      numberFailed,
      maxTime,
      maxTimeSuccess,
      maxTimeFailed,
      timeInMsArr,
    } = await doProcesses(numberProcesses);

    // sort timeInMsArr desc
    timeInMsArr.sort((a, b) => b - a);
    // write to JSON file
    const content = {
      numberFailed,
      maxTime,
      maxTimeSuccess,
      maxTimeFailed,
      timeInMsArr,
    };

    fs.writeFileSync(
      `log/${ts}/attack-dynamodb-time-${time}.json`,
      JSON.stringify(content)
    );

    // console.log(`- Log saved to log/${ts}/attack-dynamodb-time-${time}.json`);
    console.log(`Max time: ${maxTime} ms, Number of failed: ${numberFailed}`);

    if (maxTime > 5000) {
      console.warn("⚠️ Potential attack detected!");
    }
    numberProcesses += increaseProcesses;
  }
}

// dequeue();
// queryDynamoDB();
// doProcesses();
// enqueue();

attack();
