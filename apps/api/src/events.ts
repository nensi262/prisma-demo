import { LoginRequestCode, handleLoginRequestCode } from "./app/auth/events";

export const events = {
  "login-request-code": {
    event: LoginRequestCode,
    handler: handleLoginRequestCode,
  },
};
