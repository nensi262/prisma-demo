import { ZodError } from "zod";

export class HTTPError extends Error {
  status: number;
  issues: ZodError["issues"] | null;
  message: string;

  constructor({
    status,
    message,
    issues,
  }: {
    status: number;
    message: string;
    issues?: ZodError["issues"];
  }) {
    super(message);
    this.message = message;
    this.issues = issues || [];
    this.status = status;
  }
}
