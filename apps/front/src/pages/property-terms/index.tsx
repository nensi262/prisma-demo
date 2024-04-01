import { client } from "@/lib/contentful";
import { ArrowRight } from "lucide-react";
import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";

export default function TermsGlossary({
  termsGroupedByLetter,
  termCountByLetter,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (!element) return;
    const elementPosition = element.getBoundingClientRect().top;
    window.scrollTo({
      top: elementPosition - 100,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="w-full bg-primary/10">
        <Head>
          <title>Property Terms | Your Guide to Real Estate - Moove</title>
          <meta
            name="description"
            content="Whether you're a seasoned investor or a first-time buyer, our glossary helps you to navigate the world of property with confidence."
          />
        </Head>
        <div className="max-w-7xl mx-auto pt-44 pb-16 px-6 lg:px-">
          <h1 className="text-5xl font-bold">Property Terms</h1>
          <p className="mt-4 max-w-xl font-medium">
            Whether you&apos;re a seasoned investor or a first-time buyer, our
            glossary helps you to navigate the world of property with
            confidence.
          </p>
        </div>

        <div className="w-full pb-12 hidden md:block">
          <ul className="flex items-center px-6 lg:px- justify-between max-w-7xl mx-auto">
            {alphabet.map((letter) => {
              const LiOrA = Object.keys(termCountByLetter).includes(letter)
                ? "a"
                : "li";

              return (
                <LiOrA
                  href={`#letter-${letter}`}
                  key={letter}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToLetter(letter);
                  }}
                  className={`${
                    Object.keys(termCountByLetter).includes(letter)
                      ? "text-primary font-bold"
                      : "text-gray-400 font-medium"
                  } `}
                >
                  {letter}
                </LiOrA>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-12 px-3">
        {Object.keys(termsGroupedByLetter)
          .sort()
          .map((letter) => (
            <div
              className="w-full mb-20"
              key={`letter-${letter}`}
              id={`letter-${letter}`}
            >
              <div className="rounded-full w-14 h-14 bg-primary flex items-center justify-center font-bold text-white mb-6 ml-2">
                <span className="text-xl">{letter}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {termsGroupedByLetter[letter]
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((term) => (
                    <Link href={`/property-terms/${term.slug}`} key={term.slug}>
                      <div className="hover:bg-gray-100 p-2 hover:px-3 transition-all rounded-md duration-300 flex items-center justify-between">
                        <div>
                          {" "}
                          <div className="font-bold text-primary text-lg">
                            {term.title}
                          </div>
                          <div>{term.shortDescription}</div>
                        </div>
                        <ArrowRight className="text-primary" />
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export const getStaticProps = async () => {
  const terms = await client.getEntries({
    content_type: "term",
    include: 1,
    order: ["fields.title"],
    limit: 1000,
  });

  const mapped = terms.items.map((term) => ({
    title: term.fields.title as string,
    slug: term.fields.slug as string,
    shortDescription: term.fields.shortDescription as string,
  }));

  const termsGroupedByLetter = mapped.reduce(
    (acc, term) => {
      const letter = term.title[0].toUpperCase();
      acc[letter] = acc[letter] || [];
      acc[letter].push(term);
      return acc;
    },
    {} as Record<string, typeof mapped>,
  );

  const termCountByLetter = mapped.reduce(
    (result, term) => {
      const firstLetter = term.title.charAt(0).toUpperCase();
      result[firstLetter] = (result[firstLetter] || 0) + 1;
      return result;
    },
    {} as Record<string, number>,
  );

  return {
    props: {
      articles: mapped,
      termsGroupedByLetter,
      termCountByLetter,
    },
    revalidate: 60 * 5,
  };
};
