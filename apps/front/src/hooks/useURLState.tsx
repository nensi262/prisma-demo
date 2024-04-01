import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

export default function useURLState() {
  const router = useRouter();

  const setQueryPrimitive = (
    q: ((prev: ParsedUrlQuery) => ParsedUrlQuery) | ParsedUrlQuery,
  ) => {
    if (typeof q === "function") {
      router.push(
        {
          pathname: router.pathname,
          query: q(router.query),
        },
        undefined,
        { shallow: true },
      );
      return;
    }

    router.push(
      {
        pathname: router.pathname,
        query: q,
      },
      undefined,
      { shallow: true },
    );
  };

  return [
    { url: router.asPath, query: router.query },
    { setQuery: setQueryPrimitive },
  ] as const;
}
