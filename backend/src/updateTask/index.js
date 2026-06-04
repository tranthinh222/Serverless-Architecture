import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../shared/dynamodb.js";
import { success, failure } from "../shared/response.js";
import { getUserId } from "../shared/auth.js";
import { parseJsonBody, validateUpdateTask, sanitizeUpdateInput } from "../shared/validation.js";

export async function handler(event) {
  console.log("UpdateTaskFunction event:", JSON.stringify({
    requestId: event?.requestContext?.requestId,
    route: "PUT /tasks/{id}",
    taskId: event?.pathParameters?.id
  }));

  try {
    const userId = getUserId(event);
    const taskId = event?.pathParameters?.id;

    if (!taskId) {
      return failure(400, "Task id is required");
    }

    const body = parseJsonBody(event);
    validateUpdateTask(body);

    const input = sanitizeUpdateInput(body);
    const updateFields = {
      ...input,
      updatedAt: new Date().toISOString()
    };

    const expressionNames = {};
    const expressionValues = { ":userId": userId };
    const setExpressions = [];

    for (const [key, value] of Object.entries(updateFields)) {
      expressionNames[`#${key}`] = key;
      expressionValues[`:${key}`] = value;
      setExpressions.push(`#${key} = :${key}`);
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { taskId },
      UpdateExpression: `SET ${setExpressions.join(", ")}`,
      ConditionExpression: "attribute_exists(taskId) AND userId = :userId",
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: "ALL_NEW"
    }));

    return success(result.Attributes);
  } catch (error) {
    console.error("UpdateTaskFunction error:", error);

    if (error.message?.startsWith("Unauthorized")) {
      return failure(401, "Unauthorized");
    }

    if (error.name === "ValidationError") {
      return failure(error.statusCode || 400, error.message, error.details);
    }

    if (error.name === "ConditionalCheckFailedException") {
      return failure(404, "Task not found");
    }

    return failure(500, "Failed to update task");
  }
}
