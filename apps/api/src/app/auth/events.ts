import { generateMagicLink } from "./magic-links";

export class LoginRequestCode extends Event {
  constructor(
    public data: { email: string; clientCode: string; next?: string },
  ) {
    super("login-request-code");
  }
}

export const handleLoginRequestCode = async (
  data: LoginRequestCode["data"],
) => {
  await generateMagicLink({
    next: data.next || "/",
    email: data.email,
    clientCode: data.clientCode,
  });
};
