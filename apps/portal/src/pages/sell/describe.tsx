import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers, Schemas } from "api";
import { SparklesIcon } from "lucide-react";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import Button from "ui/forms/Button";
import Input from "ui/forms/Input";
import TextArea from "ui/forms/TextArea";
import Spinner from "ui/interactions/Spinner";

export default function Details() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { listing } = useSellerFlow({
    onSuccess({ listing }) {
      setTitle(listing?.title ?? "");
      setDescription(listing?.description ?? "");
    },
  });

  const { bearer } = useUser();

  const descriptionGpt = useSWRMutation(
    {
      url: `/listings/seller/${listing.id}/gpt/description`,
      bearer,
    },
    mutationFetcher<
      // @ts-expect-error - fix later
      Handlers["listings"]["gptDescription"],
      Schemas["listings"]["gptDescriptionSchema"]
    >,
  );

  const titleGpt = useSWRMutation(
    {
      url: `/listings/seller/${listing.id}/gpt/description`,
      bearer,
    },
    mutationFetcher<
      // @ts-expect-error - fix later
      Handlers["listings"]["gptDescription"],
      Schemas["listings"]["gptDescriptionSchema"]
    >,
  );

  const describe = useSWRMutation(
    {
      url: `/listings/seller/${listing.id}`,
      bearer,
      method: "PATCH",
    },
    mutationFetcher<
      Handlers["listings"]["updateListing"],
      Schemas["listings"]["updateListingSchema"]
    >,
  );

  return (
    <>
      <FlowHeading>
        Now, let&apos;s give an overview of your property.
      </FlowHeading>
      <FlowSubHeading className="mt-5">
        This is your chance to sell your home and all it&apos;s qualities,
        we&apos;ve suggested some headlines for you, be free.
      </FlowSubHeading>
      <FlowSubHeading className="mt-2">
        This is what buyers will see when they&apos;re browsing.
      </FlowSubHeading>
      <Input
        className="mt-5"
        label="Headline"
        placeholder="e.g. Beautiful 3 bedroom house"
        value={title}
        error={describe.error?.data?.zodError?.fieldErrors?.title?.[0]}
        onChange={(e) => {
          setTitle(e.target.value);
          describe.reset();
        }}
        inputClassName="pr-12"
        innerInput={
          <button
            onClick={async () => {
              const t = await titleGpt.trigger({
                type: "title",
              });

              setTitle(t[0].message.content ?? "");
            }}
            disabled={titleGpt.isMutating}
            className="h-full flex items-center px-2 text-gray-500 rounded-r-lg hover:bg-gray-100 transition-all border absolute top-0 right-0"
          >
            {titleGpt.isMutating ? (
              <Spinner className="w-5 h-5 mx-0.5" />
            ) : (
              <SparklesIcon />
            )}
          </button>
        }
      />
      <TextArea
        className="mt-5"
        label="Description"
        rows={5}
        error={describe.error?.data?.zodError?.fieldErrors.description?.[0]}
        placeholder="e.g. A cosy 3 bedroom house, set in the heart of the countryside..."
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          describe.reset();
        }}
      />
      <Button
        className="mt-2"
        icon={SparklesIcon}
        variant="outline"
        onClick={() =>
          descriptionGpt.trigger({
            customerProvided: description,
            type: "description",
          })
        }
      >
        Help me
      </Button>
      <div className="mt-5">
        {descriptionGpt.isMutating ? (
          <>
            <div className="w-full rounded-lg p-4 border flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  className="w-full rounded bg-gray-200 h-4 animate-pulse"
                  key={i}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* @ts-expect-error - fix later */}
            {descriptionGpt.data?.map((autocompletion) => (
              <div
                className="w-full rounded-lg p-4 border text-gray-700 hover:bg-gray-100 cursor-pointer transition-all"
                onClick={() => {
                  setDescription(autocompletion.message.content ?? "");
                  descriptionGpt.reset();
                }}
                key={autocompletion.index}
              >
                <p className="whitespace-pre-wrap">
                  {autocompletion.message.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavigationButtons
        onNext={async (next) => {
          await describe.trigger({
            title,
            description,
          });

          next();
        }}
        disableNext={!title || !description}
      />
    </>
  );
}
