import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';

import { HttpResponse } from '../common/http/HttpResponse.js';
import { handleHttpError } from '../common/http/handleHttpError.js';
import { User } from '../models/User.js';

const getUserParameters = z.object({
  userId: z.string().transform(Number),
});

export const handler = async (event: APIGatewayProxyEventV2) => {
  const response = new HttpResponse();

  try {
    const { userId } = getUserParameters.parse(event.pathParameters);

    const url = new URL(`https://jsonplaceholder.typicode.com/users/${userId}`);
    const getUserResponse = await fetch(url);

    if (!getUserResponse.ok) {
      return response.status(404).send('User not found');
    }

    const user: User = await getUserResponse.json();

    return response.status(200).send(user);
  } catch (error) {
    return handleHttpError(error, response);
  }
};
