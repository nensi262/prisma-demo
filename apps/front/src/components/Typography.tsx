import { ReactNode } from "react";

export const H2 = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <h2 className={`text-3xl font-bold ${className}`}>{children}</h2>;
};

export const H3 = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <h3 className={`text-2xl font-medium ${className}`}>{children}</h3>;
};
