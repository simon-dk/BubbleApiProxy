import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import type { HttpResponse } from './HttpResponse.js';

export const handleHttpError = (error: unknown, response: HttpResponse) => {
  if (error instanceof ZodError) {
    const err = fromZodError(error);

    return response.status(400).send(err.message);
  }

  return response.status(500).send('Internal Server Error');
};
