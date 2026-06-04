export function buildResponse(statusCode, body) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

export function success(data, statusCode = 200) {
  return buildResponse(statusCode, {
    success: true,
    data
  });
}

export function failure(statusCode, message, details = undefined) {
  const error = { message };

  if (details) {
    error.details = details;
  }

  return buildResponse(statusCode, {
    success: false,
    error
  });
}
