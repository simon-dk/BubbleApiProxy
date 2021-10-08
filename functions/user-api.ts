import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import fetch from "node-fetch";

export const getUser: APIGatewayProxyHandlerV2 = async (event, context) => {
  const getUser = await fetch("https://jsonplaceholder.typicode.com/users/1").then((response) =>
    response.json()
  );

  return { statusCode: 200, body: JSON.stringify(getUser) };
};
