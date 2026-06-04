const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_STATUSES = ["pending", "done"];

export function parseJsonBody(event) {
  if (!event.body) {
    throw createValidationError("Request body is required");
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw createValidationError("Request body must be valid JSON");
  }
}

export function validateCreateTask(input) {
  const errors = [];

  if (!input.title || typeof input.title !== "string" || input.title.trim().length === 0) {
    errors.push("title is required");
  }

  if (!VALID_PRIORITIES.includes(input.priority)) {
    errors.push("priority must be low, medium, or high");
  }

  if (input.status !== undefined && !VALID_STATUSES.includes(input.status)) {
    errors.push("status must be pending or done");
  }

  if (errors.length > 0) {
    throw createValidationError("Validation failed", errors);
  }
}

export function validateUpdateTask(input) {
  const errors = [];

  if (input.title !== undefined) {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      errors.push("title must not be empty");
    }
  }

  if (input.priority !== undefined && !VALID_PRIORITIES.includes(input.priority)) {
    errors.push("priority must be low, medium, or high");
  }

  if (input.status !== undefined && !VALID_STATUSES.includes(input.status)) {
    errors.push("status must be pending or done");
  }

  if (errors.length > 0) {
    throw createValidationError("Validation failed", errors);
  }
}

export function createValidationError(message, details = undefined) {
  const error = new Error(message);
  error.name = "ValidationError";
  error.statusCode = 400;
  error.details = details;
  return error;
}

export function sanitizeCreateInput(input) {
  return {
    title: input.title.trim(),
    description: typeof input.description === "string" ? input.description.trim() : "",
    priority: input.priority,
    dueDate: typeof input.dueDate === "string" ? input.dueDate : null,
    status: input.status || "pending"
  };
}

export function sanitizeUpdateInput(input) {
  const output = {};

  if (input.title !== undefined) output.title = input.title.trim();
  if (input.description !== undefined) output.description = String(input.description).trim();
  if (input.priority !== undefined) output.priority = input.priority;
  if (input.dueDate !== undefined) output.dueDate = input.dueDate || null;
  if (input.status !== undefined) output.status = input.status;

  return output;
}
