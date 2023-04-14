import { httpResponseCodes } from './httpResponseCodes.js';

export type StatusCodes = keyof typeof httpResponseCodes;

export class HttpResponse {
  public statusCode: StatusCodes;

  public body?: string | number | boolean;

  public headers?: { 'Content-Type': string };

  constructor(statusCode: StatusCodes = 200) {
    this.statusCode = statusCode;
  }

  public status(statusCode: StatusCodes) {
    this.statusCode = statusCode;
    return this;
  }

  public send(body?: unknown) {
    if (!body) {
      this.body = httpResponseCodes[this.statusCode];
      return this;
    }

    if (
      // eslint-disable-next-line operator-linebreak
      typeof body === 'string' ||
      // eslint-disable-next-line operator-linebreak
      typeof body === 'number' ||
      typeof body === 'boolean'
    ) {
      this.body = body;
      this.headers = { 'Content-Type': 'text/plain' };
    }

    if (body == null) {
      this.headers = { 'Content-Type': 'text/plain' };
      this.body = '';
    }

    if (typeof body === 'object' && body != null) {
      this.headers = { 'Content-Type': 'application/json' };
      this.json(body);
    }

    return this;
  }

  private json(body: object) {
    try {
      this.body = JSON.stringify(body);
    } catch (error) {
      this.statusCode = 500;
      this.headers = { 'Content-Type': 'text/plain' };
      this.body = httpResponseCodes[this.statusCode];
    }
  }
}
