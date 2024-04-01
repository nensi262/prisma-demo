import React, { ReactNode, useId } from "react";
// import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

interface InputProps
  extends Omit<React.HTMLProps<HTMLInputElement>, "classID"> {
  label?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password" | "number" | "tel";
  error?: string;
  className?: string;
  bottomRadius?: boolean;
  unit?: string;
  innerInput?: ReactNode;
}

export default function Input({
  label,
  onChange,
  type = "text",
  error,
  className,
  bottomRadius = true,
  unit,
  innerInput,
  ...props
}: InputProps) {
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
        {innerInput}
        <input
          type={type ?? "text"}
          id={id}
          onChange={onChange}
          className={`block w-full py-2.5 px-3 text-gray-900 bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
            !bottomRadius ? "rounded-t-lg" : "rounded-lg"
          } transition-all sm:leading-6 ${
            error ? "ring-red-300" : "ring-gray-300 focus:ring-primary"
          }`}
          placeholder={props.placeholder ?? ""}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {/* <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            /> */}
          </div>
        )}
        {unit && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            {unit}
          </span>
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
