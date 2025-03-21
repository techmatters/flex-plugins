import { ZodError } from 'zod';

class InvalidInputPayloadException extends Error {
  zodError: ZodError;

  constructor(zodError: ZodError) {
    super();
    this.zodError = zodError;
    this.name = 'InvalidInputPayloadException';
  }

  // Default instanceof was not working to check if err was an instance of InvalidInputPayloadException
  public static instanceOf(err: unknown): err is InvalidInputPayloadException {
    if(err instanceof Error && err.name === this.name) return true;
    return false;
  }

  // Using arrow function here to automatically bind "this"
  invalidInputPayloadResponse = () => {
    const body = {
      success: false,
      type: this.name,
      fieldErrors: this.zodError.flatten().fieldErrors,
    };

    return {
      statusCode: 422,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
  }
};

export default InvalidInputPayloadException;