import { ReactNode } from "react";

export default function FlowSubHeading({
  children,
  className = "",
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2
      className={`${className} text-dust font-inter tracking-tight text-sm font-medium max-w-xs`}
    >
      {children}
    </h2>
  );
}
