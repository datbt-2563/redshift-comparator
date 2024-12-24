import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

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
