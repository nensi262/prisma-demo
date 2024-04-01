import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers } from "api";
import { ReactNode, createContext, useContext } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const UserContext = createContext<{
  user: Handlers["auth"]["me"] | undefined | null;
  loading: boolean;
  setBearer: (token: string, expiry: Date) => void;
  bearer: string;
}>({
  user: null,
  loading: true,
  setBearer: () => null,
  bearer: "",
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const bearer = useSWR<{ token: string }>(
    {
      url: "/auth/lookup",
      baseUrl: "/api",
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );

  const { data: user, isLoading: loading } = useSWR<Handlers["auth"]["me"]>(
    bearer.data?.token
      ? {
          url: "/auth/me",
          bearer: bearer.data.token,
        }
      : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );

  const storeBearer = useSWRMutation(
    { url: "/auth/persist", baseUrl: "/api" },
    mutationFetcher,
  );

  const setBearer = async (token: string, expiry: Date) => {
    await storeBearer.trigger({
      bearer: token,
      expiry,
    });

    bearer.mutate({
      token,
    });
  };

  //todo: fix problematic code
  // if (!user && isFetched && router.pathname !== "/auth") {
  //   router.push(`/auth?next=${router.asPath}`);
  // }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        bearer: bearer.data?.token ?? "",
        setBearer,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);

export { UserProvider, useUser };
