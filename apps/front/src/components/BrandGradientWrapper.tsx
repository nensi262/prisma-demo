import { ReactNode, useEffect, useRef, useState } from "react";

export default function BrandGradientWrapperContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BrandGradientWrapper
      className={`w-screen flex justify-center ${className}`}
    >
      {children}
    </BrandGradientWrapper>
  );
}

export const BrandGradientWrapper = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vars, setVars] = useState({
    "--size": "300px",
    "--oblong-width": "150px",
    "--oblong-height": "300px",
    "--blur": "100px",
    "--pink-after": "200px",
  });

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        const width = ref.current.clientWidth;
        const height = ref.current.clientHeight;

        const moderator = width > height ? width : height;

        const size = moderator * 0.4;
        const oblongLength = moderator * 0.36;
        const oblongHeight = oblongLength * 0.53;
        const blur = moderator * 0.11;
        const pinkAfter = moderator * 0.13;

        setVars({
          "--size": `${size}px`,
          "--oblong-width": `${oblongLength}px`,
          "--oblong-height": `${oblongHeight}px`,
          "--blur": `${blur}px`,
          "--pink-after": `${pinkAfter}px`,
        });
      }
    };

    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return (
    <div
      ref={ref}
      style={vars as Record<string, string>}
      className={`relative z-0 bg-cover overflow-hidden bg-gradient-to-br from-primary from-30% via-70% via-pumpkin to-pumpkin after:content-[''] after:size-[var(--size)] after:bg-rose after:rounded-full after:scale-y-75 after:absolute after:-top-5 after:-right-[var(--pink-after)] after:blur-[var(--blur)] after:will-change-transform after:pointer-events-none before:content-[''] before:pointer-events-none before:w-[var(--oblong-width)] before:h-[var(--oblong-height)] before:rounded-full before:bg-maize before:absolute before:-bottom-5 before:left-[45%] before:blur-[var(--blur)] before:will-change-transform after:-z-10 before:-z-10 ${className}`}
    >
      {children}
    </div>
  );
};
