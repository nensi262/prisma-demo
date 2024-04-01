import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import React, { useId } from "react";

interface TextAreaProps
  extends Omit<React.HTMLProps<HTMLTextAreaElement>, "classId"> {
  label?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  type?: "text" | "email" | "password" | "number" | "tel";
  error?: string;
  className?: string;
}

export default function TextArea({
  label,
  onChange,
  type = "text",
  error,
  className,
  ...props
}: TextAreaProps) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="bg-white px-1 text-sm pb-1.5 block font-medium text-gray-500"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={id}
          onChange={onChange}
          className={`block w-full py-2.5 px-3 text-gray-900 bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none rounded-lg transition-all sm:leading-6 ${
            error ? "ring-red-300" : "ring-gray-300 focus:ring-primary"
          }`}
          placeholder={props.placeholder ?? ""}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
}
