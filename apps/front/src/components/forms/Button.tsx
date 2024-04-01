import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import Spinner from "ui/interactions/Spinner";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  variant?: "translucent" | "white" | "primary";
  loading?: boolean;
  icon?: LucideIcon;
  itemsCenter?: boolean;
  disabled?: boolean;
  decoration?: ReactNode;
}

export default function Button({
  children,
  variant = "translucent",
  className = "",
  disabled,
  loading,
  decoration,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`flex ${
        disabled ? "opacity-60" : ""
      } leading-none shadow-sm ${className} ${
        {
          translucent:
            "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30",
          white: "bg-white text-oxford-blue hover:bg-white/80",
          primary: "bg-primary text-white hover:bg-primary-800",
        }[variant]
      } py-3 px-6 rounded-full border group transition-all font-satoshi relative`}
    >
      {decoration}
      {props.icon && <props.icon className="w-4 min-w-[16px] h-4 mr-2" />}
      <span className="font-semibold">{children}</span>
      {loading && (
        <span className="pl-2">
          <Spinner className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  );
}
