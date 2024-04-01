import { useReducer, useRef } from "react";
import SuperJSON from "superjson";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";
import { HTTPError } from "./HTTPError";

type State<Data> =
  | {
      data: Data;
      status: "success";
      error: undefined;
    }
  | {
      data: undefined;
      status: "error";
      error: HTTPError;
    }
  | {
      data: undefined;
      status: "loading";
      error: undefined;
    }
  | {
      data: undefined;
      status: "idle";
      error: undefined;
    };

type Cache<T> = Record<string, T>;

export type OverwriteType<Data> = (<T = Data>(prev: T) => Data) | Data;

type Action<T> =
  | { type: "loading" }
  | { type: "fetched"; payload: T }
  | { type: "error"; payload: HTTPError };

/**
 * @example
 * const { data, error } = useFetch<User>('https://api.example.com/user');
 */
export default function useFetch<Data = unknown>(
  url?: string,
  options: RequestInit & { enabled?: boolean } = { enabled: true },
) {
  const cache = useRef<Cache<Data>>({});

  // Used to prevent state update if the component is unmounted
  const cancelRequest = useRef(false);

  const initialState: State<Data> = {
    error: undefined,
    data: undefined,
    status: "idle",
  };

  // Keep state logic separated
  const fetchReducer = (
    state: State<Data>,
    action: Action<Data>,
  ): State<Data> => {
    switch (action.type) {
      case "loading":
        return { ...initialState, status: "loading" };
      case "fetched":
        return { ...initialState, data: action.payload, status: "success" };
      case "error":
        return { ...initialState, error: action.payload, status: "error" };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(fetchReducer, initialState);

  const overwrite = (prev: OverwriteType<Data>) => {
    if (typeof prev === "function") {
      dispatch({
        type: "fetched",
        payload: (prev as <T = Data>(prev: T) => Data)(state.data),
      });
      return;
    }
    dispatch({ type: "fetched", payload: prev });
  };

  const fetchData = async () => {
    if (!url || !options.enabled) return;
    dispatch({ type: "loading" });

    // If a cache exists for this url, return it in the meantime
    const currentCache = cache.current[url];
    if (currentCache) {
      dispatch({ type: "fetched", payload: currentCache });
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new HTTPError({
          issues: data.issues || [],
          message: data.message,
          status: response.status,
        });
      }

      if (response.headers.get("content-type")?.includes("application/json")) {
        if (!("json" in data)) {
          dispatch({ type: "fetched", payload: data as Data });
          cache.current[url] = data;
          return;
        }

        dispatch({
          type: "fetched",
          payload: SuperJSON.deserialize(data) as Data,
        });

        cache.current[url] = SuperJSON.deserialize(data);
      } else {
        dispatch({ type: "fetched", payload: data as Data });
      }

      if (cancelRequest.current) return;
    } catch (error) {
      if (cancelRequest.current) return;

      if (error instanceof HTTPError) {
        dispatch({
          type: "error",
          payload: error,
        });
      }

      dispatch({
        type: "error",
        payload: new HTTPError({
          status: 0,
          message: error instanceof Error ? error.message : "An error occurred",
          issues: [],
        }),
      });
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  useIsomorphicLayoutEffect(() => {
    // Do nothing if the url is not given
    if (!url || !options.enabled) return;

    cancelRequest.current = false;

    (async () => fetchData())();

    return () => {
      cancelRequest.current = true;
    };
  }, [url, options?.enabled]);

  return { refetch, overwrite, ...state };
}
