import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

export const TABLE_NAME = process.env.TASKS_TABLE_NAME;
export const USER_ID_INDEX_NAME = process.env.USER_ID_INDEX_NAME || "userId-index";
