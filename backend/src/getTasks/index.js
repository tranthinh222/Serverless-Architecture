import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME, USER_ID_INDEX_NAME } from "../shared/dynamodb.js";
import { success, failure } from "../shared/response.js";
import { getUserId } from "../shared/auth.js";

export async function handler(event) {
  console.log("GetTasksFunction event:", JSON.stringify({
    requestId: event?.requestContext?.requestId,
    route: "GET /tasks"
  }));

  try {
    const userId = getUserId(event);

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: USER_ID_INDEX_NAME,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      },
      ScanIndexForward: false
    }));

    const tasks = result.Items || [];

    tasks.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });

    return success(tasks);
  } catch (error) {
    console.error("GetTasksFunction error:", error);

    if (error.message?.startsWith("Unauthorized")) {
      return failure(401, "Unauthorized");
    }

    return failure(500, "Failed to get tasks");
  }
}
