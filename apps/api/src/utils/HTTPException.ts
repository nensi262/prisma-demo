const errors = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  418: "I'm a teapot",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

export class HTTPException extends Error {
  status: number;
  message: string;
  isServer: boolean;

  constructor(status: keyof typeof errors, message?: string) {
    super(message);
    this.status = status;
    this.message = message || errors[status];
    this.isServer = status >= 500;
  }
}
