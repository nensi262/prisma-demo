import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { IceCream, LucideIcon } from "lucide-react";

const ucFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function Alert({
  severity,
  title,
  children,
  className,
  ...props
}: {
  icon?: LucideIcon;
  title?: string;
  severity: "error" | "warning" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  if (!props.icon)
    props.icon =
      severity == "error"
        ? ExclamationCircleIcon
        : severity == "warning"
        ? ExclamationCircleIcon
        : IceCream;

  return (
    <div
      className={`flex gap-2 border bg-gradient-to-r ${
        {
          error: "from-red-300 to-red-100 border-red-600",
          warning: "from-amber-300 to-amber-100 border-amber-600",
          info: "from-primary-300 to-primary-100 border-primary-600",
          success: "from-green-300 to-green-100 border-green-600",
        }[severity]
      } p-4 rounded-lg ${className ?? ""}`}
    >
      <props.icon className="flex-shrink-0 text-red-900 w-6 h-6" />
      <div>
        <p className="text-base text-red-950 leading-5 mb-1">
          {title ?? ucFirst(severity)}
        </p>
        <p className="text-sm text-red-950">{children}</p>
      </div>
    </div>
  );
}
