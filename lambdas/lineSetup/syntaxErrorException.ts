/**
 * Copyright (C) 2021-2025 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

class SyntaxErrorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyntaxErrorException';
  }

  // Default instanceof was not working to check if err was an instance of SyntaxErrorException
  public static instanceOf(err: unknown): err is SyntaxErrorException {
    return err instanceof Error && err.name === this.name;
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
  };
}

export default SyntaxErrorException;
