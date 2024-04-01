import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers, Schemas } from "api";
import useDebounce from "hooks/useDebounce";
import { HomeIcon } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Button from "ui/forms/Button";
import Input from "ui/forms/Input";
import Spinner from "ui/interactions/Spinner";

export default function SellStart() {
  const [search, setSearch] = useState("");
  const { setId, goToNextStep } = useSellerFlow();
  const debouncedSearch = useDebounce(search, 300);
  const { bearer } = useUser();

  const { data: autocompletions, isLoading: loadingAddresses } = useSWR<
    Handlers["addresses"]["search"]
  >(
    debouncedSearch.length > 0 && {
      url: `/addresses/search?query=${debouncedSearch}`,
      bearer,
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const create = useSWRMutation(
    {
      url: "/listings/seller",
    },
    mutationFetcher<
      Handlers["listings"]["createListing"],
      Schemas["listings"]["createListingSchema"]
    >,
  );

  return (
    <>
      <FlowHeading>
        Let&apos;s get started with the better way to sell your home.{" "}
        <span className="text-primary">What&apos;s your address?</span>
      </FlowHeading>
      <FlowSubHeading className="mt-5">
        We&apos;re here to make selling your property simple and stress-free.
        Let&apos;s start with the basics.
      </FlowSubHeading>
      <FlowSubHeading className="mt-2">
        Oh, and your changes are saved as you go along, so feel free to go and
        come back any time.
      </FlowSubHeading>
      <div className="mt-10 relative">
        <Input
          label="Address"
          unit={loadingAddresses ? <Spinner /> : <></>}
          placeholder="Start typing your address"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {autocompletions && (
        <div className="mt-5 flex flex-col gap-y-3">
          {autocompletions.map((autocompletion) => (
            <Button
              variant="outline"
              fullWidth
              onClick={async () => {
                const res = await create.trigger({
                  addressId: autocompletion.id,
                });
                setId(res.listingId);
                goToNextStep();
              }}
              itemsCenter={false}
              icon={HomeIcon}
              key={autocompletion.id}
            >
              {autocompletion.address}
            </Button>
          ))}
        </div>
      )}
      <Button
        variant="dark-900"
        className="mt-5"
        onClick={() => goToNextStep()}
      >
        Enter address manually
      </Button>
    </>
  );
}
