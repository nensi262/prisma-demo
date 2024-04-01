import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({
  crumbs,
  className,
}: {
  crumbs: Crumb[];
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <nav aria-label="Breadcrumb" className={className}>
      {mounted &&
        createPortal(
          <script type="application/ld+json">
            {`{
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": ${JSON.stringify(
                crumbs.map((crumb) => ({
                  "@type": "ListItem",
                  position: crumbs.indexOf(crumb) + 1,
                  name: crumb.label,
                  item: crumb.href
                    ? `${process.env.NEXT_PUBLIC_DOMAIN}${crumb.href}`
                    : undefined,
                })),
              )}}
          `}
          </script>,
          document.head,
        )}
      <ol className="flex gap-2.5">
        {crumbs.map((crumb, i) => (
          <Fragment key={i}>
            {crumb.href ? (
              <Link href={crumb.href} className="font-bold text-primary">
                {crumb.label}
              </Link>
            ) : (
              <li aria-current="page">{crumb.label}</li>
            )}
            {i < crumbs.length - 1 && <span className="opacity-30">/</span>}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
