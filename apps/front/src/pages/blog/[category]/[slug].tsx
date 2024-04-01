import { H2, H3 } from "@/components/Typography";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { client } from "@/lib/contentful";
import { formatBlogDate } from "@/lib/date";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, Document, INLINES } from "@contentful/rich-text-types";
import { Asset, Entry } from "contentful";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Test({
  entry: entryProp,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const entry = useContentfulLiveUpdates(entryProp);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const canonical = `${process.env.NEXT_PUBLIC_DOMAIN}${
    router.asPath === "/" ? "" : router.asPath.split("?")[0]
  }`;

  const content = documentToReactComponents(entry.fields.content as Document, {
    renderNode: {
      [BLOCKS.HEADING_1]: (node, children) => (
        <H2 className="mb-4 mt-6">{children}</H2>
      ),
      [BLOCKS.HEADING_2]: (node, children) => (
        <H2 className="mb-4 mt-6">{children}</H2>
      ),
      [BLOCKS.HEADING_3]: (node, children) => (
        <H3 className="mb-4 mt-6">{children}</H3>
      ),
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="mb-8">{children}</p>
      ),
      [INLINES.HYPERLINK]: (node, children) => (
        <Link
          href={node.data.uri}
          className="text-primary hover:text-primary/80 border-b border-primary/100 hover:border-primary/80 transition-colors duration-200"
        >
          {children}
        </Link>
      ),
      [BLOCKS.UL_LIST]: (node, children) => (
        <ul className="list-disc pl-4 mb-8">{children}</ul>
      ),
      [BLOCKS.LIST_ITEM]: (node, children) => (
        <li className="mb-2 pl-2 [&>p]:mb-2">{children}</li>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <ol className="list-decimal pl-4 mb-8">{children}</ol>
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        return (
          <div className="overflow-hidden rounded-md w-full mb-12">
            <Image
              src={`https://${node.data.target.fields.file.url.slice(2)}`}
              className="object-cover max-h-96"
              width={node.data.target.fields.file.details.image.width}
              height={node.data.target.fields.file.details.image.height}
              alt={node.data.target.fields.description ?? ""}
            />
          </div>
        );
      },
    },
  });

  return (
    <div className="min-h-screen">
      {mounted &&
        createPortal(
          <script type="application/ld+json">
            {`{
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "${entry.fields.title}",
                "image": [
                  "${`https://${(
                    (entry.fields.featuredImage as Asset).fields.file
                      ?.url as string
                  ).slice(2)}`}"
                ],
                "datePublished": "${new Date(
                  entry.sys.createdAt,
                ).toISOString()}",
                "dateModified": "${new Date(
                  entry.sys.updatedAt,
                ).toISOString()}",
                "author": [{
                    "@type": "Person",
                    "name": "${(entry.fields.author as Entry).fields.name}",
                    "jobTitle": "${(entry.fields.author as Entry).fields.role}"
                  }]
              }
          `}
          </script>,
          document.head,
        )}
      <Head>
        <title>{`${entry.fields.title} | Moove Blog`}</title>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/blog/${(
            entry.fields.category as Entry
          )?.fields.slug}/${entry.fields.slug}`}
        />
        <meta name="title" content={`${entry.fields.metaTitle}`} />
        <meta name="description" content={`${entry.fields.metaDescription}`} />
        <meta property="og:title" content={`${entry.fields.title}`} />
        <meta
          property="og:description"
          content={`${entry.fields.metaDescription}`}
        />
        <meta
          property="og:image"
          content={`https://${(
            (entry.fields.featuredImage as Asset).fields.file?.url as string
          ).slice(2)}`}
        />
        <meta property="og:url" content={``} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_GB" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MooveUpdates" />
        <meta property="twitter:domain" content="moove.house" />
        <meta property="twitter:url" content={`${canonical}`} />
        <meta name="twitter:title" content={`${entry.fields.title}`} />
        <meta
          name="twitter:description"
          content={`${entry.fields.metaDescription}`}
        />
        <meta
          name="twitter:image"
          content={`https://${(
            (entry.fields.featuredImage as Asset).fields.file?.url as string
          ).slice(2)}`}
        />
      </Head>
      <div className="w-full bg-primary/10">
        <div className="max-w-7xl mx-auto pt-40 pb-16 px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { label: "Making a Moovement", href: "/blog" },
              { label: entry.fields.title as string },
            ]}
            className="mb-8"
          />

          <h1 className="text-5xl font-bold max-w-4xl leading-[1.1]">
            {entry.fields.title as string}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-14 lg:my-14 px-6 lg:px-8 text-lg md:flex gap-10">
        <div className="w-full max-w-4xl text-base leading-7 text-gray-700">
          {content}
        </div>
        <div className="flex-grow mt-14 md:mt-0 min-w-[200px] lg:min-w-[250px]">
          <p className="text-base font-semibold leading-7 mb-4 text-dust">
            Posted by
          </p>
          <div className="h-20 w-20 overflow-hidden relative rounded-full bg-gray-100">
            <Image
              alt={`${
                (entry.fields.author as Entry).fields.name
              }'s profile photo`}
              src={`https://${(
                ((entry.fields.author as Entry).fields.image as Asset).fields
                  .file?.url as string
              ).slice(2)}`}
              fill
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="pt-2">
            <p className="font-bold">
              {(entry.fields.author as Entry).fields.name as string}
            </p>
            <p className="max-w-[75%] text-sm text-dust">
              {(entry.fields.author as Entry).fields.role as string}
            </p>
            <p className="text-sm text-dust font-medium pt-3">
              {formatBlogDate(entry.sys.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths = (async () => {
  return {
    paths: [],
    fallback: "blocking", // false or "blocking"
  };
}) satisfies GetStaticPaths;

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const search = await client.getEntries({
    content_type: "post",
    limit: 1,
    "fields.slug": params?.slug,
    "fields.category.fields.slug": params?.category,
    "fields.category.sys.contentType.sys.id": "category",
    include: 1,
  });

  if (!search.items[0])
    return {
      notFound: true,
    };

  /* todo: swap to on-demand static regeneration
      https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#using-on-demand-revalidation
  */
  return {
    props: { entry: search.items[0] },
    revalidate: 60 * 5,
  };
};
