export function getUserId(event) {
  const claims = event?.requestContext?.authorizer?.claims;

  if (!claims) {
    throw new Error("Unauthorized: missing Cognito claims");
  }

  return claims.sub || claims.username || claims["cognito:username"];
}
