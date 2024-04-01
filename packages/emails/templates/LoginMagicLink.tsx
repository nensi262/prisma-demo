import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import tailwind from "tailwind-config/tailwind.config";
import React from "react";

export const LoginMagicLink = ({
  magicLink = "https://moove.house",
  code = 643782,
}: {
  magicLink: string;
  code: number;
}) => {
  return (
    <Tailwind
      config={{
        theme: tailwind.theme,
      }}
    >
      <Html>
        <Head />
        <Preview>Your Moove login code is {code.toString()}</Preview>
        <Body style={main}>
          <Container className="my-0 mx-auto pt-5 px-10">
            <Img
              src="https://moove-brand-assets.s3.eu-west-2.amazonaws.com/logos/Blue%20Keys%20Transparent%401x.png"
              className="h-8 pb-4"
            />
            <Heading className="text-3xl font-bold">
              Here&apos;s your Moove login link
            </Heading>
            <Text style={paragraph}>
              Hello there! You requested to login to Moove with this email.
            </Text>
            <Section className="pt-5 pb-10">
              <Button
                className="px-6 py-3 bg-primary text-white font-medium text-lg rounded-md"
                href={magicLink}
              >
                Login to Moove
              </Button>
            </Section>
            <Text style={paragraph}>
              If the link doesn&apos;t work, you can use the code below instead:
            </Text>

            <Text className="font-bold bg-gray-100 tracking-widest text-2xl px-2 py-1.5 rounded-md w-max">
              {code}
            </Text>
            <Hr className="border-gray-100 mt-8 mb-6" />
            <Link
              href="https://www.moove.house"
              className="text-gray-400 text-sm"
            >
              Moove
            </Link>
            <Text className="text-gray-400 text-sm">
              You&apos;re recieving this account-related email because you
              requested a login link using this email address. If you
              didn&apos;t request this email, please ignore it.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default LoginMagicLink;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};
