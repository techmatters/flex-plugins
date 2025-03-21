class ResourceAlreadyExistsException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceAlreadyExistsException';
  }

  // Default instanceof was not working to check if err was an instance of ResourceAlreadyExistsException
  public static instanceOf(err: unknown): err is ResourceAlreadyExistsException {
    if(err instanceof Error && err.name === this.name) return true;
    return false;
  }

  // Using arrow function here to automatically bind "this"
  resourceAlreadyExistsResponse = () => {
    const body = {
      success: false,
      type: this.name,
      message: this.message,
    };

    return {
      statusCode: 409,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
  }
};

export default ResourceAlreadyExistsException;