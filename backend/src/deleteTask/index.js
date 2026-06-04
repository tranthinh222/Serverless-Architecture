import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../shared/dynamodb.js";
import { success, failure } from "../shared/response.js";
import { getUserId } from "../shared/auth.js";

export async function handler(event) {
  console.log("DeleteTaskFunction event:", JSON.stringify({
    requestId: event?.requestContext?.requestId,
    route: "DELETE /tasks/{id}",
    taskId: event?.pathParameters?.id
  }));

  try {
    const userId = getUserId(event);
    const taskId = event?.pathParameters?.id;

    if (!taskId) {
      return failure(400, "Task id is required");
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { taskId },
      ConditionExpression: "attribute_exists(taskId) AND userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    }));

    return success({ taskId, deleted: true });
  } catch (error) {
    console.error("DeleteTaskFunction error:", error);

    if (error.message?.startsWith("Unauthorized")) {
      return failure(401, "Unauthorized");
    }

    if (error.name === "ConditionalCheckFailedException") {
      return failure(404, "Task not found");
    }

    return failure(500, "Failed to delete task");
  }
}
