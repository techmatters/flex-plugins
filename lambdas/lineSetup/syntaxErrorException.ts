class SyntaxErrorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyntaxErrorException';
  }

  // Default instanceof was not working to check if err was an instance of SyntaxErrorException
  public static instanceOf(err: unknown): err is SyntaxErrorException {
    if(err instanceof Error && err.name === this.name) return true;
    return false;
  }

  // Using arrow function here to automatically bind "this"
  syntaxErrorResponse = () => {
    const body = {
      success: false,
      type: this.name,
      message: this.message,
    };

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
  }
};

export default SyntaxErrorException;