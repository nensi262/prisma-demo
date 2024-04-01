type TypographyProps = {
  children: React.ReactNode;
  className?: string;
};

export const H1 = ({ children, className = "" }: TypographyProps) => (
  <h1 className={`text-3xl font-bold text-gray-900 ${className}`}>
    {children}
  </h1>
);

export const H2 = ({ children, className = "" }: TypographyProps) => (
  <h1 className={`text-2xl font-bold text-gray-900 ${className}`}>
    {children}
  </h1>
);
