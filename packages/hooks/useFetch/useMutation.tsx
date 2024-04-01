import { useReducer, useRef } from "react";
import SuperJSON from "superjson";
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

type Action<T> =
  | { type: "loading" }
  | { type: "fetched"; payload: T }
  | { type: "error"; payload: HTTPError };

export function useMutation<Data = unknown, Payload = unknown>(
  url: string,
  options?: RequestInit,
) {
  const cache = useRef<Cache<Data>>({});
  const cachedPayload = useRef<Cache<Payload>>({});

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

  async function mutate(payload?: Payload) {
    dispatch({ type: "loading" });

    try {
      const response = await fetch(url, {
        ...options,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new HTTPError({
          issues: data.issues || [],
          message: data.message,
          status: response.status,
        });
      }

      let returnData: Data = data as Data;
      if (response.headers.get("content-type")?.includes("application/json")) {
        if (!("json" in data)) {
          dispatch({ type: "fetched", payload: data as Data });
          cache.current[url] = data;
          returnData = data;
          return;
        }

        dispatch({
          type: "fetched",
          payload: SuperJSON.deserialize(data) as Data,
        });

        returnData = SuperJSON.deserialize(data);
        cache.current[url] = SuperJSON.deserialize(data);

        if (payload) {
          cachedPayload.current[url] = payload;
        }
      } else {
        dispatch({ type: "fetched", payload: data as Data });
      }

      return returnData;
    } catch (error) {
      dispatch({
        type: "error",
        payload: new HTTPError({
          status: 0,
          message: error instanceof Error ? error.message : "An error occurred",
          issues: [],
        }),
      });
      throw error;
    }
  }

  const refetch = () => mutate(cachedPayload.current[url]);

  return { mutate, ...state, refetch };
}
