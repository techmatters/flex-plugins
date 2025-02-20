export class HttpClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
      Object.setPrototypeOf(this, HttpClientError.prototype);
    this.statusCode = statusCode;
    this.name = 'HttpClientError';
  }
}
