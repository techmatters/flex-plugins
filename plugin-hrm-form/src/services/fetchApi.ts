export class ApiError extends Error {
  constructor(message: string, options: { response: Response; body: any }, errorOptions?: ErrorOptions) {
    super(message, errorOptions);

    // see: https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ApiError.prototype);

    this.name = 'ApiError';
    this.response = options.response;
    this.body = options.body;
  }

  response: Response;

  body: any;
}

/**
 * Low level fetch wrapper to provide some sensible defaults & rudimentary error handling
 * You would normally wrap this rather than calling it directly, see fetchProtectedApi & fetchHrmApi
 * @param baseUrl
 * @param endpointPath
 * @param token
 * @param options
 */
export const fetchApi = async (baseUrl: URL, endpointPath: string, options: RequestInit): Promise<any> => {
  const url = new URL(`${baseUrl.pathname}${endpointPath}`, baseUrl);

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url.toString(), finalOptions);

  if (!response.ok) {
    let body;
    try {
      body = await response.json();
    } catch (err) {
      body = await response.text();
    }
    throw new ApiError(`Error response: ${response.status} (${response.statusText})`, { response, body });
  }

  return response.json() as Promise<any>;
};
