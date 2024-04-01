import React from "react";
import Spinner from "../interactions/Spinner";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger" | "dark-900";
  loading?: boolean;
  icon?: any;
  itemsCenter?: boolean;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  fullWidth = false,
  itemsCenter = true,
  loading,
  ...props
}: ButtonProps) {
  const classes = {
    primary: {
      button: "from-primary-600 to-primary-400",
      wrapper:
        "from-primary-300 to-primary-600 group-hover:from-primary-400 group-hover:to-primary-600 ",
      main: "bg-primary-400 text-white group-hover:bg-primary-500",
    },
    secondary: {
      button: "from-orange-600 to-orange-400",
      wrapper:
        "from-orange-300 to-orange-600 group-hover:from-orange-400 group-hover:to-orange-600 ",
      main: "bg-orange-400 text-white group-hover:bg-orange-500",
    },
    outline: {
      button: "from-gray-300 to-gray-400",
      wrapper:
        "from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 ",
      main: "bg-gray-50 text-black group-hover:bg-gray-100",
    },
    danger: {
      button: "from-red-300 to-red-400 ",
      wrapper:
        "from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 ",
      main: "bg-gray-50 text-red-500 group-hover:bg-red-100",
    },
    "dark-900": {
      button: "from-gray-900 to-gray-800",
      wrapper:
        "from-gray-800 to-gray-900 group-hover:from-gray-700 group-hover:to-gray-800 ",
      main: "bg-gray-900 text-white group-hover:bg-gray-800",
    },
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`flex ${disabled ? "opacity-60" : ""} ${
        fullWidth ? "w-full" : "w-max"
      } rounded-lg bg-gradient-to-b ${
        classes[variant].button
      } p-px leading-none shadow-sm ${className} group transition-all`}
    >
      <div
        className={`rounded-[7px] bg-gradient-to-b ${classes[variant].wrapper} w-full p-px transition-all`}
      >
        <div
          className={`flex items-center gap-x-1.5 rounded-md w-full ${
            itemsCenter ? "justify-center" : "text-left"
          } px-3 py-2 text-sm ${classes[variant].main} transition-all`}
        >
          {props.icon && <props.icon className="w-4 min-w-[16px] h-4" />}
          <span className="font-medium">{children}</span>
          {loading && (
            <span className="pl-2">
              <Spinner className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
