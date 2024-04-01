import { ReactNode } from "react";

export default function FlowHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`${className} font-semibold text-2xl max-w-xs`}>
      {children}
    </h2>
  );
}
