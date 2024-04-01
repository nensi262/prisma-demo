import Input from "@/components/forms/Input";
import Head from "next/head";
import { useState } from "react";
import Button from "ui/forms/Button";
import TextArea from "ui/forms/TextArea";
import { ZodError, z } from "zod";

const fields = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(fields);
  const [errors, setErrors] = useState<ZodError | null>();
  const [submissionStatus, setSubmissionStatus] = useState<
    "error" | "success" | "loading" | null
  >(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setErrors(null);
    setSubmissionStatus("loading");

    const body = await z
      .object({
        name: z.string().min(1, "Please enter your name"),
        email: z.string().email(),
        phone: z.string().optional(),
        message: z.string().min(1, "Please enter a message"),
      })
      .parseAsync(form)
      .catch((e: ZodError) => {
        setErrors(e);
      });

    if (!body) return setSubmissionStatus(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setSubmissionStatus("error");
      return;
    }

    setForm(fields);
    setSubmissionStatus("success");
  };

  return (
    <>
      <div className="w-full">
        <Head>
          <title>Contact | Moove</title>
          <meta
            name="description"
            content="Get in touch with Moove. We are always happy to hear from you."
          />
        </Head>
        <div className="max-w-7xl mx-auto pt-44 pb-16 px-6">
          <span className="uppercase text-sm text-primary font-bold tracking-wider">
            Let&apos;s Connect
          </span>
          <h1 className="text-5xl font-bold mt-2">Get in touch</h1>
          <p className="mt-4 max-w-xl font-medium">
            We&apos;re always happy to hear from you.
          </p>
        </div>
        <div className="max-w-7xl mx-auto pt-5 pb-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <div className="flex flex-col space-y-5">
            <Input
              label="Your name"
              value={form.name}
              error={errors?.errors?.find((e) => e.path[0] == "name")?.message}
              name="name"
              onChange={handleChange}
            />
            <div className="flex flex-wrap gap-x-5">
              <Input
                label="Email"
                name="email"
                value={form.email}
                error={
                  errors?.errors?.find((e) => e.path[0] == "email")?.message
                }
                className="flex-[1_1_250px]"
                onChange={handleChange}
              />
              <Input
                label="Phone number"
                name="phone"
                value={form.phone}
                error={
                  errors?.errors?.find((e) => e.path[0] == "phone")?.message
                }
                className="flex-[1_1_250px]"
                onChange={handleChange}
              />
            </div>
            <TextArea
              label="Message"
              value={form.message}
              error={
                errors?.errors?.find((e) => e.path[0] == "message")?.message
              }
              name="message"
              onChange={handleChange}
            />
            <div className="pt-2">
              <Button
                loading={submissionStatus == "loading"}
                fullWidth
                onClick={handleSubmit}
              >
                Send
              </Button>
              {submissionStatus == "error" && (
                <p className="text-red-500 text-sm mt-2">
                  There was an error sending your message. Please try again
                  later.
                </p>
              )}
              {submissionStatus == "success" && (
                <p className="text-green-500 text-sm mt-2">
                  Your message has been sent successfully, we&apos;ll get back
                  to you as soon as possible.
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm">
              Submit the form with your query or get in touch with us using the
              details below.
            </p>
            <p className="font-semibold text-lg mt-5">
              <a href="mailto:hello@moove.house">hello@moove.house</a>
            </p>
            <p className="font-semibold text-lg">
              <a href="mailto:hello@moove.house">press@moove.house</a>
            </p>
            <p className="font-semibold text-sm mt-5">
              We are open 9am - 5pm Monday to Friday.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
