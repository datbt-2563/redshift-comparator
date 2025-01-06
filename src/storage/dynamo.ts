import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import fs from "fs";

// Initialize DynamoDB client
const dynamoDBClient = new DynamoDBClient({ region: "ap-northeast-1" });

export interface RedshiftComparatorQueryResult {
  campaignId: string;
  clusterName: string;
  sessionId: string;
  queryExecutionId: string;
  status: string;
  aliasQuery: string;
  sql: string;
  result?: string;
  durationInMs?: number;
  cluster?: string;
  outputLocation?: string;
  note?: string;
}

// Function to save data to DynamoDB
export async function saveToDynamoDB(data: RedshiftComparatorQueryResult) {
  try {
    // Define current timestamp
    const timestamp = new Date().toISOString();

    // Prepare DynamoDB PutItemCommand
    const command = new PutItemCommand({
      TableName: "dev-redshift-comparator-query-result",
      Item: {
        campaignId: { S: data.campaignId || "" },
        clusterName: { S: data.clusterName || "" },
        sessionId: { S: data.sessionId || "" },
        queryExecutionId: { S: data.queryExecutionId || "" },
        sql: { S: data.sql || "" },
        aliasQuery: { S: data.aliasQuery || "" },
        status: { S: data.status || "" },
        result: { S: data.result || "" },
        durationInMs: { N: data.durationInMs?.toString() || "0" },
        cluster: { S: data.cluster || "" },
        outputLocation: { S: data.outputLocation || "" },
        note: { S: data.note || "" },
        createdAt: { S: timestamp },
        updatedAt: { S: timestamp },
      },
    });

    // Execute the command
    const response = await dynamoDBClient.send(command);
    // console.log("✅ Data saved to DynamoDB");
    return response;
  } catch (error) {
    console.error("❌ Error saving data:", error);
    throw new Error("Failed to save data to DynamoDB");
  }
}

export const getRecordsByCampaignId = async (
  campaignId: string
): Promise<
  {
    campaignId: string;
    clusterName: string;
    sessionId: string;
    queryExecutionId: string;
    status: string;
    aliasQuery: string;
    sql: string;
    result: string;
    durationInMs: number;
    outputLocation: string;
    note: string;
    createdAt: string;
  }[]
> => {
  const path = `campaign/${campaignId}.json`;

  // check if file exist
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
  }

  try {
    let items = [];
    let lastEvaluatedKey = undefined;

    do {
      const response = await dynamoDBClient.send(
        new ScanCommand({
          TableName: "dev-redshift-comparator-query-result",
          FilterExpression: "campaignId = :campaignId",
          ExpressionAttributeValues: {
            ":campaignId": { S: campaignId },
          },
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      items = items.concat(response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    items = items.map((item) => {
      return {
        campaignId: item.campaignId.S,
        clusterName: item.clusterName.S,
        sessionId: item.sessionId.S,
        queryExecutionId: item.queryExecutionId.S,
        sql: item.sql.S,
        aliasQuery: item.aliasQuery.S,
        status: item.status.S,
        result: item.result.S,
        durationInMs: parseInt(item.durationInMs.N),
        outputLocation: item.outputLocation.S,
        note: item.note.S,
        createdAt: item.createdAt.S,
      };
    });

    fs.writeFileSync(path, JSON.stringify(items, null, 2));
    return items;
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    throw new Error("Failed to fetch data from DynamoDB");
  }
};

export const scanCampaignsInformation = async () => {
  const path = "campaigns.json";

  try {
    let items = [];
    let campaigns: {
      campaignId: string;
      count: number;
      note: string;
      createdAt: string;
    }[] = [];

    let lastEvaluatedKey = undefined;

    do {
      const response = await dynamoDBClient.send(
        new ScanCommand({
          TableName: "dev-redshift-comparator-query-result",
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      items = items.concat(response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    items = items.map((item) => {
      return {
        campaignId: item.campaignId.S,
        clusterName: item.clusterName.S,
        sessionId: item.sessionId.S,
        queryExecutionId: item.queryExecutionId.S,
        sql: item.sql.S,
        aliasQuery: item.aliasQuery.S,
        status: item.status.S,
        result: item.result.S,
        durationInMs: parseInt(item.durationInMs.N),
        outputLocation: item.outputLocation.S,
        note: item.note.S,
        createdAt: item.createdAt.S,
      };
    });

    const campaignIds = new Set(items.map((item) => item.campaignId));

    for (const campaignId of campaignIds) {
      const count = items.filter(
        (item) => item.campaignId === campaignId
      ).length;
      const note = items.find((item) => item.campaignId === campaignId).note;
      const createdAt = items.find(
        (item) => item.campaignId === campaignId
      ).createdAt;

      campaigns.push({
        campaignId,
        count,
        note,
        createdAt,
      });
    }

    console.log(campaigns);

    fs.writeFileSync(path, JSON.stringify(campaigns, null, 2));
    return items;
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    throw new Error("Failed to fetch data from DynamoDB");
  }
};
