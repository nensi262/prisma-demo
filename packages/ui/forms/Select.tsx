import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.HTMLProps<HTMLSelectElement> {
  label?: string;
  labelFor?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  className?: string;
  noBottomRadius?: boolean;
  options: SelectOption[];
}

export default function Select({
  label,
  labelFor,
  onChange,
  error,
  className,
  noBottomRadius = false,
  options,
  placeholder,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={labelFor ?? undefined}
          className="absolute z-10 -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={labelFor ?? undefined}
          onChange={onChange}
          {...props}
          className={`${className} block w-full border-0 py-3 sm:py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:outline-none font-medium ${
            noBottomRadius ? "rounded-t-md" : "rounded-md"
          } transition-all sm:text-sm sm:leading-6 ${
            error ? "ring-red-300" : "ring-gray-300 focus:ring-primary"
          }`}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
