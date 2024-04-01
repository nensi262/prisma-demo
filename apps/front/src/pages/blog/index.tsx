import { client } from "@/lib/contentful";
import { Asset, AssetFile, Entry } from "contentful";
import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Blog({
  categories,
  articles: articlesProp,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const allPostsButton = useRef<HTMLButtonElement>(null);
  const [articles, setArticles] = useState(articlesProp);

  useEffect(() => {
    if (selectedCategory === null) {
      setArticles(articlesProp);
      return;
    }

    const filteredArticles = articlesProp.filter(
      (article) =>
        (article.fields.category as Entry).sys.id === selectedCategory,
    );

    setArticles(filteredArticles);
  }, [selectedCategory]);

  return (
    <>
      <div className="w-full bg-primary/10">
        <Head>
          <title>Moove Blog - Making a Moovement</title>
          <meta
            name="description"
            content="Keep tabs on what we're up to and the latest in the property world."
          />
        </Head>
        <div className="max-w-7xl mx-auto pt-44 pb-16 px-6">
          <span className="uppercase text-sm text-primary font-bold tracking-wider">
            Moove&apos;s Blog
          </span>
          <h1 className="text-5xl font-bold mt-2">Making a Moovement</h1>
          <p className="mt-4 max-w-xl font-medium">
            Keep tabs on what we&apos;re up to and the latest in the property
            world.
          </p>
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto px-6 mb-10">
        <div className="flex items-center gap-x-3 py-5 relative">
          <div
            className="absolute bg-gray-100 -z-10 rounded-md transition-all"
            style={undefined}
          />
          <button
            className={`font-semibold px-2.5 py-1 rounded-md ${
              selectedCategory === null
                ? "text-primary bg-gray-100"
                : "text-black"
            }`}
            onClick={() => setSelectedCategory(null)}
            ref={allPostsButton}
          >
            All Posts
          </button>
          {categories.map((category) => (
            <button
              key={category.sys.id}
              className={`font-semibold px-2.5 py-1 rounded-md ${
                selectedCategory === category.sys.id
                  ? "text-primary bg-gray-100"
                  : "text-black"
              }`}
              onClick={() => setSelectedCategory(category.sys.id)}
            >
              {category.fields.title as string}
            </button>
          ))}
        </div>
        <div>
          <div className="flex flex-wrap items-start gap-5">
            {articles.slice(0, 2).map((post, i) => (
              <Article
                className={i == 0 ? "flex-[1_1_430px]" : "flex-[1_1_275px]"}
                post={post}
                key={post.sys.id}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {articles.slice(2).map((post) => (
              <Article post={post} key={post.sys.id} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const Article = ({ post, className }: { post: Entry; className?: string }) => (
  <div className={className} key={post.sys.id}>
    <Link
      href={`/blog/${(post.fields.category as Entry).fields.slug}/${
        post.fields.slug
      }`}
    >
      <div
        className={`rounded-lg border flex flex-col overflow-clip hover:bg-gray-100 transition-all`}
      >
        <div className="relative h-64">
          <Image
            src={`https://${(
              (post.fields.featuredImage as Asset).fields.file?.url as string
            ).slice(2)}`}
            alt="Featured Image for post"
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="p-4">
          <div className="h-8 w-8 overflow-hidden relative rounded-full bg-gray-100 mb-2">
            <Image
              alt={`${
                (post.fields.author as Entry).fields.name
              }'s profile photo`}
              src={`https://${(
                ((post.fields.author as Entry).fields.image as Asset).fields
                  .file?.url as string
              ).slice(2)}`}
              width={
                (
                  ((post.fields.author as Entry).fields.image as Asset).fields
                    .file as AssetFile
                ).details?.image?.width
              }
              height={
                (
                  ((post.fields.author as Entry).fields.image as Asset).fields
                    .file as AssetFile
                ).details?.image?.height
              }
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <p className="font-light text-sm mb-1">
            {(post.fields.category as Entry).fields.title as string}
          </p>
          <p className="font-medium">{post.fields.title as string}</p>
        </div>
      </div>
    </Link>
  </div>
);

export const getStaticProps = async () => {
  const categories = await client.getEntries({
    content_type: "category",
  });

  if (!categories.items[0]) throw new Error();

  const articles = await client.getEntries({
    content_type: "post",
    include: 1,
    order: ["-sys.createdAt"],
  });

  /* todo: swap to on-demand static regeneration
      https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#using-on-demand-revalidation
  */
  return {
    props: {
      articles: articles.items,
      categories: categories.items,
    },
    revalidate: 60 * 5,
  };
};
