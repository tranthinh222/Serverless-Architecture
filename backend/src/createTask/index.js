import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { docClient, TABLE_NAME } from "../shared/dynamodb.js";
import { success, failure } from "../shared/response.js";
import { getUserId } from "../shared/auth.js";
import { parseJsonBody, validateCreateTask, sanitizeCreateInput } from "../shared/validation.js";

export async function handler(event) {
  console.log("CreateTaskFunction event:", JSON.stringify({
    requestId: event?.requestContext?.requestId,
    route: "POST /tasks"
  }));

  try {
    const userId = getUserId(event);
    const body = parseJsonBody(event);

    validateCreateTask(body);

    const input = sanitizeCreateInput(body);
    const now = new Date().toISOString();

    const task = {
      taskId: randomUUID(),
      userId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
      status: input.status,
      createdAt: now
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: task,
      ConditionExpression: "attribute_not_exists(taskId)"
    }));

    return success(task, 201);
  } catch (error) {
    console.error("CreateTaskFunction error:", error);

    if (error.message?.startsWith("Unauthorized")) {
      return failure(401, "Unauthorized");
    }

    if (error.name === "ValidationError") {
      return failure(error.statusCode || 400, error.message, error.details);
    }

    return failure(500, "Failed to create task");
  }
}
