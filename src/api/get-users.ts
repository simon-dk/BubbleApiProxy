import { HttpResponse } from '../common/http/HttpResponse.js';
import { handleHttpError } from '../common/http/handleHttpError.js';
import { User } from '../models/User.js';

export const handler = async () => {
  const response = new HttpResponse();

  try {
    const url = new URL(`https://jsonplaceholder.typicode.com/users`);
    const getUsersResponse = await fetch(url);

    if (!getUsersResponse.ok) {
      return response.status(404).send();
    }

    const users: User[] = await getUsersResponse.json();

    return response.status(200).send(users);
  } catch (error) {
    return handleHttpError(error, response);
  }
};
