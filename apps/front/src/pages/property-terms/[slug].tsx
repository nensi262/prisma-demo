import { H2, H3 } from "@/components/Typography";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { client } from "@/lib/contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, Document, INLINES } from "@contentful/rich-text-types";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

export default function TermSlug({
  term,
}: InferGetServerSidePropsType<typeof getStaticProps>) {
  const longDescription = documentToReactComponents(
    term.fields.longDescription as Document,
    {
      renderNode: {
        [BLOCKS.HEADING_2]: (node, children) => (
          <H2 className="mb-4 mt-6">{children as ReactNode}</H2>
        ),
        [BLOCKS.HEADING_3]: (node, children) => (
          <H3 className="mb-4 mt-6">{children as ReactNode}</H3>
        ),
        [BLOCKS.PARAGRAPH]: (node, children) => (
          <p className="mb-8">{children}</p>
        ),
      },
    },
  );

  const content = documentToReactComponents(term.fields.content as Document, {
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

  const [isOpen, setIsOpen] = useState<Array<boolean>>();

  useEffect(() => {
    if (!term) return;

    setIsOpen(term.fields.faqs?.map(() => false));
  }, [term]);

  return (
    <div className="min-h-screen">
      <Head>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/property-terms/${term.fields.slug}`}
        />

        <title>{`${term.fields.whatIsTitle} - Property Terms | Moove`}</title>
        <meta name="description" content={term.fields.metaDescription} />
      </Head>
      <div className="w-full bg-primary/10">
        <div className="max-w-7xl mx-auto pt-40 pb-16 px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { label: "Property Terms", href: "/property-terms" },
              { label: term.fields.title },
            ]}
            className="mb-8"
          />

          <h1 className="text-5xl font-bold">{term.fields.title}</h1>
          <p className="mt-4 max-w-xl font-medium">
            {term.fields.shortDescription}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-14 lg:my-20 px-6 lg:px-8 text-lg">
        <h2 className="text-4xl font-bold mb-6">{term.fields.whatIsTitle}</h2>
        <div className="font-medium">{content || longDescription}</div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-2">Related</h2>
          <div className="flex flex-wrap items-center gap-3">
            {term.fields.related.map(
              (term: { slug: string; title: string }) => (
                <Link href={`/property-terms/${term.slug}`} key={term.slug}>
                  <div className="p-2 px-5 transition-all hover:bg-primary/20 rounded-lg bg-primary/10 text-primary font-medium">
                    {term.title}
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
      {term.fields.faqs && term.fields.faqs.length > 0 && (
        <div className="w-full bg-primary/10">
          <Head>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: term.fields.faqs.map(
                    (faq: {
                      [key: string]: { question: string; answer: string };
                    }) => ({
                      "@type": "Question",
                      name: faq.fields.question,
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: faq.fields.answer,
                      },
                    }),
                  ),
                }),
              }}
            />
          </Head>
          <div className="max-w-7xl mx-auto py-10 px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-2">
              Frequently Asked Questions
            </h2>
            <p className="w-full max-w-4xl mb-7">
              {term.fields.title} is a term that you may have heard before, but
              you might not be sure what it means. Here are some common
              questions and answers to help you understand what it means.
            </p>
            <div className="flex flex-col gap-5">
              {term.fields.faqs.map(
                (
                  faq: { [key: string]: { question: string; answer: string } },
                  i: number,
                ) => (
                  <div key={i}>
                    <button
                      onClick={() =>
                        setIsOpen(() => {
                          if (!isOpen) return;
                          const newIsOpen = [...isOpen];
                          newIsOpen.forEach((_, i) => (newIsOpen[i] = false));
                          newIsOpen[i] = !newIsOpen[i];
                          return newIsOpen;
                        })
                      }
                      className="font-bold bg-primary/10 text-primary px-4 py-3 rounded-md text-lg flex justify-between items-center w-full"
                    >
                      <span className="text-left">{faq.fields.question}</span>
                      <motion.div
                        animate={
                          isOpen?.[i]
                            ? { rotate: 180, paddingLeft: 0, paddingRight: 16 }
                            : { rotate: 0, paddingLeft: 16, paddingRight: 0 }
                        }
                      >
                        <ChevronDown />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      <motion.div
                        animate={{ height: isOpen?.[i] ? "auto" : 0 }}
                        initial={{ height: 0 }}
                        exit={{ height: 0 }}
                        className="font-medium overflow-hidden"
                      >
                        <div className="px-4 py-3">{faq.fields.answer}</div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
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
    content_type: "term",
    limit: 1,
    "fields.slug": params?.slug,
  });

  if (!search.items[0])
    return {
      notFound: true,
    };

  const related =
    (
      search.items[0].fields.related as Array<
        Record<string, Record<string, string>>
      >
    )?.map((r) => ({
      title: r.fields.title,
      slug: r.fields.slug,
    })) || [];

  return {
    props: {
      term: {
        ...search.items[0],
        fields: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(search.items[0].fields as any),
          related: related || [],
        },
      },
    },
    revalidate: 60 * 5,
  };
};
